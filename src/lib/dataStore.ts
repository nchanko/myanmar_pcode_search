import path from 'node:path';
import fs from 'node:fs';
import type { Place, BatchResultItem } from '@/types/pcode';
import { calculateDistanceKm } from './geo';

const GRID_SIZE = 0.1; // ~11km cells, matching legacy/js/utils/spatialIndex.js

// Serverless bundlers (e.g. Netlify Functions) don't always place included
// files under process.cwd() at runtime, so try the conventional path first
// and fall back to a path relative to this module's own location.
function resolveDataPath(relativePath: string): string {
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(__dirname, '../../', relativePath),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
}

interface Meta {
  postalCodes: number;
  version: string;
  mimuRelease: string;
}

interface Store {
  places: Place[];
  byPcode: Map<string, Place>;
  grid: Map<string, Place[]>;
  meta: Meta;
}

let store: Store | null = null;

function gridKey(lat: number, lng: number): string {
  return `${Math.floor(lat / GRID_SIZE)},${Math.floor(lng / GRID_SIZE)}`;
}

function loadStore(): Store {
  if (store) return store;

  const dataPath = resolveDataPath('public/data/pcode-compact.json');
  const metaPath = resolveDataPath('public/data/pcode-meta.json');

  if (!fs.existsSync(dataPath)) {
    throw new Error(`Dataset not found at ${dataPath}. Please run "npm run build:compact" first.`);
  }

  const places: Place[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const meta: Meta = fs.existsSync(metaPath)
    ? JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    : { postalCodes: 0, version: 'unknown', mimuRelease: 'unknown' };

  const byPcode = new Map<string, Place>();
  const grid = new Map<string, Place[]>();

  for (const p of places) {
    if (p.pcode) byPcode.set(p.pcode, p);
    if (p.lat != null && p.lng != null) {
      const key = gridKey(p.lat, p.lng);
      let cell = grid.get(key);
      if (!cell) {
        cell = [];
        grid.set(key, cell);
      }
      cell.push(p);
    }
  }

  store = { places, byPcode, grid, meta };
  return store;
}

/**
 * Search places by query string (Myanmar name, English name, PCode, or Township).
 * Mirrors the relevance scoring previously done in SQL (src/lib/db.ts) so
 * result ordering stays consistent after moving off SQLite.
 */
export function searchPlaces(query: string, type?: string, limit: number = 30): Place[] {
  const { places } = loadStore();
  const q = query.trim();
  if (!q) return [];
  const qLower = q.toLowerCase();

  const scored: { place: Place; relevance: number }[] = [];

  for (const p of places) {
    if (type && type !== 'all' && p.type !== type) continue;

    const pcode = p.pcode || '';
    const pcodeLower = pcode.toLowerCase();
    const postal = p.postal_code || '';
    const postalLower = postal.toLowerCase();
    const nameEng = p.name_eng || '';
    const nameEngLower = nameEng.toLowerCase();
    const nameMmr = p.name_mmr || '';
    const tspLower = (p.tsp_name || '').toLowerCase();

    const isMatch =
      pcodeLower.includes(qLower) ||
      postalLower.includes(qLower) ||
      nameEngLower.includes(qLower) ||
      nameMmr.includes(q) ||
      tspLower.includes(qLower);

    if (!isMatch) continue;

    let relevance = 10;
    if (pcode === q) relevance = 100;
    else if (postal === q) relevance = 95;
    else if (nameEngLower === qLower || nameMmr === q) relevance = 90;
    else if (pcodeLower.startsWith(qLower)) relevance = 80;
    else if (postalLower.startsWith(qLower)) relevance = 75;
    else if (nameEngLower.startsWith(qLower) || nameMmr.startsWith(q)) relevance = 60;
    else if (nameEngLower.includes(qLower) || nameMmr.includes(q)) relevance = 40;
    else if (tspLower.includes(qLower)) relevance = 30;

    scored.push({ place: p, relevance });
  }

  scored.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance;
    const aHasCoords = a.place.lat != null ? 1 : 0;
    const bHasCoords = b.place.lat != null ? 1 : 0;
    return bHasCoords - aHasCoords;
  });

  return scored.slice(0, limit).map((s) => s.place);
}

