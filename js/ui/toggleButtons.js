// Toggle buttons management for search mode switching

import { searchController } from '../search/searchController.js';

export class ToggleButtons {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.contextMessage = this.createContextMessage();
    }

    initializeElements() {
        this.townSearchBtn = document.getElementById('townSearchBtn');
        this.wardSearchBtn = document.getElementById('wardSearchBtn');
        this.vtSearchBtn = document.getElementById('vtSearchBtn');
        this.villageSearchBtn = document.getElementById('villageSearchBtn');
        this.pcodeSearchBtn = document.getElementById('pcodeSearchBtn');
        this.coordinateSearchBtn = document.getElementById('coordinateSearchBtn');
        this.searchInput = document.querySelector('.search-input');
        this.suggestionsContainer = document.querySelector('.suggestions');
        this.searchContainer = document.querySelector('.search-container');
    }

    createContextMessage() {
        const contextMessage = document.createElement('div');
        contextMessage.classList.add('context-message');
        this.searchContainer.appendChild(contextMessage);
        return contextMessage;
    }

    setupEventListeners() {
        this.townSearchBtn?.addEventListener('click', () => {
            this.handleDataTypeChange('towns', 'Search by town name...');
        });

        this.wardSearchBtn?.addEventListener('click', () => {
            this.handleDataTypeChange('wards', 'Search by ward name...');
        });

        this.vtSearchBtn?.addEventListener('click', () => {
            this.handleDataTypeChange('villageTracts', 'Search by village tract name...');
        });

        this.villageSearchBtn?.addEventListener('click', () => {
            this.handleDataTypeChange('villages', 'Search by village name...');
        });

        this.pcodeSearchBtn?.addEventListener('click', () => {
            this.handleSearchModeChange('pcode', 'Search by PCode...');
        });

        this.coordinateSearchBtn?.addEventListener('click', () => {
            this.handleSearchModeChange('coordinates', 'Enter coordinates: lat,long (e.g., 16.8661, 96.1951)');
        });
    }

    handleDataTypeChange(dataType, placeholder) {
        this.setActiveButton(this.getButtonByDataType(dataType));
        searchController.setSearchMode('name');
        searchController.setDataType(dataType);
        this.updateUI(placeholder);
        this.updateContextMessage();
        this.searchContainer.classList.remove('coordinate-search');
    }

    handleSearchModeChange(mode, placeholder) {
        if (mode === 'pcode') {
            this.setActiveButton(this.pcodeSearchBtn);
        } else if (mode === 'coordinates') {
            this.setActiveButton(this.coordinateSearchBtn);
            this.searchContainer.classList.add('coordinate-search');
        }
        
        searchController.setSearchMode(mode);
        this.updateUI(placeholder);
        this.updateContextMessage();
    }

    getButtonByDataType(dataType) {
        switch (dataType) {
            case 'towns': return this.townSearchBtn;
            case 'wards': return this.wardSearchBtn;
            case 'villageTracts': return this.vtSearchBtn;
            case 'villages': return this.villageSearchBtn;
            default: return this.townSearchBtn;
        }
    }

    setActiveButton(button) {
        document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
        button?.classList.add('active');
    }

    updateUI(placeholder) {
        this.searchInput.placeholder = placeholder;
        this.searchInput.value = '';
        this.suggestionsContainer.style.display = 'none';
    }

    updateContextMessage() {
        const mode = searchController.getSearchMode();
        const dataType = searchController.getDataType();

        if (mode === 'pcode') {
            this.contextMessage.textContent = `Searching ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} PCodes`;
            this.contextMessage.classList.add('active');
        } else if (mode === 'coordinates') {
            this.contextMessage.textContent = `Searching Villages by Coordinates (Latitude, Longitude)`;
            this.contextMessage.classList.add('active');
        } else {
            this.contextMessage.textContent = ``;
            this.contextMessage.classList.remove('active');
        }
    }
}

// Create and export singleton instance
export const toggleButtons = new ToggleButtons(); 