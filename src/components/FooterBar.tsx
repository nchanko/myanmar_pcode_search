'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, BookOpen, FileText } from 'lucide-react';

export function FooterBar() {
  return (
    <footer className="footer-bar">
      <div className="footer-bar-content">
        <div className="footer-bar-left">
          <span><strong>Source:</strong> MIMU Release 9.6 (Feb 2025) & Myanmar Postal Code (V-1.0)</span>
          <span className="footer-sep">•</span>
          <a href="https://themimu.info/place-codes" target="_blank" rel="noreferrer">
            MIMU Place Codes <ExternalLink size={11} style={{ display: 'inline' }} />
          </a>
          <span className="footer-sep">•</span>
          <a href="https://github.com/MyanmarPost/MyanmarPostalCode" target="_blank" rel="noreferrer">
            Myanmar Postal Code <ExternalLink size={11} style={{ display: 'inline' }} />
          </a>
        </div>
        <div className="footer-bar-right">
          <Link href="/guide">
            <BookOpen size={12} style={{ display: 'inline', marginRight: '3px' }} /> User Guide
          </Link>
          <span className="footer-sep">•</span>
          <Link href="/docs">
            <FileText size={12} style={{ display: 'inline', marginRight: '3px' }} /> REST API Docs
          </Link>
          <span className="footer-sep">•</span>
          <a href="https://github.com/nchanko/myanmar_pcode_search" target="_blank" rel="noreferrer">
            GitHub <ExternalLink size={11} style={{ display: 'inline' }} />
          </a>
          <span className="footer-sep">•</span>
          <span>Developed by Medaius</span>
        </div>
      </div>
    </footer>
  );
}
export default FooterBar;
