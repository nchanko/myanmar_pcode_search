'use client';

import React, { useState, useEffect } from 'react';
import { X, Wifi, WifiOff, HardDrive, Download, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { isOfflineReady, syncOfflineData } from '@/lib/offlineDb';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (val: boolean) => void;
  offlineStatus: { ready: boolean; count: number; lastSynced?: string };
  setOfflineStatus: (status: any) => void;
}

export function OfflineManagerModal({
  isOpen,
  onClose,
  isOfflineMode,
  setIsOfflineMode,
  offlineStatus,
  setOfflineStatus
}: OfflineManagerModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncProgress(0);

    try {
      await syncOfflineData((percent, message) => {
        setSyncProgress(percent);
        setSyncMessage(message);
      });

      const updated = await isOfflineReady();
      setOfflineStatus(updated);
    } catch (err: any) {
      setSyncError(err.message || 'Failed to sync offline database');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <HardDrive size={22} color="#6366f1" />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Offline Database Storage</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Store Myanmar PCode data inside browser IndexedDB for 100% offline searches
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Offline Mode Toggle Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {isOfflineMode ? <WifiOff size={24} color="#f59e0b" /> : <Wifi size={24} color="#10b981" />}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {isOfflineMode ? 'Forced Offline Mode Active' : 'Online / Automatic Mode'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {isOfflineMode
                    ? 'All searches run strictly in-browser via IndexedDB with zero network calls.'
                    : 'Searches automatically use server API, and auto-fall back to IndexedDB if disconnected.'}
                </div>
              </div>
            </div>

            <button
              className={`nav-btn ${isOfflineMode ? 'primary' : ''}`}
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              {isOfflineMode ? 'Disable Offline Mode' : 'Simulate Offline'}
            </button>
          </div>

          {/* Storage Status */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                IndexedDB Status:
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: offlineStatus.ready ? '#34d399' : '#f59e0b'
              }}>
                {offlineStatus.ready ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {offlineStatus.ready ? `Ready (${offlineStatus.count.toLocaleString()} places)` : 'Not Downloaded'}
              </div>
            </div>

            {offlineStatus.lastSynced && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Last synced: {new Date(offlineStatus.lastSynced).toLocaleString()}
              </div>
            )}

            {syncError && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                fontSize: '0.8rem'
              }}>
                {syncError}
              </div>
            )}

            {isSyncing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>{syncMessage}</span>
                  <span style={{ fontWeight: 600, color: '#818cf8' }}>{syncProgress}%</span>
                </div>
                <div style={{
                  height: '8px',
                  width: '100%',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${syncProgress}%`,
                    background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                    transition: 'width 0.2s ease'
                  }} />
                </div>
              </div>
            ) : (
              <button
                className="nav-btn primary"
                onClick={handleStartSync}
                style={{
                  marginTop: '0.5rem',
                  justifyContent: 'center',
                  padding: '0.75rem',
                  fontSize: '0.9rem'
                }}
              >
                <Download size={16} />
                {offlineStatus.ready ? 'Re-sync Offline Database (2.4 MB)' : 'Download Database for Offline Use (2.4 MB)'}
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            💡 <strong>Offline Capabilities:</strong> Once downloaded, all 90,676 Myanmar places (Towns, Wards, Villages), coordinates, and postal codes remain cached permanently in your browser. You can search, browse the map pins, and process batch CSV files anywhere in Myanmar without internet.
          </div>
        </div>
      </div>
    </div>
  );
}
