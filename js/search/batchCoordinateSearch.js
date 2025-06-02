// Batch coordinate search functionality for processing multiple coordinates from CSV

import { searchByLatLong } from './coordinateSearch.js';
import { performanceMonitor } from '../utils/performanceMonitor.js';

/**
 * Process a CSV file containing coordinates and return matching villages
 * @param {File} file - CSV file containing coordinates
 * @param {number} radius - Search radius in kilometers
 * @returns {Promise<Array>} Array of results with original coordinates and matches
 */
export async function processCoordinateCSV(file, radius = 10) {
    const startTime = Date.now();
    console.time('Batch coordinate processing');
    
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    console.log('CSV headers:', headers);
    
    // Check row limit (excluding header)
    const dataRows = lines.length - 1;
    if (dataRows > 1000) {
        throw new Error(`File contains ${dataRows} rows. Maximum allowed is 1000 rows (excluding header). Please reduce the file size and try again.`);
    }
    
    if (dataRows === 0) {
        throw new Error('CSV file appears to be empty or contains only headers. Please add coordinate data.');
    }
    
    // Validate required headers
    const requiredHeaders = ['id', 'latitude', 'longitude'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}. Required format: id,latitude,longitude`);
    }

    // Get indices of required columns
    const idIndex = headers.indexOf('id');
    const latIndex = headers.indexOf('latitude');
    const lonIndex = headers.indexOf('longitude');

    console.log('Column indices:', { idIndex, latIndex, lonIndex });

    const results = [];
    let processedCount = 0;
    let successfulSearches = 0;
    let totalMatches = 0;
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        const id = values[idIndex];
        const lat = values[latIndex];
        const lon = values[lonIndex];

        console.log(`Processing row ${i}: ID=${id}, Lat=${lat}, Lon=${lon}`);

        // Skip invalid coordinates
        if (!lat || !lon || !id) {
            console.log(`Skipping row ${i}: missing data (ID, Lat, or Lon)`);
            continue;
        }

        // Validate numeric coordinates
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        if (isNaN(latitude) || isNaN(longitude)) {
            console.log(`Skipping row ${i}: invalid coordinate format`);
            continue;
        }
        
        // Validate Myanmar coordinate ranges
        if (latitude < 9.5 || latitude > 28.5 || longitude < 92.0 || longitude > 101.5) {
            console.log(`Warning row ${i}: coordinates outside Myanmar bounds (Lat: 9.5-28.5, Lon: 92.0-101.5)`);
            // Continue processing but log warning
        }

        // Use original string values to preserve exact formatting (including trailing zeros)
        const coordString = `${lat}, ${lon}`;
        console.log(`Searching for coordinates: ${coordString}`);
        
        // Use optimized coordinate search with performance tracking
        const searchId = performanceMonitor.generateSearchId();
        performanceMonitor.startSearch(searchId, 'batch-coordinate', coordString, { radius, batchIndex: i });
        
        try {
            const matches = searchByLatLong(coordString, radius, 1);
            
            performanceMonitor.endSearch(searchId, matches, true);
            successfulSearches++;
            
            console.log(`Found ${matches.length} matches for coordinates ${coordString}`);
            
            if (matches.length > 0) {
                totalMatches += matches.length;
            }

            results.push({
                id,
                latitude: lat,
                longitude: lon,
                matches: matches.map(match => ({
                    // Administrative Hierarchy
                    srPcode: match.SR_Pcode,
                    srName: match.SR_Name_Eng,
                    districtPcode: match['District/SAZ_Pcode'],
                    districtName: match['District/SAZ_Name_Eng'],
                    tspPcode: match.Tsp_Pcode,
                    townshipName: match.Township_Name_Eng,
                    vtPcode: match.VT_Pcode,
                    villageTractName: match.Village_Tract_Name_Eng,
                    // Village Details
                    villageId: match.Village_Pcode,
                    villageName: match.Village_Name_Eng,
                    villageNameMMR: match.Village_Name_MMR,
                    // Location
                    villageLongitude: match.Longitude,
                    villageLatitude: match.Latitude,
                    distance: match.distance.toFixed(2)
                }))
            });
            
            processedCount++;
            
        } catch (error) {
            performanceMonitor.endSearch(searchId, [], false, error);
            console.error(`Error processing coordinates ${coordString}:`, error);
            
            // Add empty result for failed search
            results.push({
                id,
                latitude: lat,
                longitude: lon,
                matches: []
            });
            processedCount++;
        }
        
        // Log progress for large files
        if (processedCount % 50 === 0) {
            console.log(`Progress: ${processedCount}/${dataRows} coordinates processed`);
        }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.timeEnd('Batch coordinate processing');
    
    // Log comprehensive statistics
    console.group('📊 Batch Processing Statistics');
    console.log(`Total coordinates processed: ${processedCount}`);
    console.log(`Successful searches: ${successfulSearches}`);
    console.log(`Total matches found: ${totalMatches}`);
    console.log(`Success rate: ${((successfulSearches / processedCount) * 100).toFixed(1)}%`);
    console.log(`Average time per coordinate: ${(totalTime / processedCount).toFixed(1)}ms`);
    console.log(`Total processing time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`Coordinates per second: ${(processedCount / (totalTime / 1000)).toFixed(1)}`);
    console.groupEnd();
    
    return results;
}

