// Main search controller that coordinates different search types

import { searchByName } from './textSearch.js';
import { searchByPcode } from './pcodeSearch.js';
import { searchByLatLong } from './coordinateSearch.js';

export class SearchController {
    constructor() {
        this.searchByPcode = false;
        this.searchByCoordinates = false;
        this.currentDataType = 'towns';
    }

    /**
     * Set search mode
     * @param {string} mode - Search mode: 'name', 'pcode', or 'coordinates'
     */
    setSearchMode(mode) {
        this.searchByPcode = mode === 'pcode';
        this.searchByCoordinates = mode === 'coordinates';
        
        // For coordinate search, always use villages
        if (this.searchByCoordinates) {
            this.currentDataType = 'villages';
        }
    }

    /**
     * Set current data type
     * @param {string} dataType - Data type: 'towns', 'wards', 'villageTracts', 'villages'
     */
    setDataType(dataType) {
        // Don't change data type if in coordinate search mode
        if (!this.searchByCoordinates) {
            this.currentDataType = dataType;
        }
    }

    /**
     * Perform search based on current mode
     * @param {string} query - Search query
     * @param {number} maxResults - Maximum number of results
     * @returns {Array} Search results
     */
    search(query, maxResults = 20) {
        if (!query || query.trim().length === 0) {
            return [];
        }

        if (this.searchByCoordinates) {
            return searchByLatLong(query.trim(), 10, maxResults);
        } else if (this.searchByPcode) {
            return searchByPcode(query.trim(), this.currentDataType, maxResults);
        } else {
            return searchByName(query.trim(), this.currentDataType, maxResults);
        }
    }

    /**
     * Get current search mode
     * @returns {string} Current search mode
     */
    getSearchMode() {
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
}

// Create and export singleton instance
export const searchController = new SearchController(); 