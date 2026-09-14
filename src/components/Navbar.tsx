'use client';

import React from 'react';
import Link from 'next/link';
import { UploadCloud, Database, FileText, BookOpen } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onOpenBatch?: () => void;
  onOpenOfflineManager?: () => void;
  isOnline?: boolean;
  offlineCount?: number;
}

export function Navbar({ isOnline = true, offlineCount }: NavbarProps) {
  return (
    <header className="navbar">
      <Link href="/" className="nav-brand">
        <div className="brand-icon">
          <img src="/assets/logo.png" alt="Logo" width={34} height={34} />
        </div>
        <div>
          <div className="brand-title">Myanmar PCode Search</div>
          <div className="brand-subtitle">
            MIMU 9.6 • 90,676 Places
            <span className={`status-badge ${isOnline ? 'online' : 'offline'}`} style={{ marginLeft: 6 }}>
              {isOnline ? '● Online' : '○ Offline'}
            </span>
            {offlineCount ? (
              <span className="status-badge online" style={{ marginLeft: 4 }}>
                💾 {(offlineCount / 1000).toFixed(1)}k
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="nav-actions">
        <Link href="/batch" className="nav-btn" title="Batch Coordinate Upload">
          <UploadCloud size={14} color="#10b981" />
          <span>Batch CSV</span>
        </Link>
        <Link href="/offline" className="nav-btn" title="Offline Database">
          <Database size={14} color="#6366f1" />
          <span>Offline DB</span>
        </Link>
        <Link href="/docs" className="nav-btn" title="REST API Documentation">
          <FileText size={14} color="#06b6d4" />
          <span>API Docs</span>
        </Link>
        <Link href="/guide" className="nav-btn" title="User Guide">
          <BookOpen size={14} color="#8b5cf6" />
          <span>Guide</span>
        </Link>
        <ThemeToggle />
        <a
          href="https://github.com/nchanko/myanmar_pcode_search"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-btn"
          title="GitHub Repository"
          style={{ padding: '0.45rem' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
            <path d="M9 18c-4.51 2-5-2-7-2"></path>
          </svg>
        </a>
      </div>
    </header>
  );
}
export default Navbar;
