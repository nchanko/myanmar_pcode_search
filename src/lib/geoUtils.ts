/**
 * Robust Coordinate & Google Maps URL Parser
 * Supports:
 * - Direct: "16.8661, 96.1951", "16.8661 96.1951"
 * - URL @lat,lng: "https://www.google.com/maps/@16.8661,96.1951,17z"
 * - URL place: "https://www.google.com/maps/place/.../@16.8661,96.1951..."
 * - URL query: "?q=16.8661,96.1951", "?q=16.8661%2C96.1951", "?query=16.8661,96.1951"
 * - URL 3d/4d: "!3d16.8661!4d96.1951"
 * - URL ll: "?ll=16.8661,96.1951"
 */
export function parseCoordinatesInput(input: string): { lat: number; lng: number } | null {
  if (!input || typeof input !== 'string') return null;
  const decoded = decodeURIComponent(input).trim();

  // 1. Google Maps @lat,lng
  const atMatch = decoded.match(/@(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 2. Google Maps !3d... !4d...
  const param3d4d = decoded.match(/3d(-?\d+\.?\d*).*?4d(-?\d+\.?\d*)/);
  if (param3d4d) {
    const lat = parseFloat(param3d4d[1]);
    const lng = parseFloat(param3d4d[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 3. Google Maps q=lat,lng or query=lat,lng or ll=lat,lng
  const queryMatch = decoded.match(/[?&](?:q|query|ll)=(-?\d+\.?\d*)\s*(?:%2C|,|\s+)\s*(-?\d+\.?\d*)/i);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 4. Standard comma or space separated: "16.8661, 96.1951" or "16.8661 96.1951"
  const directMatch = decoded.match(/^(-?\d+\.?\d*)\s*(?:,|\s+)\s*(-?\d+\.?\d*)$/);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 5. Check if any coordinates are embedded in string (e.g. pasted URL with extra parameters)
  const generalMatch = decoded.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
  if (generalMatch) {
    const lat = parseFloat(generalMatch[1]);
    const lng = parseFloat(generalMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
