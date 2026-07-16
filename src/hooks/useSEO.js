/**
 * useSEO — Dynamic SEO meta tag updater for SafeHive SPA
 *
 * Call this hook at the top of App.jsx, passing the current `view` string.
 * It updates <title>, <meta name="description">, and <meta name="keywords">
 * on every route change so that search-engine bots see the correct page-level
 * meta data for every view.
 */

import { useEffect } from 'react';

const BASE_URL = 'https://www.safehive.com.et'; // <-- update to your live domain

const SEO_MAP = {
  landing: {
    title: 'SafeHive | #1 CCTV, Alarm & Smart Door Lock Installation in Addis Ababa, Ethiopia',
    description:
      'SafeHive is Ethiopia\'s most trusted security company. Professional CCTV camera installation, Ajax alarm systems, GSM burglar alarms, and smart door locks for homes and businesses in Addis Ababa. Free site survey. Call now.',
    keywords: 'CCTV installation Addis Ababa, alarm system Ethiopia, smart door lock Ethiopia, security company Ethiopia, surveillance camera Addis Ababa, SafeHive',
    canonical: '/',
  },
  services: {
    title: 'Security Services in Ethiopia | CCTV, Alarm Systems & Smart Locks — SafeHive Addis Ababa',
    description:
      'Explore SafeHive\'s full range of security services for Ethiopian homes and businesses: IP & analog CCTV installation, Ajax & GSM alarm systems, and biometric smart door locks in Addis Ababa.',
    keywords: 'security services Ethiopia, CCTV services Addis Ababa, alarm installation Ethiopia, smart lock Ethiopia, security installation services Ethiopia',
    canonical: '/services',
  },
  cctv: {
    title: 'CCTV Camera Installation in Addis Ababa, Ethiopia | SafeHive',
    description:
      'Professional CCTV camera installation in Addis Ababa, Ethiopia. IP cameras, PTZ cameras, outdoor security cameras, night-vision, and remote phone monitoring for homes and businesses. Free survey. Call SafeHive.',
    keywords: 'CCTV installation Addis Ababa, security camera Ethiopia, IP camera Ethiopia, PTZ camera Ethiopia, CCTV company Ethiopia, surveillance camera installation, remote monitoring Ethiopia, outdoor camera Ethiopia',
    canonical: '/cctv',
  },
  alarm: {
    title: 'Alarm System Installation Addis Ababa, Ethiopia | Ajax & GSM Burglar Alarms — SafeHive',
    description:
      'SafeHive installs professional alarm systems in Addis Ababa including Ajax wireless alarms, GSM burglar alarms, and commercial fire detection systems for homes and businesses across Ethiopia.',
    keywords: 'alarm system Addis Ababa, burglar alarm Ethiopia, Ajax alarm Ethiopia, GSM alarm Ethiopia, fire alarm Addis Ababa, intrusion detection Ethiopia, wireless alarm Ethiopia, alarm company Ethiopia',
    canonical: '/alarm',
  },
  smartdoorlock: {
    title: 'Smart Door Lock Installation Addis Ababa, Ethiopia | Biometric & Video Door Locks — SafeHive',
    description:
      'Upgrade your entry security with biometric smart video door locks, Ring Video Doorbells, and electromagnetic glass door locks installed by SafeHive in Addis Ababa, Ethiopia. Fingerprint, PIN, RFID & mobile app access.',
    keywords: 'smart door lock Ethiopia, biometric door lock Addis Ababa, ring doorbell Ethiopia, video doorbell Ethiopia, electromagnetic lock Ethiopia, access control Addis Ababa, fingerprint door lock Ethiopia, RFID lock Ethiopia',
    canonical: '/smartdoorlock',
  },
  portfolio: {
    title: 'Security Installation Projects in Ethiopia | SafeHive Portfolio — Addis Ababa',
    description:
      'View SafeHive\'s completed security projects in Ethiopia including CCTV installations, alarm systems, and smart door locks for hotels, corporations, factories, and residences in Addis Ababa.',
    keywords: 'security projects Ethiopia, CCTV installation portfolio Ethiopia, alarm system projects Addis Ababa, security company portfolio Ethiopia',
    canonical: '/portfolio',
  },
  about: {
    title: 'About SafeHive | Ethiopia\'s Leading Security Company — 17+ Years in Addis Ababa',
    description:
      'Learn about SafeHive — Ethiopia\'s premier security installation company with 17+ years of experience, 100+ successful installations, and a 99% client retention rate across Addis Ababa and Ethiopia.',
    keywords: 'SafeHive Ethiopia, security company Ethiopia, about SafeHive, trusted security company Addis Ababa, best security company Ethiopia',
    canonical: '/about',
  },
  contact: {
    title: 'Contact SafeHive | Free Security Quote in Addis Ababa, Ethiopia — Call or WhatsApp Now',
    description:
      'Contact SafeHive for a free security consultation and quote. We serve Addis Ababa and all of Ethiopia. Call, WhatsApp, or fill in our online form. Fast response. Free site survey included.',
    keywords: 'contact SafeHive, security quote Ethiopia, CCTV quote Addis Ababa, free security survey Ethiopia, security consultation Ethiopia',
    canonical: '/contact',
  },
  quote: {
    title: 'Request a Free Security Quote | SafeHive Ethiopia — CCTV, Alarm & Smart Locks Addis Ababa',
    description:
      'Request a free, no-obligation quote for CCTV camera installation, alarm system, or smart door lock installation from SafeHive — Addis Ababa\'s most trusted security professionals.',
    keywords: 'free security quote Ethiopia, CCTV quote Addis Ababa, alarm system quote Ethiopia, smart lock quote Ethiopia, SafeHive quote',
    canonical: '/quote',
  },
  'cctv-quote': {
    title: 'CCTV System Quote — Free Assessment in Addis Ababa | SafeHive Ethiopia',
    description:
      'Get a free tailored quote for professional CCTV camera installation in Addis Ababa from SafeHive Ethiopia. IP cameras, PTZ, night vision and remote access systems.',
    keywords: 'CCTV quote Ethiopia, CCTV price Addis Ababa, security camera quote Ethiopia',
    canonical: '/cctv-quote',
  },
  'alarm-quote': {
    title: 'Alarm System Quote — Free Assessment in Addis Ababa | SafeHive Ethiopia',
    description:
      'Get a free tailored quote for professional alarm system installation in Addis Ababa from SafeHive Ethiopia. Ajax wireless, GSM and fire alarm systems.',
    keywords: 'alarm system quote Ethiopia, burglar alarm quote Addis Ababa, fire alarm quote Ethiopia',
    canonical: '/alarm-quote',
  },
  'smartdoorlock-quote': {
    title: 'Smart Door Lock Quote — Free Assessment in Addis Ababa | SafeHive Ethiopia',
    description:
      'Get a free tailored quote for smart door lock installation in Addis Ababa from SafeHive Ethiopia. Biometric, fingerprint, Ring doorbell and glass door lock systems.',
    keywords: 'smart door lock quote Ethiopia, biometric lock quote Addis Ababa, ring doorbell price Ethiopia',
    canonical: '/smartdoorlock-quote',
  },
  'other-quote': {
    title: 'Custom Security Quote Request | SafeHive Ethiopia — Addis Ababa',
    description:
      'Tell us about your custom security requirements and get a free expert consultation from SafeHive Ethiopia. We serve homes and businesses across Addis Ababa.',
    keywords: 'custom security Ethiopia, security consultation Addis Ababa, security services quote Ethiopia',
    canonical: '/other-quote',
  },
  faq: {
    title: 'Security FAQ Ethiopia | CCTV, Alarm & Smart Lock Questions — SafeHive Addis Ababa',
    description:
      'Find answers to frequently asked questions about CCTV installation, alarm systems, smart door locks, pricing, and maintenance from SafeHive Ethiopia — serving Addis Ababa and beyond.',
    keywords: 'CCTV FAQ Ethiopia, alarm system FAQ Addis Ababa, security FAQ Ethiopia, CCTV cost Ethiopia, smart lock FAQ',
    canonical: '/faq',
  },
  blog: {
    title: 'Security Tips & News | SafeHive Blog — Ethiopia\'s Security Experts',
    description:
      'Stay informed with SafeHive\'s security blog. Expert tips on CCTV cameras, burglar alarms, smart door locks, and property protection for Ethiopian homes and businesses.',
    keywords: 'security tips Ethiopia, CCTV tips Addis Ababa, alarm system advice Ethiopia, security news Ethiopia',
    canonical: '/blog',
  },
  'project-detail': {
    title: 'Security Installation Project | SafeHive Ethiopia — Addis Ababa',
    description:
      'Detailed view of a completed SafeHive security installation project in Ethiopia — CCTV cameras, alarm systems, and smart door locks.',
    keywords: 'security project Ethiopia, CCTV project Addis Ababa',
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

    // --- Meta keywords (per-page, updated dynamically) ---
    if (seo.keywords) {
      let metaKw = document.querySelector('meta[name="keywords"]');
      if (!metaKw) {
        metaKw = document.createElement('meta');
        metaKw.name = 'keywords';
        document.head.appendChild(metaKw);
      }
      metaKw.content = seo.keywords;
    }

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
    setOG('og:site_name', 'SafeHive Security Solutions Ethiopia');
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
