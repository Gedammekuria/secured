import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

const defaultProjects = [
  {
    id: 1,
    title: "Amibara Properties",
    clientName: "Amibara Properties",
    location: "Addis Ababa, Ethiopia",
    description: "The client needed a cost-effective, high-definition security system with zero blind spots, local video backup and secure remote access.",
    fullDetail: "A massive security deployment for a large commercial properties group. We engineered a high resolution IP cameras. The system features advanced motion analytics to monitor high-traffic areas and thermal detection for sensitive zones.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Remote global access", "Motion detection", "Minimized risks of employee's and property loses", "Take immediate action for the problem"],
    category: "CCTV Camera",
    image: "/assets/service/amibara-project.jpg",
  },
  {
    id: 2,
    title: "Jotun ",
    clientName: "Jotun Paint Manufacturing",
    location: "Addis Ababa, Ethiopia",
    description: "The client needed cctv camera to control his employe's and their properties any where to reduce wastage and increase the productivity of the manufacturing plant.",
    fullDetail: "Surveillance in industry is vital to control the employees and their properties any where to reduce wastage and increase the productivity of the manufacturing plant. We deployed explosion-proof CCTV housings and long-range thermal cameras to monitor process equipment and ensure site safety.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Remote access from any where", "Increase productivity", "Use their time properly", "Highly minimized the wastage"],

    category: "CCTV Camera",
    image: "/assets/service/jotun-cctv.webp"
  },
  {
    id: 3,
    title: "Oasis Hotel Apartment",
    clientName: "Oasis Hotel Apartment",
    location: "Addis Ababa, Ethiopia",
    description: "The client needed cctv camera for controling the guest safety and high-traffic area monitoring across multiple floors.",
    fullDetail: "For Oasis Hotel Apartment, we installed  a CCTV camera security system. The installation includes high-definition dome and bullet cameras in hallways and common areass. The system provides real-time monitoring and advanced playback capabilities for management.",
    benefit: ["24/7 continuous recording", "Multi-floor coverage", "Guest privacy optimization", "24/7 hotel monitoring"],
    category: "CCTV Camera",
    image: "/assets/service/oasishotel.webp"
  },
  {
    id: 4,
    title: "Sunrise Real Estate",
    clientName: "Sunrise Real Estate",
    location: "Addis Ababa, Ethiopia",
    description: "We installed high-definition CCTV surveillance system for Sunrise Real Estate to safeguard property assets and ensure tenant security .",
    fullDetail: "Sunrise Real Estate required a CCTV security solution for their residential complex. We installed the Cameras with out blined spot.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", " ", "Remote global access", "Motion-triggered alerts", "Night vision excellence"],
    category: "CCTV Camera",
    image: "/assets/service/Sunrise-project.jpg"
  },
  {
    id: 5,
    title: "Amstel Frozen Foods",
    clientName: "Amstel Frozen Foods",
    location: "Addis Ababa, Ethiopia",
    description: "Professional CCTV camera installation designed to provide continuous, high quality monitoring.",
    fullDetail: "We designed a powerful CCTV system for Amstel Frozen Foods. Key focus areas include the point of sale for transaction security and the production area to monitor quality control. The high-resolution cameras provide clear footage even in low-light conditions during night shifts.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Quality control oversight", "Remote operational checks", "POS transaction monitoring", "Time managment"],
    category: "CCTV Camera",
    image: "/assets/service/amstel_frozen_foods.webp"
  },
  {
    id: 6,
    title: "Jotun Fire Alarm System",
    clientName: "Jotun Paint Manufacturing",
    location: "Addis Ababa, Ethiopia",
    description: "Comprehensive fire alarm system installation across Jotun's paint manufacturing facility to ensure employee safety and protect high-value production equipment.",
    fullDetail: "Jotun's manufacturing plant required a robust fire detection and alarm solution suitable for a high-risk industrial environment. We installed an addressable fire alarm control panel, heat detectors in the production areas, smoke detectors in office and storage zones, and manual call points at all exits. The system is integrated with the site's emergency evacuation plan, providing immediate zone-based alerts to the safety team and automatic notification to local fire services.",
    benefit: ["Addressable zone detection", "Industrial-grade heat detectors", "Automatic emergency notification", "Full site evacuation coverage", "24/7 monitoring capability", "Compliance with Ethiopian fire safety standards"],
    category: "Alarm system",
    image: "/assets/service/fire-alarm-control-system.jpg"
  },
  {
    id: 7,
    title: "Ethiopian Insurance Corporation Fire Alarm",
    clientName: "Ethiopian Insurance Corporation",
    location: "Addis Ababa, Ethiopia",
    description: "Full-scale fire alarm system installation across the Ethiopian Insurance Corporation's corporate headquarters to protect staff, records, and critical infrastructure.",
    fullDetail: "Ethiopian Insurance Corporation needed a reliable fire alarm system to safeguard their multi-floor headquarters building. We deployed a conventional fire alarm control panel with smoke detectors in all office floors, server room heat detectors, break-glass manual call points on every floor landing, and ceiling-mounted sounders for building-wide alerts. The installation was completed with full wiring documentation and staff training on emergency procedures.",
    benefit: ["Multi-floor smoke detection", "Server room heat detection", "Building-wide alarm sounders", "Break-glass manual call points", "Emergency procedure training", "Full wiring documentation"],
    category: "Alarm system",
    image: "/assets/service/fire-alarm-installation.jpg"
  },
  {
    id: 8,
    title: "Ethiopian Insurance Corporation Door Lock",
    clientName: "Ethiopian Insurance Corporation",
    location: "Addis Ababa, Ethiopia",
    description: "Installation of Biometric Smart Video Door Locks at the Ethiopian Insurance Corporation to enforce strict access control for sensitive departments and server rooms.",
    fullDetail: "Following the fire alarm project, Ethiopian Insurance Corporation engaged us to upgrade access control across their headquarters. We installed Biometric Smart Video Door Locks on the executive floor. Each lock supports fingerprint recognition, PIN code, and RFID card access, with a built-in camera capturing every entry attempt. Management receives real-time alerts for unrecognised access attempts and can remotely lock or unlock any door via the mobile app.",
    benefit: ["Biometric fingerprint access", "Built-in entry camera", "Remote lock/unlock via app", "Real-time intrusion alerts", "RFID and PIN backup access", "Complete access audit trail"],
    category: "Smart Door Locks",
    image: "/assets/service/smart-door-lock-installation.jpg"
  }
];

