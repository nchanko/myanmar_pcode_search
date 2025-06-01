// PCode search functionality for place code based searches

import { dataManager } from '../data/dataManager.js';

/**
 * Search items by PCode
 * @param {string} query - PCode search query
 * @param {string} dataType - Type of data to search (towns, wards, villageTracts, villages)
 * @param {number} maxResults - Maximum number of results (default: 20)
 * @returns {Array} Array of matching items
 */
export function searchByPcode(query, dataType, maxResults = 20) {
    const currentData = dataManager.getData(dataType);
    query = query.toLowerCase();

    return currentData.filter(item => {
        let pcode = null;

        // Get the appropriate pcode field based on data type
        switch (dataType) {
            case 'towns':
                pcode = item.Town_Pcode || item.Tsp_Pcode || item['District/SAZ_Pcode'] || item.SR_Pcode;
                break;
            case 'wards':
                pcode = item.Ward_Pcode || item.Tsp_Pcode || item['District/SAZ_Pcode'] || item.SR_Pcode;
                break;
            case 'villageTracts':
                pcode = item.VT_Pcode || item.Tsp_Pcode || item['District/SAZ_Pcode'] || item.SR_Pcode;
                break;
            case 'villages':
                pcode = item.Village_Pcode;
                break;
            default:
                return false;
        }

        return pcode?.toLowerCase().includes(query);
    }).slice(0, maxResults);
}

/**
 * Get the display text for PCode search results
 * @param {object} item - Data item
 * @param {string} dataType - Type of data
 * @returns {string} Display text with PCode and name
 */
export function getPcodeDisplayText(item, dataType) {
    switch (dataType) {
        case 'towns':
            return `${item.Town_Pcode} - ${item.Town_Name_Eng}`;
        case 'wards':
            return `${item.Ward_Pcode} - ${item.Ward_Name_Eng}`;
        case 'villageTracts':
            return `${item.VT_Pcode} - ${item.Village_Tract_Name_Eng}`;
        case 'villages':
            return `${item.Village_Pcode} - ${item.Village_Name_Eng}`;
        default:
            return 'Unknown';
    }
}

/**
 * Get all PCodes for an item (hierarchical)
 * @param {object} item - Data item
 * @param {string} dataType - Type of data
 * @returns {object} Object containing all relevant PCodes
 */
export function getAllPcodes(item, dataType) {
    const pcodes = {
        sr: item.SR_Pcode,
        district: item['District/SAZ_Pcode'],
        township: item.Tsp_Pcode
    };

    switch (dataType) {
        case 'towns':
            pcodes.main = item.Town_Pcode;
            break;
        case 'wards':
            pcodes.main = item.Ward_Pcode;
            break;
        case 'villageTracts':
            pcodes.main = item.VT_Pcode;
            break;
        case 'villages':
            pcodes.main = item.Village_Pcode;
            pcodes.villageTract = item.VT_Pcode;
            break;
    }

    return pcodes;
}

/**
 * Validate PCode format
 * @param {string} pcode - PCode to validate
 * @returns {boolean} True if PCode format is valid
 */
export function isValidPcodeFormat(pcode) {
    // Myanmar PCode format: typically 6-8 characters, alphanumeric
    const pcodePattern = /^[A-Z0-9]{4,8}$/i;
    return pcodePattern.test(pcode);
} 