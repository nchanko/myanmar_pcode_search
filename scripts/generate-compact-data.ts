import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { Place } from '../src/types/pcode';

const DB_PATH = path.resolve('data/pcode.db');
const OUT_PATH = path.resolve('public/data/pcode-compact.json');

console.log('Generating compact offline dataset...');
const db = new DatabaseSync(DB_PATH, { readOnly: true });

const places = db.prepare(`
  SELECT 
    id, type, pcode, name_eng, name_mmr, 
    sr_pcode, sr_name, district_name, tsp_pcode, tsp_name, 
    lat, lng, postal_code
  FROM places
`).all() as unknown as Place[];

console.log(`Exporting ${places.length} places to ${OUT_PATH}...`);
fs.writeFileSync(OUT_PATH, JSON.stringify(places));

const stats = fs.statSync(OUT_PATH);
console.log(`✅ Compact dataset created: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
