// Data management module for handling pcode and postal data

import { spatialIndex } from '../utils/spatialIndex.js';

class DataManager {
    constructor() {
        this.pcodeData = {
            towns: [],
            wards: [],
            villageTracts: [],
            villages: []
        };
        this.postalData = [];
        this.postalLookup = new Map();
        this.filteredData = [];
        this.dataLoaded = false;
        this.loadingPromise = null;
    }

    /**
     * Load CSV data for a specific data type
     * @param {string} file - CSV file path
     * @param {string} dataType - Type of data (towns, wards, villageTracts, villages)
     */
    async loadCSVData(file, dataType) {
        try {
            console.time(`Loading ${dataType}`);
            const response = await fetch(file);
            const csvText = await response.text();
            
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true, // Skip empty lines for performance
                    complete: (results) => {
                        // Filter out invalid entries
                        const validData = results.data.filter(row => {
                            // Basic validation - ensure required fields exist
                            return row && Object.keys(row).length > 0;
                        });
                        
                        this.pcodeData[dataType] = validData;
                        this.updateFilters(dataType);
                        
                        console.timeEnd(`Loading ${dataType}`);
                        console.log(`CSV data loaded for ${dataType}:`, validData.length, 'records');
                        resolve(validData);
                    },
                    error: (error) => {
                        console.error(`Error parsing CSV for ${dataType}:`, error);
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error(`Error loading CSV for ${dataType}:`, error);
            throw error;
        }
    }

    /**
     * Load postal code data
     * @param {string} file - Postal data CSV file path
     */
    async loadPostalData(file) {
        try {
            console.time('Loading postal data');
            const response = await fetch(file);
            const csvText = await response.text();
            
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        this.postalData = results.data;
                        this.createPostalLookup();
                        console.timeEnd('Loading postal data');
                        console.log('Postal data loaded:', this.postalData.length, 'records');
                        resolve(results.data);
                    },
                    error: (error) => {
                        console.error('Error parsing postal data:', error);
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error('Error loading postal data:', error);
            throw error;
        }
    }

    /**
     * Create postal code lookup map
     */
    createPostalLookup() {
        console.time('Building postal lookup');
        this.postalLookup.clear(); // Clear existing data
        
        this.postalData.forEach(item => {
            const pcode = item['VT_Pcode'] || item['Ward_Pcode'];
            if (pcode) {
                this.postalLookup.set(pcode, item);
            }
        });
        
        console.timeEnd('Building postal lookup');
        console.log('Postal lookup created:', this.postalLookup.size, 'entries');
    }

    /**
     * Build spatial index after all data is loaded
     */
    buildSpatialIndex() {
        console.log('Building spatial index for location searches...');
        spatialIndex.buildIndex(
            this.pcodeData.towns,
            this.pcodeData.villages,
            this.pcodeData.wards,
            this.pcodeData.villageTracts
        );
        
        // Log spatial index statistics
        const stats = spatialIndex.getStats();
        console.log('Spatial index statistics:', stats);
    }

    /**
     * Update filtered data for a specific data type
     * @param {string} dataType - Type of data to filter
     */
    updateFilters(dataType) {
        this.filteredData = this.pcodeData[dataType];
    }

    /**
     * Get data for a specific type
     * @param {string} dataType - Type of data to retrieve
     * @returns {Array} Array of data items
     */
    getData(dataType) {
        return this.pcodeData[dataType] || [];
    }

    /**
     * Get spatial index for advanced searches
     * @returns {SpatialIndex} Spatial index instance
     */
    getSpatialIndex() {
        return spatialIndex;
    }

    /**
     * Get postal information by pcode
     * @param {string} pcode - PCode to lookup
     * @returns {object|null} Postal information or null if not found
     */
    getPostalInfo(pcode) {
        return this.postalLookup.get(pcode) || null;
    }

    /**
     * Check if data is loaded
     * @returns {boolean} True if all data is loaded
     */
    isDataLoaded() {
        return this.dataLoaded;
    }

    /**
     * Get loading promise for async operations
     * @returns {Promise|null} Loading promise or null if not loading
     */
    getLoadingPromise() {
        return this.loadingPromise;
    }

    /**
     * Initialize all data loading with optimizations
     */
    async initializeData() {
        if (this.loadingPromise) {
            return this.loadingPromise; // Return existing promise if already loading
        }

        this.loadingPromise = this._performDataInitialization();
        return this.loadingPromise;
    }

    /**
     * Internal method to perform data initialization
     */
    async _performDataInitialization() {
        try {
            console.time('Total data initialization');
            
            // Load all CSV data in parallel for maximum speed
            await Promise.all([
                this.loadCSVData('data/pcode9.6_town_data.csv', 'towns'),
                this.loadCSVData('data/pcode9.6_ward_data.csv', 'wards'),
                this.loadCSVData('data/pcode9.6_village_tract_data.csv', 'villageTracts'),
                this.loadCSVData('data/pcode9.6_village_data.csv', 'villages'),
                this.loadPostalData('data/myanmar_postal_code_data.csv')
            ]);
            
            // Build spatial index for fast location searches
            this.buildSpatialIndex();
            
            this.dataLoaded = true;
            console.timeEnd('Total data initialization');
            console.log('🚀 All data loaded and optimized successfully!');
            
            // Log memory usage statistics
            this._logPerformanceStats();
            
        } catch (error) {
            console.error('Error initializing data:', error);
            this.dataLoaded = false;
            throw error;
        } finally {
            this.loadingPromise = null;
        }
    }

    /**
     * Log performance statistics
     */
    _logPerformanceStats() {
        const totalRecords = Object.values(this.pcodeData).reduce((sum, data) => sum + data.length, 0);
        const spatialStats = spatialIndex.getStats();
        
        console.log('📊 Performance Statistics:');
        console.log(`  Total records loaded: ${totalRecords.toLocaleString()}`);
        console.log(`  Towns: ${this.pcodeData.towns.length.toLocaleString()}`);
        console.log(`  Villages: ${this.pcodeData.villages.length.toLocaleString()}`);
        console.log(`  Wards: ${this.pcodeData.wards.length.toLocaleString()}`);
        console.log(`  Village Tracts: ${this.pcodeData.villageTracts.length.toLocaleString()}`);
        console.log(`  Spatial index: ${spatialStats.gridCells} cells, ${spatialStats.avgPerCell} avg per cell`);
        console.log(`  Postal lookup: ${this.postalLookup.size} entries`);
    }
}

// Create and export a singleton instance
export const dataManager = new DataManager(); 