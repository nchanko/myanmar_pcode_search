// Main search controller that coordinates different search types

import { searchByName } from './textSearch.js';
import { searchByPcode } from './pcodeSearch.js';
import { searchByLatLong, isValidCoordinateFormat } from './coordinateSearch.js';
import { 
    searchByLocationNameOptimized, 
    getLocationSuggestionsOptimized, 
    isValidLocationName,
    searchByLatLongOptimized 
} from './optimizedLocationSearch.js';

export class SearchController {
    constructor() {
        this.searchByPcode = false;
        this.searchByCoordinates = false;
        this.searchByLocation = false;
        this.currentDataType = 'towns';
        this.useOptimizedSearch = true; // Flag to enable optimized searches
    }

    /**
     * Set search mode
     * @param {string} mode - Search mode: 'name', 'pcode', 'coordinates', or 'location'
     */
    setSearchMode(mode) {
        this.searchByPcode = mode === 'pcode';
        this.searchByCoordinates = mode === 'coordinates';
        this.searchByLocation = mode === 'location';
        
        // For coordinate search, always use villages (since it searches villages specifically)
        if (this.searchByCoordinates) {
            this.currentDataType = 'villages';
        }
    }

    /**
     * Get current search mode
     * @returns {string} Current search mode
     */
    getSearchMode() {
        if (this.searchByLocation) return 'location';
        if (this.searchByCoordinates) return 'coordinates';
        if (this.searchByPcode) return 'pcode';
        return 'name';
    }

    /**
     * Set data type for search
     * @param {string} dataType - Data type: 'towns', 'wards', 'villageTracts', 'villages'
     */
    setDataType(dataType) {
        // Don't change data type if in coordinate search mode (which is villages-only)
        if (!this.searchByCoordinates) {
            this.currentDataType = dataType;
        }
    }

    /**
     * Get current data type
     * @returns {string} Current data type
     */
    getDataType() {
        return this.currentDataType;
    }

    /**
     * Check if coordinate search is active
     * @returns {boolean} True if coordinate search is active
     */
    isCoordinateSearch() {
        return this.searchByCoordinates;
    }

    /**
     * Check if location search is active
     * @returns {boolean} True if location search is active
     */
    isLocationSearch() {
        return this.searchByLocation;
    }

    /**
     * Check if PCode search is active
     * @returns {boolean} True if PCode search is active
     */
    isPcodeSearch() {
        return this.searchByPcode;
    }

    /**
     * Check if the current search mode is async
     * @returns {boolean} True if current search mode requires async handling
     */
    isAsyncSearch() {
        return this.searchByLocation;
    }

    /**
     * Get search mode configuration
     * @returns {object} Configuration object with mode details
     */
    getSearchConfig() {
        return {
            mode: this.getSearchMode(),
            dataType: this.currentDataType,
            isAsync: this.isAsyncSearch(),
            supportsRadius: this.searchByCoordinates || this.searchByLocation,
            supportsSuggestions: this.searchByLocation
        };
    }

    /**
     * Perform search based on current mode
     * @param {string} query - Search query
     * @param {number} maxResults - Maximum number of results
     * @param {object} options - Additional search options
     * @returns {Promise<Array>|Array} Search results (Promise for location search, Array for others)
     */
    search(query, maxResults = 20, options = {}) {
        if (!query || query.trim().length === 0) {
            return this.searchByLocation ? Promise.resolve([]) : [];
        }

        if (this.searchByLocation) {
            // Use optimized location search
            if (this.useOptimizedSearch) {
                return this.searchOptimizedLocation(query.trim(), options.radius || 10, maxResults, options);
            } else {
                // Fallback to original location search
                return this.searchOriginalLocation(query.trim(), options.radius || 10, maxResults, options);
            }
        } else if (this.searchByCoordinates) {
            // Use optimized coordinate search
            if (this.useOptimizedSearch) {
                return searchByLatLongOptimized(query.trim(), options.radius || 10, maxResults);
            } else {
                return searchByLatLong(query.trim(), options.radius || 10, maxResults);
            }
        } else if (this.searchByPcode) {
            return searchByPcode(query.trim(), this.currentDataType, maxResults);
        } else {
            return searchByName(query.trim(), this.currentDataType, maxResults);
        }
    }

