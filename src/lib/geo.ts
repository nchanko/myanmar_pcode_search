import type { Place } from '@/types/pcode';

/**
 * True for surveyed MIMU points. Approximate points (area centres filled in
 * at build time) are left out so nearby/batch lookups keep matching real
 * places. Offline data synced before coord_source existed counts as exact.
 */
export function hasExactCoords(p: Place): p is Place & { lat: number; lng: number } {
  return p.lat != null && p.lng != null && (p.coord_source ?? 'mimu') === 'mimu';
}

/**
 * Pure Haversine formula to compute great-circle distance in kilometers.
 * Works in both browser and server environments.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // 2 decimal places
}
