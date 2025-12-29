// Consent management for Futebol Analytics Pro
(function() {
  'use strict';

  const CONSENT_KEY = 'fap_user_consent_v1';

  /**
   * Get current consent from localStorage
   */
  function getConsent() {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Failed to read consent:', e);
      return null;
    }
  }

  /**
   * Set consent in localStorage
   */
  function setConsent(consent) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
      return true;
    } catch (e) {
      console.error('Failed to save consent:', e);
      return false;
    }
  }

  /**
   * Inject consent scripts based on user preferences
   * Finds placeholders with data-consent attribute and converts them to real scripts
   */
  function injectConsentScripts() {
    const consent = getConsent();
    if (!consent) {
      console.log('No consent found, skipping script injection');
      return;
    }

    console.log('Injecting consent scripts with consent:', consent);

    // Find all placeholders with data-consent attribute
    const placeholders = document.querySelectorAll('script[data-consent][data-src]');
    
    placeholders.forEach(placeholder => {
      const consentType = placeholder.getAttribute('data-consent');
      const dataSrc = placeholder.getAttribute('data-src');
      
      // Check if user has consented to this type
      if (consent[consentType]) {
        console.log(`Injecting ${consentType} script:`, dataSrc);
        
        // Create new script element
        const script = document.createElement('script');
        script.src = dataSrc;
        script.setAttribute('data-consent-loaded', consentType);
        
        // Copy other attributes
        Array.from(placeholder.attributes).forEach(attr => {
          if (attr.name !== 'data-src' && attr.name !== 'data-consent') {
            script.setAttribute(attr.name, attr.value);
          }
        });
        
        // Set data-consent-loaded immediately (defensive)
        script.setAttribute('data-consent-loaded', consentType);
        
        // Add load and error handlers to ensure attribute stays set
        script.addEventListener('load', () => {
          script.setAttribute('data-consent-loaded', consentType);
          console.log(`${consentType} script loaded successfully`);
        });
        
        script.addEventListener('error', (e) => {
          script.setAttribute('data-consent-loaded', consentType);
          console.warn(`${consentType} script failed to load (network may be blocked):`, e);
        });
        
        // Insert after placeholder
        placeholder.parentNode.insertBefore(script, placeholder.nextSibling);
      }
    });

    // Handle inline scripts with data-consent (like gtag-init)
    const inlinePlaceholders = document.querySelectorAll('script[data-consent]:not([data-src])');
    
    inlinePlaceholders.forEach(placeholder => {
      const consentType = placeholder.getAttribute('data-consent');
      
      if (consent[consentType]) {
        console.log(`Activating inline ${consentType} script`);
        
        // For inline scripts, we need to execute their content
        const content = placeholder.textContent;
        if (content.trim()) {
          try {
            // Create new script with the content
            const script = document.createElement('script');
            script.textContent = content;
            script.setAttribute('data-consent-loaded', consentType);
            
            // Copy id and other attributes
            Array.from(placeholder.attributes).forEach(attr => {
              if (attr.name !== 'data-consent') {
                script.setAttribute(attr.name, attr.value);
              }
            });
            
            placeholder.parentNode.insertBefore(script, placeholder.nextSibling);
          } catch (e) {
            console.error(`Failed to execute inline ${consentType} script:`, e);
          }
        }
        
        // Mark the placeholder as loaded
        placeholder.setAttribute('data-consent-loaded', consentType);
      }
    });
  }

  /**
   * Accept all consent types
   */
  function acceptAllConsent() {
    const consent = {
      analytics: true,
      ads: true,
      backend: true
    };
    
    if (setConsent(consent)) {
      console.log('All consent accepted');
      injectConsentScripts();
      
      // Hide consent banner if present
      const banner = document.querySelector('.consent-banner');
      if (banner) {
        banner.style.display = 'none';
      }
    }
  }

  /**
   * Reject all consent types
   */
  function rejectAllConsent() {
    const consent = {
      analytics: false,
      ads: false,
      backend: false
    };
    
    if (setConsent(consent)) {
      console.log('All consent rejected');
      
      // Hide consent banner if present
      const banner = document.querySelector('.consent-banner');
      if (banner) {
        banner.style.display = 'none';
      }
    }
  }

  // Expose functions globally
  window.injectConsentScripts = injectConsentScripts;
  window.acceptAllConsent = acceptAllConsent;
  window.rejectAllConsent = rejectAllConsent;
  window.setConsent = setConsent;
  window.getConsent = getConsent;

  // Auto-inject scripts on page load if consent already exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (getConsent()) {
        injectConsentScripts();
      }
    });
  } else {
    // DOMContentLoaded already fired
    if (getConsent()) {
      injectConsentScripts();
    }
  }
})();
