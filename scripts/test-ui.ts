import { chromium } from 'playwright';

async function testUI() {
  console.log('Launching browser to inspect UI...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto('http://localhost:3030', { waitUntil: 'networkidle' });

  // Type Burmese text 'သု' into search
  console.log('Typing query "သု"...');
  await page.fill('.search-input', 'သု');
  await page.waitForTimeout(1000);

  // Take screenshot of dark mode
  await page.screenshot({ path: 'test-dark.png', fullPage: false });

  // Switch to light mode
  const themeBtn = page.locator('button[title*="Light"]');
  if (await themeBtn.count() > 0) {
    await themeBtn.click();
    await page.waitForTimeout(500);
  }

  // Take screenshot of light mode
  await page.screenshot({ path: 'test-light.png', fullPage: false });

  // Inspect the first card dimensions and content
  const firstCard = page.locator('.result-card').first();
  const box = await firstCard.boundingBox();
  const innerHtml = await firstCard.innerHTML();
  console.log('Card bounding box:', box);
  console.log('Card inner HTML length:', innerHtml.length);

  await browser.close();
  console.log('Screenshots saved: test-dark.png, test-light.png');
}

testUI().catch(console.error);
