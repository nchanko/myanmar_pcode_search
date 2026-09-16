import type { Place, BatchResultItem } from '@/types/pcode';
import { calculateDistanceKm, hasExactCoords } from './geo';
import { searchByPostalCode } from './postalSearch';

const DB_NAME = 'MyanmarPCodeDB';
const DB_VERSION = 1;
const STORE_PLACES = 'places';
const STORE_META = 'meta';

let inMemoryPlacesCache: Place[] | null = null;

/**
 * The one open connection, shared by every call.
 *
 * Opening a fresh connection per call leaks them, and any connection left open
 * makes deleteDatabase() fire 'blocked' and wait instead of completing, which
 * is what made clearing the offline data hang.
 */
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open or upgrade IndexedDB
 */
function openIndexedDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not available in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    // Another tab is deleting or upgrading the database.
    request.onblocked = () =>
      reject(new Error('The offline database is in use by another tab. Close it and try again.'));

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_PLACES)) {
        const placeStore = db.createObjectStore(STORE_PLACES, { keyPath: 'id' });
        placeStore.createIndex('pcode', 'pcode', { unique: false });
        placeStore.createIndex('name_eng', 'name_eng', { unique: false });
        placeStore.createIndex('name_mmr', 'name_mmr', { unique: false });
        placeStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      // Let a delete or upgrade started elsewhere proceed instead of blocking on us.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
        inMemoryPlacesCache = null;
      };
      db.onclose = () => {
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => reject(request.error);
  });

  // A failed open must not be cached, or every later call replays the failure.
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}

/** Close the shared connection, if one is open. */
async function closeDb(): Promise<void> {
  const pending = dbPromise;
  dbPromise = null;
  if (!pending) return;
  try {
    (await pending).close();
  } catch {
    // Nothing to close: the open failed.
  }
}

/**
 * Check if offline data is downloaded and stored in IndexedDB
 */
export async function isOfflineReady(): Promise<{ ready: boolean; count: number; lastSynced?: string }> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_META, STORE_PLACES], 'readonly');
      const metaStore = tx.objectStore(STORE_META);
      const placeStore = tx.objectStore(STORE_PLACES);

      const countReq = placeStore.count();
      const metaReq = metaStore.get('sync_info');

      tx.oncomplete = () => {
        const count = countReq.result || 0;
        const meta = metaReq.result;
        resolve({
          ready: count > 1000,
          count,
          lastSynced: meta?.timestamp
        });
      };

      tx.onerror = () => {
        resolve({ ready: false, count: 0 });
      };
    });
  } catch {
    return { ready: false, count: 0 };
  }
}

/**
 * Download compact dataset and store permanently in IndexedDB
 */
