// Result display management for showing detailed location information

import { searchController } from '../search/searchController.js';
import { dataManager } from '../data/dataManager.js';

export class ResultDisplay {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.resultContainer = document.querySelector('.result');
    }

    setupEventListeners() {
        // Listen for result selection events
        document.addEventListener('resultSelected', (e) => {
            this.showResult(e.detail.match);
        });
    }

    showResult(match) {
        this.resultContainer.innerHTML = '';
        
        const resultContent = this.generateResultContent(match);
        this.resultContainer.innerHTML = resultContent;
        this.resultContainer.style.display = 'block';

        // Dispatch event for map integration
        this.dispatchShowOnMap(match);
    }

    generateResultContent(match) {
        const dataType = searchController.getDataType();
        const mode = searchController.getSearchMode();
        
        let content = '<h2>Location Details</h2><div class="result-grid">';
        
        // For location and coordinate search, use the actual dataType from the match
        const actualDataType = (mode === 'location' || mode === 'coordinates') ? match.dataType : dataType;
        
        // Generate content based on actual data type
        if (actualDataType === 'villages') {
            content += this.generateVillageContent(match);
        } else if (actualDataType === 'towns') {
            content += this.generateTownContent(match);
        } else if (actualDataType === 'wards') {
            content += this.generateWardContent(match);
        } else if (actualDataType === 'villageTracts') {
            content += this.generateVillageTractContent(match);
        } else {
            // Fallback for coordinate search or unknown types
            if (mode === 'coordinates') {
                content += this.generateVillageContent(match);
            } else if (dataType === 'towns') {
                content += this.generateTownContent(match);
            } else if (dataType === 'wards') {
                content += this.generateWardContent(match);
            } else if (dataType === 'villageTracts') {
                content += this.generateVillageTractContent(match);
            } else {
                content += this.generateVillageContent(match);
            }
        }

        // Add postal information if available - use actual data type for postal lookup
        content += this.generatePostalContent(match, actualDataType || dataType);
        
        content += '</div>';
        return content;
    }

    generateVillageContent(match) {
        const isCoordinateSearch = searchController.isCoordinateSearch();
        const isLocationSearch = searchController.isLocationSearch();
        
        return `
            <div class="result-item">
                <strong>State/Region:</strong><br>${match.SR_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>State/Region PCode:</strong><br>${match.SR_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>District/SAZ:</strong><br>${match['District/SAZ_Name_Eng'] || 'N/A'}
            </div>
            <div class="result-item">
                <strong>District/SAZ PCode:</strong><br>${match['District/SAZ_Pcode'] || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Township:</strong><br>${match.Township_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Township PCode:</strong><br>${match.Tsp_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Village Tract:</strong><br>${match.Village_Tract_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Village Tract PCode:</strong><br>${match.VT_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Village Name (English):</strong><br>${match.Village_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Village Name (Myanmar):</strong><br>${match.Village_Name_MMR || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Village PCode:</strong><br>${match.Village_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Coordinates:</strong><br>
                ${match.Latitude || 'N/A'}, ${match.Longitude || 'N/A'}
            </div>
            ${(isCoordinateSearch || isLocationSearch) && match.distance !== undefined ? 
                `<div class="result-item">
                    <strong>Distance from Search Point:</strong><br>${match.distance.toFixed(2)} km
                </div>` : ''}
            ${isLocationSearch && match.searchedLocation ? 
                `<div class="result-item">
                    <strong>Searched Near:</strong><br>${match.searchedLocation.name}
                </div>` : ''}
        `;
    }

    generateTownContent(match) {
        const isLocationSearch = searchController.isLocationSearch();
        
        return `
            <div class="result-item">
                <strong>State/Region:</strong><br>${match.SR_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>State/Region PCode:</strong><br>${match.SR_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>District/SAZ:</strong><br>${match['District/SAZ_Name_Eng'] || 'N/A'}
            </div>
            <div class="result-item">
                <strong>District/SAZ PCode:</strong><br>${match['District/SAZ_Pcode'] || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Township:</strong><br>${match.Township_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Township PCode:</strong><br>${match.Tsp_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Town Name (English):</strong><br>${match.Town_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Town Name (Myanmar):</strong><br>${match.Town_Name_MMR || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Town PCode:</strong><br>${match.Town_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Coordinates:</strong><br>
                ${match.Latitude || 'N/A'}, ${match.Longitude || 'N/A'}
            </div>
            ${isLocationSearch && match.distance !== undefined ? 
                `<div class="result-item">
                    <strong>Distance from Search Point:</strong><br>${match.distance.toFixed(2)} km
                </div>` : ''}
            ${isLocationSearch && match.searchedLocation ? 
                `<div class="result-item">
                    <strong>Searched Near:</strong><br>${match.searchedLocation.name}
                </div>` : ''}
        `;
    }

    generateWardContent(match) {
        return `
            <div class="result-item">
                <strong>State/Region:</strong><br>${match.SR_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>State/Region PCode:</strong><br>${match.SR_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>District/SAZ:</strong><br>${match['District/SAZ_Name_Eng'] || 'N/A'}
            </div>
            <div class="result-item">
                <strong>District/SAZ PCode:</strong><br>${match['District/SAZ_Pcode'] || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Township:</strong><br>${match.Township_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Township PCode:</strong><br>${match.Tsp_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Ward Name (English):</strong><br>${match.Ward_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Ward Name (Myanmar):</strong><br>${match.Ward_Name_MMR || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Ward PCode:</strong><br>${match.Ward_Pcode || 'N/A'}
            </div>
        `;
    }

    generateVillageTractContent(match) {
        return `
            <div class="result-item">
                <strong>State/Region:</strong><br>${match.SR_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>State/Region PCode:</strong><br>${match.SR_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>District/SAZ:</strong><br>${match['District/SAZ_Name_Eng'] || 'N/A'}
            </div>
            <div class="result-item">
                <strong>District/SAZ PCode:</strong><br>${match['District/SAZ_Pcode'] || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Township:</strong><br>${match.Township_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Township PCode:</strong><br>${match.Tsp_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Village Tract Name (English):</strong><br>${match.Village_Tract_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Village Tract Name (Myanmar):</strong><br>${match.Village_Tract_Name_MMR || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Village Tract PCode:</strong><br>${match.VT_Pcode || 'N/A'}
            </div>
        `;
    }

    generatePostalContent(match, dataType) {
        let pcode = null;
        
        switch (dataType) {
            case 'towns':
                pcode = match.Town_Pcode;
                break;
            case 'wards':
                pcode = match.Ward_Pcode;
                break;
            case 'villageTracts':
            case 'villages':
                pcode = match.VT_Pcode;
                break;
        }

        if (pcode) {
            const postalInfo = dataManager.getPostalInfo(pcode);
            if (postalInfo) {
                return `
                    <div class="result-item">
                        <strong>Postal Code:</strong><br>${postalInfo['Postal Code'] || 'N/A'}
                    </div>
                    <div class="result-item">
                        <strong>Postal Code Name:</strong><br>${postalInfo['Village Tract/ Ward'] || 'N/A'}
                    </div>
                `;
            }
        }
        
        return '';
    }

    dispatchShowOnMap(match) {
        const event = new CustomEvent('showOnMap', {
            detail: { match }
        });
        document.dispatchEvent(event);
    }

    hideResult() {
        this.resultContainer.style.display = 'none';
    }
}

// Create and export singleton instance
export const resultDisplay = new ResultDisplay(); 