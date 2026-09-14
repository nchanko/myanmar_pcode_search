import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { Place } from '../src/types/pcode';

const DB_PATH = path.resolve('data/pcode.db');
const OUT_PATH = path.resolve('public/data/pcode-compact.json');
const META_PATH = path.resolve('public/data/pcode-meta.json');

console.log('Generating compact dataset...');
const db = new DatabaseSync(DB_PATH, { readOnly: true });

// Full column set so this JSON can fully replace SQLite for both the
// offline client store and the server-side API routes (see src/lib/dataStore.ts).
const places = db.prepare(`
  SELECT
    id, type, pcode, name_eng, name_mmr,
    sr_pcode, sr_name, district_pcode, district_name,
    tsp_pcode, tsp_name, town_pcode, town_name, vt_pcode, vt_name,
    lat, lng, postal_code
  FROM places
`).all() as unknown as Place[];

console.log(`Exporting ${places.length} places to ${OUT_PATH}...`);
fs.writeFileSync(OUT_PATH, JSON.stringify(places));

// Small metadata sidecar: postal_codes is a separate raw import table (not
// derivable from `places` alone), so bake its count in at build time rather
// than re-reading the CSV/DB at request time.
const postalCount = db.prepare('SELECT COUNT(*) as count FROM postal_codes').get() as { count: number };
const meta = {
  postalCodes: postalCount.count,
  version: '9.6',
  mimuRelease: 'Feb 2025',
  generatedAt: new Date().toISOString()
};
fs.writeFileSync(META_PATH, JSON.stringify(meta));

db.close();

const stats = fs.statSync(OUT_PATH);
console.log(`✅ Compact dataset created: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
