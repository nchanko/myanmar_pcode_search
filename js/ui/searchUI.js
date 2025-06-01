// Search UI management for input handling and suggestions display

import { searchController } from '../search/searchController.js';
import { getDisplayName, getHierarchyText } from '../search/textSearch.js';
import { getPcodeDisplayText } from '../search/pcodeSearch.js';

export class SearchUI {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.showMyanmarText = false;
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
        if (query.length >= 2) {
            const matches = searchController.search(query);
            this.showSuggestions(matches);
        } else {
            this.hideSuggestions();
        }
    }

    toggleLanguage() {
        this.showMyanmarText = this.languageToggle?.checked || false;
        
        // Refresh suggestions if there's a current search
        if (this.searchInput?.value) {
            this.handleSearchInput(this.searchInput.value);
        }
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
            this.hideSuggestions();
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
            // For coordinate search, always show village with distance
            mainText = getDisplayName(match, 'villages', this.showMyanmarText);
            hierarchyText = getHierarchyText(match, 'villages');
            
            // Add distance information
            if (match.distance !== undefined) {
                hierarchyText += ` • Distance: ${match.distance.toFixed(2)} km`;
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
}

// Create and export singleton instance
export const searchUI = new SearchUI(); 