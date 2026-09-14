import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import Papa from 'papaparse';

const DB_PATH = path.resolve('data/pcode.db');
console.log('Building SQLite database at:', DB_PATH);

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

const db = new DatabaseSync(DB_PATH);

// Setup schema and indexes
db.exec(`
  PRAGMA journal_mode = OFF;
  PRAGMA synchronous = 0;
  PRAGMA cache_size = 10000;

  CREATE TABLE places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    pcode TEXT NOT NULL,
    name_eng TEXT NOT NULL,
    name_mmr TEXT,
    sr_pcode TEXT,
    sr_name TEXT,
    district_pcode TEXT,
    district_name TEXT,
    tsp_pcode TEXT,
    tsp_name TEXT,
    town_pcode TEXT,
    town_name TEXT,
    vt_pcode TEXT,
    vt_name TEXT,
    lat REAL,
    lng REAL,
    postal_code TEXT
  );

  CREATE INDEX idx_places_pcode ON places(pcode);
  CREATE INDEX idx_places_type ON places(type);
  CREATE INDEX idx_places_name_eng ON places(name_eng COLLATE NOCASE);
  CREATE INDEX idx_places_name_mmr ON places(name_mmr);
  CREATE INDEX idx_places_coords ON places(lat, lng) WHERE lat IS NOT NULL;
  CREATE INDEX idx_places_tsp ON places(tsp_name COLLATE NOCASE);

  CREATE TABLE postal_codes (
    postal_code TEXT NOT NULL,
    region TEXT,
    township TEXT,
    name TEXT,
    vt_pcode TEXT,
    ward_pcode TEXT
  );

  CREATE INDEX idx_postal_code ON postal_codes(postal_code);
  CREATE INDEX idx_postal_vt ON postal_codes(vt_pcode);
  CREATE INDEX idx_postal_ward ON postal_codes(ward_pcode);
`);

console.log('Schema created successfully.');

// 1. Load Postal Data for cross-referencing
console.log('Loading Postal Code data...');
const postalCsv = fs.readFileSync(path.resolve('data/myanmar_postal_code_data.csv'), 'utf8');
const postalParsed = Papa.parse<Record<string, string>>(postalCsv, { header: true, skipEmptyLines: true });
const postalLookup = new Map<string, string>(); // pcode -> postal_code
const townPostalLookup = new Map<string, string>(); // 12-char town pcode prefix -> postal_code
const tspPostalLookup = new Map<string, string>(); // lowercase township name -> postal_code

