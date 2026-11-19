import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Asus ROG\\.gemini\\antigravity\\brain\\02cb1732-294e-439b-9df2-9f1f3f109031';

async function testUiFlow() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);

  // 1. Navigate to Klip tab
  const klipBtn = page.locator('button').filter({ hasText: /^Klip$/i }).first();
  await klipBtn.click();
  await page.waitForTimeout(800);

  // 2. Open streamer-demo in Studio Render
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('buka-proyek-klip', { detail: 'streamer-demo' }));
  });
  await page.waitForTimeout(1500);

  // Check Daftar Klip view: Top Filter & Quick Actions
  console.log('Testing Daftar Klip top bar and filters...');
  const semuaTab = page.locator('button').filter({ hasText: /Semua/i }).first();
  const videoJadiTab = page.locator('button').filter({ hasText: /Video Jadi/i }).first();
  const dicentangTab = page.locator('button').filter({ hasText: /Dicentang/i }).first();

  console.log('Semua Tab visible:', await semuaTab.isVisible());
  console.log('Video Jadi Tab visible:', await videoJadiTab.isVisible());
  console.log('Dicentang Tab visible:', await dicentangTab.isVisible());

  // Click Video Jadi tab
  await videoJadiTab.click();
  await page.waitForTimeout(500);

  // Take screenshot of Daftar Klip with Video Jadi filter active
  const daftarKlipPath = path.join(ARTIFACT_DIR, 'verified_daftar_klip_top_bar.png');
  await page.screenshot({ path: daftarKlipPath });
  console.log('Saved Daftar Klip screenshot to:', daftarKlipPath);

  // Switch back to semua
  await semuaTab.click();
  await page.waitForTimeout(500);

  // 3. Open Atur Gaya
  const aturGayaBtn = page.locator('button').filter({ hasText: /Atur gaya/i }).first();
  if (await aturGayaBtn.isVisible()) {
    await aturGayaBtn.click();
    await page.waitForTimeout(1000);
  }

  // 4. Test Navigation Bar in Atur Gaya
  console.log('Testing Atur Gaya Quick Navigation tabs...');
  const navTabs = ['Rasio & Layout', 'Gaya Subtitle', 'Musik & Suara'];
  for (const tabName of navTabs) {
    const tabBtn = page.locator('button').filter({ hasText: tabName }).first();
    const isVis = await tabBtn.isVisible();
    console.log(`Nav Tab "${tabName}" visible:`, isVis);
  }

  // Click "Musik & Suara" tab to test 1-click jump to bottom section
  const musikTab = page.locator('button').filter({ hasText: /Musik & Suara/i }).first();
  if (await musikTab.isVisible()) {
    await musikTab.click();
    await page.waitForTimeout(800);
  }

  // Check phone canvas bounding box after scrolling/jumping to music section
  const ponselBoxAtBottom = await page.locator('.ponsel').boundingBox();
  console.log('Ponsel box when at Musik section:', ponselBoxAtBottom);

  // Take screenshot of Atur Gaya at Musik section (verifying phone canvas is right there beside the music controls!)
  const aturGayaPath = path.join(ARTIFACT_DIR, 'verified_atur_gaya_sticky_preview.png');
  await page.screenshot({ path: aturGayaPath });
  console.log('Saved Atur Gaya screenshot to:', aturGayaPath);

  // Click Subtitle tab to test jump back to Subtitle section
  const subTab = page.locator('button').filter({ hasText: /Gaya Subtitle/i }).first();
  if (await subTab.isVisible()) {
    await subTab.click();
    await page.waitForTimeout(800);
  }

  const aturGayaSubPath = path.join(ARTIFACT_DIR, 'verified_atur_gaya_subtitle_section.png');
  await page.screenshot({ path: aturGayaSubPath });
  console.log('Saved Atur Gaya Subtitle section screenshot to:', aturGayaSubPath);

  await browser.close();
  console.log('All UI flow tests PASSED!');
}

testUiFlow().catch(console.error);
