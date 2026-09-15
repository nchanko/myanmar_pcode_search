import type { Place, PlaceType } from '@/types/pcode';

// Postal codes are assigned per ward / village tract, so one code covers that
// ward or VT plus every village inside it. List the assigned unit first.
const TYPE_ORDER: Record<PlaceType, number> = { ward: 0, village_tract: 1, town: 2, village: 3 };

/**
 * Normalize a postal code query: Myanmar numerals become ASCII digits and
 * spaces are dropped (e.g. "၁၅၀ ၁၀၀၁" -> "1501001"). Returns '' if the input
 * isn't a number.
 */
function normalizePostalQuery(query: string): string {
  const q = query
    .replace(/[၀-၉]/g, (d) => String(d.charCodeAt(0) - 0x1040))
    .replace(/\s+/g, '');
  return /^\d+$/.test(q) ? q : '';
}

/**
 * Find places by postal code. Exact matches win; if there are none, the query
 * is treated as a prefix (e.g. "1501" for a whole township). Shared by the
 * server data store and the offline IndexedDB store so both rank identically.
 */
export function searchByPostalCode(places: Place[], query: string, limit: number): Place[] {
  const q = normalizePostalQuery(query);
  if (!q) return [];

  const exact: Place[] = [];
  const prefix: Place[] = [];
  for (const p of places) {
    if (!p.postal_code) continue;
    if (p.postal_code === q) exact.push(p);
    else if (p.postal_code.startsWith(q)) prefix.push(p);
  }

  const matches = exact.length > 0 ? exact : prefix;
  matches.sort((a, b) =>
    TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || a.postal_code!.localeCompare(b.postal_code!)
  );
  return matches.slice(0, limit);
}
