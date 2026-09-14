// Optimized location search using spatial indexing and fast distance calculations

import { GeocodingService } from '../utils/geocodingService.js';
import { dataManager } from '../data/dataManager.js';
import { calculateDistanceOptimized, calculateDistancesBatch } from '../utils/optimizedGeoUtils.js';
import { parseCoordinates, isValidMyanmarCoordinate } from '../utils/geoUtils.js';

// Create geocoding service instance
const geocodingService = new GeocodingService();

/**
 * Optimized search PCode areas by location name (uses spatial indexing)
 * @param {string} locationName - Name of the location to search near
 * @param {number} radius - Search radius in kilometers (default: 10)
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @param {object} options - Additional options
 * @returns {Promise<object>} Object containing PCode areas and geocoding info
 */
export async function searchByLocationNameOptimized(locationName, radius = 10, maxResults = 10, options = {}) {
    if (!locationName || locationName.trim().length === 0) {
        return {
            success: false,
            error: 'Location name is required',
            results: [],
            geocodingInfo: null
        };
    }

    // Check if data is loaded
    if (!dataManager.isDataLoaded()) {
        const loadingPromise = dataManager.getLoadingPromise();
        if (loadingPromise) {
            await loadingPromise; // Wait for data to load
        } else {
            return {
                success: false,
                error: 'Data not loaded. Please wait for initialization.',
                results: [],
                geocodingInfo: null
            };
        }
    }

    try {
        console.time(`Location search: ${locationName}`);
        
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
        
        // Step 2: Fast spatial search using spatial index
        const nearbyAreas = await searchNearbyPCodeAreasOptimized(
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

        console.timeEnd(`Location search: ${locationName}`);
        console.log(`Found ${enrichedResults.length} results in ${radius}km radius`);

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
        console.error('Optimized location search failed:', error);
        
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
 * Optimized search for nearby villages and towns using spatial index
 * @param {number} lat - Latitude of the search center
 * @param {number} lon - Longitude of the search center
 * @param {number} radius - Search radius in kilometers
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} Array of nearby villages and towns with distance info
 */
async function searchNearbyPCodeAreasOptimized(lat, lon, radius, maxResults) {
    console.time('Spatial index search');
    
    // Get spatial index from data manager
    const spatialIndex = dataManager.getSpatialIndex();
    
    // Use spatial index to get candidates (much faster than checking all records)
    const candidates = spatialIndex.searchWithinRadius(lat, lon, radius, maxResults * 3); // Get more candidates to ensure we have enough after distance filtering
    
    console.timeEnd('Spatial index search');
    console.log(`Spatial index returned ${candidates.length} candidates`);
    
    if (candidates.length === 0) {
        return [];
    }
    
    console.time('Distance filtering');
    
    // Convert candidates to format expected by batch distance calculation
    const candidatesWithCoords = candidates.map(item => ({
        ...item,
        lat: item.lat || parseFloat(item.Latitude),
        lon: item.lon || parseFloat(item.Longitude)
    }));
    
    // Use optimized batch distance calculation
    const nearbyResults = calculateDistancesBatch(lat, lon, candidatesWithCoords, radius);
    
    // Add metadata for each result
    const enrichedResults = nearbyResults.map(item => ({
        ...item,
        displayType: getDisplayTypeName(item.dataType)
    }));
    
    console.timeEnd('Distance filtering');
    console.log(`Distance filtering returned ${enrichedResults.length} results`);
    
    // Return top results sorted by distance
    return enrichedResults.slice(0, maxResults);
}

/**
 * Fast coordinate search using spatial index (optimized version of coordinateSearch)
 * @param {string} query - Coordinate string (e.g., "16.8661, 96.1951")
 * @param {number} radius - Search radius in kilometers (default: 10)
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @returns {Array} Array of villages and towns with distance information
 */
export function searchByLatLongOptimized(query, radius = 10, maxResults = 10) {
    const coordinates = parseCoordinates(query);
    
    if (!coordinates) {
        return []; // Return empty if format is invalid
    }
    
    const { lat: searchLat, lon: searchLon } = coordinates;
    
    // Validate coordinate ranges for Myanmar
    if (!isValidMyanmarCoordinate(searchLat, searchLon)) {
        return []; // Return empty if coordinates are outside Myanmar bounds
    }
    
    // Check if data is loaded
    if (!dataManager.isDataLoaded()) {
        console.warn('Data not loaded for coordinate search');
        return [];
    }
    
    console.time(`Coordinate search: ${query}`);
    
    // Use spatial index for fast search
    const spatialIndex = dataManager.getSpatialIndex();
    const candidates = spatialIndex.searchWithinRadius(searchLat, searchLon, radius, maxResults * 2);
    
    // Convert candidates and calculate precise distances
    const candidatesWithCoords = candidates.map(item => ({
        ...item,
        lat: item.lat || parseFloat(item.Latitude),
        lon: item.lon || parseFloat(item.Longitude)
    }));
    
    const results = calculateDistancesBatch(searchLat, searchLon, candidatesWithCoords, radius);
    
    console.timeEnd(`Coordinate search: ${query}`);
    console.log(`Coordinate search found ${results.length} results`);
    
    return results.slice(0, maxResults);
}

/**
 * Get location suggestions for autocomplete (optimized)
 * @param {string} partialLocationName - Partial location name
 * @param {number} maxSuggestions - Maximum number of suggestions
 * @returns {Promise<Array>} Array of location suggestions
 */
export async function getLocationSuggestionsOptimized(partialLocationName, maxSuggestions = 5) {
    if (!partialLocationName || partialLocationName.trim().length < 2) {
        return [];
    }

    try {
        // Use lower limit for suggestions to be faster
        const geocodingResults = await geocodingService.geocode(partialLocationName.trim(), {
            limit: maxSuggestions,
            countryCode: 'mm'
        });

        return geocodingResults.map(result => ({
            name: result.name,
            type: result.type,
            coordinates: {
                lat: result.lat,
                lon: result.lon
            }
        }));
    } catch (error) {
        console.error('Error getting location suggestions:', error);
        return [];
    }
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
 * Validate location name input
 * @param {string} locationName - Location name to validate
 * @returns {boolean} True if valid
 */
export function isValidLocationName(locationName) {
    return locationName && 
           typeof locationName === 'string' && 
           locationName.trim().length >= 2 && 
           locationName.trim().length <= 100;
} 