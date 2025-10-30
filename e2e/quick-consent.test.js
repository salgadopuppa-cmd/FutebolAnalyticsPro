const { test, expect } = require('@playwright/test');

// Quick smoke test: verify consent placeholders exist and real scripts are injected after consent
test('consent gating loads analytics and ads scripts', async ({ page }) => {
  // Load the app served at localhost:4173
  await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });

  // Placeholders should be present
  const gaExternalPlaceholder = page.locator('script[data-consent="analytics"][data-src]');
  const adsPlaceholder = page.locator('script[data-consent="ads"][data-src]');

  await expect(gaExternalPlaceholder).toHaveCount(1);
  await expect(adsPlaceholder).toHaveCount(1);

  // Ensure gtag-init inline placeholder exists
  const gtagInit = page.locator('script#gtag-init[data-consent="analytics"]');
  await expect(gtagInit).toHaveCount(1);

  // Ensure real scripts are NOT present initially
  const gaRealBefore = await page.$('script[src*="googletagmanager.com"]');
  const adsRealBefore = await page.$('script[src*="googlesyndication.com"]');
  expect(gaRealBefore).toBeNull();
  expect(adsRealBefore).toBeNull();

  // Set consent in localStorage and reload
  await page.evaluate(() => {
    localStorage.setItem('fap_user_consent_v1', JSON.stringify({ analytics: true, ads: true, backend: true }));
  });

  await page.reload({ waitUntil: 'domcontentloaded' });

  // Wait for scripts injected by app.js by checking the DOM directly (script tags aren't visible)
  await page.waitForFunction(() => {
    return document.querySelectorAll('script[data-consent-loaded="analytics"]').length >= 1 &&
           document.querySelectorAll('script[data-consent-loaded="ads"]').length >= 1;
  }, { timeout: 15000 });

  // Check that at least one analytics script has the expected host in its src
  const analyticsScript = await page.$('script[data-consent-loaded="analytics"][src*="googletagmanager.com"]');
  const adsScript = await page.$('script[data-consent-loaded="ads"][src*="googlesyndication.com"]');

  expect(analyticsScript).not.toBeNull();
  expect(adsScript).not.toBeNull();
});
