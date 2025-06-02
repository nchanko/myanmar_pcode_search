// Location search functionality that combines geocoding with coordinate search

import { searchByLatLong } from './coordinateSearch.js';
import { searchByName } from './textSearch.js';
import { GeocodingService } from '../utils/geocodingService.js';
import { dataManager } from '../data/dataManager.js';
import { calculateDistance } from '../utils/geoUtils.js';

// Create geocoding service instance
const geocodingService = new GeocodingService();

/**
 * Search PCode areas by location name (uses geocoding + proximity search)
 * @param {string} locationName - Name of the location to search near (temple, business, landmark, etc.)
 * @param {number} radius - Search radius in kilometers (default: 10)
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @param {object} options - Additional options
 * @returns {Promise<object>} Object containing PCode areas and geocoding info
 */
export async function searchByLocationName(locationName, radius = 10, maxResults = 10, options = {}) {
    if (!locationName || locationName.trim().length === 0) {
        return {
            success: false,
            error: 'Location name is required',
            results: [],
            geocodingInfo: null
        };
    }

    try {
        // Step 1: Geocode the location name to get coordinates
        const geocodingResults = await geocodingService.geocode(locationName, {
            limit: options.geocodingLimit || 3,
            countryCode: 'mm'
        });

        if (!geocodingResults || geocodingResults.length === 0) {
            return {
                success: false,
                error: `No location found for "${locationName}"`,
                results: [],
                geocodingInfo: null
            };
        }

        const primaryLocation = geocodingResults[0];
        
        // Step 2: Search for nearby PCode administrative areas
        const nearbyAreas = await searchNearbyPCodeAreas(
            primaryLocation.lat, 
            primaryLocation.lon, 
            radius, 
            maxResults
        );

        // Step 3: Add geocoding information to each result
        const enrichedResults = nearbyAreas.map(area => ({
            ...area,
            searchedLocation: {
                name: primaryLocation.name,
                coordinates: {
                    lat: primaryLocation.lat,
                    lon: primaryLocation.lon
                }
            }
        }));

        return {
            success: true,
            results: enrichedResults,
            geocodingInfo: {
                searchedLocation: primaryLocation,
                alternatives: geocodingResults.slice(1),
                totalGeocodeResults: geocodingResults.length
            },
            searchParameters: {
                locationName,
                radius,
                maxResults,
                coordinates: {
                    lat: primaryLocation.lat,
                    lon: primaryLocation.lon
                }
            }
        };

    } catch (error) {
        console.error('Location search failed:', error);
        
        return {
            success: false,
            error: error.message,
            results: [],
            geocodingInfo: null,
            searchParameters: {
                locationName,
                radius,
                maxResults
            }
        };
    }
}

/**
 * Search for nearby villages and towns
 * @param {number} lat - Latitude of the search center
 * @param {number} lon - Longitude of the search center
 * @param {number} radius - Search radius in kilometers
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} Array of nearby villages and towns with distance info
 */
async function searchNearbyPCodeAreas(lat, lon, radius, maxResults) {
    const allResults = [];

    // First search towns within the specified radius
    const townData = dataManager.getData('towns');
    if (townData && townData.length > 0) {
        const nearbyTowns = townData
            .map(item => {
                const itemLat = parseFloat(item.Latitude);
                const itemLon = parseFloat(item.Longitude);
                
                if (isNaN(itemLat) || isNaN(itemLon)) {
                    return null;
                }
                
                const distance = calculateDistance(lat, lon, itemLat, itemLon);
                
                if (distance <= radius) {
                    return {
                        ...item,
                        distance: distance,
                        dataType: 'towns',
                        displayType: 'Town'
                    };
                }
                
                return null;
            })
            .filter(item => item !== null);

        allResults.push(...nearbyTowns);
    }

    // Then search villages within the specified radius
    const villageData = dataManager.getData('villages');
    if (villageData && villageData.length > 0) {
        const nearbyVillages = villageData
            .map(item => {
                const itemLat = parseFloat(item.Latitude);
                const itemLon = parseFloat(item.Longitude);
                
                if (isNaN(itemLat) || isNaN(itemLon)) {
                    return null;
                }
                
                const distance = calculateDistance(lat, lon, itemLat, itemLon);
                
                if (distance <= radius) {
                    return {
                        ...item,
                        distance: distance,
                        dataType: 'villages',
                        displayType: 'Village'
                    };
                }
                
                return null;
            })
            .filter(item => item !== null);

        allResults.push(...nearbyVillages);
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
        'towns': 'Town',
        'wards': 'Ward',
        'villageTracts': 'Village Tract',
        'villages': 'Village'
    };
    return typeMap[dataType] || dataType;
}

