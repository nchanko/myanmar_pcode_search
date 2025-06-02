// Geocoding service for converting place names to coordinates

/**
 * Geocoding service that supports multiple providers
 */
export class GeocodingService {
    constructor() {
        this.providers = {
            nominatim: {
                name: 'OpenStreetMap Nominatim',
                baseUrl: 'https://nominatim.openstreetmap.org/search',
                enabled: true
            }
            // Can add Google Maps, Mapbox, etc. here later
        };
        this.defaultProvider = 'nominatim';
    }

    /**
     * Geocode a place name to coordinates using OpenStreetMap Nominatim
     * @param {string} placeName - Name of the place to geocode
     * @param {object} options - Geocoding options
     * @returns {Promise<Array>} Array of geocoding results
     */
    async geocodeWithNominatim(placeName, options = {}) {
        const {
            limit = 5,
            countryCode = 'mm', // Myanmar country code
            language = 'en',
            format = 'json'
        } = options;

        try {
            const params = new URLSearchParams({
                q: placeName,
                format: format,
                limit: limit.toString(),
                countrycodes: countryCode,
                'accept-language': language,
                addressdetails: '1',
                extratags: '1'
            });

            const url = `${this.providers.nominatim.baseUrl}?${params}`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Myanmar PCode Search App/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Transform the response to our standard format
            return data.map(result => ({
                name: result.display_name,
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                importance: result.importance || 0,
                type: result.type || 'unknown',
                class: result.class || 'unknown',
                place_id: result.place_id,
                boundingbox: result.boundingbox ? {
                    north: parseFloat(result.boundingbox[1]),
                    south: parseFloat(result.boundingbox[0]),
                    east: parseFloat(result.boundingbox[3]),
                    west: parseFloat(result.boundingbox[2])
                } : null,
                address: result.address || {},
                provider: 'nominatim'
            }));
        } catch (error) {
            console.error('Nominatim geocoding error:', error);
            throw new Error(`Geocoding failed: ${error.message}`);
        }
    }

    /**
     * Main geocoding method that uses the default or specified provider
     * @param {string} placeName - Name of the place to geocode
     * @param {object} options - Geocoding options
     * @returns {Promise<Array>} Array of geocoding results
     */
    async geocode(placeName, options = {}) {
        const provider = options.provider || this.defaultProvider;
        
        if (!placeName || typeof placeName !== 'string' || placeName.trim().length === 0) {
            throw new Error('Place name is required and must be a non-empty string');
        }

        switch (provider) {
            case 'nominatim':
                return await this.geocodeWithNominatim(placeName.trim(), options);
            default:
                throw new Error(`Unsupported geocoding provider: ${provider}`);
        }
    }

    /**
     * Reverse geocoding - convert coordinates to place name
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {object} options - Reverse geocoding options
     * @returns {Promise<object>} Reverse geocoding result
     */
    async reverseGeocode(lat, lon, options = {}) {
        const {
            language = 'en',
            format = 'json'
        } = options;

        try {
            const params = new URLSearchParams({
                lat: lat.toString(),
                lon: lon.toString(),
                format: format,
                'accept-language': language,
                addressdetails: '1'
            });

            const url = `https://nominatim.openstreetmap.org/reverse?${params}`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Myanmar PCode Search App/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                name: data.display_name,
                lat: parseFloat(data.lat),
                lon: parseFloat(data.lon),
                address: data.address || {},
                place_id: data.place_id,
                provider: 'nominatim'
            };
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            throw new Error(`Reverse geocoding failed: ${error.message}`);
        }
    }

    /**
     * Get available providers
     * @returns {Array} Array of available provider names
     */
    getAvailableProviders() {
        return Object.keys(this.providers).filter(key => this.providers[key].enabled);
    }

    /**
     * Set default provider
     * @param {string} provider - Provider name
     */
    setDefaultProvider(provider) {
        if (!this.providers[provider]) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        this.defaultProvider = provider;
    }
}

// Create and export singleton instance
 