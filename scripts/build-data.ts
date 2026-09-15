import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import type { CoordSource, Place } from '../src/types/pcode';

// Builds public/data/pcode-compact.json straight from the source CSVs in
// data/. That JSON is the only dataset at runtime: the API routes read it via
// src/lib/dataStore.ts and the offline mode stores it in IndexedDB.
const RELEASE = { version: '9.7', mimuRelease: 'Jan 2026' };
const OUT_PATH = path.resolve('public/data/pcode-compact.json');
const META_PATH = path.resolve('public/data/pcode-meta.json');

type Row = Record<string, string>;

function readCsv(file: string): Row[] {
  const text = fs.readFileSync(path.resolve('data', file), 'utf8');
  return Papa.parse<Row>(text, { header: true, skipEmptyLines: true }).data;
}

const mimuCsv = (level: string) => readCsv(`pcode${RELEASE.version}_${level}_data.csv`);
const num = (v: string | undefined) => parseFloat(v || '') || null;

const admin = (r: Row) => ({
  sr_pcode: r['SR_Pcode'] || '',
  sr_name: r['SR_Name_Eng'] || '',
  district_pcode: r['District/SAZ_Pcode'] || '',
  district_name: r['District/SAZ_Name_Eng'] || '',
  tsp_pcode: r['Tsp_Pcode'] || '',
  tsp_name: r['Township_Name_Eng'] || ''
});

// 1. Postal codes, assigned per ward / village tract
console.log('Loading postal codes...');
const postalLookup = new Map<string, string>(); // ward or VT pcode -> postal code
const townPostalLookup = new Map<string, string>(); // town pcode (ward pcode prefix) -> first ward's postal code
const tspPostalLookup = new Map<string, string>(); // lowercase township name -> first postal code
let postalCount = 0;

for (const row of readCsv('myanmar_postal_code_data.csv')) {
  const code = (row['Postal Code'] || '').trim();
  if (!code) continue;
  postalCount++;
  const vt = (row['VT_Pcode'] || '').trim();
  const ward = (row['Ward_Pcode'] || '').trim();
  const tsp = (row['Township'] || '').trim().toLowerCase();
  if (vt) postalLookup.set(vt, code);
  if (ward) {
    postalLookup.set(ward, code);
    if (ward.length >= 12 && !townPostalLookup.has(ward.substring(0, 12))) {
      townPostalLookup.set(ward.substring(0, 12), code);
    }
  }
  if (tsp && !tspPostalLookup.has(tsp)) tspPostalLookup.set(tsp, code);
}

// 2. MIMU places, in the same order (and so the same ids) as before
console.log(`Loading MIMU Pcode ${RELEASE.version}...`);
const places: Place[] = [];

function add(p: Omit<Place, 'id' | 'coord_source'>) {
  places.push({ id: places.length + 1, ...p, coord_source: p.lat != null && p.lng != null ? 'mimu' : null });
}

for (const r of mimuCsv('town')) {
  const pcode = (r['Town_Pcode'] || '').trim();
  if (!pcode) continue;
  const tsp = (r['Township_Name_Eng'] || '').trim().toLowerCase();
  add({
    type: 'town', pcode, name_eng: r['Town_Name_Eng'] || '', name_mmr: r['Town_Name_MMR'] || '', ...admin(r),
    town_pcode: pcode, town_name: r['Town_Name_Eng'] || '', vt_pcode: '', vt_name: '',
    lat: num(r['Latitude']), lng: num(r['Longitude']),
    postal_code: postalLookup.get(pcode) || townPostalLookup.get(pcode) || tspPostalLookup.get(tsp) || null
  });
}

for (const r of mimuCsv('ward')) {
  const pcode = (r['Ward_Pcode'] || '').trim();
  if (!pcode) continue;
  add({
    type: 'ward', pcode, name_eng: r['Ward_Name_Eng'] || '', name_mmr: r['Ward_Name_MMR'] || '', ...admin(r),
    town_pcode: r['Town_Pcode'] || '', town_name: r['Town'] || '', vt_pcode: '', vt_name: '',
    lat: null, lng: null,
    postal_code: postalLookup.get(pcode) || null
  });
}

