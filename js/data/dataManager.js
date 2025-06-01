// Data management module for handling pcode and postal data

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
    }

    /**
     * Load CSV data for a specific data type
     * @param {string} file - CSV file path
     * @param {string} dataType - Type of data (towns, wards, villageTracts, villages)
     */
    async loadCSVData(file, dataType) {
        try {
            const response = await fetch(file);
            const csvText = await response.text();
            
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        this.pcodeData[dataType] = results.data;
                        this.updateFilters(dataType);
                        console.log(`CSV data loaded for ${dataType}:`, this.pcodeData[dataType].length, 'records');
                        resolve(results.data);
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
            const response = await fetch(file);
            const csvText = await response.text();
            
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        this.postalData = results.data;
                        this.createPostalLookup();
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
        this.postalData.forEach(item => {
            const pcode = item['VT_Pcode'] || item['Ward_Pcode'];
            if (pcode) {
                this.postalLookup.set(pcode, item);
            }
        });
        console.log('Postal lookup created:', this.postalLookup.size, 'entries');
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
     * Get postal information by pcode
     * @param {string} pcode - PCode to lookup
     * @returns {object|null} Postal information or null if not found
     */
    getPostalInfo(pcode) {
        return this.postalLookup.get(pcode) || null;
    }

    /**
     * Initialize all data loading
     */
    async initializeData() {
        try {
            await Promise.all([
                this.loadCSVData('data/pcode9.6_town_data.csv', 'towns'),
                this.loadCSVData('data/pcode9.6_ward_data.csv', 'wards'),
                this.loadCSVData('data/pcode9.6_village_tract_data.csv', 'villageTracts'),
                this.loadCSVData('data/pcode9.6_village_data.csv', 'villages'),
                this.loadPostalData('myanmar_postal_code_data.csv')
            ]);
            console.log('All data loaded successfully');
        } catch (error) {
            console.error('Error initializing data:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
export const dataManager = new DataManager(); 