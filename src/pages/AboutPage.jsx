import React, { useEffect } from 'react';
import { Shield, Target, Users, Award, CheckCircle, ArrowRight, ShieldCheck, Zap, Heart } from 'lucide-react';
import { useSiteSettings } from '../SiteSettingsContext';

const AboutPage = ({ onNavigate }) => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { label: "Successful Installations", value: settings.stat_installations || "100+" },
    { label: "Years Experience", value: settings.stat_years_experience || "17+" },
    { label: "Client Retention", value: settings.stat_client_retention || "99%" },
  ];

  const values = [
    {
      icon: <ShieldCheck className="text-primary" size={32} />,
      title: "Uncompromising Security",
      description: "Our systems are designed to eliminate vulnerabilities and provide total peace of mind."
    },
    {
      icon: <Zap className="text-primary" size={32} />,
      title: "< 15 min response time",
      description: "Always we are ready to support you with in 15 minutes after you call us."
    },
    {
      icon: <Heart className="text-primary" size={32} />,
      title: "continious Support",
      description: "Our relationship doesn't end at installation. We provide technical support to ensure your protection never sleeps."
    }
  ];

  return (
    <div className="about-page pb-20">
      {/* Hero Section */}
      <section className="about-hero py-24 bg-dark text-white text-center rounded-32">
        <div className="container">
          <h1 className="display-4 font-weight-bold mb-4">Securing Hives, <br /> Protecting Lives.</h1>
          <p className="lead opacity-70 mx-auto" style={{ maxWidth: '700px' }}>
            Your trusted partner in security solutions, dedicated to protecting what matters most across Ethiopia.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container " style={{ marginBottom: '100px' }}>
        <div className="bg-white rounded-32 shadow-lg p-5" style={{
          display: 'grid', gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))', gap: '30px', textAlign: 'center'
        }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-item">
              <h2 className="display-2 mb-0" style={{ color: '#635bff', fontSize: '2rem' }}>{stat.value}</h2>
              <p className="text-muted font-weight-bold mb-0">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Mission & Vision */}
      <section className="container section-margin">
        <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>

            <h2 className="font-weight-bold mb-4" style={{ color: '#0a2540', fontSize: 'clamp(2rem, 4vw, 2.5rem)' }}> Securing Tomorrow, Today.</h2>
            <p className="text-muted lead mb-5">

              Safehive is a trusted leader in intelligent security solutions in ethiopia, specializing in the design, supply, installation,
              and technical support of advanced CCTV Surveillance and Alarm Systems. We believe that true protection goes
              beyond installing cameras and detectors.
            </p>

            <div className="feature-list">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="rounded-circle bg-primary-light p-2" style={{ backgroundColor: 'rgba(99, 91, 255, 0.1)', color: '#635bff' }}>
                  <CheckCircle size={18} />
                </div>
                <span className="font-weight-bold" style={{ color: '#0a2540' }}>17+ Years of specialized security expertise</span>
              </div>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="rounded-circle bg-primary-light p-2" style={{ backgroundColor: 'rgba(99, 91, 255, 0.1)', color: '#635bff' }}>
                  <CheckCircle size={18} />
                </div>
                <span className="font-weight-bold" style={{ color: '#0a2540' }}>Experienced technical engineers</span>
              </div>


              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="rounded-circle bg-primary-light p-2" style={{ backgroundColor: 'rgba(99, 91, 255, 0.1)', color: '#635bff' }}>
                  <CheckCircle size={18} />
                </div>
                <span className="font-weight-bold" style={{ color: '#0a2540' }}>End-to-end: Design,Installation and Support</span>
              </div>


              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-primary-light p-2" style={{ backgroundColor: 'rgba(99, 91, 255, 0.1)', color: '#635bff' }}>
                  <CheckCircle size={18} />
                </div>
                <span className="font-weight-bold" style={{ color: '#0a2540' }}>Competitive pricing with premium quality installation</span>
              </div>
            </div>
          </div>
          <div className="rounded-32 overflow-hidden shadow-lg about-image-container" style={{ height: '450px', position: 'relative' }}>
            <video
              src="/assets/service/safehive info.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-light py-24" style={{ backgroundColor: '#f8fafc', borderRadius: '60px' }}>
        <div className="container">
          <div className="text-center mb-5 pb-4">
            <h2 className="display-4 font-weight-bold mb-3" style={{ color: '#0a2540' }}>Built on Trust</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              The foundations of Safehive are built on three core pillars that guide every installation and service call.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {values.map((v, i) => (
              <div key={i} className=" p-5 rounded-32 shadow-sm border border-light" style={{ transition: 'transform 0.3s ease' }}>
                <div className="mb-4" style={{ color: '#635bff' }}>{v.icon}</div>
                <h3 className="font-weight-bold mb-3" style={{ color: '#0a2540' }}>{v.title}</h3>
                <p className="text-muted mb-0">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="container py-24">
        <div className="bg-dark rounded-32 p-5 text-white overflow-hidden position-relative" style={{ padding: 'min(80px, 10vw)', textAlign: 'center' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 className="display-4 font-weight-bold mb-4">Experience the <br /> Safehive Standard</h2>
            <p className="lead opacity-70 mx-auto mb-5" style={{ maxWidth: '600px' }}>
              Don't leave your most valuable assets to chance. Join like as our cients property owners who sleep soundly under our protection.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-4">
              <button className="btn-primary" style={{ padding: '16px 32px' }} onClick={() => onNavigate('quote')}>Request Free Survey</button>
              <button className="btn-secondary" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '16px 32px' }} onClick={() => onNavigate('portfolio')}>
                View Our Projects
              </button>
            </div>
          </div>
          {/* Decorative Blur */}
          <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99, 91, 255, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1 }}></div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
