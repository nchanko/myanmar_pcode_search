// Optimized geographic utility functions with caching and performance enhancements

// Distance calculation cache
const distanceCache = new Map();
const CACHE_SIZE_LIMIT = 10000; // Limit cache size to prevent memory issues

/**
 * Fast bounding box check before expensive distance calculation
 * @param {number} lat1 - Center latitude
 * @param {number} lon1 - Center longitude  
 * @param {number} lat2 - Point latitude
 * @param {number} lon2 - Point longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean} True if point might be within radius (rough check)
 */
export function isWithinBoundingBox(lat1, lon1, lat2, lon2, radiusKm) {
    // Convert radius to approximate degrees (rough but fast)
    const radiusDegrees = radiusKm / 111; // ~111km per degree at equator
    
    const latDiff = Math.abs(lat1 - lat2);
    const lonDiff = Math.abs(lon1 - lon2);
    
    return latDiff <= radiusDegrees && lonDiff <= radiusDegrees;
}

/**
 * Optimized distance calculation with caching and fast rejection
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @param {number} maxRadius - Maximum radius for early rejection (optional)
 * @returns {number} Distance in kilometers
 */
export function calculateDistanceOptimized(lat1, lon1, lat2, lon2, maxRadius = null) {
    // Generate cache key
    const cacheKey = `${lat1.toFixed(4)},${lon1.toFixed(4)},${lat2.toFixed(4)},${lon2.toFixed(4)}`;
    
    // Check cache first
    if (distanceCache.has(cacheKey)) {
        return distanceCache.get(cacheKey);
    }
    
    // Fast bounding box check if maxRadius provided
    if (maxRadius && !isWithinBoundingBox(lat1, lon1, lat2, lon2, maxRadius)) {
        const distance = Infinity; // Mark as too far
        
        // Cache the result
        if (distanceCache.size < CACHE_SIZE_LIMIT) {
            distanceCache.set(cacheKey, distance);
        }
        
        return distance;
    }
    
    // Calculate precise distance using Haversine formula
    const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    
    // Cache the result
    if (distanceCache.size < CACHE_SIZE_LIMIT) {
        distanceCache.set(cacheKey, distance);
    }
    
    return distance;
}

/**
 * Haversine distance calculation (optimized version)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    
    // Convert to radians
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
}

/**
 * Batch distance calculation for multiple points
 * @param {number} centerLat - Center latitude
 * @param {number} centerLon - Center longitude
 * @param {Array} points - Array of {lat, lon} objects
 * @param {number} maxRadius - Maximum radius for filtering
 * @returns {Array} Array of {point, distance} objects within radius
 */
export function calculateDistancesBatch(centerLat, centerLon, points, maxRadius = 10) {
    const results = [];
    
    for (const point of points) {
        // Fast bounding box check first
        if (!isWithinBoundingBox(centerLat, centerLon, point.lat, point.lon, maxRadius)) {
            continue;
        }
        
        const distance = calculateDistanceOptimized(centerLat, centerLon, point.lat, point.lon, maxRadius);
        
        if (distance <= maxRadius) {
            results.push({
                ...point,
                distance
            });
        }
    }
    
    return results.sort((a, b) => a.distance - b.distance);
}

/**
 * Clear distance cache (useful for memory management)
 */
export function clearDistanceCache() {
    distanceCache.clear();
    console.log('Distance cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    return {
        cacheSize: distanceCache.size,
        cacheLimit: CACHE_SIZE_LIMIT,
        memoryUsage: `${((distanceCache.size * 50) / 1024).toFixed(1)} KB` // Rough estimate
    };
}

// Re-export from original geoUtils for compatibility
export { isValidMyanmarCoordinate, parseCoordinates, isValidCoordinateInput, isGoogleMapsUrl } from './geoUtils.js'; 