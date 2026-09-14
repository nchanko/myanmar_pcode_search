import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import type { Place, BatchResultItem, PostalCodeInfo } from '@/types/pcode';
import { calculateDistanceKm } from './geo';

const DB_PATH = path.resolve(process.cwd(), 'data/pcode.db');

let dbInstance: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (!dbInstance) {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`Database not found at ${DB_PATH}. Please run "npm run build:db" first.`);
    }
    dbInstance = new DatabaseSync(DB_PATH, { readOnly: true });
    dbInstance.exec('PRAGMA cache_size = 10000;');
  }
  return dbInstance;
}

/**
 * Search places by query string (Myanmar name, English name, PCode, or Township)
 */
export function searchPlaces(query: string, type?: string, limit: number = 30): Place[] {
  const db = getDb();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const isPcode = /^[A-Z0-9]+$/i.test(trimmed) && trimmed.length >= 4;

  let sql = `
    SELECT 
      id, type, pcode, name_eng, name_mmr, sr_pcode, sr_name,
      district_pcode, district_name, tsp_pcode, tsp_name,
      town_pcode, town_name, vt_pcode, vt_name, lat, lng, postal_code,
      CASE
        WHEN pcode = ? THEN 100
        WHEN pcode LIKE ? THEN 80
        WHEN LOWER(name_eng) = LOWER(?) OR name_mmr = ? THEN 90
        WHEN LOWER(name_eng) LIKE LOWER(?) OR name_mmr LIKE ? THEN 60
        WHEN LOWER(name_eng) LIKE LOWER(?) OR name_mmr LIKE ? THEN 40
        WHEN LOWER(tsp_name) LIKE LOWER(?) THEN 30
        ELSE 10
      END as relevance
    FROM places
    WHERE 
      (pcode LIKE ? OR name_eng LIKE ? OR name_mmr LIKE ? OR tsp_name LIKE ?)
  `;

  const params: (string | number)[] = [
    trimmed,
    `${trimmed}%`,
    trimmed, trimmed,
    `${trimmed}%`, `${trimmed}%`,
    `%${trimmed}%`, `%${trimmed}%`,
    `%${trimmed}%`,
    `%${trimmed}%`, `%${trimmed}%`, `%${trimmed}%`, `%${trimmed}%`
  ];

  if (type && type !== 'all') {
    sql += ` AND type = ?`;
    params.push(type);
  }

  sql += ` ORDER BY relevance DESC, (lat IS NOT NULL) DESC LIMIT ?`;
  params.push(limit);

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params) as unknown as (Place & { relevance: number })[];
  return rows.map(({ relevance, ...place }) => place);
}

/**
 * Get place by exact PCode
 */
export function getPlaceByPCode(pcode: string): Place | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM places WHERE pcode = ? LIMIT 1
  `);
  const row = stmt.get(pcode.trim());
  return (row as unknown as Place) || null;
}

/**
 * Search places near latitude and longitude within radius in km
 */
export function getNearbyPlaces(
  centerLat: number,
  centerLng: number,
  radiusKm: number = 10,
  limit: number = 25
): Place[] {
  const db = getDb();
  // Bounding box approximation
  const dLat = radiusKm / 111.0;
  const dLng = radiusKm / (111.0 * Math.cos(centerLat * (Math.PI / 180)));

  const minLat = centerLat - dLat;
  const maxLat = centerLat + dLat;
  const minLng = centerLng - dLng;
  const maxLng = centerLng + dLng;

  const stmt = db.prepare(`
    SELECT * FROM places
    WHERE lat BETWEEN ? AND ?
      AND lng BETWEEN ? AND ?
    LIMIT 300
  `);

  const candidates = stmt.all(minLat, maxLat, minLng, maxLng) as unknown as Place[];

  // Compute exact haversine distance and filter
  const withDistance = candidates
    .map(place => {
      const dist = calculateDistanceKm(centerLat, centerLng, place.lat!, place.lng!);
      return { ...place, distance_km: dist };
    })
    .filter(place => place.distance_km <= radiusKm)
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

    // Find nearest within 25km
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
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as count FROM places').get() as { count: number };
  const towns = db.prepare("SELECT COUNT(*) as count FROM places WHERE type = 'town'").get() as { count: number };
  const wards = db.prepare("SELECT COUNT(*) as count FROM places WHERE type = 'ward'").get() as { count: number };
  const vts = db.prepare("SELECT COUNT(*) as count FROM places WHERE type = 'village_tract'").get() as { count: number };
  const villages = db.prepare("SELECT COUNT(*) as count FROM places WHERE type = 'village'").get() as { count: number };
  const coordsCount = db.prepare("SELECT COUNT(*) as count FROM places WHERE lat IS NOT NULL").get() as { count: number };
  const postalCount = db.prepare('SELECT COUNT(*) as count FROM postal_codes').get() as { count: number };

  return {
    totalPlaces: total.count,
    towns: towns.count,
    wards: wards.count,
    villageTracts: vts.count,
    villages: villages.count,
    placesWithCoordinates: coordsCount.count,
    postalCodes: postalCount.count,
    version: '9.6',
    mimuRelease: 'Feb 2025'
  };
}
