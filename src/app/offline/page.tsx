'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  HardDrive,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  Zap,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { isOfflineReady, syncOfflineData, clearOfflineData } from '@/lib/offlineDb';

export default function OfflinePage() {
  const [offlineStatus, setOfflineStatus] = useState<{ ready: boolean; count: number; lastSynced?: string }>({
    ready: false,
    count: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isOfflineForced, setIsOfflineForced] = useState(false);

  useEffect(() => {
    isOfflineReady().then(setOfflineStatus).catch(console.error);

    // Read stored offline preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mm_pcode_force_offline') === 'true';
      setIsOfflineForced(stored);
    }
  }, []);

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

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear the offline IndexedDB cache?')) {
      await clearOfflineData();
      const updated = await isOfflineReady();
      setOfflineStatus(updated);
    }
  };

  const toggleForceOffline = () => {
    const nextVal = !isOfflineForced;
    setIsOfflineForced(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mm_pcode_force_offline', nextVal ? 'true' : 'false');
    }
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
            <HardDrive size={20} color="#6366f1" />
            <span>Offline Database Storage / အော့ဖ်လိုင်းဒေတာ သိမ်းဆည်းခြင်း</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="doc-container">
        <div className="doc-hero">
          <h1>Offline Database Storage (IndexedDB)</h1>
          <p>
            Download Myanmar PCode data (90,676 places & 17,331 postal codes) directly into your browser.
            Once cached, all searches, coordinate lookups, and batch CSV processing will work 100% offline without any internet connection.
          </p>
        </div>

        <div className="doc-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Mode Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'rgba(99, 102, 241, 0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isOfflineForced ? <WifiOff size={24} color="#f59e0b" /> : <Wifi size={24} color="#10b981" />}
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>
                  {isOfflineForced ? 'Forced Offline Mode Active' : 'Automatic Online / Offline Mode'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {isOfflineForced
                    ? 'All queries are strictly answered by your local browser IndexedDB.'
                    : 'Searches query the fast server API and automatically fall back to IndexedDB if disconnected.'}
                </div>
              </div>
            </div>

            <button
              className="toggle-btn"
              onClick={toggleForceOffline}
              style={{
                background: isOfflineForced ? '#f59e0b' : 'white',
                color: isOfflineForced ? 'white' : 'var(--text-primary)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              {isOfflineForced ? 'Switch to Online Mode' : 'Simulate / Force Offline'}
            </button>
          </div>

          {/* Database Status Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                IndexedDB Status
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {offlineStatus.ready ? (
                  <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={18} /> Cached & Ready ({offlineStatus.count.toLocaleString()} places)
                  </span>
                ) : (
                  <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={18} /> Not Downloaded
                  </span>
                )}
              </div>
              {offlineStatus.lastSynced && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Last downloaded: {new Date(offlineStatus.lastSynced).toLocaleString()}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="toggle-btn"
                onClick={handleStartSync}
                disabled={isSyncing}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Downloading... {syncProgress}%</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>{offlineStatus.ready ? 'Re-download / Update (2.4 MB)' : 'Download Offline Database (2.4 MB)'}</span>
                  </>
                )}
              </button>

              {offlineStatus.ready && (
                <button
                  className="toggle-btn"
                  onClick={handleClear}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                  title="Clear IndexedDB"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Sync Progress Bar */}
          {isSyncing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#4b5563' }}>
                <span>{syncMessage}</span>
                <span>{syncProgress}%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${syncProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  transition: 'width 0.2s ease'
                }} />
              </div>
            </div>
          )}

          {syncError && (
            <div style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              ⚠️ {syncError}
            </div>
          )}
        </div>

        {/* Feature Capabilities Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginTop: '24px'
        }}>
          <div className="doc-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Zap size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Zero Network Latency</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: 1.5 }}>
              Searches are performed directly in memory using your browser&apos;s IndexedDB indices. Typical response times are under 5ms.
            </p>
          </div>

          <div className="doc-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ShieldCheck size={20} color="#10b981" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Works 100% Offline</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: 1.5 }}>
              Ideal for humanitarian field workers, logistics teams, and areas in Myanmar with limited or unstable connectivity.
            </p>
          </div>

          <div className="doc-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Compass size={20} color="#6366f1" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Spatial Coordinate Search</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: 1.5 }}>
              Uses the haversine formula inside the browser to calculate nearest villages and towns even without internet access.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
