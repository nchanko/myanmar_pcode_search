'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UploadCloud, Database, FileText, BookOpen, Menu, X, ChevronRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';

interface NavbarProps {
  isOnline?: boolean;
  offlineCount?: number;
}

export function Navbar(_props?: NavbarProps) {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="navbar">
      <Link href="/" className="nav-brand">
        <div className="brand-icon">
          <img src="/assets/logo.png" alt="Logo" width={34} height={34} />
        </div>
        <div>
          <div className="brand-title">{t.appName}</div>
          <div className="brand-subtitle">{t.placesCount}</div>
        </div>
      </Link>

      <div className="nav-actions" ref={menuRef}>
        <LanguageToggle />
        <ThemeToggle />
        
        {/* Menu button for tools & other pages */}
        <button
          type="button"
          className={`nav-btn nav-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={t.menu}
          title={t.menu}
        >
          {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
          <span className="nav-menu-text">{t.menu}</span>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="nav-menu-dropdown">
            <div className="nav-menu-header">
              <span>{t.menuSubtitle}</span>
            </div>
            <Link
              href="/batch"
              className="nav-menu-item"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="nav-menu-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <UploadCloud size={16} />
              </div>
              <div className="nav-menu-info">
                <span className="nav-menu-title">{t.batchNav}</span>
                <span className="nav-menu-desc">CSV Geocoding</span>
              </div>
              <ChevronRight size={14} className="nav-menu-arrow" />
            </Link>

            <Link
              href="/offline"
              className="nav-menu-item"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="nav-menu-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
                <Database size={16} />
              </div>
              <div className="nav-menu-info">
                <span className="nav-menu-title">{t.offlineNav}</span>
                <span className="nav-menu-desc">Offline Database</span>
              </div>
              <ChevronRight size={14} className="nav-menu-arrow" />
            </Link>

            <Link
              href="/docs"
              className="nav-menu-item"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="nav-menu-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
                <FileText size={16} />
              </div>
              <div className="nav-menu-info">
                <span className="nav-menu-title">{t.apiDocsNav}</span>
                <span className="nav-menu-desc">REST API Documentation</span>
              </div>
              <ChevronRight size={14} className="nav-menu-arrow" />
            </Link>

            <Link
              href="/guide"
              className="nav-menu-item"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="nav-menu-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                <BookOpen size={16} />
              </div>
              <div className="nav-menu-info">
                <span className="nav-menu-title">{t.guideNav}</span>
                <span className="nav-menu-desc">User Manual & Tips</span>
              </div>
              <ChevronRight size={14} className="nav-menu-arrow" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
export default Navbar;