/**
 * Process coordinates in parallel batches for better performance
 * @param {File} file - CSV file containing coordinates
 * @param {number} radius - Search radius in kilometers
 * @param {number} batchSize - Number of coordinates to process in parallel (default: 10)
 * @returns {Promise<Array>} Array of results with original coordinates and matches
 */
export async function processCoordinateCSVParallel(file, radius = 10, batchSize = 10) {
    const startTime = Date.now();
    console.time('Parallel batch coordinate processing');
    
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    // Validation (same as original function)
    const dataRows = lines.length - 1;
    if (dataRows > 1000) {
        throw new Error(`File contains ${dataRows} rows. Maximum allowed is 1000 rows (excluding header). Please reduce the file size and try again.`);
    }
    
    if (dataRows === 0) {
        throw new Error('CSV file appears to be empty or contains only headers. Please add coordinate data.');
    }
    
    const requiredHeaders = ['id', 'latitude', 'longitude'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}. Required format: id,latitude,longitude`);
    }

    const idIndex = headers.indexOf('id');
    const latIndex = headers.indexOf('latitude');
    const lonIndex = headers.indexOf('longitude');

    // Parse all coordinate rows
    const coordinateRows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        const id = values[idIndex];
        const lat = values[latIndex];
        const lon = values[lonIndex];

        if (lat && lon && id) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            
            if (!isNaN(latitude) && !isNaN(longitude)) {
                coordinateRows.push({ id, lat, lon, coordString: `${lat}, ${lon}` });
            }
        }
    }

    console.log(`Processing ${coordinateRows.length} valid coordinates in batches of ${batchSize}`);
    
    // Process in parallel batches
    const results = [];
    const batches = [];
    
    for (let i = 0; i < coordinateRows.length; i += batchSize) {
        batches.push(coordinateRows.slice(i, i + batchSize));
    }
    
    console.log(`Created ${batches.length} batches for parallel processing`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} coordinates)`);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (coord) => {
            const searchId = performanceMonitor.generateSearchId();
            performanceMonitor.startSearch(searchId, 'parallel-batch-coordinate', coord.coordString, { radius, batchIndex });
            
            try {
                const matches = searchByLatLong(coord.coordString, radius, 1);
                performanceMonitor.endSearch(searchId, matches, true);
                
                return {
                    id: coord.id,
                    latitude: coord.lat,
                    longitude: coord.lon,
                    matches: matches.map(match => ({
                        // Same mapping as original function
                        srPcode: match.SR_Pcode,
                        srName: match.SR_Name_Eng,
                        districtPcode: match['District/SAZ_Pcode'],
                        districtName: match['District/SAZ_Name_Eng'],
                        tspPcode: match.Tsp_Pcode,
                        townshipName: match.Township_Name_Eng,
                        vtPcode: match.VT_Pcode,
                        villageTractName: match.Village_Tract_Name_Eng,
                        villageId: match.Village_Pcode,
                        villageName: match.Village_Name_Eng,
                        villageNameMMR: match.Village_Name_MMR,
                        villageLongitude: match.Longitude,
                        villageLatitude: match.Latitude,
                        distance: match.distance.toFixed(2)
                    }))
                };
            } catch (error) {
                performanceMonitor.endSearch(searchId, [], false, error);
                console.error(`Error processing coordinates ${coord.coordString}:`, error);
                
                return {
                    id: coord.id,
                    latitude: coord.lat,
                    longitude: coord.lon,
                    matches: []
                };
            }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);
    
    console.timeEnd('Parallel batch coordinate processing');
    
    console.group('📊 Parallel Batch Processing Statistics');
    console.log(`Total coordinates processed: ${results.length}`);
    console.log(`Total matches found: ${totalMatches}`);
    console.log(`Batch size: ${batchSize}`);
    console.log(`Number of batches: ${batches.length}`);
    console.log(`Average time per coordinate: ${(totalTime / results.length).toFixed(1)}ms`);
    console.log(`Total processing time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`Coordinates per second: ${(results.length / (totalTime / 1000)).toFixed(1)}`);
    console.groupEnd();
    
    return results;
}

/**
 * Convert results to CSV format
 * @param {Array} results - Array of search results
 * @returns {string} CSV formatted string
 */
export function resultsToCSV(results) {
    const headers = [
        'Input ID', 'Input Latitude', 'Input Longitude',
        'SR PCode', 'SR Name', 
        'District PCode', 'District Name',
        'Township PCode', 'Township Name',
        'VT PCode', 'Village Tract Name',
        'Village PCode', 'Village Name (Eng)', 'Village Name (MMR)',
        'Village Longitude', 'Village Latitude',
        'Distance (km)'
    ];
    
    const rows = results.flatMap(result => 
        result.matches.map(match => [
            result.id,
            result.latitude,
            result.longitude,
            match.srPcode,
            match.srName,
            match.districtPcode,
            match.districtName,
            match.tspPcode,
            match.townshipName,
            match.vtPcode,
            match.villageTractName,
            match.villageId,
            match.villageName,
            match.villageNameMMR,
            match.villageLongitude,
            match.villageLatitude,
            match.distance
        ])
    );

    return [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
} 