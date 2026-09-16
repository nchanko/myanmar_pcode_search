'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { BatchResultItem } from '@/types/pcode';
import { DATA_INFO } from '@/lib/appInfo';
import Papa from 'papaparse';

export default function BatchPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (file: File) => {
    setError(null);
    setWarning(null);
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
          let serverError: string | null = null;

          try {
            const res = await fetch('/api/v1/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items })
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
              // e.g. the 2,000-item cap, or a 500. Keep the reason: the user
              // needs it if the offline fallback isn't available either.
              const message: string = data?.error || `Server returned ${res.status}.`;
              serverError = message;
              throw new Error(message);
            }
            if (!Array.isArray(data?.results)) {
              const message: string = data?.error || 'The server returned an unexpected response.';
              serverError = message;
              throw new Error(message);
            }

            batchResults = data.results;
          } catch (netErr: any) {
            // Fall back to the downloaded dataset — but only if it is actually
            // there. Running the lookup against an empty database returns a
            // NOT_FOUND for every row, which reads like a real answer.
            const { isOfflineReady, batchLookupOffline } = await import('@/lib/offlineDb');
            const offline = await isOfflineReady().catch(() => ({ ready: false, count: 0 }));

            if (!offline.ready) {
              throw new Error(
                serverError
                  ? `${serverError} No offline database is downloaded to fall back on.`
                  : 'Could not reach the server, and no offline database is downloaded. Download it on the Offline page, then try again.'
              );
            }

            batchResults = await batchLookupOffline(items);
            setWarning(
              serverError
                ? `Server lookup failed (${serverError}) — matched against your downloaded offline database instead.`
                : 'Could not reach the server — matched against your downloaded offline database instead.'
            );
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

  const matchedCount = results.filter(r => r.status === 'FOUND').length;
  const unmatchedCount = results.length - matchedCount;

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
    <div className="doc-page-layout">
      {/* Top Navbar */}
      <header className="doc-navbar">
        <div className="doc-navbar-left">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Map & Search</span>
          </Link>
          <div className="doc-brand">
            <UploadCloud size={20} color="#10b981" />
            <span>Batch Coordinate Reverse Geocoding / အများအပြားရှာဖွေခြင်း</span>
          </div>
        </div>
        <div className="nav-actions">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="doc-container">
        <div className="doc-hero">
          <h1>Batch Coordinate Processing</h1>
          <p>
            Upload a CSV file containing multiple GPS coordinates (latitude, longitude) to instantly match them with
            official Myanmar Place Codes (MIMU {DATA_INFO.version}), Township hierarchies, and Postal Codes.
          </p>
        </div>

        <div className="doc-card">
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.85rem'
            }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {warning && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'var(--warning-subtle)',
              border: '1px solid var(--warning-subtle)',
              borderRadius: '8px',
              color: 'var(--warning-text)',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={18} />
              <span>{warning}</span>
            </div>
          )}

          {results.length === 0 ? (
            <div
              style={{
                border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                background: dragOver ? 'var(--primary-subtle)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              onClick={() => document.getElementById('batchFileInput')?.click()}
            >
              <input
                id="batchFileInput"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />

              {isProcessing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <Loader2 className="animate-spin" size={42} color="#6366f1" />
                  <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Matching Coordinates with Spatial Database...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--success-text)'
                  }}>
                    <UploadCloud size={28} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    Click or drag & drop CSV here to upload
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    CSV must include <code>latitude</code> and <code>longitude</code> columns.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDownloadSample(); }}
                    style={{
                      marginTop: '0.5rem',
                      background: 'none',
                      border: 'none',
                      color: '#6366f1',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Download Sample CSV Template
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-text)', fontWeight: 600 }}>
                  <CheckCircle2 size={20} />
                  <span>
                    Matched {matchedCount} of {results.length} rows
                    {unmatchedCount > 0 ? ` (${unmatchedCount} unmatched)` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="toggle-btn"
                    onClick={() => setResults([])}
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    Upload Another
                  </button>
                  <button
                    className="toggle-btn"
                    onClick={handleDownloadResults}
                    style={{ background: 'var(--success)', color: '#ffffff' }}
                  >
                    <Download size={14} /> Download Enriched CSV
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>Matched Place</th>
                      <th>Type</th>
                      <th>PCode</th>
                      <th>Postal Code</th>
                      <th>Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 20).map((r, i) => (
                      <tr key={i}>
                        <td>{r.id}</td>
                        <td><code>{r.latitude.toFixed(4)}</code></td>
                        <td><code>{r.longitude.toFixed(4)}</code></td>
                        <td><strong>{r.matched_name_eng || 'Unknown'}</strong></td>
                        <td><span className="type-pill">{r.matched_type || 'N/A'}</span></td>
                        <td><code>{r.matched_pcode || 'N/A'}</code></td>
                        <td>{r.postal_code ? `📮 ${r.postal_code}` : '-'}</td>
                        <td>{r.distance_km != null ? `${r.distance_km} km` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
