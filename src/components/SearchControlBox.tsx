'use client';

import React, { useRef, useEffect } from 'react';
import {
  Search,
  X,
  Loader2,
  Navigation,
  Hash,
  Building2,
  Home,
  Trees,
  Landmark as LandmarkIcon,
  Mail,
  Store
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// One entry per search tab; `label` and `placeholder` are translation keys.
const SEARCH_TABS = [
  { mode: 'town', icon: Building2, label: 'townsTab', placeholder: 'placeholderTown' },
  { mode: 'ward', icon: Home, label: 'wardsTab', placeholder: 'placeholderWard' },
  { mode: 'village_tract', icon: Trees, label: 'vtTab', placeholder: 'placeholderVT' },
  { mode: 'village', icon: Home, label: 'villagesTab', placeholder: 'placeholderVillage' },
  { mode: 'pcode', icon: Hash, label: 'pcodeTab', placeholder: 'placeholderPcode' },
  { mode: 'postal', icon: Mail, label: 'postalTab', placeholder: 'placeholderPostal' },
  { mode: 'coordinates', icon: Navigation, label: 'latlongTab', placeholder: 'placeholderCoords' },
  { mode: 'landmark', icon: LandmarkIcon, label: 'landmarkTab', placeholder: 'placeholderLandmark' }
] as const;

interface SearchControlBoxProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchMode: string;
  setSearchMode: (mode: string) => void;
  suggestions: any[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  isLoading: boolean;
  isGeocoding: boolean;
  onSearch: (query: string, mode?: string) => void;
  onSelectSuggestion: (item: any) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export function SearchControlBox({
  searchQuery,
  setSearchQuery,
  searchMode,
  setSearchMode,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  isLoading,
  isGeocoding,
  onSearch,
  onSelectSuggestion,
  searchInputRef
}: SearchControlBoxProps) {
  const { language, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  const activeTab = SEARCH_TABS.find((tab) => tab.mode === searchMode) ?? SEARCH_TABS[0];

  return (
    <>
      {/* Search Type Filters */}
      <div className="search-row">
        {SEARCH_TABS.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            className={`toggle-btn ${mode === 'landmark' ? 'landmark-btn' : ''} ${searchMode === mode ? 'active' : ''}`}
            onClick={() => { setSearchMode(mode); if (searchQuery.trim()) onSearch(searchQuery, mode); }}
          >
            <Icon size={14} /> {t[label]}
          </button>
        ))}
      </div>

      {/* Search Input Card */}
      <div className="glass-card search-container" ref={containerRef}>
        <div className="search-input-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder={t[activeTab.placeholder]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setShowSuggestions(false);
                onSearch(searchQuery);
              }
            }}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          />
          <div className="search-icon-right">
            {(isLoading || isGeocoding) ? (
              <Loader2 size={17} className="animate-spin" color="var(--primary)" />
            ) : searchQuery ? (
              <button
                className="clear-btn"
                onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                title="Clear"
              >
                <X size={16} />
              </button>
            ) : (
              <Search size={17} />
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              <div className="suggestion-header">
                {searchMode === 'landmark' ? '📍 Landmark Results (OpenStreetMap)' : t.suggestionsHeader}
              </div>
              {suggestions.map((item, idx) => (
                <div
                  key={item.placeId || item.id || idx}
                  className="suggestion-item"
                  onClick={() => {
                    setShowSuggestions(false);
                    onSelectSuggestion(item);
                  }}
                >
                  <div className="suggestion-main">
                    <div className="suggestion-title">
                      {searchMode === 'landmark' ? (
                        <><Store size={14} color="#d97706" /> {item.name}</>
                      ) : language === 'mm' ? (
                        item.name_mmr || item.name_eng
                      ) : (
                        item.name_eng
                      )}
                    </div>
                    <div className="suggestion-hierarchy">
                      {searchMode === 'landmark' ? item.displayName : (
                        [item.tsp_name, item.district_name, item.sr_name].filter(Boolean).join(' • ')
                      )}
                    </div>
                  </div>
                  <div className="suggestion-meta">
                    <span className={`suggestion-tag ${searchMode === 'landmark' ? 'landmark' : ''}`}>
                      {searchMode === 'landmark' ? (item.category || 'landmark') : item.type}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {searchMode === 'landmark' ? `${item.lat?.toFixed(3)}, ${item.lng?.toFixed(3)}` : `PCode: ${item.pcode}`}
                    </span>
                    {item.postal_code && searchMode !== 'landmark' && (
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: '#059669', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 5px', borderRadius: '4px' }}>
                        Postal: {item.postal_code}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default SearchControlBox;
