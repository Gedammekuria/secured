import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

const defaultProjects = [
  {
    id: 1,
    title: "Amibara Properties",
    clientName: "Amibara Properties",
    location: "Addis Ababa, Ethiopia",
    description: "The client needed a cost-effective, high-definition security system with zero blind spots, local video backup redundancy, and secure remote access.",
    fullDetail: "A massive security deployment for a large commercial properties group. We engineered a high resolution IP camera network designed for 360-degree blind-spot coverage. The system features advanced motion analytics to monitor high-traffic areas and thermal detection for sensitive zones.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Remote global access", "Motion detection", "Minimized risks of employee's and property loses", "Take immediate action for the problem"],
    category: "CCTV Camera",
    image: "/assets/service/amibara project.JPG",
  },
  {
    id: 2,
    title: "Jotun ",
    clientName: "Jotun Paint manufacturing",
    location: "Addis Ababa, Ethiopia",
    description: "The client needed cctv camera to control his employe's and their properties any where to reduce wastage and increase the productivity of the manufacturing plant.",
    fullDetail: "Surveillance in industry is vital to control the employees and their properties any where to reduce wastage and increase the productivity of the manufacturing plant. We deployed explosion-proof CCTV housings and long-range thermal cameras to monitor process equipment and ensure site safety.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Remote access from any where", "Increase productivity", "Use their time properly", "Highly minimized the wastage"],

    category: "CCTV Camera",
    image: "/assets/service/jotun cctv.jpg"
  },
  {
    id: 3,
    title: "Oasis Hotel Apartment",
    clientName: "Oasis Hotel Apartment",
    location: "Addis Ababa, Ethiopia",
    description: "Comprehensive surveillance system for guest safety and high-traffic area monitoring across multiple floors.",
    fullDetail: "For Oasis Hotel Apartment, we installaed  a CCTV camera security system. The installation includes high-definition dome and bullet cameras in hallways and common areass. The system provides real-time monitoring and advanced playback capabilities for management.",
    benefit: ["Multi-floor coverage", "Guest privacy optimization", "24/7 hotel monitoring", "Mobile access for management"],
    category: "CCTV Camera",
    image: "/assets/service/oasis_hotel.png"
  },
  {
    id: 4,
    title: "Sunrise Real Estate",
    clientName: "Sunrise Real Estate",
    location: "Addis Ababa, Ethiopia",
    description: "We installed high-definition CCTV surveillance system for Sunrise Real Estate to safeguard property assets and ensure tenant security .",
    fullDetail: "Sunrise Real Estate required a CCTV security solution for their residential complex. We installed the Cameras with out blined spot.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Remote global access", "Motion-triggered alerts", "Night vision excellence"],
    category: "CCTV Camera",
    image: "/assets/service/sunrise_real_estate.png"

  },
  {
    id: 5,
    title: "Maryod ",
    clientName: "Maryod Bakery",
    location: "Addis Ababa, Ethiopia",
    description: "Professional CCTV camera installation designed to provide continuous, high quality monitoring.",
    fullDetail: "We designed a powerful CCTV system for Maryod Bakery. Key focus areas include the point of sale for transaction security and the production area to monitor quality control. The high-resolution cameras provide clear footage even in low-light conditions during night shifts.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Quality control oversight", "Remote operational checks", "POS transaction monitoring", "Time managment"],
    category: "CCTV Camera",
    image: "/assets/service/maryod_bakery.jpg"
  },
];

const PortfolioPage = ({ onSelectProject, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [projectsList, setProjectsList] = useState(defaultProjects);

  useEffect(() => {
    window.scrollTo(0, 0);

    const cachedProjects = sessionStorage.getItem('safehive_all_projects_cache');
    if (cachedProjects) {
      try {
        const parsed = JSON.parse(cachedProjects);
        setProjectsList(parsed);
        return;
      } catch (e) {
        // Fallback to fetch
      }
    }

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

  const categories = ['All', 'CCTV Camera', 'Alarm system'];

  const filteredProjects = activeFilter === 'All'
    ? projectsList
    : projectsList.filter(p => p.category === activeFilter);

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
                  <button
                    onClick={() => onSelectProject(project)}
                    className="btn-primary w-100"
                    style={{ justifyContent: 'center', fontWeight: '700', padding: '14px', borderRadius: '12px' }}
                  >
                    View More
                  </button>
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
            <p className="lead opacity-70 mx-auto mb-5" style={{ maxWidth: '600px' }}>Join our growing list of satisfied commercial and residential clients across Addis Ababa.</p>
            <button className="btn-primary" style={{ padding: '16px 40px' }} onClick={() => onNavigate('quote')}>Book a Consultation</button>
          </div>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 91, 255, 0.1) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 1 }}></div>
        </div>
      </section>
    </div>
  );
};

export default PortfolioPage;
