'use client';

import React, { useEffect, useRef } from 'react';
import type { Place } from '@/types/pcode';

interface MapViewProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onMapClickCoordinates: (lat: number, lng: number) => void;
  activeCoordinates?: { lat: number; lng: number } | null;
  activeLandmark?: { name: string; lat: number; lng: number } | null;
}

export default function MapView({
  places,
  selectedPlace,
  onSelectPlace,
  onMapClickCoordinates,
  activeCoordinates,
  activeLandmark
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const activePinRef = useRef<any>(null);
  const landmarkPinRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    let isMounted = true;

    import('leaflet').then((leaflet) => {
      L = leaflet.default || leaflet;

      if (!isMounted) return;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        // Myanmar bounds center ~ 16.8661, 96.1951
        const map = L.map(mapContainerRef.current, {
          center: [16.8661, 96.1951],
          zoom: 12,
          zoomControl: false
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Click to search nearby
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          onMapClickCoordinates(lat, lng);
        });

        mapInstanceRef.current = map;
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when places change
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    import('leaflet').then((leaflet) => {
      const L = leaflet.default || leaflet;
      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const validPlaces = places.filter(p => p.lat != null && p.lng != null);

      const group: any[] = [];

      validPlaces.forEach((place) => {
        const isSelected = selectedPlace?.id === place.id;
        const color = isSelected ? '#6366f1' : '#06b6d4';

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              width: ${isSelected ? '26px' : '18px'};
              height: ${isSelected ? '26px' : '18px'};
              background: ${color};
              border: 2.5px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 ${isSelected ? '14px rgba(99,102,241,0.8)' : '6px rgba(6,182,212,0.6)'};
              cursor: pointer;
              transition: all 0.2s ease;
            "></div>
          `,
          iconSize: [isSelected ? 26 : 18, isSelected ? 26 : 18],
          iconAnchor: [isSelected ? 13 : 9, isSelected ? 13 : 9]
        });

        const marker = L.marker([place.lat!, place.lng!], { icon: customIcon }).addTo(map);

        const popupHtml = `
          <div style="font-family: system-ui; padding: 4px; min-width: 180px;">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 2px;">${place.name_eng}</div>
            ${place.name_mmr ? `<div style="color: #4f46e5; font-weight: 700; font-size: 13px; margin-bottom: 4px;">${place.name_mmr}</div>` : ''}
            <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 6px;">
              ${place.tsp_name || ''}${place.sr_name ? ` • ${place.sr_name}` : ''}
            </div>
            <div style="display: flex; gap: 6px; font-size: 11px; flex-wrap: wrap;">
              <span style="background: rgba(99,102,241,0.12); color: #4f46e5; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-family: monospace;">
                ${place.pcode}
              </span>
              ${place.postal_code ? `
                <span style="background: rgba(16,185,129,0.12); color: #059669; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-family: monospace;">
                  📮 ${place.postal_code}
                </span>
              ` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.on('click', () => {
          onSelectPlace(place);
        });

        markersRef.current.push(marker);
        group.push(marker);

        if (isSelected) {
          marker.openPopup();
        }
      });

      // Handle active search coordinates pin
      if (activePinRef.current) {
        activePinRef.current.remove();
        activePinRef.current = null;
      }

      if (activeCoordinates) {
        const searchPinIcon = L.divIcon({
          className: 'search-center-pin',
          html: `
            <div style="
              width: 18px;
              height: 18px;
              background: #ef4444;
              border: 3px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 14px rgba(239, 68, 68, 0.9);
            "></div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });

        activePinRef.current = L.marker([activeCoordinates.lat, activeCoordinates.lng], {
          icon: searchPinIcon
        }).addTo(map);
        group.push(activePinRef.current);
      }

      // Handle active Landmark pin
      if (landmarkPinRef.current) {
        landmarkPinRef.current.remove();
        landmarkPinRef.current = null;
      }

      if (activeLandmark) {
        const landmarkIcon = L.divIcon({
          className: 'landmark-pin',
          html: `
            <div style="
              background: #f59e0b;
              color: white;
              padding: 4px 8px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              border: 2px solid #ffffff;
              box-shadow: 0 4px 14px rgba(245, 158, 11, 0.7);
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
            ">
              📍 ${activeLandmark.name.slice(0, 16)}
            </div>
          `,
          iconAnchor: [40, 20]
        });

        landmarkPinRef.current = L.marker([activeLandmark.lat, activeLandmark.lng], {
          icon: landmarkIcon
        }).addTo(map);

        landmarkPinRef.current.bindPopup(`
          <div style="font-family: system-ui; padding: 4px;">
            <div style="font-weight: 800; color: #d97706; font-size: 13px;">📍 Searched Landmark</div>
            <div style="font-weight: 700; font-size: 14px; margin-top: 2px;">${activeLandmark.name}</div>
            <div style="font-size: 11px; color: #0f172a; font-weight: 600; font-family: monospace; margin-top: 4px;">
              ${activeLandmark.lat.toFixed(5)}, ${activeLandmark.lng.toFixed(5)}
            </div>
          </div>
        `).openPopup();

        group.push(landmarkPinRef.current);
      }

      // Auto fit bounds if places exist
      if (group.length > 0) {
        const featureGroup = L.featureGroup(group);
        map.fitBounds(featureGroup.getBounds().pad(0.25), { maxZoom: 15, duration: 0.5 });
      } else if (activeLandmark) {
        map.setView([activeLandmark.lat, activeLandmark.lng], 14);
      } else if (activeCoordinates) {
        map.setView([activeCoordinates.lat, activeCoordinates.lng], 13);
      }
    });
  }, [places, selectedPlace, activeCoordinates, activeLandmark]);

  return (
    <div ref={mapContainerRef} id="map" className="map-container-inner" />
  );
}
