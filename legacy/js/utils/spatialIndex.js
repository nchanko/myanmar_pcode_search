// Spatial indexing system for fast location-based searches

/**
 * Spatial index using grid-based approach for Myanmar
 * Divides Myanmar into grid cells for O(1) spatial lookups
 */
export class SpatialIndex {
    constructor(gridSize = 0.1) { // 0.1 degree = ~11km grid cells
        this.gridSize = gridSize;
        this.index = new Map(); // Grid cell -> array of locations
        this.bounds = {
            minLat: 9.5,   // Myanmar bounds
            maxLat: 28.5,
            minLon: 92.0,
            maxLon: 101.5
        };
    }

    /**
     * Get grid cell key for coordinates
     */
    getGridKey(lat, lon) {
        const gridLat = Math.floor(lat / this.gridSize);
        const gridLon = Math.floor(lon / this.gridSize);
        return `${gridLat},${gridLon}`;
    }

    /**
     * Add location to spatial index
     */
    addLocation(location, dataType) {
        const lat = parseFloat(location.Latitude);
        const lon = parseFloat(location.Longitude);
        
        if (isNaN(lat) || isNaN(lon)) return;
        
        const key = this.getGridKey(lat, lon);
        
        if (!this.index.has(key)) {
            this.index.set(key, []);
        }
        
        this.index.get(key).push({
            ...location,
            lat,
            lon,
            dataType
        });
    }

    /**
     * Build index from data arrays
     */
    buildIndex(townData = [], villageData = [], wardData = [], villageTractData = []) {
        console.time('Building spatial index');
        
        // Clear existing index
        this.index.clear();
        
        // Index all data types
        townData.forEach(location => this.addLocation(location, 'towns'));
        villageData.forEach(location => this.addLocation(location, 'villages'));
        wardData.forEach(location => this.addLocation(location, 'wards'));
        villageTractData.forEach(location => this.addLocation(location, 'villageTracts'));
        
        console.timeEnd('Building spatial index');
        console.log(`Spatial index built: ${this.index.size} grid cells`);
    }

    /**
     * Get nearby grid cells for a radius search
     */
    getNearbyGridKeys(centerLat, centerLon, radiusKm) {
        // Convert radius to degree approximation
        const radiusDegrees = radiusKm / 111; // ~111km per degree
        const gridRadius = Math.ceil(radiusDegrees / this.gridSize);
        
        const centerGridLat = Math.floor(centerLat / this.gridSize);
        const centerGridLon = Math.floor(centerLon / this.gridSize);
        
        const keys = [];
        
        for (let dLat = -gridRadius; dLat <= gridRadius; dLat++) {
            for (let dLon = -gridRadius; dLon <= gridRadius; dLon++) {
                const gridLat = centerGridLat + dLat;
                const gridLon = centerGridLon + dLon;
                keys.push(`${gridLat},${gridLon}`);
            }
        }
        
        return keys;
    }

    /**
     * Fast spatial search within radius
     */
    searchWithinRadius(centerLat, centerLon, radiusKm, maxResults = 20) {
        const nearbyKeys = this.getNearbyGridKeys(centerLat, centerLon, radiusKm);
        const candidates = [];
        
        // Get all candidates from nearby grid cells
        for (const key of nearbyKeys) {
            const locations = this.index.get(key);
            if (locations) {
                candidates.push(...locations);
            }
        }
        
        // Return candidates for distance filtering
        return candidates;
    }

    /**
     * Get statistics about the index
     */
    getStats() {
        let totalLocations = 0;
        let maxPerCell = 0;
        let minPerCell = Infinity;
        
        for (const locations of this.index.values()) {
            totalLocations += locations.length;
            maxPerCell = Math.max(maxPerCell, locations.length);
            minPerCell = Math.min(minPerCell, locations.length);
        }
        
        return {
            gridCells: this.index.size,
            totalLocations,
            avgPerCell: (totalLocations / this.index.size).toFixed(1),
            maxPerCell,
            minPerCell: minPerCell === Infinity ? 0 : minPerCell
        };
    }
}

// Export singleton instance
export const spatialIndex = new SpatialIndex(); 