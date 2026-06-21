import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import './App.css';
import './ContentPages.css';
import PhoneInput from './components/PhoneInput';
import {
  Camera, Bell, Radio, Home as HomeIcon, Eye, Shield, DoorOpen, AlertTriangle,
  ChevronDown, ChevronUp, ClipboardList, PenTool, Wrench, Users,
  Phone, MapPin, Mail, Clock, CheckCircle, Star, Globe,
  Wifi, Lock, Smartphone, Monitor, Menu, X, ArrowRight,
  Briefcase, HelpCircle, FileText, BookOpen, Send, FileEdit
} from 'lucide-react';

// Lazy loading components for faster initial load
import Home from './pages/Home';

const CCTVPage = lazy(() => import('./pages/CCTVPage'));
const AlarmPage = lazy(() => import('./pages/AlarmPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const QuotePage = lazy(() => import('./pages/QuotePage'));

import BackToTop from './components/BackToTop';
import ChatWidget from './components/ChatWidget';

// Simple loading indicator
const PageLoader = () => (
  <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="loader"></div>
  </div>
);


const Navbar = ({
  onNavigate,
  currentView,
  onQuoteOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  mobileServicesOpen,
  setMobileServicesOpen,
  megaMenuVisible,
  setMegaMenuVisible
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false);
  const [projectsMegaVisible, setProjectsMegaVisible] = useState(false);
  const hideTimer = useRef(null);
  const projectsHideTimer = useRef(null);

  // Check if current view is a service-related page
  const isServicesActive = ['cctv', 'alarm'].includes(currentView);
  const isProjectsActive = ['portfolio', 'faq', 'project-detail'].includes(currentView);
  const isHomeActive = ['landing', 'services'].includes(currentView);
  const isQuoteActive = ['quote', 'cctv-quote', 'alarm-quote', 'other-quote'].includes(currentView);

  // Show immediately; cancel any pending hide
  const showMegaMenu = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setMegaMenuVisible(true);
  };

  // Hide after a short delay so cursor can cross the gap safely
  const scheduleMegaMenuHide = () => {
    hideTimer.current = setTimeout(() => setMegaMenuVisible(false), 200);
  };

  const showProjectsMega = () => {
    if (projectsHideTimer.current) clearTimeout(projectsHideTimer.current);
    setProjectsMegaVisible(true);
  };

  const scheduleProjectsHide = () => {
    projectsHideTimer.current = setTimeout(() => setProjectsMegaVisible(false), 200);
  };


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!megaMenuVisible) return;

    let listenerAdded = false;
    // Delay adding the listener so the current click event doesn't immediately close the menu
    const timer = setTimeout(() => {
      const handleOutsideClick = (e) => {
        const navElement = document.querySelector('.navbar');
        if (navElement && !navElement.contains(e.target)) {
          setMegaMenuVisible(false);
        }
      };
      document.addEventListener('click', handleOutsideClick);
      listenerAdded = handleOutsideClick;
    }, 300);

    return () => {
      clearTimeout(timer);
      if (listenerAdded) {
        document.removeEventListener('click', listenerAdded);
      }
    };
  }, [megaMenuVisible, setMegaMenuVisible]);


  const handleAnchorClick = (e, id) => {
    e.preventDefault();
    onNavigate('landing');
    setMobileMenuOpen(false);
    setMegaMenuVisible(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleServiceClick = (e, view) => {
    e.preventDefault();
    onNavigate('services');
    setMobileMenuOpen(false);
    setMegaMenuVisible(false);
    setTimeout(() => {
      const element = document.getElementById(view);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const navigateToService = (e, targetView) => {
    e.preventDefault();
    onNavigate(targetView);
    setMobileMenuOpen(false);
    setMegaMenuVisible(false);
    window.scrollTo(0, 0);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    onNavigate('landing');
    setMobileMenuOpen(false);
    setMegaMenuVisible(false);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('body-lock');
    } else {
      document.body.classList.remove('body-lock');
    }
  }, [mobileMenuOpen]);
  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="nav-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      <div className="container nav-content">
        <a href="#" className="logo" onClick={handleLogoClick}>
          <img src="/assets/safehive.png" alt="Safehive Logo" className="logo-img" fetchpriority="high" />
        </a>
        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <a
            href="#landing"
            className={isHomeActive ? 'active' : ''}
            onClick={handleLogoClick}
          >
            Home
          </a>

          <div
            className={`nav-item-has-mega ${mobileServicesOpen ? 'mobile-expanded' : ''} ${isServicesActive ? 'active' : ''}`}
            onMouseEnter={showMegaMenu}
            onMouseLeave={scheduleMegaMenuHide}
          >
            <a href="#services" className="nav-link-mega" onClick={(e) => {
              e.preventDefault();
              if (window.innerWidth <= 1024) {
                setMobileServicesOpen(!mobileServicesOpen);
              }
              // Desktop: clicking the label does nothing — hover opens the mega menu
            }}>
              Services <span className="chevron-down"><ChevronDown size={14} strokeWidth={2.5} /></span>
            </a>

            <div
              className={`mega-menu projects-mega ${megaMenuVisible ? 'is-visible' : ''}`}
              onMouseEnter={showMegaMenu}
              onMouseLeave={scheduleMegaMenuHide}
            >
              <div className="mega-menu-content" style={{ gridTemplateColumns: 'minmax(280px, 1fr) 1.2fr', gap: '40px' }}>
                <div className="mega-column-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <a href="#cctv" className="mega-header-link" style={{ maxWidth: 'none' }} onClick={(e) => navigateToService(e, 'cctv')}>
                    <div className="mega-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                      <span className="mega-icon"><Camera size={22} /></span>
                      <div>
                        <h4>CCTV Systems</h4>
                        <p>High-definition surveillance</p>
                      </div>
                    </div>
                  </a>
                  <a href="#alarm" className="mega-header-link" style={{ maxWidth: 'none' }} onClick={(e) => navigateToService(e, 'alarm')}>
                    <div className="mega-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                      <span className="mega-icon"><Bell size={22} /></span>
                      <div>
                        <h4>Alarm Systems</h4>
                        <p>Smart intrusion detection</p>
                      </div>
                    </div>
                  </a>

                </div>
                <div className="mega-column mega-featured">
                  <div className="featured-card">
                    <span className="badge-featured">Free Survey</span>
                    <h5>Ready for a Professional Quote?</h5>
                    <p>Our experts are here to design the perfect security ecosystem tailored to your unique requirements.</p>
                    <button className="btn-primary-sm" onClick={(e) => {
                      e.preventDefault(); onNavigate('contact');
                      setMegaMenuVisible(false);
                    }}>Get Started <ArrowRight size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
            <div className={`mobile-sub-menu ${mobileServicesOpen ? 'active' : ''}`}>
              <a href="#cctv" className={currentView === 'cctv' ? 'active' : ''} onClick={(e) => navigateToService(e, 'cctv')}>
                <span className="link-icon"><Camera size={14} /></span> CCTV Systems
              </a>
              <a href="#alarm" className={currentView === 'alarm' ? 'active' : ''} onClick={(e) => navigateToService(e, 'alarm')}>
                <span className="link-icon"><Bell size={14} /></span> Alarm Systems
              </a>
            </div>
          </div>

          <div
            className={`nav-item-has-mega ${mobileProjectsOpen ? 'mobile-expanded' : ''} ${isProjectsActive ? 'active' : ''}`}
            onMouseEnter={showProjectsMega}
            onMouseLeave={scheduleProjectsHide}
          >
            <a href="#portfolio" className="nav-link-mega" onClick={(e) => {
              e.preventDefault();
              if (window.innerWidth <= 1024) {
                setMobileProjectsOpen(!mobileProjectsOpen);
              } else {
                onNavigate('portfolio');
                setMobileMenuOpen(false);
                setProjectsMegaVisible(false);
                window.scrollTo(0, 0);
              }
            }}>
              Projects <span className="chevron-down"><ChevronDown size={14} strokeWidth={2.5} /></span>
            </a>

            <div
              className={`mega-menu projects-mega ${projectsMegaVisible ? 'is-visible' : ''}`}
              onMouseEnter={showProjectsMega}
              onMouseLeave={scheduleProjectsHide}
            >
              <div className="mega-menu-content" style={{ gridTemplateColumns: 'minmax(280px, 1fr) 1.2fr', gap: '40px' }}>
                <div className="mega-column-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <a href="#portfolio" className="mega-header-link" style={{ maxWidth: 'none' }} onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); setMobileMenuOpen(false); setProjectsMegaVisible(false); }}>
                    <div className="mega-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                      <span className="mega-icon" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}><Briefcase size={22} /></span>
                      <div>
                        <h4>Portfolios</h4>
                        <p>Our recent installations</p>
                      </div>
                    </div>
                  </a>
                  <a href="#faq" className="mega-header-link" style={{ maxWidth: 'none' }} onClick={(e) => { e.preventDefault(); onNavigate('faq'); setMobileMenuOpen(false); setProjectsMegaVisible(false); }}>
                    <div className="mega-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                      <span className="mega-icon" style={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }}><HelpCircle size={22} /></span>
                      <div>
                        <h4>FAQ's</h4>
                        <p>Questions & Answers</p>
                      </div>
                    </div>
                  </a>

                </div>
                <div className="mega-column mega-featured">
                  <div className="featured-card">
                    <span className="badge-featured" style={{ background: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }}>Exclusive Offer</span>
                    <h5>Secure Your Peace of Mind</h5>
                    <p>Don't leave your protection to chance. Every second counts—book a priority consultation now to receive a customized security blueprint from our elite engineering team.</p>
                    <button className="btn-primary-sm" onClick={(e) => { e.preventDefault(); onNavigate('contact'); setProjectsMegaVisible(false); }}>Book Now <ArrowRight size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile-only projects sub-menu */}
            <div className={`mobile-sub-menu ${mobileProjectsOpen ? 'active' : ''}`}>
              <a href="#portfolio" className={currentView === 'portfolio' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); setMobileMenuOpen(false); }}>
                <span className="link-icon"><Briefcase size={14} /></span> Portfolios
              </a>
              <a href="#faq" className={currentView === 'faq' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onNavigate('faq'); setMobileMenuOpen(false); }}>
                <span className="link-icon"><HelpCircle size={14} /></span> FAQ's
              </a>

            </div>
          </div>


          <a
            href="#about"
            className={currentView === 'about' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onNavigate('about'); setMobileMenuOpen(false); }}
            style={{ fontWeight: '600' }}
          >
            About
          </a>

          <a
            href="#contact"
            className={`btn-nav ${currentView === 'contact' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate('contact'); setMobileMenuOpen(false); }}
          >
            Contact Us
          </a>

          <a
            href="#quote"
            className={`btn-get-quote ${isQuoteActive ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate('quote'); setMobileMenuOpen(false); }}
          >
            Get a Quote
          </a>
        </div>
      </div>
    </nav>
  );
};

