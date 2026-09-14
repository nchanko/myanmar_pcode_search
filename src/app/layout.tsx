import type { Metadata } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0f1d'
};

export const metadata: Metadata = {
  title: 'Myanmar PCode Search | မြန်မာ PCODE ရှာဖွေရေးစနစ် v2.0',
  description: 'High-performance search engine, REST API, and interactive map for Myanmar Place Codes (MIMU 9.6) and Postal Codes with persistent caching.',
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
    <html lang="my">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
