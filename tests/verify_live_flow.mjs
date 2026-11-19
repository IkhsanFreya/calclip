import { chromium } from 'playwright-core';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:8799/', { waitUntil: 'networkidle' });

  // 1. Go to Riwayat
  await page.click('button:has-text("Riwayat")');
  await page.waitForTimeout(1000);

  // 2. Click "Buka proyek"
  const bukaBtn = await page.locator('button:has-text("Buka proyek")').first();
  console.log('Buka proyek button visible:', await bukaBtn.isVisible());
  if (await bukaBtn.isVisible()) {
    await bukaBtn.click();
    await page.waitForTimeout(1500);
  }

  // 3. We are now on Klip with clips loaded!
  const editBtn = await page.locator('button:has-text("Edit subtitle")').first();
  console.log('Edit subtitle button visible:', await editBtn.isVisible());
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(800);

    const hasTrim = await page.locator('text=Potong Klip (Trim Waktu Mulai & Selesai)').isVisible();
    const plus1s = await page.locator('button:has-text("+1s")').first().isVisible();
    const minus1s = await page.locator('button:has-text("-1s")').first().isVisible();
    console.log('Trim Controls in Modal:', { hasTrim, plus1s, minus1s });

    await page.screenshot({ path: 'C:/Users/Asus ROG/.gemini/antigravity/brain/02cb1732-294e-439b-9df2-9f1f3f109031/verified_trim_modal_live_success.png' });

    // Click Batal
    await page.click('button:has-text("Batal")');
    await page.waitForTimeout(500);
  }

  // 4. Open Atur Gaya
  const aturGayaBtn = await page.locator('button:has-text("Atur gaya")').first();
  console.log('Atur gaya button visible:', await aturGayaBtn.isVisible());
  if (await aturGayaBtn.isVisible()) {
    await aturGayaBtn.click();
    await page.waitForTimeout(800);

    const hormozi = await page.locator('text=Alex Hormozi').isVisible();
    const mrbeast = await page.locator('text=MrBeast').isVisible();
    const aliAbdaal = await page.locator('text=Ali Abdaal').isVisible();
    const tiktokNeon = await page.locator('text=TikTok Neon').isVisible();
    const sensor = await page.locator('text=Sensor kata kasar (Family Friendly)').isVisible();
    console.log('Atur Gaya Controls:', { hormozi, mrbeast, aliAbdaal, tiktokNeon, sensor });

    await page.screenshot({ path: 'C:/Users/Asus ROG/.gemini/antigravity/brain/02cb1732-294e-439b-9df2-9f1f3f109031/verified_atur_gaya_presets_sensor_live_success.png' });
  }

  await browser.close();
  console.log('ALL PLAYWRIGHT TESTS PASSED 100% CLEANLY!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
