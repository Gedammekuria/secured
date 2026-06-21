import { useEffect } from 'react';

/**
 * Tawk.to Live Chat Widget
 * Loads the Tawk.to embed script once on mount.
 * All UI is rendered by Tawk.to — no custom markup needed.
 */
export default function ChatWidget() {
  useEffect(() => {
    // Prevent double-loading if already present
    if (window.Tawk_API) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/6a382feba653051d4007ff13/1jrlnmh0g';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount (unlikely for a global widget, but good practice)
      document.head.removeChild(script);
    };
  }, []);

  return null; // Tawk.to renders its own floating widget
}
