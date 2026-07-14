/**
 * useSEO — Dynamic SEO meta tag updater for SafeHive SPA
 *
 * Call this hook at the top of App.jsx, passing the current `view` string.
 * It updates <title> and <meta name="description"> on every route change so
 * that social-sharing crawlers and search-engine bots that execute JS
 * (Google, Bing) see the correct page-level meta data.
 */

import { useEffect } from 'react';

const BASE_URL = 'https://www.safehive.com.et'; // <-- update to your live domain

const SEO_MAP = {
  landing: {
    title: 'SafeHive | Professional CCTV, Alarm & Smart Door Lock Installation in Addis Ababa',
    description:
      'SafeHive is Addis Ababa\'s trusted security company. We install CCTV cameras, alarm systems, and smart door locks for homes and businesses across Ethiopia. Get a free quote today.',
    canonical: '/',
  },
  services: {
    title: 'Security Services | CCTV, Alarms & Smart Locks – SafeHive Ethiopia',
    description:
      'Explore SafeHive\'s full range of security services: IP & analog CCTV installation, Ajax & GSM alarm systems, and biometric smart door locks in Addis Ababa, Ethiopia.',
    canonical: '/services',
  },
  cctv: {
    title: 'CCTV Camera Installation in Addis Ababa | SafeHive Ethiopia',
    description:
      'Professional CCTV camera installation in Addis Ababa. IP cameras, PTZ cameras, night-vision, and remote monitoring for homes and businesses. Call SafeHive today.',
    canonical: '/cctv',
  },
  alarm: {
    title: 'Alarm System Installation Addis Ababa | Ajax & GSM Alarms – SafeHive',
    description:
      'SafeHive installs professional alarm systems in Addis Ababa including Ajax wireless alarms, GSM burglar alarms, and fire detection systems for homes and commercial properties.',
    canonical: '/alarm',
  },
  smartdoorlock: {
    title: 'Smart Door Lock Installation Addis Ababa | Biometric & Video Locks – SafeHive',
    description:
      'Upgrade your security with biometric smart video door locks and Ring Video Doorbells installed by SafeHive in Addis Ababa. Fingerprint, PIN, RFID & mobile app access.',
    canonical: '/smartdoorlock',
  },
  portfolio: {
    title: 'Our Security Projects & Installations | SafeHive Portfolio Ethiopia',
    description:
      'View SafeHive\'s completed security projects in Ethiopia including CCTV, alarm, and door lock installations for hotels, corporations, factories, and residences.',
    canonical: '/portfolio',
  },
  about: {
    title: 'About SafeHive | 17+ Years of Security Excellence in Ethiopia',
    description:
      'Learn about SafeHive — Ethiopia\'s leading security installation company with 17+ years of experience, 100+ successful installations, and a 99% client retention rate.',
    canonical: '/about',
  },
  contact: {
    title: 'Contact SafeHive | Get a Free Security Quote in Addis Ababa',
    description:
      'Contact SafeHive for a free security consultation and quote. We serve Addis Ababa and surrounding areas. Call, WhatsApp, or fill in our online form.',
    canonical: '/contact',
  },
  quote: {
    title: 'Request a Free Security Quote | SafeHive Ethiopia',
    description:
      'Request a free, no-obligation quote for CCTV, alarm system, or smart door lock installation from SafeHive — Addis Ababa\'s trusted security professionals.',
    canonical: '/quote',
  },
  'cctv-quote': {
    title: 'CCTV System Quote Request | SafeHive Ethiopia',
    description:
      'Get a free tailored quote for professional CCTV camera installation in Addis Ababa from SafeHive Ethiopia.',
    canonical: '/cctv-quote',
  },
  'alarm-quote': {
    title: 'Alarm System Quote Request | SafeHive Ethiopia',
    description:
      'Get a free tailored quote for professional alarm system installation in Addis Ababa from SafeHive Ethiopia.',
    canonical: '/alarm-quote',
  },
  'smartdoorlock-quote': {
    title: 'Smart Door Lock Quote Request | SafeHive Ethiopia',
    description:
      'Get a free tailored quote for smart door lock installation in Addis Ababa from SafeHive Ethiopia.',
    canonical: '/smartdoorlock-quote',
  },
  'other-quote': {
    title: 'Custom Security Quote Request | SafeHive Ethiopia',
    description:
      'Tell us about your custom security requirements and get a free consultation from SafeHive Ethiopia.',
    canonical: '/other-quote',
  },
  faq: {
    title: 'Security FAQ | Common Questions About CCTV & Alarms – SafeHive',
    description:
      'Find answers to frequently asked questions about CCTV installation, alarm systems, smart door locks, pricing, and maintenance from SafeHive Ethiopia.',
    canonical: '/faq',
  },
  blog: {
    title: 'Security Tips & News | SafeHive Blog Ethiopia',
    description:
      'Stay informed with SafeHive\'s security blog. Expert tips on CCTV, burglar alarms, smart locks, and property protection for Ethiopian homes and businesses.',
    canonical: '/blog',
  },
  'project-detail': {
    title: 'Project Details | SafeHive Security Installation',
    description:
      'Detailed information about this SafeHive security installation project in Ethiopia.',
    canonical: '/portfolio',
  },
};

const DEFAULT_SEO = SEO_MAP.landing;

export function useSEO(view) {
  useEffect(() => {
    const seo = SEO_MAP[view] || DEFAULT_SEO;

    // --- Title ---
    document.title = seo.title;

    // --- Meta description ---
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = seo.description;

    // --- Canonical URL ---
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}${seo.canonical}`;

    // --- Open Graph ---
    const setOG = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setOG('og:title', seo.title);
    setOG('og:description', seo.description);
    setOG('og:url', `${BASE_URL}${seo.canonical}`);
    setOG('og:type', 'website');
    setOG('og:site_name', 'SafeHive');
    setOG('og:image', `${BASE_URL}/assets/safehive.webp`);
    setOG('og:locale', 'en_ET');

    // --- Twitter Card ---
    const setTwitter = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setTwitter('twitter:card', 'summary_large_image');
    setTwitter('twitter:title', seo.title);
    setTwitter('twitter:description', seo.description);
    setTwitter('twitter:image', `${BASE_URL}/assets/safehive.webp`);

  }, [view]);
}