const PortfolioPage = ({ onSelectProject, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [projectsList, setProjectsList] = useState(defaultProjects);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Show cached data immediately for fast render, but always re-fetch to get latest
    const cachedProjects = sessionStorage.getItem('safehive_all_projects_cache');
    if (cachedProjects) {
      try {
        const parsed = JSON.parse(cachedProjects);
        setProjectsList(parsed);
      } catch (e) {
        // ignore bad cache
      }
    }

    // Always fetch fresh data from server to pick up any new projects
    fetch('/api/projects')
      .then(res => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          sessionStorage.setItem('safehive_all_projects_cache', JSON.stringify(data));
          setProjectsList(data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch projects, using fallback data:', err);
      });
  }, []);

  const categories = ['All', 'CCTV Camera', 'Alarm system', 'Smart Door Locks'];

  const filteredProjects = activeFilter === 'All'
    ? projectsList
    : projectsList.filter(p => p.category === activeFilter);

  const handleRequestNow = (category) => {
    const catLower = (category || '').toLowerCase();
    if (catLower.includes('cctv') || catLower.includes('camera')) {
      onNavigate('cctv-quote');
    } else if (catLower.includes('alarm')) {
      onNavigate('alarm-quote');
    } else if (catLower.includes('door') || catLower.includes('lock')) {
      onNavigate('smartdoorlock-quote');
    } else {
      onNavigate('quote');
    }
  };

  return (
    <div className="portfolio-page pb-20">
      {/* Hero Header */}
      <section className="portfolio-hero py-24 bg-dark text-white text-center" style={{ paddingBottom: '160px' }}>
        <div className="container animate-fade-up">
          <h1 className="display-4 font-weight-bold mb-4">Our Complated Projects </h1>
          <p className="lead opacity-70 mx-auto mb-0" style={{ maxWidth: '700px' }}>
            Explore our portfolio of professional CCTV installations and smart alarm systems built for absolute reliability.          </p>
        </div>
      </section>

      {/* Category Filter Buttons */}
      <section className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 15 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'white',
          padding: '12px',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          width: 'fit-content',
          margin: '0 auto',
          border: '1px solid #f1f5f9'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                padding: '10px 24px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: activeFilter === cat ? '#635bff' : 'transparent',
                color: activeFilter === cat ? 'white' : '#475569',
                boxShadow: activeFilter === cat ? '0 4px 12px rgba(99,91,255,0.3)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container" style={{ marginTop: '60px', position: 'relative', zIndex: 10, paddingBottom: '60px' }}>
        <div className="content-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="portfolio-card bg-white rounded-32 shadow-lg overflow-hidden border-0 d-flex flex-column">
              <div
                className="portfolio-image-wrapper"
                style={{ height: '260px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                onClick={() => onSelectProject(project)}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  className="transition-transform"
                  loading="lazy"
                  decoding="async"
                />
                <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                  <span className="badge-light" style={{ backgroundColor: 'rgba(10, 37, 64, 0.8)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>{project.category}</span>
                </div>
              </div>
              <div className="portfolio-content p-5 flex-1 d-flex flex-column" style={{ padding: '32px' }}>
                <div className="d-flex align-items-center gap-2 text-primary mb-3" style={{ fontSize: '13px', fontWeight: '700', color: '#635bff' }}>
                  <MapPin size={14} /> {project.location}
                </div>
                <h3 className="font-weight-bold mb-3" style={{ fontSize: '22px', color: '#0a2540', lineHeight: '1.4' }}>{project.title}</h3>
                <p className="text-muted mb-4" style={{ lineHeight: '1.6', fontSize: '15px' }}>{project.description}</p>
                <div className="mt-auto pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => onSelectProject(project)}
                      className="btn-primary"
                      style={{
                        flex: '1',
                        justifyContent: 'center',
                        fontWeight: '700',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#f1f5f9',
                        color: '#0a2540',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px'
                      }}
                    >
                      View More
                    </button>
                    <button
                      onClick={() => handleRequestNow(project.category)}
                      className="btn-primary"
                      style={{
                        flex: '1',
                        justifyContent: 'center',
                        fontWeight: '700',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#635bff',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '14px'
                      }}
                    >
                      Request Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Partnerships Section */}
      {/* <section className="container" style={{ marginTop: '100px' }}>
        <div className="bg-white rounded-32 p-5 border shadow-sm" style={{ padding: '60px' }}>
          <div className="text-center mb-5">
            <h2 className="font-weight-bold mb-3" style={{ fontSize: '32px', color: '#0a2540' }}>Our Strategic Technology Partners</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>We work with the world's most innovative security benefit providers to deliver uncompromising protection.</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
            alignItems: 'center'
          }}>
            {['Hikvision', 'Ajax Systems', 'Dahua', 'Ring', 'Ubiquiti'].map((partner, i) => (
              <div key={i} className="text-center p-4" style={{
                background: '#f8fafc',
                borderRadius: '20px',
                border: '1px solid #f1f5f9',
                fontWeight: '800',
                color: '#635bff',
                fontSize: '18px'
              }}>
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Trust CTA */}
      <section className="container section-margin">
        <div className="bg-dark rounded-32 p-5 text-white text-center position-relative overflow-hidden" style={{ padding: '80px' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 className="display-4 font-weight-bold mb-4">Ready to start your project?</h2>
            <p className="lead opacity-70 mx-auto mb-5" style={{ maxWidth: '600px' }}>Join our growing list of satisfied commercial and residential clients across Ethiopia.</p>
            <button className="btn-primary" style={{ padding: '16px 40px' }} onClick={() => onNavigate('quote')}>Book a Consultation</button>
          </div>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 91, 255, 0.1) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 1 }}></div>
        </div>
      </section>
    </div>
  );
};

export default PortfolioPage;
