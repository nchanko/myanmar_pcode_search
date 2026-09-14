import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 950 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3030...');
  await page.goto('http://localhost:3030', { waitUntil: 'networkidle' });

  // Take initial screenshot of the restored original UI
  await page.screenshot({ path: 'restored-original-ui.png', fullPage: true });
  console.log('Saved restored-original-ui.png');

  // Test 1: Click the Landmark Toggle
  const landmarkBtn = page.locator('button:has-text("Landmark")');
  await landmarkBtn.click();
  console.log('Clicked Landmark button');

  // Test 2: Type famous shop/landmark "Junction City"
  const searchInput = page.locator('.search-input');
  await searchInput.fill('Junction City');
  console.log('Typed Junction City into search');

  // Wait for suggestions dropdown
  await page.waitForSelector('.suggestions-dropdown', { timeout: 8000 });
  console.log('Suggestions dropdown appeared');
  await page.screenshot({ path: 'landmark-suggestions.png' });

  // Click the first suggestion item
  const firstSuggestion = page.locator('.suggestion-item').first();
  await firstSuggestion.click();
  console.log('Clicked first suggestion');

  // Wait for Location Details card to populate with landmark
  await page.waitForSelector('.landmark-highlight', { timeout: 6000 });
  console.log('Landmark highlight card appeared');

  // Take screenshot of selected landmark with coordinates and nearby places
  await page.screenshot({ path: 'landmark-selected-result.png', fullPage: true });
  console.log('Saved landmark-selected-result.png');

  // Test 3: Mobile Viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'landmark-mobile-view.png', fullPage: true });
  console.log('Saved landmark-mobile-view.png');

  await browser.close();
  console.log('All Playwright UI tests completed successfully!');
}

run().catch((err) => {
  console.error('Playwright test failed:', err);
  process.exit(1);
});
