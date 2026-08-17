import { useEffect } from 'react';

/**
 * Tawk.to Live Chat Widget
 * Deferred by 5 seconds to avoid blocking initial page render.
 * All UI is rendered by Tawk.to — no custom markup needed.
 */
export default function ChatWidget() {
  useEffect(() => {
    const PROPERTY_ID = '6a829cd5883a1a1d4bc9ba70';
    const WIDGET_ID = 'default';
    const NEW_SRC = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;

    // If property changed, clean up legacy Tawk session from browser storage/cookies
    const lastProperty = localStorage.getItem('safehive_tawk_property_id');
    if (lastProperty !== PROPERTY_ID) {
      try {
        // Clear Tawk localStorage keys
        Object.keys(localStorage).forEach((key) => {
          if (/tawk|twk/i.test(key)) {
            localStorage.removeItem(key);
          }
        });
        // Clear Tawk sessionStorage keys
        Object.keys(sessionStorage).forEach((key) => {
          if (/tawk|twk/i.test(key)) {
            sessionStorage.removeItem(key);
          }
        });
        // Clear Tawk cookies
        document.cookie.split(';').forEach((c) => {
          const cookieName = c.split('=')[0].trim();
          if (/tawk|twk/i.test(cookieName)) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
        localStorage.setItem('safehive_tawk_property_id', PROPERTY_ID);
      } catch (e) {
        // Storage access fallback
      }
    }

    // Remove any existing script tag that doesn't match the new src
    const existingScript = document.getElementById('tawk-script');
    if (existingScript) {
      if (existingScript.src === NEW_SRC) {
        return; // Already loaded correctly
      }
      existingScript.remove();
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.async = true;
    script.src = NEW_SRC;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }, []);

  return null; // Tawk.to renders its own floating widget
}

