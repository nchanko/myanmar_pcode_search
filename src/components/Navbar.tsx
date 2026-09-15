'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UploadCloud, Database, FileText, BookOpen, Menu, X, ChevronRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import { DATA_INFO } from '@/lib/appInfo';
import { formatNumber } from '@/lib/format';

// `title` is a translation key; `color` tints the icon.
const MENU_ITEMS = [
  { href: '/batch', icon: UploadCloud, color: '#10b981', title: 'batchNav', desc: 'CSV Geocoding' },
  { href: '/offline', icon: Database, color: '#6366f1', title: 'offlineNav', desc: 'Offline Database' },
  { href: '/docs', icon: FileText, color: '#06b6d4', title: 'apiDocsNav', desc: 'REST API Documentation' },
  { href: '/guide', icon: BookOpen, color: '#8b5cf6', title: 'guideNav', desc: 'User Manual & Tips' }
] as const;

export function Navbar() {
  const { t, language } = useLanguage();
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

  const subtitle = t.placesCount
    .replace('{version}', DATA_INFO.version)
    .replace('{count}', formatNumber(DATA_INFO.totalPlaces, language));

  return (
    <header className="navbar">
      <Link href="/" className="nav-brand">
        <div className="brand-icon">
          <img src="/assets/logo.png" alt="Logo" width={34} height={34} />
        </div>
        <div>
          <div className="brand-title">{t.appName}</div>
          <div className="brand-subtitle">{subtitle}</div>
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

        {isMenuOpen && (
          <div className="nav-menu-dropdown">
            <div className="nav-menu-header">
              <span>{t.menuSubtitle}</span>
            </div>
            {MENU_ITEMS.map(({ href, icon: Icon, color, title, desc }) => (
              <Link key={href} href={href} className="nav-menu-item" onClick={() => setIsMenuOpen(false)}>
                {/* "1f" appends ~12% alpha for a light tint of the icon colour */}
                <div className="nav-menu-icon" style={{ background: `${color}1f`, color }}>
                  <Icon size={16} />
                </div>
                <div className="nav-menu-info">
                  <span className="nav-menu-title">{t[title]}</span>
                  <span className="nav-menu-desc">{desc}</span>
                </div>
                <ChevronRight size={14} className="nav-menu-arrow" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
export default Navbar;
