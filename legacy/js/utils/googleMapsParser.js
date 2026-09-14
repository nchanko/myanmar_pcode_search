// Google Maps URL parsing and validation utilities

/**
 * Extract coordinates from Google Maps URL
 * @param {string} url - Google Maps URL
 * @returns {object|null} Object with lat and lon properties, or null if not a valid Google Maps URL
 */
export function extractCoordsFromGoogleMapsUrl(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }

    // Check if it's a Google Maps URL
    if (!isGoogleMapsUrl(url)) {
        return null;
    }

    try {
        // Method 1: Extract from @lat,lng pattern in URL path
        const pathPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const pathMatch = url.match(pathPattern);
        
        if (pathMatch) {
            const lat = parseFloat(pathMatch[1]);
            const lng = parseFloat(pathMatch[2]);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                return { lat, lon: lng };
            }
        }

        // Method 2: Extract from query parameters (3d=lat, 4d=lng)
        const paramPattern = /3d(-?\d+\.?\d*).*?4d(-?\d+\.?\d*)/;
        const paramMatch = url.match(paramPattern);
        
        if (paramMatch) {
            const lat = parseFloat(paramMatch[1]);
            const lng = parseFloat(paramMatch[2]);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                return { lat, lon: lng };
            }
        }

        // Method 3: Extract from ll= parameter (less common)
        const llPattern = /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const llMatch = url.match(llPattern);
        
        if (llMatch) {
            const lat = parseFloat(llMatch[1]);
            const lng = parseFloat(llMatch[2]);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                return { lat, lon: lng };
            }
        }

        // Method 4: Extract from q= parameter with coordinates
        const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const qMatch = url.match(qPattern);
        
        if (qMatch) {
            const lat = parseFloat(qMatch[1]);
            const lng = parseFloat(qMatch[2]);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                return { lat, lon: lng };
            }
        }

        return null;
    } catch (error) {
        console.error('Error extracting coordinates from Google Maps URL:', error);
        return null;
    }
}

/**
 * Check if a string is likely a Google Maps URL
 * @param {string} input - Input string to check
 * @returns {boolean} True if input appears to be a Google Maps URL
 */
export function isGoogleMapsUrl(input) {
    if (!input || typeof input !== 'string') {
        return false;
    }
    
    return input.includes('google.com/maps') || 
           input.includes('goo.gl/maps') || 
           input.includes('maps.google.com') ||
           input.includes('maps.app.goo.gl');
}

/**
 * Validate if a Google Maps URL contains extractable coordinates
 * @param {string} url - Google Maps URL to validate
 * @returns {boolean} True if coordinates can be extracted from the URL
 */
export function isValidGoogleMapsUrl(url) {
    if (!isGoogleMapsUrl(url)) {
        return false;
    }
    
    const coords = extractCoordsFromGoogleMapsUrl(url);
    return coords !== null;
}

/**
 * Get detailed information about a Google Maps URL
 * @param {string} url - Google Maps URL to analyze
 * @returns {object} Object containing URL analysis results
 */
export function analyzeGoogleMapsUrl(url) {
    const result = {
        isGoogleMapsUrl: isGoogleMapsUrl(url),
        hasCoordinates: false,
        coordinates: null,
        extractionMethod: null,
        isValid: false
    };

    if (!result.isGoogleMapsUrl) {
        return result;
    }

    // Try different extraction methods and track which one worked
    const methods = [
        { name: '@lat,lng pattern', pattern: /@(-?\d+\.?\d*),(-?\d+\.?\d*)/ },
        { name: '3d/4d parameters', pattern: /3d(-?\d+\.?\d*).*?4d(-?\d+\.?\d*)/ },
        { name: 'll parameter', pattern: /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/ },
        { name: 'q parameter', pattern: /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/ }
    ];

    for (const method of methods) {
        const match = url.match(method.pattern);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                result.hasCoordinates = true;
                result.coordinates = { lat, lon: lng };
                result.extractionMethod = method.name;
                result.isValid = true;
                break;
            }
        }
    }

    return result;
}

/**
 * Extract location name from Google Maps URL (if available)
 * @param {string} url - Google Maps URL
 * @returns {string|null} Location name if found, null otherwise
 */
export function extractLocationNameFromGoogleMapsUrl(url) {
    if (!isGoogleMapsUrl(url)) {
        return null;
    }

    try {
        // Try to extract place name from the URL path
        const placePattern = /\/place\/([^/@]+)/;
        const placeMatch = url.match(placePattern);
        
        if (placeMatch) {
            // Decode URL-encoded characters
            return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        }

        // Try to extract from search query
        const searchPattern = /[?&]q=([^&@]+)/;
        const searchMatch = url.match(searchPattern);
        
        if (searchMatch) {
            const query = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
            // Only return if it doesn't look like coordinates
            if (!/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(query)) {
                return query;
            }
        }

        return null;
    } catch (error) {
        console.error('Error extracting location name from Google Maps URL:', error);
        return null;
    }
} 