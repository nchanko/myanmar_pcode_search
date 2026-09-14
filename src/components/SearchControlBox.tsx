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
  Store
} from 'lucide-react';

interface SearchControlBoxProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchMode: string;
  setSearchMode: (mode: string) => void;
  showMyanmarName: boolean;
  setShowMyanmarName: (show: boolean) => void;
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
  showMyanmarName,
  setShowMyanmarName,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  isLoading,
  isGeocoding,
  onSearch,
  onSelectSuggestion,
  searchInputRef
}: SearchControlBoxProps) {
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

  const getPlaceholderText = () => {
    switch (searchMode) {
      case 'town': return 'Search by town name (မြို့အမည်)... e.g. Yangon, မန္တလေး';
      case 'ward': return 'Search by ward name (ရပ်ကွက်)... e.g. Kyauktada';
      case 'village_tract': return 'Search by village tract (ကျေးရွာအုပ်စု)...';
      case 'village': return 'Search by village name (ကျေးရွာ)...';
      case 'pcode': return 'Search by Place PCode... e.g. MMR013000777';
      case 'coordinates': return 'Lat, Lng or paste Google Maps URL...';
      case 'landmark': return 'Search landmarks, pagodas, hotels, malls, shops...';
      default: return 'Type place name or PCode...';
    }
  };

  return (
    <>
      {/* Search Type Filters */}
      <div className="search-row">
        <button
          className={`toggle-btn ${searchMode === 'town' ? 'active' : ''}`}
          onClick={() => { setSearchMode('town'); if (searchQuery.trim()) onSearch(searchQuery, 'town'); }}
        >
          <Building2 size={14} /> မြို့ Towns
        </button>
        <button
          className={`toggle-btn ${searchMode === 'ward' ? 'active' : ''}`}
          onClick={() => { setSearchMode('ward'); if (searchQuery.trim()) onSearch(searchQuery, 'ward'); }}
        >
          <Home size={14} /> ရပ်ကွက် Wards
        </button>
        <button
          className={`toggle-btn ${searchMode === 'village_tract' ? 'active' : ''}`}
          onClick={() => { setSearchMode('village_tract'); if (searchQuery.trim()) onSearch(searchQuery, 'village_tract'); }}
        >
          <Trees size={14} /> ကျေးရွာအုပ်စု VT
        </button>
        <button
          className={`toggle-btn ${searchMode === 'village' ? 'active' : ''}`}
          onClick={() => { setSearchMode('village'); if (searchQuery.trim()) onSearch(searchQuery, 'village'); }}
        >
          <Home size={14} /> ရွာ Villages
        </button>
        <button
          className={`toggle-btn ${searchMode === 'pcode' ? 'active' : ''}`}
          onClick={() => { setSearchMode('pcode'); if (searchQuery.trim()) onSearch(searchQuery, 'pcode'); }}
        >
          <Hash size={14} /> Pcode
        </button>
        <button
          className={`toggle-btn ${searchMode === 'coordinates' ? 'active' : ''}`}
          onClick={() => { setSearchMode('coordinates'); if (searchQuery.trim()) onSearch(searchQuery, 'coordinates'); }}
        >
          <Navigation size={14} /> Lat/Long
        </button>
        <button
          className={`toggle-btn landmark-btn ${searchMode === 'landmark' ? 'active' : ''}`}
          onClick={() => { setSearchMode('landmark'); if (searchQuery.trim()) onSearch(searchQuery, 'landmark'); }}
        >
          <LandmarkIcon size={14} /> Landmark
        </button>
      </div>

      {/* Search Input Card */}
      <div className="glass-card search-container" ref={containerRef}>
        <label className="language-toggle">
          <input
            type="checkbox"
            checked={showMyanmarName}
            onChange={(e) => setShowMyanmarName(e.target.checked)}
          />
          <span>🔤 Show Myanmar Name</span>
        </label>

        <div className="search-input-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder={getPlaceholderText()}
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
                {searchMode === 'landmark' ? '📍 Landmark Results (OpenStreetMap)' : 'Search Suggestions'}
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
                      ) : (
                        <>
                          {item.name_eng}
                          {showMyanmarName && item.name_mmr && (
                            <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: 6 }}>
                              ({item.name_mmr})
                            </span>
                          )}
                        </>
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
                      {searchMode === 'landmark' ? `${item.lat?.toFixed(3)}, ${item.lng?.toFixed(3)}` : item.pcode}
                    </span>
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
