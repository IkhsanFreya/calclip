import { chromium } from 'playwright-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Asus ROG\\.gemini\\antigravity\\brain\\02cb1732-294e-439b-9df2-9f1f3f109031';

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
  });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Take screenshot of the hero section
  const hero = page.locator('div.relative.rounded-3xl').first();
  await hero.scrollIntoViewIfNeeded();

  await hero.screenshot({
    path: path.join(ARTIFACT_DIR, 'verified_hero_centered_animated.png'),
  });
  console.log('Saved verified_hero_centered_animated.png');

  // Full page screenshot
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'verified_beranda_full_centered.png'),
  });
  console.log('Saved verified_beranda_full_centered.png');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