for (const r of mimuCsv('village_tract')) {
  const pcode = (r['VT_Pcode'] || '').trim();
  if (!pcode) continue;
  add({
    type: 'village_tract', pcode, name_eng: r['Village_Tract_Name_Eng'] || '', name_mmr: r['Village_Tract_Name_MMR'] || '', ...admin(r),
    town_pcode: '', town_name: '', vt_pcode: pcode, vt_name: r['Village_Tract_Name_Eng'] || '',
    lat: null, lng: null,
    postal_code: postalLookup.get(pcode) || null
  });
}

for (const r of mimuCsv('village')) {
  const pcode = (r['Village_Pcode'] || '').trim();
  if (!pcode) continue;
  const vtCode = (r['VT_Pcode'] || '').trim();
  add({
    type: 'village', pcode, name_eng: r['Village_Name_Eng'] || '', name_mmr: r['Village_Name_MMR'] || '', ...admin(r),
    town_pcode: '', town_name: '', vt_pcode: vtCode, vt_name: r['Village_Tract_Name_Eng'] || '',
    lat: num(r['Latitude']), lng: num(r['Longitude']),
    postal_code: postalLookup.get(vtCode) || postalLookup.get(pcode) || null
  });
}

// 3. MIMU lists give no points for wards and village tracts (those levels are
// only published as boundary polygons), and a few towns lack one. Fill them
// in, best source first:
//   'boundary' - centre of the OCHA COD-AB polygon (adm4 = town/VT, adm5 = ward)
//   'villages' - VT only: median of its villages' MIMU points
//   'town'     - ward only: its town's MIMU point
// These are approximate; coord_source lets the UI say so and keeps them out
// of nearby/batch matching (see hasExactCoords in src/lib/geo.ts).
console.log('Filling approximate coordinates...');
const centroids = new Map<string, [number, number]>();
for (const r of readCsv('cod_ab_centroids.csv')) {
  centroids.set(r['pcode'], [Number(r['center_lat']), Number(r['center_lon'])]);
}

const townPoints = new Map<string, [number, number]>();
const villagePoints = new Map<string, { lats: number[]; lngs: number[] }>();
for (const p of places) {
  if (p.coord_source !== 'mimu') continue;
  if (p.type === 'town') townPoints.set(p.pcode, [p.lat!, p.lng!]);
  if (p.type === 'village' && p.vt_pcode) {
    let pts = villagePoints.get(p.vt_pcode);
    if (!pts) villagePoints.set(p.vt_pcode, (pts = { lats: [], lngs: [] }));
    pts.lats.push(p.lat!);
    pts.lngs.push(p.lng!);
  }
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const round6 = (x: number) => Math.round(x * 1e6) / 1e6;

for (const p of places) {
  // A village-tract-level guess would be misleading for a single village.
  if (p.coord_source || p.type === 'village') continue;
  let point = centroids.get(p.pcode);
  let source: CoordSource = 'boundary';
  if (!point && p.type === 'village_tract') {
    const pts = villagePoints.get(p.pcode);
    if (pts) [point, source] = [[median(pts.lats), median(pts.lngs)], 'villages'];
  }
  if (!point && p.type === 'ward') {
    const town = townPoints.get((p.town_pcode || '').trim());
    if (town) [point, source] = [town, 'town'];
  }
  if (point) {
    p.lat = round6(point[0]);
    p.lng = round6(point[1]);
    p.coord_source = source;
  }
}

// 4. Write output
fs.writeFileSync(OUT_PATH, JSON.stringify(places));
fs.writeFileSync(META_PATH, JSON.stringify({
  totalPlaces: places.length,
  postalCodes: postalCount,
  version: RELEASE.version,
  mimuRelease: RELEASE.mimuRelease,
  generatedAt: new Date().toISOString()
}));

const summary: Record<string, Record<string, number>> = {};
for (const p of places) {
  const s = (summary[p.type] ??= { total: 0 });
  s.total++;
  const key = p.coord_source ?? 'none';
  s[key] = (s[key] || 0) + 1;
}
console.table(summary);
console.log(`✅ ${places.length} places, ${postalCount} postal codes -> ${OUT_PATH} (${(fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(2)} MB)`);
