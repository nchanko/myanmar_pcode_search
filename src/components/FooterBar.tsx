'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, BookOpen, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function FooterBar() {
  const { language, t } = useLanguage();

  return (
    <footer className="footer-bar">
      <div className="footer-bar-content">
        <div className="footer-bar-left">
          <span><strong>{language === 'mm' ? 'ရင်းမြစ်:' : 'Source:'}</strong> MIMU Release 9.6 & Myanmar Postal Code</span>
          <span className="footer-sep">•</span>
          <a href="https://themimu.info/place-codes" target="_blank" rel="noreferrer">
            {t.footerDataMimu} <ExternalLink size={11} style={{ display: 'inline' }} />
          </a>
          <span className="footer-sep">•</span>
          <a href="https://github.com/MyanmarPost/MyanmarPostalCode" target="_blank" rel="noreferrer">
            {t.footerDataPost} <ExternalLink size={11} style={{ display: 'inline' }} />
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
        </div>
      </div>
    </footer>
  );
}
export default FooterBar;
