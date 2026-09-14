const PORT = process.env.PORT || 3030;
const BASE_URL = `http://localhost:${PORT}`;

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode: number;
  durationMs: number;
  details?: string;
}

const results: TestResult[] = [];

async function runTest(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  validator?: (data: any) => boolean
) {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const data = await res.json();

    const passed = res.status === 200 && (!validator || validator(data));

    results.push({
      endpoint,
      method,
      status: passed ? 'PASS' : 'FAIL',
      statusCode: res.status,
      durationMs,
      details: passed ? `OK (${JSON.stringify(data).slice(0, 70)}...)` : `Error: ${JSON.stringify(data)}`
    });
  } catch (err: any) {
    results.push({
      endpoint,
      method,
      status: 'FAIL',
      statusCode: 0,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      details: `Exception: ${err.message}`
    });
  }
}

async function main() {
  console.log(`\n🧪 Testing Myanmar PCode REST API v1 on ${BASE_URL}...\n`);

  // 1. Stats
  await runTest('/api/v1/stats', 'GET', undefined, (d) => (d.apiVersion === 'v1' || d.version) && d.totalPlaces > 90000);

  // 2. English text search
  await runTest('/api/v1/search?q=Yangon&type=town&limit=5', 'GET', undefined, (d) => d.results?.length > 0);

  // 3. Myanmar Unicode search
  await runTest(`/api/v1/search?q=${encodeURIComponent('မန္တလေး')}&limit=5`, 'GET', undefined, (d) => d.results?.length > 0);

  // 4. Coordinates search
  await runTest('/api/v1/nearby?lat=16.8661&lng=96.1951&radius=10&limit=5', 'GET', undefined, (d) => d.results?.length > 0);

  // 5. PCode lookup
  await runTest('/api/v1/pcode/MMR013000777', 'GET', undefined, (d) => d.pcode === 'MMR013000777');

  // 6. Batch coordinate lookup
  await runTest(
    '/api/v1/batch',
    'POST',
    {
      items: [
        { id: 1, latitude: 16.8661, longitude: 96.1951 },
        { id: 2, latitude: 21.9588, longitude: 96.0891 }
      ]
    },
    (d) => d.results?.length === 2 && d.results[0].status === 'FOUND'
  );

  console.log('='.repeat(75));
  console.log(`| ${'METHOD'.padEnd(7)} | ${'ENDPOINT'.padEnd(42)} | ${'STATUS'.padEnd(5)} | ${'LATENCY'.padEnd(8)} |`);
  console.log('='.repeat(75));

  let passCount = 0;
  for (const r of results) {
    if (r.status === 'PASS') passCount++;
    const statusFormatted = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    console.log(
      `| ${r.method.padEnd(7)} | ${r.endpoint.padEnd(42)} | ${statusFormatted} | ${(r.durationMs + 'ms').padEnd(8)} |`
    );
  }
  console.log('='.repeat(75));
  console.log(`\nSummary: ${passCount}/${results.length} tests passed.\n`);

  if (passCount !== results.length) {
    process.exit(1);
  }
}

main().catch(console.error);