/**
 * Get place by exact PCode
 */
export function getPlaceByPCode(pcode: string): Place | null {
  const { byPcode } = loadStore();
  return byPcode.get(pcode.trim()) || null;
}

/**
 * Search places near latitude and longitude within radius in km.
 * Uses a grid index so this stays fast even under repeated calls (see
 * batchLookupCoordinates), instead of scanning every place per lookup.
 */
export function getNearbyPlaces(
  centerLat: number,
  centerLng: number,
  radiusKm: number = 10,
  limit: number = 25
): Place[] {
  const { grid } = loadStore();

  const dLat = radiusKm / 111.0;
  const dLng = radiusKm / (111.0 * Math.cos(centerLat * (Math.PI / 180)));
  const gridRadiusLat = Math.ceil(dLat / GRID_SIZE) + 1;
  const gridRadiusLng = Math.ceil(dLng / GRID_SIZE) + 1;

  const centerGridLat = Math.floor(centerLat / GRID_SIZE);
  const centerGridLng = Math.floor(centerLng / GRID_SIZE);

  const candidates: Place[] = [];
  for (let dy = -gridRadiusLat; dy <= gridRadiusLat; dy++) {
    for (let dx = -gridRadiusLng; dx <= gridRadiusLng; dx++) {
      const cell = grid.get(`${centerGridLat + dy},${centerGridLng + dx}`);
      if (cell) candidates.push(...cell);
    }
  }

  const withDistance = candidates
    .map((place) => {
      const dist = calculateDistanceKm(centerLat, centerLng, place.lat!, place.lng!);
      return { ...place, distance_km: dist };
    })
    .filter((place) => place.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit);

  return withDistance;
}

/**
 * Batch reverse-lookup for an array of coordinates
 */
export function batchLookupCoordinates(
  items: { id: string | number; latitude: number; longitude: number }[]
): BatchResultItem[] {
  const results: BatchResultItem[] = [];

  for (const item of items) {
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);

    if (isNaN(lat) || isNaN(lng) || lat < 9 || lat > 29 || lng < 92 || lng > 102) {
      results.push({
        id: item.id,
        latitude: lat,
        longitude: lng,
        status: 'INVALID_COORDS'
      });
      continue;
    }

    const nearest = getNearbyPlaces(lat, lng, 25, 1);
    if (nearest.length > 0) {
      const match = nearest[0];
      results.push({
        id: item.id,
        latitude: lat,
        longitude: lng,
        matched_pcode: match.pcode,
        matched_name_eng: match.name_eng,
        matched_name_mmr: match.name_mmr || undefined,
        matched_type: match.type,
        state_region: match.sr_name || undefined,
        township: match.tsp_name || undefined,
        postal_code: match.postal_code || undefined,
        distance_km: match.distance_km,
        status: 'FOUND'
      });
    } else {
      results.push({
        id: item.id,
        latitude: lat,
        longitude: lng,
        status: 'NOT_FOUND'
      });
    }
  }

  return results;
}

/**
 * Get database summary stats
 */
export function getStats() {
  const { places, meta } = loadStore();

  let towns = 0;
  let wards = 0;
  let vts = 0;
  let villages = 0;
  let withCoords = 0;

  for (const p of places) {
    if (p.type === 'town') towns++;
    else if (p.type === 'ward') wards++;
    else if (p.type === 'village_tract') vts++;
    else if (p.type === 'village') villages++;
    if (p.lat != null) withCoords++;
  }

  return {
    totalPlaces: places.length,
    towns,
    wards,
    villageTracts: vts,
    villages,
    placesWithCoordinates: withCoords,
    postalCodes: meta.postalCodes,
    version: meta.version,
    mimuRelease: meta.mimuRelease
  };
}
