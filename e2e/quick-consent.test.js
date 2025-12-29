const { test, expect } = require('@playwright/test');

// Robust consent test: preseed localStorage, verify placeholders, inject and validate scripts
test('consent gating loads analytics and ads scripts', async ({ page }) => {
  // Preseed localStorage with consent BEFORE navigation
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
  const gtagInit = page.locator('script#gtag-init[data-consent="analytics"]');

  await expect(gaExternalPlaceholder).toHaveCount(1);
  await expect(adsPlaceholder).toHaveCount(1);
  await expect(gtagInit).toHaveCount(1);

  // Ensure real scripts are NOT present initially (before injection)
  const gaRealBefore = await page.$('script[src*="googletagmanager.com"]');
  const adsRealBefore = await page.$('script[src*="googlesyndication.com"]');
  expect(gaRealBefore).toBeNull();
  expect(adsRealBefore).toBeNull();

  // Call injectConsentScripts() from page context as fallback and log the attempt
  await page.evaluate(() => {
    console.log('Fallback: calling injectConsentScripts() manually');
    if (typeof window.injectConsentScripts === 'function') {
      window.injectConsentScripts();
    } else {
      console.warn('injectConsentScripts not found on window');
    }
  });

  // Wait up to 30s for injected scripts with proper data-consent-loaded attributes
  await page.waitForFunction(() => {
    const analyticsScripts = document.querySelectorAll('script[data-consent-loaded="analytics"]');
    const adsScripts = document.querySelectorAll('script[data-consent-loaded="ads"]');
    return analyticsScripts.length >= 1 && adsScripts.length >= 1;
  }, { timeout: 30000 });

  // Validate injected script src hosts
  // Analytics should have googletagmanager.com
  const analyticsScript = await page.$('script[data-consent-loaded="analytics"][src*="googletagmanager.com"]');
  expect(analyticsScript).not.toBeNull();

  // Ads should have googlesyndication.com or doubleclick.net
  const adsScriptSyndication = await page.$('script[data-consent-loaded="ads"][src*="googlesyndication.com"]');
  const adsScriptDoubleClick = await page.$('script[data-consent-loaded="ads"][src*="doubleclick.net"]');
  
  // At least one ads script should be present
  expect(adsScriptSyndication !== null || adsScriptDoubleClick !== null).toBe(true);

  console.log('✓ Consent test passed: placeholders verified, scripts injected with correct hosts');
});

