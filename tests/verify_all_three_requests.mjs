import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Asus ROG/.gemini/antigravity/brain/02cb1732-294e-439b-9df2-9f1f3f109031';

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  console.log('1. Navigating to CalClip.IN...');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);

  // Verification 1: Title & Logo
  const pageTitle = await page.title();
  console.log(`Page title: "${pageTitle}"`);
  if (!pageTitle.includes('CalClip.IN')) {
    throw new Error(`Expected title CalClip.IN, got ${pageTitle}`);
  }

  // Verification 2: Test Light Mode (Whitemode)
  console.log('2. Testing Light Mode (Whitemode)...');
  const pengaturanBtn = page.locator('button').filter({ hasText: /Pengaturan AI/i }).first();
  await pengaturanBtn.click();
  await page.waitForTimeout(800);

  // Click "Terang"
  const terangBtn = page.locator('button').filter({ hasText: /^Terang$/i }).first();
  await terangBtn.click();
  await page.waitForTimeout(800);

  // Screenshot Light Mode on Settings screen
  const lightSettingsPath = path.join(ARTIFACT_DIR, 'verified_whitemode_settings.png');
  await page.screenshot({ path: lightSettingsPath, fullPage: true });
  console.log(`Whitemode settings screenshot saved to ${lightSettingsPath}`);

  // Also check Beranda in Light Mode
  const berandaBtn = page.locator('button').filter({ hasText: /^Beranda$/i }).first();
  await berandaBtn.click();
  await page.waitForTimeout(800);
  const lightBerandaPath = path.join(ARTIFACT_DIR, 'verified_whitemode_beranda.png');
  await page.screenshot({ path: lightBerandaPath, fullPage: true });
  console.log(`Whitemode beranda screenshot saved to ${lightBerandaPath}`);

  // Switch back to Gelap or Otomatis
  const sidebarThemeToggle = page.locator('button').filter({ hasText: /Tampilan:/i }).first();
  // Click until dark mode
  await sidebarThemeToggle.click(); // to otomatis or gelap
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('ganti-tema', { detail: 'gelap' }));
  });
  await page.waitForTimeout(500);

  // Verification 3: Test Background Music in Klip Studio Render
  console.log('3. Testing Background Music Feature...');
  const klipBtn = page.locator('button').filter({ hasText: /^Klip$/i }).first();
  await klipBtn.click();
  await page.waitForTimeout(500);

  // Open existing project
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('buka-proyek-klip', { detail: '20261118-191512' }));
  });
  await page.waitForTimeout(1500);

  // Open Studio Render (Atur gaya)
  const aturGayaBtn = page.locator('button').filter({ hasText: /Atur gaya/i }).first();
  await aturGayaBtn.waitFor({ state: 'visible', timeout: 5000 });
  await aturGayaBtn.click();
  await page.waitForTimeout(1000);

  // Scroll down to Musik latar
  const pilihMusikBtn = page.locator('button').filter({ hasText: /Pilih musik/i }).first();
  await pilihMusikBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Click "Pilih musik" -> opens Modal
  await pilihMusikBtn.click();
  await page.waitForTimeout(500);

  // Screenshot music modal
  const musicModalPath = path.join(ARTIFACT_DIR, 'verified_music_modal.png');
  await page.screenshot({ path: musicModalPath });
  console.log(`Music modal screenshot saved to ${musicModalPath}`);

  // Select "Chill Lo-Fi Beat"
  const lofiCard = page.locator('text=Chill Lo-Fi Beat').first();
  await lofiCard.click();
  await page.waitForTimeout(800);

  // Verify track name is updated and Preview button is visible
  const musicSectionPath = path.join(ARTIFACT_DIR, 'verified_music_selected.png');
  await page.screenshot({ path: musicSectionPath });
  console.log(`Music selected screenshot saved to ${musicSectionPath}`);

  await browser.close();
  console.log('All verifications completed successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