    /**
     * Optimized location search wrapper
     * @param {string} query - Search query
     * @param {number} radius - Search radius
     * @param {number} maxResults - Maximum results
     * @param {object} options - Additional options
     * @returns {Promise<Array>} Search results
     */
    async searchOptimizedLocation(query, radius, maxResults, options) {
        try {
            const result = await searchByLocationNameOptimized(
                query, 
                radius, 
                maxResults,
                options
            );
            
            return result.success ? result.results : [];
        } catch (error) {
            console.error('Optimized location search error:', error);
            return [];
        }
    }

    /**
     * Original location search wrapper (fallback)
     * @param {string} query - Search query
     * @param {number} radius - Search radius
     * @param {number} maxResults - Maximum results
     * @param {object} options - Additional options
     * @returns {Promise<Array>} Search results
     */
    async searchOriginalLocation(query, radius, maxResults, options) {
        try {
            // Import original location search dynamically
            const { searchByLocationName } = await import('./locationSearch.js');
            
            const result = await searchByLocationName(
                query, 
                radius, 
                maxResults,
                options
            );
            
            return result.success ? result.results : [];
        } catch (error) {
            console.error('Original location search error:', error);
            return [];
        }
    }

    /**
     * Get suggestions for autocomplete
     * @param {string} partialQuery - Partial search query
     * @param {number} maxSuggestions - Maximum number of suggestions
     * @returns {Promise<Array>|Array} Array of suggestions
     */
    async getSuggestions(partialQuery, maxSuggestions = 5) {
        if (!partialQuery || partialQuery.trim().length < 2) {
            return [];
        }

        if (this.searchByLocation) {
            // Use optimized location suggestions
            if (this.useOptimizedSearch) {
                return await getLocationSuggestionsOptimized(partialQuery.trim(), maxSuggestions);
            } else {
                // Fallback to original suggestions
                try {
                    const { getLocationSuggestions } = await import('./locationSearch.js');
                    return await getLocationSuggestions(partialQuery.trim(), maxSuggestions);
                } catch (error) {
                    console.error('Error getting location suggestions:', error);
                    return [];
                }
            }
        } else {
            // For other search types, return empty (they don't use autocomplete)
            return [];
        }
    }

    /**
     * Validate query format based on current search mode
     * @param {string} query - Query to validate
     * @returns {boolean} True if query is valid for current mode
     */
    isValidQuery(query) {
        if (!query || typeof query !== 'string') {
            return false;
        }

        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length === 0) {
            return false;
        }

        if (this.searchByLocation) {
            return isValidLocationName(trimmedQuery);
        } else if (this.searchByCoordinates) {
            return isValidCoordinateFormat(trimmedQuery);
        } else {
            // For name and pcode search, any non-empty string is valid
            return trimmedQuery.length >= 1;
        }
    }

    /**
     * Toggle between optimized and original search (for testing/fallback)
     * @param {boolean} useOptimized - Whether to use optimized search
     */
    setOptimizedSearch(useOptimized) {
        this.useOptimizedSearch = useOptimized;
        console.log(`Search optimization ${useOptimized ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get search performance statistics
     * @returns {object} Performance statistics
     */
    getPerformanceStats() {
        // Import performance utilities
        const { getCacheStats } = require('../utils/optimizedGeoUtils.js');
        const { dataManager } = require('../data/dataManager.js');
        
        const cacheStats = getCacheStats();
        const spatialStats = dataManager.isDataLoaded() ? dataManager.getSpatialIndex().getStats() : null;
        
        return {
            optimizedSearchEnabled: this.useOptimizedSearch,
            distanceCache: cacheStats,
            spatialIndex: spatialStats,
            currentMode: this.getSearchMode(),
            currentDataType: this.currentDataType
        };
    }
}

// Create and export singleton instance
export const searchController = new SearchController(); 