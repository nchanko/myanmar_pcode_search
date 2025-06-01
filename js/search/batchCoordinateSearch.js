// Batch coordinate search functionality for processing multiple coordinates from CSV

import { searchByLatLong } from './coordinateSearch.js';

/**
 * Process a CSV file containing coordinates and return matching villages
 * @param {File} file - CSV file containing coordinates
 * @param {number} radius - Search radius in kilometers
 * @returns {Promise<Array>} Array of results with original coordinates and matches
 */
export async function processCoordinateCSV(file, radius = 10) {
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

        const coordString = `${latitude}, ${longitude}`;
        console.log(`Searching for coordinates: ${coordString}`);
        
        const matches = searchByLatLong(coordString, radius, 1);
        console.log(`Found ${matches.length} matches for coordinates ${coordString}`);

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
    }

    console.log(`Total results processed: ${results.length}`);
    console.log(`Total matches found: ${results.reduce((total, r) => total + r.matches.length, 0)}`);
    
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