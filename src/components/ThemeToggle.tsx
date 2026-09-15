'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'dark' | 'light';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  // The inline script in app/layout.tsx already applied the theme; read it back
  // so the icon matches what is on screen.
  useEffect(() => {
    const applied = document.documentElement.getAttribute('data-theme');
    if (applied === 'light' || applied === 'dark') setTheme(applied);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch {
      // Private browsing: the theme still applies for this page view.
    }
  };

  return (
    <button
      className="nav-btn"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      style={{ padding: '0.45rem' }}
    >
      {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
    </button>
  );
}
