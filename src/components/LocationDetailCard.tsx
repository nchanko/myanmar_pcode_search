'use client';

import React from 'react';
import { Store, Check, Copy, Navigation } from 'lucide-react';
import type { Place } from '@/types/pcode';

interface LocationDetailCardProps {
  place: Place;
  showMyanmarName: boolean;
  activeLandmark?: { name: string; lat: number; lng: number; displayName?: string } | null;
  copiedKey: string | null;
  onCopy: (val: string, key: string) => void;
}

export function LocationDetailCard({
  place,
  showMyanmarName,
  activeLandmark,
  copiedKey,
  onCopy
}: LocationDetailCardProps) {
  return (
    <div className="unified-location-card">
      {/* Landmark Banner (if searched via landmark) */}
      {activeLandmark && (
        <div className="landmark-summary-banner">
          <div className="landmark-banner-left">
            <Store size={18} color="#d97706" />
            <div>
              <div className="landmark-banner-title">{activeLandmark.name}</div>
              <div className="landmark-banner-address">{activeLandmark.displayName}</div>
            </div>
          </div>
          <button
            className="copy-chip coords"
            onClick={() => onCopy(`${activeLandmark.lat}, ${activeLandmark.lng}`, 'landmark-coords')}
            title="Copy Landmark Coordinates"
          >
            {copiedKey === 'landmark-coords' ? <Check size={12} /> : <Copy size={12} />}
            <span>{activeLandmark.lat.toFixed(4)}, {activeLandmark.lng.toFixed(4)}</span>
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="unified-header-banner">
        <div>
          <div className="unified-title-main">{place.name_eng}</div>
          {showMyanmarName && place.name_mmr && (
            <div className="unified-title-burmese">{place.name_mmr}</div>
          )}
        </div>

        <div className="unified-badges">
          <span className="type-pill">{place.type.replace('_', ' ')}</span>
          <button
            className="copy-chip pcode"
            onClick={() => onCopy(place.pcode, 'pcode')}
            title="Copy PCode"
          >
            {copiedKey === 'pcode' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
            <span>{place.pcode}</span>
          </button>
          {place.postal_code && (
            <button
              className="copy-chip postal"
              onClick={() => onCopy(place.postal_code!, 'postal')}
              title="Copy Postal Code"
            >
              {copiedKey === 'postal' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
              <span>📮 {place.postal_code}</span>
            </button>
          )}
        </div>
      </div>

      {/* Administrative Hierarchy Breadcrumbs */}
      <div className="hierarchy-summary-box">
        <div className="hierarchy-step">
          <span className="hierarchy-label">State/Region:</span>
          <strong>{place.sr_name || 'N/A'}</strong>
          {place.sr_pcode && <span className="hierarchy-code">{place.sr_pcode}</span>}
        </div>
        <span className="hierarchy-sep">›</span>
        <div className="hierarchy-step">
          <span className="hierarchy-label">District:</span>
          <strong>{place.district_name || 'N/A'}</strong>
          {place.district_pcode && <span className="hierarchy-code">{place.district_pcode}</span>}
        </div>
        <span className="hierarchy-sep">›</span>
        <div className="hierarchy-step">
          <span className="hierarchy-label">Township:</span>
          <strong>{place.tsp_name || 'N/A'}</strong>
          {place.tsp_pcode && <span className="hierarchy-code">{place.tsp_pcode}</span>}
        </div>
      </div>

      {/* Spatial Meta Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        fontSize: '12.5px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Coordinates:</span>
          <button
            className="copy-chip coords"
            onClick={() => onCopy(`${place.lat}, ${place.lng}`, 'coords')}
            title="Copy Coordinates"
          >
            {copiedKey === 'coords' ? <Check size={12} /> : <Copy size={12} />}
            <span>
              {place.lat != null && place.lng != null
                ? `${place.lat.toFixed(5)}, ${place.lng.toFixed(5)}`
                : 'Unavailable'}
            </span>
          </button>
        </div>

        {place.distance_km != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--warning)', fontWeight: 600 }}>
            <Navigation size={12} />
            <span>{place.distance_km} km away</span>
          </div>
        )}
      </div>
    </div>
  );
}
export default LocationDetailCard;
