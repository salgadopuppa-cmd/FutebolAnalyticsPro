// Consent management and script injection for Futebol Analytics Pro
// This file handles consent-gated loading of analytics and advertising scripts

(function() {
  'use strict';

  // Check if injectConsentScripts is already defined (avoid double execution)
  if (typeof window.injectConsentScripts !== 'undefined') {
    return;
  }

  /**
   * Injects consent-gated scripts based on user consent stored in localStorage
   */
  function injectConsentScripts() {
    try {
      // Read consent from localStorage
      const consentStr = localStorage.getItem('fap_user_consent_v1');
      if (!consentStr) {
        return; // No consent set yet
      }

      const consent = JSON.parse(consentStr);

      // Inject analytics scripts if consented
      if (consent.analytics) {
        injectAnalyticsScripts();
      }

      // Inject ads scripts if consented
      if (consent.ads) {
        injectAdsScripts();
      }
    } catch (err) {
      console.error('Error injecting consent scripts:', err);
    }
  }

  /**
   * Injects Google Analytics scripts
   */
  function injectAnalyticsScripts() {
    // Find placeholder scripts
    const gaExternalPlaceholder = document.querySelector('script[data-consent="analytics"][data-src]');
    const gtagInitPlaceholder = document.querySelector('script#gtag-init[data-consent="analytics"]');

    // Inject external gtag script
    if (gaExternalPlaceholder) {
      const src = gaExternalPlaceholder.getAttribute('data-src');
      if (src) {
        // Check if script with this src already exists
        const existingScripts = document.querySelectorAll('script[src]');
        let alreadyInjected = false;
        for (let i = 0; i < existingScripts.length; i++) {
          if (existingScripts[i].src === src) {
            alreadyInjected = true;
            break;
          }
        }
        
        if (!alreadyInjected) {
          const script = document.createElement('script');
          script.async = true;
          script.src = src;
          script.setAttribute('data-consent-loaded', 'analytics');
          document.head.appendChild(script);
        }
      }
    }

    // Inject inline gtag initialization
    if (gtagInitPlaceholder) {
      const inlineCode = gtagInitPlaceholder.textContent;
      if (inlineCode && !document.querySelector('script[data-consent-loaded="analytics"][data-inline="gtag-init"]')) {
        const script = document.createElement('script');
        script.textContent = inlineCode;
        script.setAttribute('data-consent-loaded', 'analytics');
        script.setAttribute('data-inline', 'gtag-init');
        document.head.appendChild(script);
      }
    }
  }

  /**
   * Injects advertising scripts (Google AdSense)
   */
  function injectAdsScripts() {
    // Find ads placeholder
    const adsPlaceholder = document.querySelector('script[data-consent="ads"][data-src]');

    if (adsPlaceholder) {
      const src = adsPlaceholder.getAttribute('data-src');
      if (src) {
        // Check if script with this src already exists
        const existingScripts = document.querySelectorAll('script[src]');
        let alreadyInjected = false;
        for (let i = 0; i < existingScripts.length; i++) {
          if (existingScripts[i].src === src) {
            alreadyInjected = true;
            break;
          }
        }
        
        if (!alreadyInjected) {
          const script = document.createElement('script');
          script.async = true;
          script.src = src;
          script.setAttribute('data-consent-loaded', 'ads');
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }
      }
    }
  }

  // Expose function globally for testing and manual invocation
  window.injectConsentScripts = injectConsentScripts;

  // Auto-run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectConsentScripts);
  } else {
    // DOM already loaded, run immediately
    injectConsentScripts();
  }
})();
