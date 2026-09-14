'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="nav-lang-toggle" title={language === 'mm' ? 'ဘာသာစကားပြောင်းရန်' : 'Switch Language'}>
      <button
        type="button"
        className={`nav-lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        title="English"
      >
        EN
      </button>
      <button
        type="button"
        className={`nav-lang-btn ${language === 'mm' ? 'active' : ''}`}
        onClick={() => setLanguage('mm')}
        title="မြန်မာဘာသာ"
      >
        မြန်မာ
      </button>
    </div>
  );
}
export default LanguageToggle;
