// Search UI management for input handling and suggestions display

import { searchController } from '../search/searchController.js';
import { getDisplayName, getHierarchyText } from '../search/textSearch.js';
import { getPcodeDisplayText } from '../search/pcodeSearch.js';

export class SearchUI {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.showMyanmarText = false;
        this.searchTimeout = null;
        this.isSearching = false;
    }

    initializeElements() {
        this.searchInput = document.querySelector('.search-input');
        this.suggestionsContainer = document.querySelector('.suggestions');
        this.languageToggle = document.getElementById('mmText');
    }

    setupEventListeners() {
        // Search input event
        this.searchInput?.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        // Language toggle event
        this.languageToggle?.addEventListener('change', () => {
            this.toggleLanguage();
        });

        // Click outside to close suggestions
        document.addEventListener('click', (e) => {
            if (!this.suggestionsContainer?.contains(e.target) && e.target !== this.searchInput) {
                this.hideSuggestions();
            }
        });
    }

    handleSearchInput(query) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (query.length >= 2) {
            // Add debouncing for location search (which is async)
            const delay = searchController.isLocationSearch() ? 500 : 100;
            
            this.searchTimeout = setTimeout(async () => {
                await this.performSearch(query);
            }, delay);
        } else {
            this.hideSuggestions();
        }
    }

    async performSearch(query) {
        if (this.isSearching) return;
        
        this.isSearching = true;
        
        try {
            if (searchController.isLocationSearch()) {
                // For location search, show location name suggestions (not results)
                this.showLoadingSuggestions();
                const suggestions = await searchController.getSuggestions(query, 5);
                this.showLocationSuggestions(suggestions);
            } else if (searchController.isAsyncSearch()) {
                // Show loading indicator for other async searches
                this.showLoadingSuggestions();
                const matches = await searchController.search(query);
                this.showSuggestions(matches);
            } else {
                // Synchronous search
                const matches = searchController.search(query);
                this.showSuggestions(matches);
            }
        } catch (error) {
            console.error('Search failed:', error);
            this.showErrorSuggestions('Search failed. Please try again.');
        } finally {
            this.isSearching = false;
        }
    }

    toggleLanguage() {
        this.showMyanmarText = this.languageToggle?.checked || false;
        
        // Refresh suggestions if there's a current search
        if (this.searchInput?.value) {
            this.handleSearchInput(this.searchInput.value);
        }
    }

    showLoadingSuggestions() {
        this.suggestionsContainer.innerHTML = `
            <div class="suggestion-item loading">
                <div class="main-text">
                    <i class="fas fa-spinner fa-spin"></i> Searching locations...
                </div>
            </div>
        `;
        this.suggestionsContainer.style.display = 'block';
    }

    showErrorSuggestions(message) {
        this.suggestionsContainer.innerHTML = `
            <div class="suggestion-item error">
                <div class="main-text">
                    <i class="fas fa-exclamation-triangle"></i> ${message}
                </div>
            </div>
        `;
        this.suggestionsContainer.style.display = 'block';
    }

    showSuggestions(matches) {
        this.suggestionsContainer.innerHTML = '';
        
        if (matches.length > 0) {
            matches.forEach(match => {
                const div = this.createSuggestionItem(match);
                this.suggestionsContainer.appendChild(div);
            });
            this.suggestionsContainer.style.display = 'block';
        } else {
            const mode = searchController.getSearchMode();
            if (mode === 'location') {
                this.showErrorSuggestions('No villages or towns found near this location.');
            } else {
                this.hideSuggestions();
            }
        }
    }

    createSuggestionItem(match) {
        const div = document.createElement('div');
        div.className = 'suggestion-item';

        const { mainText, hierarchyText } = this.getDisplayTexts(match);

        div.innerHTML = `
            <div class="main-text">${mainText}</div>
            <div class="hierarchy">${hierarchyText}</div>
        `;

        div.addEventListener('click', () => {
            this.handleSuggestionClick(match, mainText);
        });

        return div;
    }

    getDisplayTexts(match) {
        const mode = searchController.getSearchMode();
        const dataType = searchController.getDataType();
        let mainText = '';
        let hierarchyText = '';

        if (mode === 'coordinates') {
            // For coordinate search, show villages or towns with distance
            const itemDataType = match.dataType || 'villages'; // Use the item's actual data type
            mainText = getDisplayName(match, itemDataType, this.showMyanmarText);
            hierarchyText = getHierarchyText(match, itemDataType);
            
            // Add type and distance information
            if (match.displayType) {
                hierarchyText = `${match.displayType}: ${hierarchyText}`;
            }
            if (match.distance !== undefined) {
                hierarchyText += ` • Distance: ${match.distance.toFixed(2)} km`;
            }
        } else if (mode === 'location') {
            // For location search, show villages or towns with distance and searched location
            const itemDataType = match.dataType || 'villages'; // Use the item's actual data type
            mainText = getDisplayName(match, itemDataType, this.showMyanmarText);
            hierarchyText = getHierarchyText(match, itemDataType);
            
            // Add type and distance information
            if (match.displayType) {
                hierarchyText = `${match.displayType}: ${hierarchyText}`;
            }
            if (match.distance !== undefined) {
                hierarchyText += ` • Distance: ${match.distance.toFixed(2)} km`;
            }
            if (match.searchedLocation?.name) {
                hierarchyText += ` • Near: ${match.searchedLocation.name}`;
            }
        } else if (mode === 'pcode') {
            mainText = getPcodeDisplayText(match, dataType);
            hierarchyText = getHierarchyText(match, dataType);
        } else {
            // Name search
            mainText = getDisplayName(match, dataType, this.showMyanmarText);
            hierarchyText = getHierarchyText(match, dataType);
        }

        return { mainText, hierarchyText };
    }

    handleSuggestionClick(match, mainText) {
        const mode = searchController.getSearchMode();
        
        if (mode === 'coordinates') {
            this.searchInput.value = `${match.Latitude}, ${match.Longitude}`;
        } else if (mode === 'location') {
            // For location search, show the area name based on its type
            const itemDataType = match.dataType || 'villages';
            this.searchInput.value = getDisplayName(match, itemDataType, this.showMyanmarText);
        } else {
            this.searchInput.value = mainText;
        }
        
        this.hideSuggestions();
        
        // Dispatch custom event for result selection
        this.dispatchResultSelected(match);
    }

    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
    }

    dispatchResultSelected(match) {
        const event = new CustomEvent('resultSelected', {
            detail: { match }
        });
        document.dispatchEvent(event);
    }

    clearSearch() {
        this.searchInput.value = '';
        this.hideSuggestions();
    }

    setSearchValue(value) {
        this.searchInput.value = value;
    }

    showLocationSuggestions(suggestions) {
        this.suggestionsContainer.innerHTML = '';
        
        if (suggestions.length > 0) {
            suggestions.forEach(suggestion => {
                const div = this.createLocationSuggestionItem(suggestion);
                this.suggestionsContainer.appendChild(div);
            });
            this.suggestionsContainer.style.display = 'block';
        } else {
            this.showErrorSuggestions('No locations found. Try a different location name.');
        }
    }

    createLocationSuggestionItem(suggestion) {
        const div = document.createElement('div');
        div.className = 'suggestion-item location-suggestion';

        div.innerHTML = `
            <div class="main-text">
                <i class="fas fa-map-marker-alt"></i> ${suggestion.name}
            </div>
            <div class="hierarchy">
                ${suggestion.type || 'Location'} • Confidence: ${(suggestion.confidence * 100).toFixed(0)}%
            </div>
        `;

        div.addEventListener('click', async () => {
            await this.handleLocationSuggestionClick(suggestion);
        });

        return div;
    }

    async handleLocationSuggestionClick(suggestion) {
        // Set the input to the location name
        this.searchInput.value = suggestion.name;
        this.hideSuggestions();
        
        try {
            // Perform the actual search for villages/towns near this location
            const results = await searchController.search(suggestion.name, 20);
            
            if (results.length > 0) {
                // Show the first result in the main result area (not in suggestions)
                this.dispatchResultSelected(results[0]);
            } else {
                // Show error message briefly, then hide
                this.showErrorSuggestions('No villages or towns found near this location.');
                setTimeout(() => {
                    this.hideSuggestions();
                }, 2000);
            }
        } catch (error) {
            console.error('Location search failed:', error);
            // Show error message briefly, then hide
            this.showErrorSuggestions('Search failed. Please try again.');
            setTimeout(() => {
                this.hideSuggestions();
            }, 2000);
        }
    }
}

// Create and export singleton instance
export const searchUI = new SearchUI(); 