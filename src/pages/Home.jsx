import React, { useState, useEffect } from 'react';
import {
  Camera, Bell, Radio, Home as HomeIcon, Eye, Shield, DoorOpen, AlertTriangle,
  ChevronDown, ChevronUp, ClipboardList, PenTool, Wrench, Users,
  ArrowRight, Award, CheckCircle, HeartHandshake, ShieldCheck, DollarSign
} from 'lucide-react';
const SERVICES_DATA = [
  {
    category: "CCTV Installation",
    icon: <Camera size={20} />,
    tagline: "See everything, miss nothing.",
    cards: [
      {
        title: "Outdoor Cameras",
        description: "Weatherproof Outdoor cameras with night vision and motion detection. Covers driveways, gardens, and perimeters 24/7.",
        image: "/assets/service/outdoor camera 1.webp"
      },
      {
        title: "Indoor Cameras",
        description: "A wide-angle lenses and two-way audio. Monitor your home's interior from your smartphone.",
        image: "/assets/service/indoor camera 1.webp"
      },
      {
        title: "Remote Access",
        description: "You can view any incidence from your property by using  smartphone everywhere remotely.",
        image: "/assets/service/mobile view.jpg"
      },
    ]
  },
  {
    category: "Alarm Systems",
    icon: <Bell size={20} />,
    tagline: "Alert before intrusion happens.",
    cards: [
      {
        title: "Ajax Alarm System",
        description: "It is a wireless security technology that protects against intrusion, fire, and flooding. It's the most awarded and reliable smart home/commercial security solutions.",
        image: "/assets/service/ajax detector.webp"
      },
      {
        title: "GSM Burglare alarm System",
        description: "A wireless security alarm that uses GSM (Global System for Mobile Communications) cellular technology essentially a SIM card to send alerts, notifications, and alarm signals over mobile phone networks.",
        image: "/assets/service/burglar.webp"
      },

      {
        title: "Ajax Remote Control",
        description: "Our systems are simple to access remotely with cellphone ",
        image: "/assets/service/ajax control.jpg"
      }
    ]
  }
];
const Hero = ({ onNavigate, onQuoteOpen, onViewServicesClick }) => {
  return (
    <section className="hero">
      <div className="hero-bg-image"></div>
      <div className="hero-overlay"></div>
      <div className="container hero-content animate-fade-up">
        <div className="hero-text">
          <h1>Secure Your Property.</h1>
          <p>Professional installation of security cameras and alarm systems.</p>
          <div className="hero-btns">
            {/*<button onClick={onQuoteOpen} className="btn-primary">Request now <ArrowRight size={16} /></button>*/}
            <a href="#services" className="btn-primary" onClick={(e) => { e.preventDefault(); onViewServicesClick ? onViewServicesClick() : onNavigate('services'); }}>
              View Our Services <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section >
  );
};