const Footer = ({ onNavigate }) => {
  const handleNav = (e, target) => {
    e.preventDefault();
    onNavigate(target);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/assets/hexagon-logo.png" alt="Safehive Logo" className="logo-img" loading="lazy" />
            <p>Safehive is sister company of hexagon conputer systems specialized in security solutions.</p>
          </div>
          <div className="footer-links">
            <h4>Services</h4>
            <a href="#cctv" onClick={(e) => handleNav(e, 'cctv')}><Camera size={18} /> CCTV Installation</a>
            <a href="#alarm" onClick={(e) => handleNav(e, 'alarm')}><Bell size={18} /> Alarm Systems</a>

          </div>
          <div className="footer-links">
            <h4>Projects</h4>
            <a href="#portfolio" onClick={(e) => handleNav(e, 'portfolio')}>Portfolios</a>
            <a href="#faq" onClick={(e) => handleNav(e, 'faq')}>FAQ's</a>

          </div>
          <div className="footer-links">
            <h4>Quick links</h4>
            <a href="#landing" onClick={(e) => handleNav(e, 'landing')}>Home</a>

            <a href="#about" onClick={(e) => handleNav(e, 'about')}>About</a>
            <a href="#contact" onClick={(e) => handleNav(e, 'contact')}>Contact</a>
            <a href="#quote" onClick={(e) => handleNav(e, 'quote')}>Get a Quote</a>
          </div>
          <div className="footer-links">
            <h4>Contact Info</h4>
            <a href="tel:+251 923 55 55 54" className="footer-contact-item">
              <Phone size={14} className="text-primary" /> +251 923 55 55 54
            </a>
            <a href="mailto:info@safehive.com" className="footer-contact-item" >
              <Mail size={14} className="text-primary" /> info@safehive.com
            </a>

            <div className="footer-contact-item" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <MapPin size={14} className="text-primary" />22 Mazoriya MAF Building
            </div>
            <div className="footer-contact-item" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Clock size={14} className="text-primary" /> Mon - Fri: 7:00 AM - 4:00 PM
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Safehive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};


function App() {
  // Initialize from hash or default to 'landing'
  const [view, setView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    // Simple validation: if hash exists, use it, otherwise landing
    return hash || 'landing';
  });

  const [activeProject, setActiveProject] = useState(null);

  // Lifted navbar states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [megaMenuVisible, setMegaMenuVisible] = useState(false);

  // Sync hash when view changes
  useEffect(() => {
    if (view) {
      window.location.hash = view;
    }
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [view]);

  // Listen for hash changes (back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && newHash !== view) {
        setView(newHash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [view]);

  const navigateToProject = (project) => {
    setActiveProject(project);
    setView('project-detail');
  };

  const handleViewServicesClick = () => {
    if (window.innerWidth <= 1024) {
      // Mobile: navigate to landing first, then open mobile menu
      setView('landing');
      setTimeout(() => {
        setMobileMenuOpen(true);
        setTimeout(() => {
          setMobileServicesOpen(true);
        }, 100);
      }, 50);
    } else {
      // Desktop: navigate to landing if not already there, then open mega menu
      setView('landing');
      // Use a short delay so the page renders before showing the mega menu
      setTimeout(() => {
        setMegaMenuVisible(true);
      }, 150);
    }
  };


  const renderView = () => {
    switch (view) {
      case 'landing': return <Home onNavigate={setView} onQuoteOpen={(target = 'quote') => setView(target)} onViewServicesClick={handleViewServicesClick} onSelectProject={navigateToProject} />;
      case 'services': return <Home onNavigate={setView} onQuoteOpen={(target = 'quote') => setView(target)} onViewServicesClick={handleViewServicesClick} onSelectProject={navigateToProject} />;
      case 'cctv': return <CCTVPage onNavigate={setView} />;
      case 'alarm': return <AlarmPage onNavigate={setView} />;
      case 'portfolio': return <PortfolioPage onSelectProject={navigateToProject} onNavigate={setView} />;
      case 'faq': return <FAQPage />;
      case 'blog': return <BlogPage />;
      case 'about': return <AboutPage onNavigate={setView} />;
      case 'contact': return <ContactPage />;
      case 'quote': return <QuotePage onNavigate={setView} />;
      case 'admin': return <AdminPage onNavigate={setView} />;
      case 'cctv-quote': return <QuotePage onNavigate={setView} initialCategory="CCTV Systems" />;
      case 'alarm-quote': return <QuotePage onNavigate={setView} initialCategory="Alarm Systems" />;
      case 'other-quote': return <QuotePage onNavigate={setView} initialCategory="Other" />;
      case 'project-detail':
        if (!activeProject) {
          setTimeout(() => setView('portfolio'), 0);
          return <PageLoader />;
        }
        return <ProjectDetailPage project={activeProject} onBack={() => setView('portfolio')} onNavigate={setView} />;
      default: return <Home onNavigate={setView} onQuoteOpen={() => setView('quote')} onViewServicesClick={handleViewServicesClick} />;
    }
  };

  return (
    <div className="app">
      {view !== 'admin' && (
        <Navbar
          onNavigate={setView}
          currentView={view}
          onQuoteOpen={() => setView('quote')}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          mobileServicesOpen={mobileServicesOpen}
          setMobileServicesOpen={setMobileServicesOpen}
          megaMenuVisible={megaMenuVisible}
          setMegaMenuVisible={setMegaMenuVisible}
        />
      )}
      <Suspense fallback={<PageLoader />}>
        {renderView()}
      </Suspense>
      {view !== 'admin' && <Footer onNavigate={setView} />}
      {view !== 'admin' && <BackToTop />}
      {view !== 'admin' && <ChatWidget />}
    </div>
  );
}

export default App;