/**
 * Get location suggestions for autocomplete
 * @param {string} partialLocationName - Partial location name
 * @param {number} maxSuggestions - Maximum number of suggestions
 * @returns {Promise<Array>} Array of location suggestions
 */
export async function getLocationSuggestions(partialLocationName, maxSuggestions = 5) {
    if (!partialLocationName || partialLocationName.trim().length < 2) {
        return [];
    }

    try {
        const suggestions = await geocodingService.geocode(partialLocationName, {
            limit: maxSuggestions,
            countryCode: 'mm'
        });

        return suggestions.map((suggestion, index) => ({
            name: suggestion.name,
            type: suggestion.type,
            confidence: suggestion.importance || (1 - index * 0.1), // Use importance or fallback
            coordinates: {
                lat: suggestion.lat,
                lon: suggestion.lon
            }
        }));

    } catch (error) {
        console.error('Failed to get location suggestions:', error);
        return [];
    }
}

/**
 * Search with multiple location candidates for better accuracy
 * @param {string} locationName - Name of the location
 * @param {number} radius - Search radius in kilometers
 * @param {number} maxResults - Maximum results per location
 * @returns {Promise<object>} Combined results from multiple candidates
 */
export async function searchByLocationNameAdvanced(locationName, radius = 10, maxResults = 10) {
    if (!locationName || locationName.trim().length === 0) {
        return {
            success: false,
            error: 'Location name is required',
            candidates: []
        };
    }

    try {
        // Get multiple geocoding candidates
        const candidates = await geocodingService.geocode(locationName, {
            limit: 3,
            countryCode: 'mm'
        });
        
        const results = [];

        for (const candidate of candidates) {
            const nearbyAreas = await searchNearbyPCodeAreas(
                candidate.lat, 
                candidate.lon, 
                radius, 
                maxResults
            );
            
            results.push({
                location: {
                    name: candidate.name,
                    confidence: candidate.importance || 0.5,
                    coordinates: {
                        lat: candidate.lat,
                        lon: candidate.lon
                    }
                },
                areas: nearbyAreas.map(area => ({
                    ...area,
                    searchedLocation: {
                        name: candidate.name,
                        confidence: candidate.importance || 0.5
                    }
                })),
                areaCount: nearbyAreas.length
            });
        }

        // Sort by confidence and area count
        results.sort((a, b) => {
            const scoreA = a.location.confidence * 0.7 + (a.areaCount / maxResults) * 0.3;
            const scoreB = b.location.confidence * 0.7 + (b.areaCount / maxResults) * 0.3;
            return scoreB - scoreA;
        });

        return {
            success: true,
            candidates: results,
            searchParameters: {
                locationName,
                radius,
                maxResults
            }
        };

    } catch (error) {
        console.error('Advanced location search failed:', error);
        
        return {
            success: false,
            error: error.message,
            candidates: [],
            searchParameters: {
                locationName,
                radius,
                maxResults
            }
        };
    }
}

/**
 * Validate if a location name is likely to be geocodable
 * @param {string} locationName - Location name to validate
 * @returns {boolean} True if the location name seems valid
 */
export function isValidLocationName(locationName) {
    if (!locationName || typeof locationName !== 'string') {
        return false;
    }

    const trimmed = locationName.trim();
    
    // Basic validation rules
    return trimmed.length >= 2 && 
           trimmed.length <= 100 && 
           !/^\d+\.?\d*\s*,\s*\d+\.?\d*$/.test(trimmed); // Not coordinates
} 