const Partners = () => {
  const logos = [
    { src: '/assets/partners/Dahua.png', height: 50 },
    { src: '/assets/partners/Hikvision.png', height: 110 },
    { src: '/assets/partners/WD-Logo-removebg-preview.png', height: 55 },
    { src: '/assets/partners/ajax.png', height: 36 },
    { src: '/assets/partners/tp-link.png', height: 50 },
    { src: '/assets/partners/unifi.png', height: 36 },
  ];

  return (
    <div className="partners-section">
      <div className="container">
        <div className="marquee">
          <div className="marquee-content">
            {[...logos, ...logos].map((logo, index) => (
              <div key={index} className="partner-logo">
                <img src={logo.src} alt={`Partner ${index}`} style={{ height: `${logo.height}px` }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Services = ({ onNavigate, onQuoteOpen }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [prevTab, setPrevTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleTabChange = React.useCallback((newIndex) => {
    setPrevTab(activeTab);
    setActiveTab(newIndex);
  }, [activeTab]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleTabChange((activeTab + 1) % SERVICES_DATA.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab, isPaused, handleTabChange]);

  const current = SERVICES_DATA[activeTab];
  const direction = activeTab >= prevTab ? 'right' : 'left';

  const [isMobile, setIsMobile] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 968px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const renderCard = (card, i, catName) => {
    const targetQuote = catName?.includes('CCTV') ? 'cctv-quote' : 'alarm-quote';
    return (
      <div key={i} className="gallery-card" style={{ animationDelay: `${i * 0.08}s` }}>
        <div className="gallery-img-wrap">
          <img src={card.image} alt={card.title} className="gallery-img" loading="lazy" />
          <div className="gallery-label">{card.title}</div>
        </div>
        <div className="gallery-desc">
          <h3>{card.title}</h3>
          <p>{card.description}</p>
          <a
            href={`#${targetQuote}`}
            onClick={(e) => { e.preventDefault(); onQuoteOpen(targetQuote); }}
            className="learn-more-btn"
          >
            Get a Quote <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '2px' }} />
          </a>
        </div>
      </div>
    );
  };

  return (
    <section id="Services" className="services-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div className="section-header">
          <h2>The Pillars of Complete Security</h2>
          <p> Whether you need watchful eyes, an unblinking alarm, a backup line that works when the internet doesn't,
            or a smarter front door, we've got a system built for the job. </p>
        </div>
        {!isMobile && (
          <div className="services-layout-top">
            <div className="services-nav-top">
              <div className="service-tabs-row">
                {SERVICES_DATA.map((s, i) => (
                  <button
                    key={i}
                    className={`service-tab-v ${activeTab === i ? 'active' : ''}`}
                    onClick={() => handleTabChange(i)}
                  >
                    <span className="tab-icon">{s.icon}</span>
                    <span className="tab-label">{s.category}</span>
                  </button>
                ))}
              </div>
              <div className="gallery-tagline-centered">{current.tagline}</div>
            </div>

            <div className="services-gallery-viewport">
              <div className="services-gallery-track" style={{ transform: `translateX(-${activeTab * 100}%)` }}>
                {SERVICES_DATA.map((category, idx) => (
                  <div key={idx} className="services-gallery-slide">
                    <div className="services-gallery">
                      {category.cards.map((card, i) => renderCard(card, i, category.category))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tab-dots-centered">
              {SERVICES_DATA.map((_, i) => (
                <button key={i} className={`tab-dot ${activeTab === i ? 'active' : ''}`} onClick={() => handleTabChange(i)} />
              ))}
            </div>
          </div>
        )}

        {isMobile && (
          <div className="services-mobile-list">
            {SERVICES_DATA.map((s, i) => (
              <div key={i} className="service-mobile-section">
                <div className="service-mobile-header">
                  <span className="service-mobile-icon">{s.icon}</span>
                  <h3 className="service-mobile-title">{s.category}</h3>
                </div>
                <p className="service-mobile-tagline">{s.tagline}</p>
                <div className="service-mobile-gallery">
                  {s.cards.map((card, j) => renderCard(card, j, s.category))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
const Process = () => {
  const steps = [
    {
      title: "Free Survey",
      description: "We visit your property to identify vulnerabilities and understand your specific security needs.",
      image: "/assets/service/servey.webp",
      icon: <ClipboardList size={22} />
    },
    {
      title: "System Design",
      description: "Our engineers create a custom blueprint using the latest tech to ensure 100% coverage and zero blind spots.",
      image: "/assets/service/drawing.jpg",
      icon: <PenTool size={22} />
    },
    {
      title: "Installation and Configuration",
      description: "Experienced technicians handle the setup with precision, ensuring clean wiring and optimal device placement.",
      image: "/assets/service/proper NVR placement.webp",
      icon: <Wrench size={22} />
    },
    {
      title: "Training & Support",
      description: "We walk you through every feature and provide ongoing support to keep your hive running smoothly 24/7.",
      image: "/assets/service/cctv training.jpg",
      icon: <Users size={22} />
    }
  ];
  return (
    <section id="process" className="process-section">
      <div className="container">
        <div className="section-header">
          <h2>From first call to fully protected</h2>
          <p>A straightforward process that we have use for years to make sure your home is secure.</p>
        </div>

        <div className="process-grid">
          {steps.map((step, i) => (
            <div key={i} className="process-step">
              <div className="process-card">
                <div className="process-img-wrap">
                  <img src={step.image} alt={step.title} loading="lazy" />
                  <div className="process-label">{step.title}</div>
                  <div className="step-number">{i + 1}</div>
                </div>
                <div className="process-content">
                  <div className="step-count">{i + 1} / 4</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <div className="step-icon">{step.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = ({ onQuoteOpen }) => (
  <section className="cta-section" id="contact">
    <div className="container cta-container">
      <div className="cta-content">
        <h2>Ready to feel safe at home?</h2>
        <p>Looking to upgrade or install a new system? SafeHive is always ready.</p>
        <a
          href="#quote"
          className="btn-primary"
          onClick={(e) => { e.preventDefault(); onQuoteOpen(); }}
        >
          Request a Free Survey
        </a>
      </div>
    </div>
  </section>
);

const WhyChooseUs = () => {
  const benefits = [
    {
      title: "Experienced Technicians",
      description: "We are 17+ Experienced. Our technicians ensuring every installation meets highest quality standards.",
      icon: <Award size={30} />
    },
    {
      title: "Premium Brands",
      description: "We use only top-tier brands like Hikvision, Dahua, Reolink, ring and Ajax for reliability and durability.",
      icon: <ShieldCheck size={30} />
    },
    {
      title: "Cable Management",
      description: "Neat and professional cable management for a clean, secure, and long-lasting installation.",
      icon: <CheckCircle size={30} />
    },
    {
      title: "Ongoing Support",
      description: "Comprehensive after-installation support and maintenance to keep your systems running perfectly.",
      icon: <HeartHandshake size={30} />
    },
    {
      title: "Service Warranty",
      description: "We will give you a 6 months  warranty on both products and our installation work.",
      icon: <Shield size={30} />
    },
    {
      title: "Transparent Pricing",
      description: "Affordable packages with no hidden costs.",
      icon: <DollarSign size={30} />
    }
  ];

  return (
    <section id="why-choose-us" className="why-choose-us">
      <div className="container">
        <div className="section-header">
          <span className="pill">Why SafeHive?</span>
          <h2>Security, the way it should be</h2>
          <p> The main reasons our customers stay with us and tell their friends about us.
            We combine technical excellence with premium equipment for proper security.</p>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit, i) => (
            <div key={i} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
const Home = ({ onNavigate, onQuoteOpen, onViewServicesClick }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page animate-fade-in">
      <Hero onNavigate={onNavigate} onQuoteOpen={onQuoteOpen} onViewServicesClick={onViewServicesClick} />
      <Partners />
      <Services onNavigate={onNavigate} onQuoteOpen={onQuoteOpen} />
      <Process />
      <WhyChooseUs />
      <CTA onQuoteOpen={onQuoteOpen} />
    </div>
  );
};

export default Home;
