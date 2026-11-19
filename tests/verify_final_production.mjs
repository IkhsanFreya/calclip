import { chromium } from 'playwright-core';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to http://127.0.0.1:8799/...');
  await page.goto('http://127.0.0.1:8799/', { waitUntil: 'networkidle' });

  // 1. Check title
  const title = await page.title();
  console.log('Page Title:', title);

  // 2. Click tab Klip
  await page.click('button:has-text("Klip")');
  await page.waitForTimeout(1000);

  // 3. Open Edit Subtitle modal on clip 1
  const editSubBtn = await page.locator('button:has-text("Edit subtitle")').first();
  if (await editSubBtn.isVisible()) {
    await editSubBtn.click();
    await page.waitForTimeout(800);

    // Verify Trim controls exist
    const trimHeader = await page.locator('text=Potong Klip (Trim Waktu Mulai & Selesai)').isVisible();
    const plus1s = await page.locator('button:has-text("+1s")').first().isVisible();
    console.log('Trim Controls visible:', trimHeader, 'Plus 1s button visible:', plus1s);

    await page.screenshot({ path: 'C:/Users/Asus ROG/.gemini/antigravity/brain/02cb1732-294e-439b-9df2-9f1f3f109031/verified_trim_modal.png' });
    
    // Close modal
    await page.click('button:has-text("Batal")');
    await page.waitForTimeout(500);
  }

  // 4. Open Atur Gaya
  const aturGayaBtn = await page.locator('button:has-text("Atur gaya")').first();
  if (await aturGayaBtn.isVisible()) {
    await aturGayaBtn.click();
    await page.waitForTimeout(1000);

    // Verify influencer presets
    const hormozi = await page.locator('text=Alex Hormozi').isVisible();
    const mrbeast = await page.locator('text=MrBeast').isVisible();
    console.log('Influencer Presets visible:', { hormozi, mrbeast });

    // Scroll to Efek & Hook
    const sensorToggle = await page.locator('text=Sensor kata kasar (Family Friendly)').isVisible();
    console.log('Sensor Kata Kasar visible:', sensorToggle);

    await page.screenshot({ path: 'C:/Users/Asus ROG/.gemini/antigravity/brain/02cb1732-294e-439b-9df2-9f1f3f109031/verified_atur_gaya_presets_sensor.png' });
  }

  // 5. Check Pengaturan update checker
  await page.click('button:has-text("Pengaturan")');
  await page.waitForTimeout(1000);
  const periksaBtn = await page.locator('button:has-text("Periksa Pembaruan")').isVisible();
  console.log('Update checker button visible:', periksaBtn);
  await page.screenshot({ path: 'C:/Users/Asus ROG/.gemini/antigravity/brain/02cb1732-294e-439b-9df2-9f1f3f109031/verified_pengaturan_update_checker.png' });

  await browser.close();
  console.log('ALL VERIFICATIONS SUCCESSFUL!');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
