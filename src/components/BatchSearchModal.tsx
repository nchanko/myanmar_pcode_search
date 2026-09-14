'use client';

import React, { useState } from 'react';
import { X, UploadCloud, Download, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import type { BatchResultItem } from '@/types/pcode';
import Papa from 'papaparse';

interface BatchSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BatchSearchModal({ isOpen, onClose }: BatchSearchModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    setError(null);
    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        try {
          const items = (parsed.data as any[]).map((row, idx) => ({
            id: row.id || row.ID || idx + 1,
            latitude: parseFloat(row.latitude || row.lat || row.Latitude || ''),
            longitude: parseFloat(row.longitude || row.lng || row.lon || row.Longitude || '')
          })).filter(item => !isNaN(item.latitude) && !isNaN(item.longitude));

          if (items.length === 0) {
            setError('No valid coordinates found in the CSV. Ensure headers include "latitude" and "longitude".');
            setIsProcessing(false);
            return;
          }

          let batchResults: BatchResultItem[] = [];

          try {
            const res = await fetch('/api/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items })
            });

            if (res.ok) {
              const data = await res.json();
              batchResults = data.results || [];
            } else {
              throw new Error('Server batch failed, trying offline...');
            }
          } catch (netErr) {
            // Seamless offline batch fallback
            console.log('Using in-browser offline batch processor...');
            const { batchLookupOffline } = await import('@/lib/offlineDb');
            batchResults = await batchLookupOffline(items);
          }

          setResults(batchResults);
        } catch (err: any) {
          setError(err.message || 'An error occurred during batch processing.');
        } finally {
          setIsProcessing(false);
        }
      },
      error: (parseErr) => {
        setError('Failed to parse CSV: ' + parseErr.message);
        setIsProcessing(false);
      }
    });
  };

  const handleDownloadResults = () => {
    if (!results.length) return;
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pcode_batch_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const sample = `id,latitude,longitude\n1,16.8661,96.1951\n2,21.9588,96.0891\n3,16.7967,96.1500\n4,19.7450,96.1297`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_coordinates.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Batch Coordinate Reverse Geocoding</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Upload up to 2,000 coordinates to auto-match with MIMU PCodes & Postal Codes
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <div
            className={`drop-zone ${dragOver ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              };
              input.click();
            }}
          >
            {isProcessing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Loader2 size={32} className="animate-spin" color="#818cf8" />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Processing coordinates against SQLite database...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={36} color="#818cf8" />
                <p style={{ fontWeight: 500 }}>Click to browse or drag & drop CSV file</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  File must contain columns: <code style={{ color: '#818cf8' }}>latitude</code>, <code style={{ color: '#818cf8' }}>longitude</code>
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="nav-btn"
              onClick={handleDownloadSample}
              style={{ fontSize: '0.8rem' }}
            >
              <Download size={14} />
              Download Sample CSV
            </button>

            {results.length > 0 && (
              <button
                className="nav-btn primary"
                onClick={handleDownloadResults}
                style={{ fontSize: '0.8rem' }}
              >
                <Download size={14} />
                Export {results.length} Results (.csv)
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div style={{
              maxHeight: '280px',
              overflowY: 'auto',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(255,255,255,0.05)', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '8px 12px' }}>ID</th>
                    <th style={{ padding: '8px 12px' }}>Coords</th>
                    <th style={{ padding: '8px 12px' }}>PCode</th>
                    <th style={{ padding: '8px 12px' }}>Matched Location</th>
                    <th style={{ padding: '8px 12px' }}>Postal</th>
                    <th style={{ padding: '8px 12px' }}>Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 100).map((r, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{r.id}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>
                        {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#818cf8', fontWeight: 600 }}>
                        {r.matched_pcode || '-'}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        {r.matched_name_eng} {r.township ? `(${r.township})` : ''}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#34d399', fontFamily: 'monospace' }}>
                        {r.postal_code || '-'}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                        {r.distance_km != null ? `${r.distance_km} km` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.length > 100 && (
                <div style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Showing first 100 of {results.length} results. Click "Export Results" for full dataset.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
