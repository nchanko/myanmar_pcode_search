'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Navigation } from 'lucide-react';
import { isOfflineReady, searchOffline, getNearbyOffline } from '@/lib/offlineDb';
import { parseCoordinatesInput } from '@/lib/geoUtils';
import { Navbar } from '@/components/Navbar';
import { FooterBar } from '@/components/FooterBar';
import { SearchControlBox } from '@/components/SearchControlBox';
import { LocationDetailCard } from '@/components/LocationDetailCard';
import { useLanguage } from '@/context/LanguageContext';
import type { Place } from '@/types/pcode';

// Dynamic import for Leaflet map to avoid SSR issues
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '600px',
      background: 'var(--bg-card)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--primary)'
    }}>
      <Loader2 className="animate-spin" size={32} />
    </div>
  )
});

export default function HomePage() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<string>('town');
  const [showNearby, setShowNearby] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeLandmark, setActiveLandmark] = useState<{ name: string; lat: number; lng: number; displayName?: string } | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isSelectingRef = useRef(false);

  // Offline status & copy feedback
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineForced, setIsOfflineForced] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState<{ ready: boolean; count: number; lastSynced?: string }>({
    ready: false,
    count: 0
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Check network & IndexedDB status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      isOfflineReady().then(setOfflineStatus).catch(console.error);
      const forced = localStorage.getItem('mm_pcode_force_offline') === 'true';
      setIsOfflineForced(forced);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Initial load: Sample Yangon places
  useEffect(() => {
    fetch('/api/search?q=Yangon&type=town&limit=10')
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          setResults(data.results);
          setSelectedPlace(data.results[0]);
        }
      })
      .catch(async () => {
        const ready = await isOfflineReady();
        if (ready.ready) {
          const offlineRes = await searchOffline('Yangon', 'town', 10);
          setResults(offlineRes);
          if (offlineRes.length > 0) setSelectedPlace(offlineRes[0]);
        }
      });
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    // If the user just selected an item, prevent re-opening suggestions
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (searchMode === 'landmark') {
        setIsGeocoding(true);
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}&limit=6`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.results || []);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error('Geocoding suggestions error:', err);
        } finally {
          setIsGeocoding(false);
        }
        return;
      }

      // Check if it's a coordinate/Google Maps input
      const coords = parseCoordinatesInput(trimmed);
      if (coords || searchMode === 'coordinates') return;

      try {
        const targetType = ['town', 'ward', 'village_tract', 'village'].includes(searchMode) ? searchMode : '';
        const url = `/api/search?q=${encodeURIComponent(trimmed)}${targetType ? `&type=${targetType}` : ''}&limit=6`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.results || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Search suggestions error:', err);
      }
    }, 240);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMode]);

  const executeSearch = useCallback(async (query: string, mode: string = searchMode) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setShowSuggestions(false);
    setSuggestions([]);

    if (mode === 'landmark') {
      try {
        const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}&limit=5`);
        if (!geoRes.ok) throw new Error('Geocoding failed');
        const geoData = await geoRes.json();

        if (geoData.results && geoData.results.length > 0) {
          const primary = geoData.results[0];
          setActiveLandmark({
            name: primary.name,
            lat: primary.lat,
            lng: primary.lng,
            displayName: primary.displayName
          });
          setActiveCoords({ lat: primary.lat, lng: primary.lng });

          const nearRes = await fetch(`/api/nearby?lat=${primary.lat}&lng=${primary.lng}&radius=15&limit=20`);
          if (nearRes.ok) {
            const nearData = await nearRes.json();
            setResults(nearData.results || []);
            if (nearData.results?.length > 0) setSelectedPlace(nearData.results[0]);
          }
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Landmark search failed:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Robust Coordinate or Google Maps URL parsing
    const coords = parseCoordinatesInput(trimmed);
    if (mode === 'coordinates' || coords) {
      const targetCoords = coords || { lat: 16.8661, lng: 96.1951 };
      setActiveCoords(targetCoords);
      setActiveLandmark(null);

      if (isOfflineForced || !isOnline) {
        try {
          const offlineRes = await getNearbyOffline(targetCoords.lat, targetCoords.lng, 15, 20);
          setResults(offlineRes);
          if (offlineRes.length > 0) setSelectedPlace(offlineRes[0]);
        } catch (e) {
          console.error('Offline coordinate search error:', e);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`/api/nearby?lat=${targetCoords.lat}&lng=${targetCoords.lng}&radius=15&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          if (data.results?.length > 0) setSelectedPlace(data.results[0]);
        }
      } catch (err) {
        console.error('Coordinate search error:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setActiveCoords(null);
    setActiveLandmark(null);

    if (isOfflineForced || !isOnline) {
      try {
        const offlineRes = await searchOffline(trimmed, mode, 25);
        setResults(offlineRes);
        if (offlineRes.length > 0) setSelectedPlace(offlineRes[0]);
      } catch (e) {
        console.error('Offline text search error:', e);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const targetType = ['town', 'ward', 'village_tract', 'village'].includes(mode) ? mode : '';
      const url = `/api/search?q=${encodeURIComponent(trimmed)}${targetType ? `&type=${targetType}` : ''}&limit=30`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        if (data.results?.length > 0) setSelectedPlace(data.results[0]);
      }
    } catch (err) {
      console.error('Text search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchMode, isOnline, isOfflineForced]);

  const handleSelectSuggestion = (item: any) => {
    isSelectingRef.current = true;
    setShowSuggestions(false);
    setSuggestions([]);

    if (searchMode === 'landmark') {
      setSearchQuery(item.name);
      setActiveLandmark({
        name: item.name,
        lat: item.lat,
        lng: item.lng,
        displayName: item.displayName
      });
      setActiveCoords({ lat: item.lat, lng: item.lng });
      fetch(`/api/nearby?lat=${item.lat}&lng=${item.lng}&radius=15&limit=20`)
        .then(res => res.json())
        .then(data => {
          setResults(data.results || []);
          if (data.results?.length > 0) setSelectedPlace(data.results[0]);
        });
      return;
    }

    setSelectedPlace(item);
    setSearchQuery(item.name_eng);
    setResults([item]);
    if (item.lat && item.lng) {
      setActiveCoords({ lat: item.lat, lng: item.lng });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    const coords = { lat, lng };
    setActiveCoords(coords);
    setActiveLandmark(null);
    setSearchQuery(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
    setSearchMode('coordinates');
    executeSearch(`${coords.lat}, ${coords.lng}`, 'coordinates');
  };

  const copyValue = (val: string, key: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Prevent duplicate cards: filter out the currently selected place from the bottom results list
  const otherResults = results.filter(p => p.id !== selectedPlace?.id);

  return (
    <div className="app-layout">
      {/* Universal Top Navigation Bar */}
      <Navbar isOnline={isOnline} offlineCount={offlineStatus.count} />

      {/* Main 2-Column Application View */}
      <main className="container">
        {/* Left Column: Search & Results */}
        <div className="search-section">
          {/* Search Controls (Filters + Input + Suggestions) */}
          <SearchControlBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            isLoading={isLoading}
            isGeocoding={isGeocoding}
            onSearch={executeSearch}
            onSelectSuggestion={handleSelectSuggestion}
            searchInputRef={searchInputRef}
          />

          {/* Selected Location Details (Shows the full details for the selected place) */}
          {selectedPlace && (
            <LocationDetailCard
              place={selectedPlace}
              activeLandmark={activeLandmark}
              copiedKey={copiedKey}
              onCopy={copyValue}
            />
          )}

          {/* Optional Collapsible Nearby / Matching Places */}
          {otherResults.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="toggle-nearby-banner"
                onClick={() => setShowNearby(!showNearby)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={14} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>
                    {activeLandmark || searchMode === 'coordinates' || (activeCoords && !searchQuery)
                      ? `${t.nearbyPlaces} (${otherResults.length})`
                      : `${t.matchingPlaces} (${otherResults.length})`}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>
                  {showNearby ? (language === 'mm' ? 'ဝှက်မည် ▲' : 'Hide ▲') : (language === 'mm' ? 'ကြည့်မည် ▼' : 'View ▼')}
                </span>
              </button>

              {showNearby && (
                <div className="results-list" style={{ marginTop: '10px' }}>
                  {otherResults.map((place) => (
                    <div
                      key={`${place.type}-${place.pcode}-${place.id}`}
                      className="place-card"
                      onClick={() => {
                        setSelectedPlace(place);
                        if (place.lat && place.lng) setActiveCoords({ lat: place.lat, lng: place.lng });
                      }}
                    >
                      <div className="place-card-top">
                        <div>
                          <div className="place-card-name">
                            {language === 'mm' ? (place.name_mmr || place.name_eng) : place.name_eng}
                          </div>
                          <div className="place-card-hierarchy">
                            {[place.vt_name ? `${place.vt_name} VT` : place.town_name, place.tsp_name, place.sr_name].filter(Boolean).join(' • ')}
                          </div>
                        </div>
                        <span className="type-pill">
                          {place.type === 'village'
                            ? (language === 'mm' ? 'ကျေးရွာ' : 'VILLAGE')
                            : place.type === 'ward'
                            ? (language === 'mm' ? 'ရပ်ကွက်' : 'WARD')
                            : place.type === 'town'
                            ? (language === 'mm' ? 'မြို့' : 'TOWN')
                            : (language === 'mm' ? 'ကျေးရွာအုပ်စု' : 'VILLAGE TRACT')}
                        </span>
                      </div>

                      <div className="place-card-pills">
                        <span className="place-pill pcode">
                          {place.type === 'village'
                            ? t.villagePcode
                            : place.type === 'ward'
                            ? t.wardPcode
                            : place.type === 'town'
                            ? t.townPcode
                            : t.vtPcode} {place.pcode}
                        </span>
                        {place.postal_code && (
                          <span className="place-pill postal">
                            {t.postalCodeLabel} {place.postal_code}
                          </span>
                        )}
                        {place.distance_km != null && (
                          <span className="place-pill distance">
                            <Navigation size={10} style={{ display: 'inline', marginRight: 2 }} />
                            {place.distance_km} {t.kmAway}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Leaflet Map */}
        <div className="map-section">
          <MapView
            places={results}
            selectedPlace={selectedPlace}
            onSelectPlace={(p) => setSelectedPlace(p)}
            onMapClickCoordinates={handleMapClick}
            activeCoordinates={activeCoords}
            activeLandmark={activeLandmark}
          />
        </div>
      </main>

      {/* Dedicated Bottom Footer Bar */}
      <FooterBar />
    </div>
  );
}
