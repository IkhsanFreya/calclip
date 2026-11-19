import { chromium } from 'playwright-core';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:8799/');
  await page.click('button:has-text("Riwayat")');
  await page.waitForTimeout(600);
  await page.click('button:has-text("Buka proyek")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Atur gaya")');
  await page.waitForTimeout(800);

  // Scroll to sec-efek
  const el = await page.locator('#sec-efek');
  if (await el.isVisible()) {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:/Users/Asus ROG/.gemini/antigravity/brain/02cb1732-294e-439b-9df2-9f1f3f109031/verified_gpu_hw_card_detail.png' });
    console.log('Detailed sec-efek screenshot captured!');
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
