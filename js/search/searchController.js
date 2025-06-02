// Main search controller that coordinates different search types

import { searchByName } from './textSearch.js';
import { searchByPcode } from './pcodeSearch.js';
import { searchByLatLong, isValidCoordinateFormat } from './coordinateSearch.js';
import { searchByLocationName, getLocationSuggestions, isValidLocationName } from './locationSearch.js';

export class SearchController {
    constructor() {
        this.searchByPcode = false;
        this.searchByCoordinates = false;
        this.searchByLocation = false; // New location search mode
        this.currentDataType = 'towns';
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
        // Location search searches both villages and towns regardless of selected type
    }

    /**
     * Set current data type
     * @param {string} dataType - Data type: 'towns', 'wards', 'villageTracts', 'villages'
     */
    setDataType(dataType) {
        // Don't change data type if in coordinate search mode (which is villages-only)
        if (!this.searchByCoordinates) {
            this.currentDataType = dataType;
        }
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
            // Return a promise for async location search
            return this.performLocationSearch(query.trim(), maxResults, options);
        } else if (this.searchByCoordinates) {
            return searchByLatLong(query.trim(), options.radius || 10, maxResults);
        } else if (this.searchByPcode) {
            return searchByPcode(query.trim(), this.currentDataType, maxResults);
        } else {
            return searchByName(query.trim(), this.currentDataType, maxResults);
        }
    }

    /**
     * Perform location search (async)
     * @param {string} query - Location name query
     * @param {number} maxResults - Maximum number of results
     * @param {object} options - Search options
     * @returns {Promise<Array>} Promise resolving to search results
     */
    async performLocationSearch(query, maxResults, options = {}) {
        try {
            const result = await searchByLocationName(
                query, 
                options.radius || 10, 
                maxResults,
                options
            );
            
            if (result.success) {
                return result.results;
            } else {
                console.warn('Location search failed:', result.error);
                return [];
            }
        } catch (error) {
            console.error('Location search error:', error);
            return [];
        }
    }

    /**
     * Get search suggestions based on current mode
     * @param {string} query - Partial query for suggestions
     * @param {number} maxSuggestions - Maximum number of suggestions
     * @returns {Promise<Array>|Array} Suggestions (Promise for location mode, Array for others)
     */
    getSuggestions(query, maxSuggestions = 5) {
        if (this.searchByLocation) {
            return getLocationSuggestions(query, maxSuggestions);
        } else {
            // For other modes, return empty array (could be enhanced later)
            return [];
        }
    }

    /**
     * Validate query format for current search mode
     * @param {string} query - Query to validate
     * @returns {boolean} True if query format is valid for current mode
     */
    isValidQuery(query) {
        if (!query || query.trim().length === 0) {
            return false;
        }

        if (this.searchByLocation) {
            return isValidLocationName(query);
        } else if (this.searchByCoordinates) {
            return isValidCoordinateFormat(query);
        } else {
            // For name and pcode search, basic validation
            return query.trim().length >= 1;
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
     * Get current data type
     * @returns {string} Current data type
     */
    getDataType() {
        return this.currentDataType;
    }

    /**
     * Check if location search is active
     * @returns {boolean} True if location search is active
     */
    isLocationSearch() {
        return this.searchByLocation;
    }

    /**
     * Check if coordinate search is active
     * @returns {boolean} True if coordinate search is active
     */
    isCoordinateSearch() {
        return this.searchByCoordinates;
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
}

// Create and export singleton instance
export const searchController = new SearchController(); 