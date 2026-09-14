// Text search functionality for name-based searches

import { dataManager } from '../data/dataManager.js';

/**
 * Search items by name (English or Myanmar)
 * @param {string} query - Search query
 * @param {string} dataType - Type of data to search (towns, wards, villageTracts, villages)
 * @param {number} maxResults - Maximum number of results (default: 20)
 * @returns {Array} Array of matching items sorted by relevance
 */
export function searchByName(query, dataType, maxResults = 20) {
    const currentData = dataManager.getData(dataType);
    query = query.toLowerCase();

    const scoredMatches = currentData.map(item => {
        let nameEng = null;
        let nameMMR = null;

        // Get the appropriate name fields based on data type
        switch (dataType) {
            case 'towns':
                nameEng = item.Town_Name_Eng;
                nameMMR = item.Town_Name_MMR;
                break;
            case 'wards':
                nameEng = item.Ward_Name_Eng;
                nameMMR = item.Ward_Name_MMR;
                break;
            case 'villageTracts':
                nameEng = item.Village_Tract_Name_Eng;
                nameMMR = item.Village_Tract_Name_MMR;
                break;
            case 'villages':
                nameEng = item.Village_Name_Eng;
                nameMMR = item.Village_Name_MMR;
                break;
            default:
                return { item, score: 0 };
        }

        let score = 0;
        const lowerNameEng = nameEng?.toLowerCase() || '';
        const lowerNameMMR = nameMMR?.toLowerCase() || '';

        // Scoring system: exact match > starts with > contains
        if (lowerNameEng === query || lowerNameMMR === query) {
            score = 3; // Exact match gets highest score
        } else if (lowerNameEng.startsWith(query) || lowerNameMMR.startsWith(query)) {
            score = 2; // Starts with gets middle score
        } else if (lowerNameEng.includes(query) || lowerNameMMR.includes(query)) {
            score = 1; // Substring gets lowest score
        }

        return { item, score };
    })
    .filter(match => match.score > 0) // Filter out non-matches
    .sort((a, b) => b.score - a.score) // Sort by score (highest first)
    .map(match => match.item) // Extract original item
    .slice(0, maxResults); // Limit results

    return scoredMatches;
}

/**
 * Get the display name for an item based on language preference
 * @param {object} item - Data item
 * @param {string} dataType - Type of data
 * @param {boolean} showMyanmarText - Whether to show Myanmar text
 * @returns {string} Display name
 */
export function getDisplayName(item, dataType, showMyanmarText = false) {
    let nameEng = '';
    let nameMMR = '';

    switch (dataType) {
        case 'towns':
            nameEng = item.Town_Name_Eng || '';
            nameMMR = item.Town_Name_MMR || '';
            break;
        case 'wards':
            nameEng = item.Ward_Name_Eng || '';
            nameMMR = item.Ward_Name_MMR || '';
            break;
        case 'villageTracts':
            nameEng = item.Village_Tract_Name_Eng || '';
            nameMMR = item.Village_Tract_Name_MMR || '';
            break;
        case 'villages':
            nameEng = item.Village_Name_Eng || '';
            nameMMR = item.Village_Name_MMR || '';
            break;
    }

    if (showMyanmarText && nameMMR) {
        return `${nameMMR} (${nameEng})`;
    }
    return nameEng;
}

/**
 * Get hierarchy text for an item
 * @param {object} item - Data item
 * @param {string} dataType - Type of data
 * @returns {string} Hierarchy string
 */
export function getHierarchyText(item, dataType) {
    const parts = [];
    
    if (item.SR_Name_Eng) parts.push(item.SR_Name_Eng);
    if (item['District/SAZ_Name_Eng']) parts.push(item['District/SAZ_Name_Eng']);
    if (item.Township_Name_Eng) parts.push(item.Township_Name_Eng);
    
    // Add village tract for villages
    if (dataType === 'villages' && item.Village_Tract_Name_Eng) {
        parts.push(item.Village_Tract_Name_Eng);
    }
    
    return parts.join(' > ');
} 