'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, BookOpen, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { APP_VERSION, CHANGELOG_URL, DATA_INFO } from '@/lib/appInfo';

export function FooterBar() {
  const { t } = useLanguage();

  return (
    <footer className="footer-bar">
      <div className="footer-bar-content">
        <div className="footer-bar-left">
          <span>
            <strong>{t.footerSource}</strong> MIMU Release {DATA_INFO.version} ({DATA_INFO.mimuRelease}) & Myanmar Postal Code
          </span>
          <span className="footer-sep">•</span>
          <a href="https://themimu.info/place-codes" target="_blank" rel="noreferrer">
            {t.footerDataMimu} <ExternalLink size={11} style={{ display: 'inline' }} />
          </a>
          <span className="footer-sep">•</span>
          <a href="https://github.com/MyanmarPost/MyanmarPostalCode" target="_blank" rel="noreferrer">
            {t.footerDataPost} <ExternalLink size={11} style={{ display: 'inline' }} />
          </a>
          <span className="footer-sep">•</span>
          <a href="https://data.humdata.org/dataset/cod-ab-mmr" target="_blank" rel="noreferrer">
            {t.footerDataBoundaries} <ExternalLink size={11} style={{ display: 'inline' }} />
          </a>
        </div>
        <div className="footer-bar-right">
          <Link href="/guide">
            <BookOpen size={12} style={{ display: 'inline', marginRight: '3px' }} /> {t.guideNav}
          </Link>
          <span className="footer-sep">•</span>
          <Link href="/docs">
            <FileText size={12} style={{ display: 'inline', marginRight: '3px' }} /> {t.apiDocsNav}
          </Link>
          <span className="footer-sep">•</span>
          <a href="https://github.com/nchanko/myanmar_pcode_search" target="_blank" rel="noreferrer">
            GitHub <ExternalLink size={11} style={{ display: 'inline' }} />
          </a>
          <span className="footer-sep">•</span>
          <a href={CHANGELOG_URL} target="_blank" rel="noreferrer" title="Changelog">
            v{APP_VERSION}
          </a>
          <span className="footer-sep">•</span>
          <span>{t.footerMadeBy} <strong>Nyein Chan Ko Ko</strong></span>
        </div>
      </div>
    </footer>
  );
}
export default FooterBar;
