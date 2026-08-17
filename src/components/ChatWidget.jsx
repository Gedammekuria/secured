import { useEffect } from 'react';

/**
 * Tawk.to Live Chat Widget
 * Deferred by 5 seconds to avoid blocking initial page render.
 * All UI is rendered by Tawk.to — no custom markup needed.
 */
export default function ChatWidget() {
  useEffect(() => {
    // Prevent double-loading if already present
    if (window.Tawk_API) return;

    // Defer loading by 5s to keep main thread free during initial render
    const timer = setTimeout(() => {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/6a829cd5883a1a1d4bc9ba70/default';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.head.appendChild(script);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return null; // Tawk.to renders its own floating widget
}

