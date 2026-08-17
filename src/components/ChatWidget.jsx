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

    const loadTawkScript = () => {
      if (window.__tawk_loaded) return;
      window.__tawk_loaded = true;

      // Clean legacy session if needed
      const lastProperty = localStorage.getItem('safehive_tawk_property_id');
      if (lastProperty !== PROPERTY_ID) {
        try {
          Object.keys(localStorage).forEach((key) => {
            if (/tawk|twk/i.test(key)) localStorage.removeItem(key);
          });
          Object.keys(sessionStorage).forEach((key) => {
            if (/tawk|twk/i.test(key)) sessionStorage.removeItem(key);
          });
          document.cookie.split(';').forEach((c) => {
            const cookieName = c.split('=')[0].trim();
            if (/tawk|twk/i.test(cookieName)) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
          });
          localStorage.setItem('safehive_tawk_property_id', PROPERTY_ID);
        } catch (e) {}
      }

      if (document.getElementById('tawk-script')) return;

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
    };

    // Defer Tawk loading until 4s after mount or upon first user interaction
    const timer = setTimeout(loadTawkScript, 4000);

    const onUserInteraction = () => {
      loadTawkScript();
      clearTimeout(timer);
      window.removeEventListener('scroll', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('mousemove', onUserInteraction);
    };

    window.addEventListener('scroll', onUserInteraction, { passive: true });
    window.addEventListener('touchstart', onUserInteraction, { passive: true });
    window.addEventListener('mousemove', onUserInteraction, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('mousemove', onUserInteraction);
    };
  }, []);

  return null;
}

