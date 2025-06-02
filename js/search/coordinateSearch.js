// Coordinate search functionality for latitude/longitude based searches

import { calculateDistance, isValidMyanmarCoordinate, parseCoordinates, isValidCoordinateInput } from '../utils/geoUtils.js';
import { isGoogleMapsUrl } from '../utils/googleMapsParser.js';
import { dataManager } from '../data/dataManager.js';

/**
 * Search villages and towns by latitude and longitude coordinates or Google Maps URL
 * @param {string} query - Coordinate string (e.g., "16.8661, 96.1951") or Google Maps URL
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
    
    // Search towns first, then villages (same as location search)
    const allResults = [];

    // First search towns within the specified radius
    const townData = dataManager.getData('towns');
    if (townData && townData.length > 0) {
        const nearbyTowns = townData
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
                    dataType: 'towns',
                    displayType: 'Town'
                };
            });

        allResults.push(...nearbyTowns);
    }

    // Then search villages within the specified radius
    const villageData = dataManager.getData('villages');
    if (villageData && villageData.length > 0) {
        const nearbyVillages = villageData
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
                    dataType: 'villages',
                    displayType: 'Village'
                };
            });

        allResults.push(...nearbyVillages);
    }

    // Sort by distance and return top results
    return allResults
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxResults);
}

/**
 * Validate coordinate input format (coordinates or Google Maps URL)
 * @param {string} query - Coordinate string or Google Maps URL to validate
 * @returns {boolean} True if format is valid
 */
export function isValidCoordinateFormat(query) {
    return isValidCoordinateInput(query);
}

/**
 * Get suggestions for coordinate search based on partial input
 * @param {string} query - Partial coordinate string or URL
 * @returns {Array} Array of suggestion strings
 */
export function getCoordinateSuggestions(query) {
    const suggestions = [];
    
    if (!query || query.length === 0) {
        suggestions.push('Enter coordinates: 16.8661, 96.1951');
        suggestions.push('Or paste Google Maps URL');
        return suggestions;
    }
    
    // Check if it looks like a Google Maps URL
    if (query.includes('google.com') || query.includes('maps') || query.includes('goo.gl')) {
        if (isGoogleMapsUrl(query)) {
            const coords = parseCoordinates(query);
            if (coords) {
                suggestions.push(`✓ Extracted coordinates: ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`);
            } else {
                suggestions.push('Paste complete Google Maps URL');
            }
        } else {
            suggestions.push('Paste complete Google Maps URL');
        }
    } else if (query.includes(',')) {
        // Looks like coordinate format
        const coords = parseCoordinates(query);
        if (coords) {
            if (isValidMyanmarCoordinate(coords.lat, coords.lon)) {
                suggestions.push(`✓ Valid Myanmar coordinates`);
            } else {
                suggestions.push('⚠ Coordinates outside Myanmar');
            }
        } else {
            suggestions.push('Format: latitude, longitude (e.g., 16.8661, 96.1951)');
        }
    } else if (query.length > 0 && !query.includes(',') && !query.includes('http')) {
        suggestions.push('Format: latitude, longitude (e.g., 16.8661, 96.1951)');
        suggestions.push('Or paste Google Maps URL');
    }
    
    return suggestions;
} 