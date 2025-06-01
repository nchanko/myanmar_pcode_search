// Coordinate search functionality for latitude/longitude based searches

import { calculateDistance, isValidMyanmarCoordinate, parseCoordinates } from '../utils/geoUtils.js';
import { dataManager } from '../data/dataManager.js';

/**
 * Search villages by latitude and longitude coordinates
 * @param {string} query - Coordinate string (e.g., "16.8661, 96.1951")
 * @param {number} radius - Search radius in kilometers (default: 10)
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @returns {Array} Array of villages with distance information
 */
export function searchByLatLong(query, radius = 10, maxResults = 10) {
    const coordinates = parseCoordinates(query);
    
    if (!coordinates) {
        return []; // Return empty if format is invalid
    }
    
    const { lat: searchLat, lon: searchLon } = coordinates;
    
    // Validate coordinate ranges for Myanmar
    if (!isValidMyanmarCoordinate(searchLat, searchLon)) {
        return []; // Return empty if coordinates are outside Myanmar bounds
    }
    
    const villageData = dataManager.getData('villages');
    
    const nearbyVillages = villageData
        .filter(village => {
            const villageLat = parseFloat(village.Latitude);
            const villageLon = parseFloat(village.Longitude);
            
            if (isNaN(villageLat) || isNaN(villageLon)) {
                return false;
            }
            
            const distance = calculateDistance(searchLat, searchLon, villageLat, villageLon);
            return distance <= radius;
        })
        .map(village => {
            const villageLat = parseFloat(village.Latitude);
            const villageLon = parseFloat(village.Longitude);
            const distance = calculateDistance(searchLat, searchLon, villageLat, villageLon);
            return { ...village, distance };
        })
        .sort((a, b) => a.distance - b.distance) // Sort by distance
        .slice(0, maxResults); // Return top results
    
    return nearbyVillages;
}

/**
 * Validate coordinate input format
 * @param {string} query - Coordinate string to validate
 * @returns {boolean} True if format is valid
 */
export function isValidCoordinateFormat(query) {
    const coordinates = parseCoordinates(query);
    return coordinates !== null;
}

/**
 * Get suggestions for coordinate search based on partial input
 * @param {string} query - Partial coordinate string
 * @returns {Array} Array of suggestion strings
 */
export function getCoordinateSuggestions(query) {
    // For coordinate search, we don't provide autocomplete suggestions
    // but we can validate the format and provide helpful hints
    const suggestions = [];
    
    if (query.length > 0 && !query.includes(',')) {
        suggestions.push('Format: latitude, longitude (e.g., 16.8661, 96.1951)');
    }
    
    return suggestions;
} 