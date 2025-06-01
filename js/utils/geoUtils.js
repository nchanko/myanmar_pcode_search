// Geographic utility functions for coordinate calculations and validation

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

/**
 * Validate if coordinates are within Myanmar bounds
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if coordinates are within Myanmar bounds
 */
export function isValidMyanmarCoordinate(lat, lon) {
    // Validate coordinate ranges (roughly for Myanmar)
    return lat >= 9.5 && lat <= 28.5 && lon >= 92.0 && lon <= 101.5;
}

/**
 * Parse coordinate string in various formats
 * @param {string} coordString - Coordinate string (e.g., "16.8661, 96.1951")
 * @returns {object|null} Object with lat and lon properties, or null if invalid
 */
export function parseCoordinates(coordString) {
    const coordPattern = /^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/;
    const match = coordString.match(coordPattern);
    
    if (!match) {
        return null; // Return null if format is invalid
    }
    
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    
    if (isNaN(lat) || isNaN(lon)) {
        return null;
    }
    
    return { lat, lon };
} 