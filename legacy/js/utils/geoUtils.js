// Geographic utility functions for coordinate calculations and validation

import { extractCoordsFromGoogleMapsUrl, isGoogleMapsUrl } from './googleMapsParser.js';

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
 * Parse coordinate string in various formats or extract from Google Maps URL
 * @param {string} coordString - Coordinate string or Google Maps URL
 * @returns {object|null} Object with lat and lon properties, or null if invalid
 */
export function parseCoordinates(coordString) {
    // First try to extract from Google Maps URL
    const googleMapsCoords = extractCoordsFromGoogleMapsUrl(coordString);
    if (googleMapsCoords) {
        return googleMapsCoords;
    }

    // If not a Google Maps URL, try regular coordinate parsing
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

/**
 * Validate coordinate input format (coordinates or Google Maps URL)
 * @param {string} input - Input string to validate
 * @returns {boolean} True if input is valid coordinates or Google Maps URL
 */
export function isValidCoordinateInput(input) {
    if (!input || typeof input !== 'string') {
        return false;
    }

    // Try to parse as coordinates (regular or from Google Maps URL)
    const coords = parseCoordinates(input.trim());
    return coords !== null;
}

// Re-export Google Maps functions for convenience
export { isGoogleMapsUrl } from './googleMapsParser.js'; 