const insertPostal = db.prepare(`
  INSERT INTO postal_codes (postal_code, region, township, name, vt_pcode, ward_pcode)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const row of postalParsed.data) {
  const code = (row['Postal Code'] || '').trim();
  const vt = (row['VT_Pcode'] || '').trim();
  const ward = (row['Ward_Pcode'] || '').trim();
  const tsp = (row['Township'] || '').trim().toLowerCase();
  if (code) {
    insertPostal.run(code, row['Region'] || '', row['Township'] || '', row['Village Tract/ Ward'] || '', vt, ward);
    if (vt) postalLookup.set(vt, code);
    if (ward) {
      postalLookup.set(ward, code);
      if (ward.length >= 12) {
        const townPrefix = ward.substring(0, 12);
        if (!townPostalLookup.has(townPrefix)) {
          townPostalLookup.set(townPrefix, code);
        }
      }
    }
    if (tsp && !tspPostalLookup.has(tsp)) {
      tspPostalLookup.set(tsp, code);
    }
  }
}
console.log(`Loaded ${postalParsed.data.length} postal code entries.`);

// Prepare insert statements
const insertPlace = db.prepare(`
  INSERT INTO places (
    type, pcode, name_eng, name_mmr, sr_pcode, sr_name, district_pcode, district_name,
    tsp_pcode, tsp_name, town_pcode, town_name, vt_pcode, vt_name, lat, lng, postal_code
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// 2. Load Towns
console.log('Loading Towns...');
const townCsv = fs.readFileSync(path.resolve('data/pcode9.6_town_data.csv'), 'utf8');
const towns = Papa.parse<Record<string, string>>(townCsv, { header: true, skipEmptyLines: true });
for (const r of towns.data) {
  const pcode = (r['Town_Pcode'] || '').trim();
  if (!pcode) continue;
  const lat = parseFloat(r['Latitude'] || '') || null;
  const lng = parseFloat(r['Longitude'] || '') || null;
  const tsp = (r['Township_Name_Eng'] || '').trim().toLowerCase();
  const postal = postalLookup.get(pcode) || townPostalLookup.get(pcode) || tspPostalLookup.get(tsp) || null;
  insertPlace.run(
    'town', pcode, r['Town_Name_Eng'] || '', r['Town_Name_MMR'] || '',
    r['SR_Pcode'] || '', r['SR_Name_Eng'] || '',
    r['District/SAZ_Pcode'] || '', r['District/SAZ_Name_Eng'] || '',
    r['Tsp_Pcode'] || '', r['Township_Name_Eng'] || '',
    pcode, r['Town_Name_Eng'] || '', '', '',
    lat, lng, postal
  );
}
console.log(`Loaded ${towns.data.length} towns.`);

// 3. Load Wards
console.log('Loading Wards...');
const wardCsv = fs.readFileSync(path.resolve('data/pcode9.6_ward_data.csv'), 'utf8');
const wards = Papa.parse<Record<string, string>>(wardCsv, { header: true, skipEmptyLines: true });
for (const r of wards.data) {
  const pcode = (r['Ward_Pcode'] || '').trim();
  if (!pcode) continue;
  const postal = postalLookup.get(pcode) || null;
  insertPlace.run(
    'ward', pcode, r['Ward_Name_Eng'] || '', r['Ward_Name_MMR'] || '',
    r['SR_Pcode'] || '', r['SR_Name_Eng'] || '',
    r['District/SAZ_Pcode'] || '', r['District/SAZ_Name_Eng'] || '',
    r['Tsp_Pcode'] || '', r['Township_Name_Eng'] || '',
    r['Town_Pcode'] || '', r['Town'] || '', '', '',
    null, null, postal
  );
}
console.log(`Loaded ${wards.data.length} wards.`);

// 4. Load Village Tracts
console.log('Loading Village Tracts...');
const vtCsv = fs.readFileSync(path.resolve('data/pcode9.6_village_tract_data.csv'), 'utf8');
const vts = Papa.parse<Record<string, string>>(vtCsv, { header: true, skipEmptyLines: true });
for (const r of vts.data) {
  const pcode = (r['VT_Pcode'] || '').trim();
  if (!pcode) continue;
  const postal = postalLookup.get(pcode) || null;
  insertPlace.run(
    'village_tract', pcode, r['Village_Tract_Name_Eng'] || '', r['Village_Tract_Name_MMR'] || '',
    r['SR_Pcode'] || '', r['SR_Name_Eng'] || '',
    r['District/SAZ_Pcode'] || '', r['District/SAZ_Name_Eng'] || '',
    r['Tsp_Pcode'] || '', r['Township_Name_Eng'] || '',
    '', '', pcode, r['Village_Tract_Name_Eng'] || '',
    null, null, postal
  );
}
console.log(`Loaded ${vts.data.length} village tracts.`);

// 5. Load Villages
console.log('Loading Villages...');
const villageCsv = fs.readFileSync(path.resolve('data/pcode9.6_village_data.csv'), 'utf8');
const villages = Papa.parse<Record<string, string>>(villageCsv, { header: true, skipEmptyLines: true });
for (const r of villages.data) {
  const pcode = (r['Village_Pcode'] || '').trim();
  if (!pcode) continue;
  const vtCode = (r['VT_Pcode'] || '').trim();
  const lat = parseFloat(r['Latitude'] || '') || null;
  const lng = parseFloat(r['Longitude'] || '') || null;
  const postal = postalLookup.get(vtCode) || postalLookup.get(pcode) || null;
  insertPlace.run(
    'village', pcode, r['Village_Name_Eng'] || '', r['Village_Name_MMR'] || '',
    r['SR_Pcode'] || '', r['SR_Name_Eng'] || '',
    r['District/SAZ_Pcode'] || '', r['District/SAZ_Name_Eng'] || '',
    r['Tsp_Pcode'] || '', r['Township_Name_Eng'] || '',
    '', '', vtCode, r['Village_Tract_Name_Eng'] || '',
    lat, lng, postal
  );
}
console.log(`Loaded ${villages.data.length} villages.`);

// Optimize SQLite
console.log('Optimizing SQLite database...');
db.exec('PRAGMA optimize;');
db.close();

const stats = fs.statSync(DB_PATH);
console.log(`✅ SQLite database successfully generated! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
