// Prefer the global fetch available in Node 18+. Fall back to node-fetch for older Node versions.
const fetch = globalThis.fetch || require('node-fetch');
const { chromium, firefox, webkit } = require('playwright');

function browserForName(name) {
  if (name === 'chromium') return chromium;
  if (name === 'firefox') return firefox;
  if (name === 'webkit') return webkit;
  return chromium;
}

(async () => {
  const base = 'http://localhost:3000';
  const browserName = process.env.BROWSER || 'chromium';
  const browserType = browserForName(browserName);
  const browser = await browserType.launch({ headless: true });
  const page = await browser.newPage();

  // If test endpoints are available, seed test data
  try {
    await fetch(`${base}/api/test/seed`, { method: 'POST' });
    console.log('Called /api/test/seed');
  } catch (e) {
    // ignore if not available
  }

  try {
    console.log('Opening frontend...');
    await page.goto(base, { waitUntil: 'networkidle' });

    // Accept consent banner if present
    const acceptBtn = await page.$('button[onclick="acceptAllConsent()"]');
    if (acceptBtn) {
      console.log('Accepting consent...');
      await acceptBtn.click();
      await page.waitForTimeout(500);
    }

    // Use fallback sign-in by invoking the sign-in button (this will call backend fallback if Firebase not configured)
    console.log('Clicking sign-in button...');
    await page.click('#signInButton');
    await page.waitForTimeout(800);

    // Wait for profile to show
    await page.waitForSelector('#userName', { timeout: 3000 });
    const userName = await page.$eval('#userName', el => el.textContent);
    console.log('Logged in as', userName);

    // Show debug panel
    console.log('Opening debug panel...');
    await page.click('#debugUserBtn');
    await page.waitForSelector('#debugContent', { timeout: 2000 });
    const debugText = await page.$eval('#debugContent', el => el.textContent);
    console.log('Debug content snippet:', debugText.slice(0, 120));

    // Perform quick query to gain coins
    console.log('Triggering quickQuery...');
    await page.click('button[onclick="quickQuery(\'serie-a-classification\')"]');
    await page.waitForTimeout(2200);

    // Read coins displayed in UI
    const coinsUI = await page.$eval('#userCoins', el => el.textContent);
    console.log('Coins shown in UI:', coinsUI);

    // Extract userId from debug JSON (if present)
    let userId = null;
    try {
      const debugJson = debugText;
      const m = debugJson.match(/"userId"\s*:\s*"([^"]+)"/);
      if (m) userId = m[1];
    } catch (e) {}

    if (!userId) {
      console.warn('Could not read userId from debug panel. Skipping backend verification.');
    } else {
      // Query backend for coins
      const resp = await fetch(`${base}/api/coins?userId=${encodeURIComponent(userId)}`);
      const json = await resp.json();
      console.log('Backend coins for', userId, json.coins);
      if (Number(json.coins) !== Number(coinsUI)) {
        throw new Error(`Coin mismatch: UI=${coinsUI} backend=${json.coins}`);
      }
      console.log('Coins match between UI and backend.');
    }

    console.log('E2E test completed successfully.');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E test failed:', err);
    try {
      const path = `./failure-${browserName}.png`;
      await page.screenshot({ path, fullPage: true });
      console.log('Saved screenshot to', path);
    } catch (sErr) {
      console.warn('Could not save screenshot:', sErr);
    }
    await browser.close();
    process.exit(2);
  } finally {
    // attempt cleanup
    try { await fetch(`${base}/api/test/cleanup`, { method: 'POST' }); } catch (e) { }
  }

})();
