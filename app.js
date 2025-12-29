// app.js - Main application runtime
// Consent-gated script injection based on localStorage consent preferences

/**
 * Injects real scripts for consented types by finding placeholders and replacing them
 * Idempotent - safe to call multiple times
 */
function injectConsentScripts() {
  // Guard: only run if not already processed
  if (window.__consentScriptsInjected) {
    return;
  }
  window.__consentScriptsInjected = true;

  // Read consent from localStorage
  let consent = {};
  try {
    const stored = localStorage.getItem('fap_user_consent_v1');
    if (stored) {
      consent = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to parse consent from localStorage:', e);
  }

  // Find all consent placeholders
  const placeholders = document.querySelectorAll('script[data-consent][data-src]');
  
  placeholders.forEach(placeholder => {
    const consentType = placeholder.getAttribute('data-consent');
    const src = placeholder.getAttribute('data-src');
    
    // Only inject if user has consented to this type
    if (consent[consentType]) {
      // Create real script element
      const realScript = document.createElement('script');
      realScript.src = src;
      realScript.async = true;
      realScript.setAttribute('data-consent-loaded', consentType);
      
      // Copy other attributes (except data-src and data-consent)
      Array.from(placeholder.attributes).forEach(attr => {
        if (attr.name !== 'data-src' && attr.name !== 'data-consent') {
          realScript.setAttribute(attr.name, attr.value);
        }
      });
      
      // Attach load/error handlers
      realScript.onload = () => {
        console.log(`Consent script loaded: ${consentType} - ${src}`);
      };
      realScript.onerror = () => {
        console.error(`Failed to load consent script: ${consentType} - ${src}`);
      };
      
      // Insert real script after placeholder
      placeholder.parentNode.insertBefore(realScript, placeholder.nextSibling);
    }
  });

  // Handle inline script placeholders (like gtag init)
  const inlinePlaceholders = document.querySelectorAll('script[data-consent]:not([data-src])');
  
  inlinePlaceholders.forEach(placeholder => {
    const consentType = placeholder.getAttribute('data-consent');
    
    // Only execute if user has consented to this type
    if (consent[consentType]) {
      // Create real script element with inline content
      const realScript = document.createElement('script');
      realScript.textContent = placeholder.textContent;
      realScript.setAttribute('data-consent-loaded', consentType);
      
      // Copy other attributes (except data-consent)
      Array.from(placeholder.attributes).forEach(attr => {
        if (attr.name !== 'data-consent') {
          realScript.setAttribute(attr.name, attr.value);
        }
      });
      
      // Insert real script after placeholder
      placeholder.parentNode.insertBefore(realScript, placeholder.nextSibling);
      console.log(`Consent inline script executed: ${consentType}`);
    }
  });
}

// Auto-run on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectConsentScripts);
} else {
  // DOM already loaded, run immediately
  injectConsentScripts();
}
