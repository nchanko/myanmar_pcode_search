// Coordinate search functionality for latitude/longitude based searches

import { calculateDistance, isValidMyanmarCoordinate, parseCoordinates } from '../utils/geoUtils.js';
import { dataManager } from '../data/dataManager.js';

/**
 * Search villages and towns by latitude and longitude coordinates
 * @param {string} query - Coordinate string (e.g., "16.8661, 96.1951")
 * @param {number} radius - Search radius in kilometers (default: 10)
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @returns {Array} Array of villages and towns with distance information
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
    
    const dataTypes = ['villages', 'towns'];
    const allResults = [];

    for (const dataType of dataTypes) {
        const data = dataManager.getData(dataType);
        
        if (!data || data.length === 0) continue;

        const nearbyItems = data
            .filter(item => {
                const itemLat = parseFloat(item.Latitude);
                const itemLon = parseFloat(item.Longitude);
                
                if (isNaN(itemLat) || isNaN(itemLon)) {
                    return false;
                }
                
                const distance = calculateDistance(searchLat, searchLon, itemLat, itemLon);
                return distance <= radius;
            })
            .map(item => {
                const itemLat = parseFloat(item.Latitude);
                const itemLon = parseFloat(item.Longitude);
                const distance = calculateDistance(searchLat, searchLon, itemLat, itemLon);
                return { 
                    ...item, 
                    distance,
                    dataType: dataType,
                    displayType: getDisplayTypeName(dataType)
                };
            });

        allResults.push(...nearbyItems);
    }

    // Sort by distance and return top results
    return allResults
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxResults);
}

/**
 * Get user-friendly display name for data types
 * @param {string} dataType - Internal data type name
 * @returns {string} Display-friendly type name
 */
function getDisplayTypeName(dataType) {
    const typeMap = {
        'villages': 'Village',
        'towns': 'Town'
    };
    return typeMap[dataType] || dataType;
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