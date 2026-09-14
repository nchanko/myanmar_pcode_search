'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Terminal, Send, Copy, Check, Code2, Database } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ApiDocsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTestResponse, setActiveTestResponse] = useState<Record<string, any>>({});
  const [isLoadingTest, setIsLoadingTest] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const executeLiveTest = async (endpoint: string, id: string, method: string = 'GET', body?: any) => {
    setIsLoadingTest(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(endpoint, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      setActiveTestResponse(prev => ({ ...prev, [id]: data }));
    } catch (err: any) {
      setActiveTestResponse(prev => ({ ...prev, [id]: { error: err.message } }));
    } finally {
      setIsLoadingTest(prev => ({ ...prev, [id]: false }));
    }
  };

  const endpoints = [
    {
      id: 'search',
      title: 'Search Places (Text & PCode)',
      method: 'GET',
      path: '/api/v1/search',
      sampleUrl: '/api/v1/search?q=Yangon&type=town&limit=5',
      description: 'Search places by Myanmar Unicode name, English name, PCode, or Township with relevance scoring.',
      parameters: [
        { name: 'q', type: 'string', required: true, desc: 'Search query (e.g. "Yangon", "မန္တလေး", "MMR013000777")' },
        { name: 'type', type: 'string', required: false, desc: 'Filter by place type: "all" | "town" | "ward" | "village_tract" | "village"' },
        { name: 'limit', type: 'number', required: false, desc: 'Maximum number of results (default 25, max 100)' }
      ],
      curlSnippet: `curl -s "http://localhost:3030/api/v1/search?q=Yangon&type=town&limit=5"`,
      jsSnippet: `const res = await fetch('http://localhost:3030/api/v1/search?q=Yangon&type=town');
const data = await res.json();
console.log(data.results);`,
      pythonSnippet: `import requests
res = requests.get('http://localhost:3030/api/v1/search', params={'q': 'Yangon', 'type': 'town'})
print(res.json()['results'])`
    },
    {
      id: 'nearby',
      title: 'Reverse Geocode / Nearby Coordinates',
      method: 'GET',
      path: '/api/v1/nearby',
      sampleUrl: '/api/v1/nearby?lat=16.8661&lng=96.1951&radius=10&limit=5',
      description: 'Find administrative places nearest to a given latitude and longitude within a radius (km).',
      parameters: [
        { name: 'lat', type: 'number', required: true, desc: 'Latitude in decimal degrees (e.g. 16.8661)' },
        { name: 'lng', type: 'number', required: true, desc: 'Longitude in decimal degrees (e.g. 96.1951)' },
        { name: 'radius', type: 'number', required: false, desc: 'Search radius in kilometers (default 10, max 100)' },
        { name: 'limit', type: 'number', required: false, desc: 'Max results (default 20, max 50)' }
      ],
      curlSnippet: `curl -s "http://localhost:3030/api/v1/nearby?lat=16.8661&lng=96.1951&radius=10"`,
      jsSnippet: `const res = await fetch('http://localhost:3030/api/v1/nearby?lat=16.8661&lng=96.1951&radius=10');
const data = await res.json();`,
      pythonSnippet: `import requests
res = requests.get('http://localhost:3030/api/v1/nearby', params={'lat': 16.8661, 'lng': 96.1951, 'radius': 10})
print(res.json()['results'])`
    },
    {
      id: 'pcode',
      title: 'Lookup by PCode',
      method: 'GET',
      path: '/api/v1/pcode/{code}',
      sampleUrl: '/api/v1/pcode/MMR013000777',
      description: 'Instant O(1) retrieval of full administrative hierarchy and postal code by unique PCode.',
      parameters: [
        { name: 'code', type: 'string', required: true, desc: 'MIMU Place Code (e.g. "MMR013000777")' }
      ],
      curlSnippet: `curl -s "http://localhost:3030/api/v1/pcode/MMR013000777"`,
      jsSnippet: `const res = await fetch('http://localhost:3030/api/v1/pcode/MMR013000777');
const place = await res.json();`,
      pythonSnippet: `import requests
res = requests.get('http://localhost:3030/api/v1/pcode/MMR013000777')
print(res.json())`
    },
    {
      id: 'batch',
      title: 'Batch Coordinate Reverse Geocoding',
      method: 'POST',
      path: '/api/v1/batch',
      sampleUrl: '/api/v1/batch',
      sampleBody: {
        items: [
          { id: 1, latitude: 16.8661, longitude: 96.1951 },
          { id: 2, latitude: 21.9588, longitude: 96.0891 }
        ]
      },
      description: 'High-throughput reverse geocoding for up to 2,000 coordinate points in a single request. Accepts JSON or CSV text.',
      parameters: [
        { name: 'items', type: 'array', required: true, desc: 'Array of objects with id, latitude, longitude' }
      ],
      curlSnippet: `curl -s -X POST http://localhost:3030/api/v1/batch \\
  -H "Content-Type: application/json" \\
  -d '{"items": [{"id": 1, "latitude": 16.8661, "longitude": 96.1951}]}'`,
      jsSnippet: `const res = await fetch('http://localhost:3030/api/v1/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items: [{ id: 1, latitude: 16.8661, longitude: 96.1951 }] })
});
const data = await res.json();`,
      pythonSnippet: `import requests
payload = {'items': [{'id': 1, 'latitude': 16.8661, 'longitude': 96.1951}]}
res = requests.post('http://localhost:3030/api/v1/batch', json=payload)
print(res.json())`
    },
    {
      id: 'stats',
      title: 'System Statistics',
      method: 'GET',
      path: '/api/v1/stats',
      sampleUrl: '/api/v1/stats',
      description: 'System statistics, total indexed places, and MIMU release info.',
      parameters: [],
      curlSnippet: `curl -s "http://localhost:3030/api/v1/stats"`,
      jsSnippet: `const res = await fetch('http://localhost:3030/api/v1/stats');
const stats = await res.json();`,
      pythonSnippet: `import requests
res = requests.get('http://localhost:3030/api/v1/stats')
print(res.json())`
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" className="nav-btn" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            <span>Back to Map</span>
          </Link>
          <div className="brand-title">Myanmar PCode REST API v1</div>
        </div>

        <div className="nav-actions">
          <Link href="/guide" className="nav-link">
            User Guide
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Documentation Body */}
      <main className="doc-page-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>API Documentation & Interactive Playground</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
            The Myanmar PCode REST API provides ultra-fast search, reverse geocoding, and batch coordinate matching against the official MIMU Release 9.6 dataset (90,676 places) and Myanmar Postal Codes (17,331 entries).
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-subtle)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Base URL:</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>http://localhost:3030</span>
          </div>
        </div>

        {/* Endpoints List */}
        {endpoints.map((ep) => (
          <section key={ep.id} className="doc-section" id={ep.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.25rem' }}>{ep.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: ep.method === 'GET' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)',
                    color: ep.method === 'GET' ? 'var(--accent-success)' : 'var(--accent-primary)'
                  }}>
                    {ep.method}
                  </span>
                  <code style={{ fontSize: '0.95rem', fontWeight: 600 }}>{ep.path}</code>
                </div>
              </div>

              {/* Try It Out Button */}
              <button
                className="nav-btn primary"
                onClick={() => executeLiveTest(ep.sampleUrl, ep.id, ep.method, ep.sampleBody)}
                disabled={isLoadingTest[ep.id]}
              >
                <Send size={14} />
                <span>{isLoadingTest[ep.id] ? 'Executing...' : 'Try It Live'}</span>
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{ep.description}</p>

            {/* Parameters Table */}
            {ep.parameters.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Parameters</h3>
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.parameters.map((p) => (
                        <tr key={p.name}>
                          <td><code>{p.name}</code></td>
                          <td><code>{p.type}</code></td>
                          <td>
                            <span style={{
                              color: p.required ? '#ef4444' : 'var(--text-muted)',
                              fontWeight: p.required ? 600 : 400
                            }}>
                              {p.required ? 'Yes' : 'Optional'}
                            </span>
                          </td>
                          <td>{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Code Snippets */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Example cURL</h3>
                <button
                  className="nav-btn"
                  onClick={() => copyToClipboard(ep.curlSnippet, `curl-${ep.id}`)}
                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                >
                  {copiedId === `curl-${ep.id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  {copiedId === `curl-${ep.id}` ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="code-block">
                <pre>{ep.curlSnippet}</pre>
              </div>
            </div>

            {/* Live Response Viewer */}
            {activeTestResponse[ep.id] && (
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--accent-success)' }}>
                  Live API Response
                </h3>
                <div className="code-block" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  <pre>{JSON.stringify(activeTestResponse[ep.id], null, 2)}</pre>
                </div>
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