export async function syncOfflineData(
  onProgress?: (percent: number, message: string) => void
): Promise<number> {
  onProgress?.(5, 'Fetching compressed dataset (~3.2 MB)...');

  // no-store: a re-download must hit the network, not the HTTP cache, and a
  // 36 MB body has no business sitting in the cache as well as IndexedDB.
  const response = await fetch('/data/pcode-compact.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch offline dataset.');
  }

  onProgress?.(35, 'Parsing dataset in browser...');
  const places: Place[] = await response.json();
  const total = places.length;

  onProgress?.(50, `Saving ${total.toLocaleString()} places to persistent IndexedDB...`);

  const db = await openIndexedDB();

  // Clear existing places
  await new Promise<void>((resolve, reject) => {
    const clearTx = db.transaction([STORE_PLACES], 'readwrite');
    clearTx.objectStore(STORE_PLACES).clear();
    clearTx.oncomplete = () => resolve();
    clearTx.onerror = () => reject(clearTx.error);
  });

  // Bulk insert in chunks
  const chunkSize = 5000;
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = places.slice(i, i + chunkSize);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_PLACES], 'readwrite');
      const store = tx.objectStore(STORE_PLACES);
      for (const item of chunk) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    const percent = Math.min(95, Math.round(50 + ((i + chunk.length) / total) * 45));
    onProgress?.(percent, `Saved ${(i + chunk.length).toLocaleString()} of ${total.toLocaleString()} places...`);
  }

  // Update sync metadata
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_META], 'readwrite');
    tx.objectStore(STORE_META).put({
      key: 'sync_info',
      count: total,
      timestamp: new Date().toISOString()
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  // Keep in memory cache for ultra-fast offline queries
  inMemoryPlacesCache = places;

  onProgress?.(100, 'Offline database ready! You can now search with zero internet connection.');
  return total;
}

/**
 * Load all places from IndexedDB into memory if not loaded
 */
async function getInMemoryPlaces(): Promise<Place[]> {
  if (inMemoryPlacesCache && inMemoryPlacesCache.length > 0) {
    return inMemoryPlacesCache;
  }

  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PLACES], 'readonly');
    const store = tx.objectStore(STORE_PLACES);
    const req = store.getAll();

    req.onsuccess = () => {
      inMemoryPlacesCache = req.result || [];
      resolve(inMemoryPlacesCache);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Search offline using client-side in-memory index
 */
export async function searchOffline(query: string, type?: string, limit: number = 25): Promise<Place[]> {
  const places = await getInMemoryPlaces();
  if (type === 'postal') return searchByPostalCode(places, query, limit);
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matched: { place: Place; score: number }[] = [];

  for (const p of places) {
    if (type && type !== 'all' && p.type !== type) {
      continue;
    }

    const eng = (p.name_eng || '').toLowerCase();
    const mmr = p.name_mmr || '';
    const pcode = (p.pcode || '').toLowerCase();
    const tsp = (p.tsp_name || '').toLowerCase();
    const postal = (p.postal_code || '').toLowerCase();

    let score = 0;
    if (pcode === q) score = 100;
    else if (postal === q) score = 95;
    else if (eng === q || mmr === q) score = 90;
    else if (pcode.startsWith(q)) score = 80;
    else if (postal.startsWith(q)) score = 75;
    else if (eng.startsWith(q) || mmr.startsWith(q)) score = 60;
    else if (eng.includes(q) || mmr.includes(q)) score = 40;
    else if (tsp.includes(q)) score = 30;

    if (score > 0) {
      matched.push({ place: p, score });
    }
  }

  matched.sort((a, b) => b.score - a.score);
  return matched.slice(0, limit).map(m => m.place);
}

/**
 * Coordinate search offline
 */
export async function getNearbyOffline(
  lat: number,
  lng: number,
  radiusKm: number = 10,
  limit: number = 20
): Promise<Place[]> {
  const places = await getInMemoryPlaces();
  const dLat = radiusKm / 111.0;
  const dLng = radiusKm / (111.0 * Math.cos(lat * (Math.PI / 180)));

  const minLat = lat - dLat;
  const maxLat = lat + dLat;
  const minLng = lng - dLng;
  const maxLng = lng + dLng;

  const candidates = places.filter(p =>
    hasExactCoords(p) &&
    p.lat >= minLat && p.lat <= maxLat &&
    p.lng >= minLng && p.lng <= maxLng
  );

  const withDist = candidates.map(p => ({
    ...p,
    distance_km: calculateDistanceKm(lat, lng, p.lat!, p.lng!)
  })).filter(p => p.distance_km <= radiusKm);

  withDist.sort((a, b) => a.distance_km - b.distance_km);
  return withDist.slice(0, limit);
}

/**
 * Batch lookup coordinates offline
 */
export async function batchLookupOffline(
  items: { id: string | number; latitude: number; longitude: number }[]
): Promise<BatchResultItem[]> {
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

    const nearest = await getNearbyOffline(lat, lng, 25, 1);
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
 * Clear offline database
 */
export async function clearOfflineData(): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return;

  inMemoryPlacesCache = null;

  // Our own connection would block the delete, so drop it first.
  await closeDb();

  return new Promise((resolve, reject) => {
    const req = window.indexedDB.deleteDatabase(DB_NAME);
    let settled = false;
    let blockedTimer: ReturnType<typeof setTimeout> | null = null;

    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      if (blockedTimer) clearTimeout(blockedTimer);
      if (err) reject(err);
      else resolve();
    };

    req.onsuccess = () => finish();
    req.onerror = () => finish(req.error ?? new Error('Failed to clear the offline database.'));

    // Another tab still holds a connection. Its onversionchange handler should
    // close it within a moment; if it doesn't, report that rather than waiting
    // forever or claiming the data was cleared when it wasn't.
    req.onblocked = () => {
      blockedTimer = setTimeout(() => {
        finish(new Error('Another tab has the offline database open. Close it and try again.'));
      }, 3000);
    };
  });
}
