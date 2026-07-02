import React, { useState, useEffect } from 'react';
import {
  Camera, Bell, Radio, Home as HomeIcon, Eye, Shield, DoorOpen, AlertTriangle,
  ChevronDown, ChevronUp, ClipboardList, PenTool, Wrench, Users,
  ArrowRight, Award, CheckCircle, HeartHandshake, ShieldCheck, DollarSign, MapPin
} from 'lucide-react';

const iconMap = {
  Camera: <Camera size={20} />,
  Bell: <Bell size={20} />,
  Shield: <Shield size={20} />,
  Radio: <Radio size={20} />,
  Home: <HomeIcon size={20} />,
  Eye: <Eye size={20} />,
  DoorOpen: <DoorOpen size={20} />,
  AlertTriangle: <AlertTriangle size={20} />
};

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
        description: "You can monitor any incident on your property remotely from your smartphone anywhere in the world",
        image: "/assets/service/mobile view.webp"
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
        description: "Our systems are easy to access remotely from your smartphone. ",
        image: "/assets/service/ajax control.webp"
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
    { src: '/assets/partners/Dahua.webp', height: 50 },
    { src: '/assets/partners/Hikvision.webp', height: 110 },
    { src: '/assets/partners/WD-Logo-removebg-preview.webp', height: 55 },
    { src: '/assets/partners/ajax.webp', height: 36 },
    { src: '/assets/partners/tp-link.webp', height: 50 },
    { src: '/assets/partners/unifi.webp', height: 36 },
  ];

  return (
    <div className="partners-section">
      <div className="container">
        <div className="marquee">
          <div className="marquee-content">
            {[...logos, ...logos].map((logo, index) => (
              <div key={index} className="partner-logo">
                <img src={logo.src} alt={`Partner ${index}`} style={{ height: `${logo.height}px` }} loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Services = ({ onNavigate, onQuoteOpen }) => {
  const [servicesList, setServicesList] = useState(SERVICES_DATA);
  const [activeTab, setActiveTab] = useState(0);
  const [prevTab, setPrevTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleTabChange = React.useCallback((newIndex) => {
    setPrevTab(activeTab);
    setActiveTab(newIndex);
  }, [activeTab]);

  useEffect(() => {
    const cachedServices = sessionStorage.getItem('safehive_services_cache');
    if (cachedServices) {
      try {
        const parsed = JSON.parse(cachedServices);
        const mapped = parsed.map(s => ({
          ...s,
          icon: iconMap[s.icon] || iconMap['Camera']
        }));
        setServicesList(mapped);
        return;
      } catch (e) {
        // Fallback to fetch
      }
    }

    fetch('/api/services')
      .then(res => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          sessionStorage.setItem('safehive_services_cache', JSON.stringify(data));
          const mapped = data.map(s => ({
            ...s,
            icon: iconMap[s.icon] || iconMap['Camera']
          }));
          setServicesList(mapped);
        }
      })
      .catch(err => console.error('Failed to fetch services, using static fallback:', err));
  }, []);

  useEffect(() => {
    if (isPaused || servicesList.length === 0) return;

    const interval = setInterval(() => {
      handleTabChange((activeTab + 1) % servicesList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab, isPaused, handleTabChange, servicesList.length]);

  const current = servicesList[activeTab] || servicesList[0];
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
          <img src={card.image} alt={card.title} className="gallery-img" loading="lazy" decoding="async" />
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

  if (servicesList.length === 0) return null;

  return (
    <section id="Services" className="services-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div className="section-header">
          <h2>The Pillars of Complete Security</h2>
          <p> Whether you need watchful eyes, an unblinking alarm, a backup line that works when the internet doesn't, we've got a system built for the job. </p>
        </div>
        {!isMobile && (
          <div className="services-layout-top">
            <div className="services-nav-top">
              <div className="service-tabs-row">
                {servicesList.map((s, i) => (
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
              <div className="gallery-tagline-centered">{current?.tagline}</div>
            </div>

            <div className="services-gallery-viewport">
              <div className="services-gallery-track" style={{ transform: `translateX(-${activeTab * 100}%)` }}>
                {servicesList.map((category, idx) => (
                  <div key={idx} className="services-gallery-slide">
                    <div className="services-gallery">
                      {category.cards.map((card, i) => renderCard(card, i, category.category))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tab-dots-centered">
              {servicesList.map((_, i) => (
                <button key={i} className={`tab-dot ${activeTab === i ? 'active' : ''}`} onClick={() => handleTabChange(i)} />
              ))}
            </div>
          </div>
        )}

        {isMobile && (
          <div className="services-mobile-list">
            {servicesList.map((s, i) => (
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
      image: "/assets/service/drawing.webp",
      icon: <PenTool size={22} />
    },
    {
      title: "Installation and Configuration",
      description: "Experienced technicians handle the setup with precision, ensuring clean wiring and optimal device placement.",
      image: "/assets/service/proper NVR placement.webp",
      icon: <Wrench size={22} />
    },
    {
      title: "Training and Support",
      description: "We walk you through every feature and provide ongoing support to keep your hive running smoothly 24/7.",
      image: "/assets/service/training.webp",
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
                  <img src={step.image} alt={step.title} loading="lazy" decoding="async" />
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
        <p>Looking to upgrade or install a new system? Safehive is always ready.</p>
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
      description: "We use only top-tier brands like Hikvision, Dahua, Imou, GSM burgar alarm and Ajax for reliability and durability.",
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
      description: "We will give you a 1 year  warranty on both products and our installation work.",
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
const FeaturedProjects = ({ onNavigate, onSelectProject }) => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const cachedFeatured = sessionStorage.getItem('safehive_featured_projects_cache');
    if (cachedFeatured) {
      try {
        const parsed = JSON.parse(cachedFeatured);
        setFeatured(parsed);
        return;
      } catch (e) {
        // Fallback to fetch
      }
    }

    fetch('/api/projects?showOnHome=true')
      .then(res => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          sessionStorage.setItem('safehive_featured_projects_cache', JSON.stringify(data));
          setFeatured(data);
        }
      })
      .catch(err => console.error('Failed to fetch featured projects:', err));
  }, []);

  if (featured.length === 0) return null;

  return (
    <section className="featured-projects-home why-choose-us" style={{ background: '#f8fafc', paddingTop: '80px', paddingBottom: '80px', borderTop: '1px solid #e2e8f0' }}>
      <div className="container animate-fade-up">
        <div className="section-header">
          <span className="pill" style={{ backgroundColor: '#eef2ff', color: '#635bff' }}>Projects</span>
          <h2>Featured Completed Projects</h2>
          <p>Explore some of our premium security setups deployed successfully.</p>
        </div>

        <div className="content-grid" style={{ marginTop: '40px' }}>
          {featured.map((project) => (
            <div key={project.id} className="portfolio-card bg-white rounded-32 shadow-lg overflow-hidden border-0 d-flex flex-column">
              <div
                className="portfolio-image-wrapper"
                style={{ height: '240px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                onClick={() => onSelectProject && onSelectProject(project)}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                  <span className="badge-light" style={{ backgroundColor: 'rgba(10, 37, 64, 0.8)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>{project.category}</span>
                </div>
              </div>
              <div className="portfolio-content p-5 flex-1 d-flex flex-column" style={{ padding: '24px' }}>
                <div className="d-flex align-items-center gap-2 text-primary mb-2" style={{ fontSize: '13px', fontWeight: '700', color: '#635bff' }}>
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {project.location}
                </div>
                <h3 className="font-weight-bold mb-3" style={{ fontSize: '18px', color: '#0a2540', lineHeight: '1.4', margin: '8px 0' }}>{project.title}</h3>
                <p className="text-muted mb-4" style={{ lineHeight: '1.6', fontSize: '14px', flexGrow: 1 }}>{project.description}</p>
                <div className="mt-auto pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => {
                      if (onSelectProject) {
                        onSelectProject(project);
                      } else {
                        onNavigate('portfolio');
                      }
                    }}
                    className="btn-primary w-100"
                    style={{ justifyContent: 'center', fontWeight: '700', padding: '12px', borderRadius: '12px' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
          <button
            onClick={() => onNavigate('portfolio')}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px 36px',
              borderRadius: '16px',
              fontWeight: '700',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(99, 91, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            View More Projects <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

const Home = ({ onNavigate, onQuoteOpen, onViewServicesClick, onSelectProject }) => {
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
      <FeaturedProjects onNavigate={onNavigate} onSelectProject={onSelectProject} />
      <CTA onQuoteOpen={onQuoteOpen} />
    </div>
  );
};

export default Home;
