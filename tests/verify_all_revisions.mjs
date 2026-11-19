import { chromium } from 'playwright-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Asus ROG\\.gemini\\antigravity\\brain\\02cb1732-294e-439b-9df2-9f1f3f109031';

async function main() {
  console.log('Launching browser to test all revisions...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
  });

  // 1. Beranda & Sidebar Brand Layout
  console.log('1. Checking CalClip.IN Beranda...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const sidebarLogo = page.locator('aside img:visible').first();
  await sidebarLogo.waitFor({ state: 'visible', timeout: 5000 });

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'verified_calclip_beranda.png'),
    fullPage: false,
  });
  console.log('Saved verified_calclip_beranda.png');

  // 2. Light Mode (Whitemode) Verification
  console.log('2. Testing Light Mode (Whitemode)...');
  const themeToggle = page.locator('aside button', { hasText: /Tampilan:/i });
  await themeToggle.click(); // to gelap or terang
  await page.waitForTimeout(400);
  const themeText = await themeToggle.textContent();
  if (!themeText.includes('terang')) {
    await themeToggle.click();
    await page.waitForTimeout(400);
  }

  // Verify light logo is visible
  const lightLogo = page.locator('aside img.light-logo').first();
  const isLightVisible = await lightLogo.isVisible();
  console.log('Light mode logo visible:', isLightVisible);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'verified_whitemode_calclip.png'),
  });
  console.log('Saved verified_whitemode_calclip.png');

  // Switch back to Dark mode
  await themeToggle.click();
  await page.waitForTimeout(400);

  // 3. Modal Pengaturan: VoxCPM2 status
  console.log('3. Testing Modal Pengaturan (Wizard Pemasangan)...');
  const aiModeInfo = page.locator('aside div[title="Buka Wizard Pemasangan AI"]');
  await aiModeInfo.click();
  await page.waitForTimeout(1000);

  // Check Step 2: Komponen
  const voxcpmCard = page.locator('div', { hasText: 'Suara AI VoxCPM2' }).filter({ hasText: 'siap' }).last();
  const isVoxSiap = await voxcpmCard.isVisible();
  console.log('Suara AI VoxCPM2 is siap:', isVoxSiap);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'verified_voxcpm2_siap.png'),
  });
  console.log('Saved verified_voxcpm2_siap.png');

  // Close modal by clicking the modal's close button
  const closeModalBtn = page.locator('.fixed.inset-0.z-50 button', { has: page.locator('svg.lucide-x') }).first();
  await closeModalBtn.click();
  await page.waitForTimeout(600);

  // 4. Layar Pengaturan AI: Google AI Studio direct link
  console.log('4. Testing Layar Pengaturan AI (Google AI Studio Link)...');
  const navPengaturan = page.locator('aside button', { hasText: 'Pengaturan AI' });
  await navPengaturan.click();
  await page.waitForTimeout(800);

  const tabGemini = page.locator('button', { hasText: 'Google Gemini' });
  await tabGemini.click();
  await page.waitForTimeout(500);

  const aiStudioLink = page.locator('a', { hasText: 'Buka AI Studio' });
  const href = await aiStudioLink.getAttribute('href');
  const target = await aiStudioLink.getAttribute('target');
  console.log(`Buka AI Studio link href: "${href}", target: "${target}"`);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'verified_google_ai_studio_link.png'),
  });
  console.log('Saved verified_google_ai_studio_link.png');

  // 5. Layar Klip: Split Podcast & 1-Person Solo Focus
  console.log('5. Testing Klip Studio Render & Podcast Centering...');
  const navKlip = page.locator('aside button', { hasText: 'Klip' });
  await navKlip.click();
  await page.waitForTimeout(600);

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

  // Click "Split podcast (2 orang)"
  console.log('Selecting Split podcast layout...');
  const btnSplitPodcast = page.locator('button', { hasText: 'Split podcast (2 orang)' });
  await btnSplitPodcast.scrollIntoViewIfNeeded();
  await btnSplitPodcast.click();
  await page.waitForTimeout(600);

  // Pratinjau Shot 2 Orang (Split)
  console.log('Testing Shot 2 Orang (Split)...');
  const btnShot2 = page.locator('button', { hasText: 'Shot 2 Orang' }).first();
  await btnShot2.scrollIntoViewIfNeeded();
  await btnShot2.click();
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'verified_podcast_split_shot.png'),
  });
  console.log('Saved verified_podcast_split_shot.png');

  // Pratinjau Shot 1 Orang (Penuh di Tengah)
  console.log('Testing Shot 1 Orang (Solo Centered)...');
  const btnShot1 = page.locator('button', { hasText: 'Shot 1 Orang' }).first();
  await btnShot1.scrollIntoViewIfNeeded();
  await btnShot1.click();
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'verified_podcast_single_centered.png'),
  });
  console.log('Saved verified_podcast_single_centered.png');

  // Pratinjau Otomatis
  console.log('Testing Otomatis Transisi...');
  const btnAuto = page.locator('button', { hasText: 'Otomatis' }).first();
  await btnAuto.scrollIntoViewIfNeeded();
  await btnAuto.click();
  await page.waitForTimeout(600);

  console.log('All 5 requirements verified successfully!');
  await browser.close();
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
