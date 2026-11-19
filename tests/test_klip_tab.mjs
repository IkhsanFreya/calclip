import { chromium } from 'playwright-core';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:8799/');
  await page.waitForTimeout(500);

  // Click Klip button in sidebar
  await page.locator('button:has-text("Klip")').first().click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'C:/Users/Asus ROG/.gemini/antigravity/brain/02cb1732-294e-439b-9df2-9f1f3f109031/klip_view.png' });
  const buttons = await page.locator('button').allTextContents();
  console.log('Klip view buttons:', buttons.slice(0, 25));

  // Fill input
  const inputEl = await page.locator('input[placeholder*="youtube.com"]').first();
  if (await inputEl.isVisible()) {
    console.log('Filling YouTube input...');
    await inputEl.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.waitForTimeout(500);
  }

  // If "Cari momen" is present
  const cariBtn = await page.locator('button:has-text("Cari momen")').first();
  if (await cariBtn.isVisible()) {
    console.log('Clicking Cari momen...');
    await cariBtn.click();
    await page.waitForTimeout(3000);
    const btnsAfter = await page.locator('button').allTextContents();
    console.log('After 3s buttons:', btnsAfter.slice(0, 30));

    // Wait until "Edit subtitle" appears (analysis takes ~45s)
    await page.waitForSelector('button:has-text("Edit subtitle")', { timeout: 70000 });
    console.log('Clips loaded!');

    // Test Edit subtitle modal
    await page.locator('button:has-text("Edit subtitle")').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'C:/Users/Asus ROG/.gemini/antigravity/brain/02cb1732-294e-439b-9df2-9f1f3f109031/verified_trim_modal_success.png' });
    console.log('Trim Modal Screenshot saved!');

    // Close modal
    await page.locator('button:has-text("Batal")').click();
    await page.waitForTimeout(500);

    // Open Atur Gaya
    await page.locator('button:has-text("Atur gaya")').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/Asus ROG/.gemini/antigravity/brain/02cb1732-294e-439b-9df2-9f1f3f109031/verified_atur_gaya_presets_sensor_success.png' });
    console.log('Atur Gaya Screenshot saved!');
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
