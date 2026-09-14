'use client';

import React from 'react';
import { Store, Check, Copy, Navigation } from 'lucide-react';
import type { Place } from '@/types/pcode';
import { useLanguage } from '@/context/LanguageContext';

interface LocationDetailCardProps {
  place: Place;
  activeLandmark?: { name: string; lat: number; lng: number; displayName?: string } | null;
  copiedKey: string | null;
  onCopy: (val: string, key: string) => void;
}

export function LocationDetailCard({
  place,
  activeLandmark,
  copiedKey,
  onCopy
}: LocationDetailCardProps) {
  const { language, t } = useLanguage();

  const pcodeLabel = place.type === 'village'
    ? t.villagePcode
    : place.type === 'ward'
    ? t.wardPcode
    : place.type === 'town'
    ? t.townPcode
    : t.vtPcode;

  return (
    <div className="unified-location-card">
      {/* Landmark Banner */}
      {activeLandmark && (
        <div className="landmark-summary-banner">
          <div className="landmark-banner-left">
            <Store size={15} color="#d97706" />
            <div>
              <div className="landmark-banner-title">
                {t.searchedLandmark} <strong style={{ color: 'var(--text-primary)' }}>{activeLandmark.name}</strong>
              </div>
              {activeLandmark.displayName && (
                <div className="landmark-banner-address">{activeLandmark.displayName}</div>
              )}
            </div>
          </div>
          <button
            className="copy-chip coords"
            style={{ padding: '2px 6px', fontSize: '11px' }}
            onClick={() => onCopy(`${activeLandmark.lat}, ${activeLandmark.lng}`, 'landmark-coords')}
            title={t.copyCoords}
          >
            {copiedKey === 'landmark-coords' ? <Check size={11} /> : <Copy size={11} />}
            <span>{activeLandmark.lat.toFixed(4)}, {activeLandmark.lng.toFixed(4)}</span>
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="unified-header-banner">
        <div>
          <div className="unified-title-main">
            {language === 'mm' ? (place.name_mmr || place.name_eng) : place.name_eng}
          </div>
        </div>

        <div className="unified-badges">
          <span className="type-pill">
            {place.type === 'village'
              ? (language === 'mm' ? 'ကျေးရွာ' : 'VILLAGE')
              : place.type === 'ward'
              ? (language === 'mm' ? 'ရပ်ကွက်' : 'WARD')
              : place.type === 'town'
              ? (language === 'mm' ? 'မြို့' : 'TOWN')
              : (language === 'mm' ? 'ကျေးရွာအုပ်စု' : 'VILLAGE TRACT')}
          </span>
          <button
            className="copy-chip pcode"
            onClick={() => onCopy(place.pcode, 'pcode')}
            title={t.copyPcode}
          >
            {copiedKey === 'pcode' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
            <span>{pcodeLabel} {place.pcode}</span>
          </button>
          {place.postal_code && (
            <button
              className="copy-chip postal"
              onClick={() => onCopy(place.postal_code!, 'postal')}
              title={t.copyPostal}
            >
              {copiedKey === 'postal' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
              <span>{t.postalCodeLabel} {place.postal_code}</span>
            </button>
          )}
        </div>
      </div>

      {/* Administrative Hierarchy Breadcrumbs */}
      <div className="hierarchy-summary-box">
        <div className="hierarchy-step">
          <span className="hierarchy-label">{t.stateRegion}</span>
          <strong>{place.sr_name || 'N/A'}</strong>
          {place.sr_pcode && <span className="hierarchy-code">{place.sr_pcode}</span>}
        </div>
        <span className="hierarchy-sep">›</span>
        <div className="hierarchy-step">
          <span className="hierarchy-label">{t.district}</span>
          <strong>{place.district_name || 'N/A'}</strong>
          {place.district_pcode && <span className="hierarchy-code">{place.district_pcode}</span>}
        </div>
        <span className="hierarchy-sep">›</span>
        <div className="hierarchy-step">
          <span className="hierarchy-label">{t.township}</span>
          <strong>{place.tsp_name || 'N/A'}</strong>
          {place.tsp_pcode && <span className="hierarchy-code">{place.tsp_pcode}</span>}
        </div>
        {place.type === 'village' && place.vt_name && (
          <>
            <span className="hierarchy-sep">›</span>
            <div className="hierarchy-step">
              <span className="hierarchy-label">{t.villageTract}</span>
              <strong>{place.vt_name}</strong>
              {place.vt_pcode && (
                <button
                  className="copy-chip pcode"
                  style={{ padding: '1px 5px', fontSize: '10.5px' }}
                  onClick={() => onCopy(place.vt_pcode!, 'vt_pcode')}
                  title="Copy VT PCode"
                >
                  {copiedKey === 'vt_pcode' ? <Check size={10} color="#059669" /> : <Copy size={10} />}
                  <span>{place.vt_pcode}</span>
                </button>
              )}
            </div>
          </>
        )}
        {place.type === 'ward' && place.town_name && (
          <>
            <span className="hierarchy-sep">›</span>
            <div className="hierarchy-step">
              <span className="hierarchy-label">{t.town}</span>
              <strong>{place.town_name}</strong>
              {place.town_pcode && (
                <button
                  className="copy-chip pcode"
                  style={{ padding: '1px 5px', fontSize: '10.5px' }}
                  onClick={() => onCopy(place.town_pcode!, 'town_pcode')}
                  title="Copy Town PCode"
                >
                  {copiedKey === 'town_pcode' ? <Check size={10} color="#059669" /> : <Copy size={10} />}
                  <span>{place.town_pcode}</span>
                </button>
              )}
            </div>
          </>
        )}
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
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t.coordinates}</span>
          <button
            className="copy-chip coords"
            onClick={() => onCopy(`${place.lat}, ${place.lng}`, 'coords')}
            title={t.copyCoords}
          >
            {copiedKey === 'coords' ? <Check size={12} /> : <Copy size={12} />}
            <span>
              {place.lat != null && place.lng != null
                ? `${place.lat.toFixed(5)}, ${place.lng.toFixed(5)}`
                : t.unavailable}
            </span>
          </button>
        </div>

        {place.distance_km != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--warning)', fontWeight: 600 }}>
            <Navigation size={12} />
            <span>{place.distance_km} {t.kmAway}</span>
          </div>
        )}
      </div>
    </div>
  );
}
export default LocationDetailCard;
