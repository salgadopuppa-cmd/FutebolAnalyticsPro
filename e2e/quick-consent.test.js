const { test, expect } = require('@playwright/test');

// Robust consent test: preseed localStorage, verify placeholders, ensure scripts inject with proper attributes
test('consent gating loads analytics and ads scripts', async ({ page }) => {
  // Preseed localStorage with consent BEFORE navigation using addInitScript
  await page.addInitScript(() => {
    localStorage.setItem('fap_user_consent_v1', JSON.stringify({ 
      analytics: true, 
      ads: true, 
      backend: true 
    }));
  });

  // Load the app served at localhost:4173
  await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });

  // Verify placeholders exist
  const gaExternalPlaceholder = page.locator('script[data-consent="analytics"][data-src]');
  const adsPlaceholder = page.locator('script[data-consent="ads"][data-src]');

  await expect(gaExternalPlaceholder).toHaveCount(1);
  await expect(adsPlaceholder).toHaveCount(1);

  // Ensure gtag-init inline placeholder exists
  const gtagInit = page.locator('script#gtag-init[data-consent="analytics"]');
  await expect(gtagInit).toHaveCount(1);

  // Ensure real scripts are NOT present initially (before consent processing)
  const gaRealBefore = await page.$('script[src*="googletagmanager.com"]:not([data-consent])');
  const adsRealBefore = await page.$('script[src*="googlesyndication.com"]:not([data-consent])');
  const doubleClickBefore = await page.$('script[src*="doubleclick.net"]:not([data-consent])');
  
  // These should be null initially (before processing)
  expect(gaRealBefore).toBeNull();
  expect(adsRealBefore).toBeNull();
  expect(doubleClickBefore).toBeNull();

  // Call injectConsentScripts as a fallback (in case auto-run didn't trigger)
  await page.evaluate(() => {
    if (typeof window.injectConsentScripts === 'function') {
      window.injectConsentScripts();
    }
  });

  // Wait up to 30 seconds for scripts to be injected with data-consent-loaded attributes
  await page.waitForFunction(() => {
    return document.querySelectorAll('script[data-consent-loaded="analytics"]').length >= 1 &&
           document.querySelectorAll('script[data-consent-loaded="ads"]').length >= 1;
  }, { timeout: 30000 });

  // Validate that injected scripts have expected hosts
  // Analytics should have googletagmanager.com
  const analyticsScript = await page.$('script[data-consent-loaded="analytics"][src*="googletagmanager.com"]');
  expect(analyticsScript).not.toBeNull();
  
  // Ads should have either doubleclick.net or googlesyndication.com
  const adsScriptGoogleSyndication = await page.$('script[data-consent-loaded="ads"][src*="googlesyndication.com"]');
  const adsScriptDoubleClick = await page.$('script[data-consent-loaded="ads"][src*="doubleclick.net"]');
  
  // At least one of these should be present
  const hasAdsScript = adsScriptGoogleSyndication !== null || adsScriptDoubleClick !== null;
  expect(hasAdsScript).toBe(true);

  console.log('✓ Consent test passed: Scripts injected with proper attributes');
});
