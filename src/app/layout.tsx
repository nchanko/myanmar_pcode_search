import type { Metadata } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { LanguageProvider } from '@/context/LanguageContext';
import { DATA_INFO } from '@/lib/appInfo';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0f1d'
};

export const metadata: Metadata = {
  title: 'Myanmar PCode Search | မြန်မာ PCODE ရှာဖွေရေးစနစ်',
  description: `High-performance search engine, REST API, and interactive map for Myanmar Place Codes (MIMU ${DATA_INFO.version}) and Postal Codes with persistent caching.`,
  keywords: ['Myanmar PCode', 'MIMU', 'Postal Code', 'Myanmar Maps', 'Geocoding', 'API'],
  authors: [{ name: 'Medaius' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/assets/apple-touch-icon.png'
  },
  manifest: '/manifest.json'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my" suppressHydrationWarning>
      <head>
        {/*
          Set the theme before first paint, on every page. Doing it in a
          component's effect instead would leave pages that don't render the
          toggle stuck on the light palette, and flash light on the ones that do.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||'dark')}catch(e){document.documentElement.setAttribute('data-theme','dark')}`
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <ServiceWorkerRegister />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
