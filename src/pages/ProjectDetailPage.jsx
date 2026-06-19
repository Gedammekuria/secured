import React, { useEffect } from 'react';
import { MapPin, ArrowLeft, Shield, Camera, CheckCircle2, ChevronRight, Users, Briefcase } from 'lucide-react';

const ProjectDetailPage = ({ project, onBack, onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!project) return null;

  return (
    <div className="project-detail-page pb-20">
      {/* Hero Header */}
      <section
        className="portfolio-hero text-white text-center rounded-32"
        style={{
          backgroundImage: project.heroImage ? `linear-gradient(rgba(10, 37, 64, 0.7), rgba(10, 37, 64, 0.7)), url("${project.heroImage}")` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <button
            onClick={onBack}
            className="badge-light mb-4 text-center cursor-pointer"
            style={{ border: 'none', background: 'rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(10px)' }}
          >
            <ArrowLeft size={16} /> Back to Portfolio
          </button>
          <h1 className="display-4 font-weight-bold mb-4">{project.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'rgba(255,255,255,0.9)', fontSize: '18px' }}>
            <MapPin size={20} color="#635bff" /> {project.location}
          </div>
        </div>
      </section>

      {/* Detail Content */}
      <section className="container" style={{ marginTop: '40px', position: 'relative', zIndex: 10 }}>
        <div className="bg-white rounded-32 shadow-lg overflow-hidden">
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Left: Image & Quick Stats */}
            <div style={{ flex: '1 0 450px', backgroundColor: '#f8fafc' }}>
              <img src={project.image} alt={project.title} style={{ width: '100%', height: '500px', objectFit: 'cover' }} loading="lazy" decoding="async" />
              <div style={{ padding: '40px' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#0a2540' }}>Project Technicals</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Client Name</span>
                    <span style={{ color: '#0a2540', fontWeight: '700' }}>{project.clientName || 'Private Client'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Project Type</span>
                    <span style={{ color: '#0a2540', fontWeight: '700' }}>CCTV Surveillance</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Client Location</span>
                    <span style={{ color: '#0a2540', fontWeight: '700' }}>{project.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Project Status</span>
                    <span style={{ color: '#10b981', fontWeight: '800' }}>COMPLETED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Technical Description */}
            <div style={{ flex: '1 0 500px', padding: '60px' }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ color: '#635bff', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Case Study Detail</div>
                <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0a2540', marginBottom: '24px', lineHeight: '1.2' }}>Professional CCTV System Installation</h2>
                <p className="text-muted" style={{ fontSize: '18px', lineHeight: '1.8' }}>
                  {project.fullDetail}
                </p>
              </div>

              <div style={{ marginBottom: '48px' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#0a2540', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={24} color="#635bff" /> Solution Architecture
                </h4>
                <p className="text-muted" style={{ lineHeight: '1.7', fontSize: '16px' }}>
                  The primary objective was to ensure a zero-blind-spot environment while maintaining a clean, professional aesthetic fitting for {project.title}. Our engineers performed a site survey to calculate optimal camera angles and focal lengths for maximum coverage.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#0a2540', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Camera size={24} color="#635bff" />Benefits they obtained
                </h4>
                <div className="modal-benefit-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  {project.benefit.map((item, i) => (
                    <div key={i} className="modal-benefit-item">
                      <CheckCircle2 size={18} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  className="btn-primary w-80"
                  style={{ padding: '20px', borderRadius: '18px', fontSize: '16px', fontWeight: '800' }}
                  onClick={() => {
                    const cat = (project.category || '').toLowerCase();
                    if (cat.includes('cctv')) {
                      onNavigate('cctv-quote');
                    } else if (cat.includes('alarm')) {
                      onNavigate('alarm-quote');
                    } else {
                      onNavigate('quote');
                    }
                  }}
                >
                  Discuss A Project Like This
                </button>
                <button
                  onClick={onBack}
                  className="btn-primary w-80"
                  style={{
                    padding: '18px',
                    borderRadius: '18px',
                    fontSize: '15px',
                    fontWeight: '700',
                    background: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    color: '#64748b'
                  }}
                >
                  View Other Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Relationship & Support Section */}
      <section className="container section-margin" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <div className="bg-white rounded-32 p-5 shadow-lg border" style={{ padding: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ color: '#635bff', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>The SafeHive Commitment</div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0a2540', marginBottom: '20px' }}>Become Our Partner</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '16px', lineHeight: '1.7' }}>
              Enhance your service offering by partnering with the specialists at SafeHive. We provide end-to-end CCTV
              and alarm system installation for residential and commercial clients.            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '5px',
            alignItems: 'stretch'
          }}>
            {[
              { title: 'Precision Installation', desc: 'Our technicians ensure optimal device placement and network stability.' },
              { title: 'Best security Solutions', desc: ' From CCTV camera to wireless alarm systems, we configure every setup.' },
              { title: 'Strict Confidentiality', desc: 'Your security data and privacy are handled with the highest level of encryption.' },
              { title: 'Ongoing Support', desc: 'We don’t just install; we provide the technical support your clients depend on' }
            ].map((feature, i) => (
              <div key={i} className="p-4 rounded-24" style={{
                background: 'linear-gradient(135deg, #0a2540, #1a3a5a)',
                padding: "30px",
                borderRadius: '24px',
                border: '2px solid #f1f5f9',
                transition: 'all 0.3s ease',
                width: '250px',
              }}>
                <h5 style={{ fontWeight: '900', fontSize: '15px', color: 'white', marginBottom: '12px' }}>{feature.title}</h5>
                <p style={{ fontSize: '14px', color: 'white', margin: 0, lineHeight: '1.6' }}>{feature.desc}</p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '60px',
            padding: '60px 40px',
            background: 'linear-gradient(135deg, #0a2540, #1a3a5a)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '32px'
          }}>
            <div style={{ color: 'white' }}>
              <h4 style={{ fontWeight: '800', marginBottom: '16px', fontSize: '36px', color: 'white' }}>Ready for a Secure Relationship?</h4>
              <p style={{ opacity: '0.8', margin: 0, fontSize: '17px', maxWidth: '600px' }}> Discover why hundreds of clients across Ethiopia choose SafeHive for their protection.</p>
            </div>
            <button
              className="btn-primary"
              style={{ background: '#e25822', color: 'white', padding: '16px 48px', fontWeight: '800' }}
              onClick={() => onNavigate('quote')}
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetailPage;
