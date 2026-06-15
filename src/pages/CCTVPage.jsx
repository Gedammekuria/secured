import React, { useEffect, useState, useRef } from 'react';
import { Camera, Eye, Shield, Zap, Monitor, Smartphone, ArrowRight, CheckCircle, Smartphone as PhoneIcon, Cpu, HardDrive } from 'lucide-react';

const AUTOPLAY_DELAY = 3000;

const CCTVPage = ({ onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      title: "High Resolution Quality",
      desc: "Crystal clear resolution that captures every detail with precision, day or night.",
      icon: <Eye className="text-blue-500" />,
      image: "/assets/service/high resolution.jpg"
    },
    {
      title: "Night Vision Pro",
      desc: "Advanced infrared and night-color technology for total visibility in complete darkness.",
      icon: <Camera className="text-blue-500" />,
      image: "/assets/service/night vision.png"
    },
    {
      title: "Motion Detection",
      desc: "Human and vehicle detection to reduce false alarms and focus on what matters.",
      icon: <Cpu className="text-blue-500" />,
      image: "/assets/service/detection.jpg"
    },
    {
      title: "Weatherproof IP67",
      desc: "Built to withstand the toughest weather, from heavy rain to extreme heat.",
      icon: <Shield className="text-blue-500" />,
      image: "/assets/service/waterproof.jpg"
    },
    {
      title: "Remote Access",
      desc: "Access your live feed and recordings from anywhere in the world via your smartphone.",
      icon: <PhoneIcon className="text-blue-500" />,
      image: "/assets/service/Remote access.jpg"
    },
    {
      title: "Local NVR recording",
      desc: "Footage records to a hard drive on-site no monthly cloud fees, no reliance on your internet. 15-30 days retention.",
      icon: <HardDrive className="text-blue-500" />,
      image: "/assets/service/data_storage.png"
    }
  ];

  // Autoplay: desktop only — on mobile every feature is visible inline, no cycling needed
  useEffect(() => {
    if (isManual) return;
    if (window.innerWidth <= 1024) return; // skip on mobile
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % features.length);
    }, AUTOPLAY_DELAY);
    return () => clearInterval(timerRef.current);
  }, [isManual]);

  // Manual click: switch slide and permanently stop autoplay
  const handleFeatureClick = (i) => {
    clearInterval(timerRef.current);
    setIsManual(true);
    setActiveIndex(i);
  };

  return (
    <div className="service-detail-page cctv-page animate-fade-in">
      {/* Simplified Hero Section */}
      <section className="detail-hero hero-minimal" style={{
        background: '#0a2540'
      }}>
        <div className="container text-center">
          <div className="hero-content-minimal mx-auto max-w-2xl">
            <h1>Eyes that never Stop</h1>
            <p>High definition surveillance solutions. We provide 24/7 monitoring with high clarity and motion detection.</p>
            <div className="hero-actions justify-center">
              <button onClick={() => onNavigate('cctv-quote')} className="btn-primary">Design my CCTV system</button>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Single Info Row instead of 4 columns */}
      <section className="trust-info-bar">
        <div className="container text-center">
          <div className="info-flex">
            <div className="info-point">high resolution</div>
            <div className="info-divider"></div>
            <div className="info-point"> 24/7 Monitoring</div>
            <div className="info-divider"></div>
            <div className="info-point">Motion Detection</div>
            <div className="info-divider"></div>
            <div className="info-point">Night Vision</div>
          </div>
        </div>
      </section>

      {/* Main Features Section - Two Column Modern Layout */}
      <section id="features" className="tech-feature-section py-20">
        <div className="container">
          <div className="section-header text-center mb-16">
            <h2>The features that matters</h2>
            <p>Our systems incorporate the latest advancements in surveillance tech.</p>
          </div>

          <div className="tech-split-layout">
            <div className="tech-features-column">
              {features.map((f, i) => (
                <div key={i} className="mobile-feature-row">
                  <div
                    className={`tech-feature-item-v2 ${activeIndex === i ? 'active' : ''}`}
                    onClick={() => handleFeatureClick(i)}
                  >
                    <div className="tech-feature-icon">
                      {f.icon}
                    </div>
                    <div className="tech-feature-text">
                      <h3>{f.title}</h3>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                  {/* Inline image — only visible on mobile, shown next to each feature row */}
                  <div className="mobile-feature-img">
                    <img src={f.image} alt={f.title} loading="lazy" />
                  </div>
                </div>
              ))}
            </div>

            <div className="tech-image-column desktop-image-column">
              <div className="tech-image-wrapper">
                {features.map((f, i) => (
                  <img
                    key={i}
                    src={f.image}
                    alt={f.title}
                    className={`main-tech-img ${activeIndex === i ? 'active' : ''}`}
                    loading="lazy"
                  />
                ))}
                <div className="hover-description-overlay">
                  <div className="overlay-content">
                    <h3>{features[activeIndex].title}</h3>
                    <p>{features[activeIndex].desc}</p>
                  </div>
                </div>
                <div className="image-scan-line"></div>

                {/* Dot nav at bottom of image */}
                <div className="tech-dot-nav">
                  {features.map((_, i) => (
                    <button
                      key={i}
                      className={`tech-dot ${activeIndex === i ? 'active' : ''}`}
                      onClick={() => handleFeatureClick(i)}
                      aria-label={`Feature ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why You Need CCTV Section */}
      <section className="why-cctv-section">
        <div className="container">
          <div className="why-cctv-header">
            <h2>Why You Need CCTV?</h2>
            <p>The evidence is clear visible, high-quality surveillance is the single most effective deterrent against crime and the best tool for post-incident resolution.</p>
          </div>

          <div className="why-cctv-spotlight">
            <div className="spotlight-image">
              <img src="/assets/service/live view.jpg" alt="Live View Surveillance" loading="lazy" />
              <div className="live-tag">
                <span className="live-dot"></span>
                LIVE VIEW
              </div>
            </div>
            <div className="spotlight-text">
              <h3>Easy to take immediate action</h3>
              <p>Seeing is responding. Our high-speed live view technology allows you to monitor your property in real-time from anywhere in the world. Identify unauthorized access instantly and take immediate action—whether it's communicating through two-way audio or alerting authorities before the incident even begins.</p>

            </div>
          </div>

          <div className="why-cctv-grid">
            <div className="why-card">
              <div className="why-card-icon">
                <Shield size={28} />
              </div>
              <h3>Your First Line of Defense</h3>
              <p>Prevent incidents before they happen with prominent, high-definition surveillance that makes intruders think.</p>
            </div>


            <div className="why-card">
              <div className="why-card-icon">
                <Eye size={28} />
              </div>
              <h3>24/7 Monitoring</h3>
              <p>Your property never sleeps. Motion-triggered recording and live viewing from your phone means you're always in control, day and night.</p>
            </div>

            <div className="why-card">
              <div className="why-card-icon">
                <Monitor size={28} />
              </div>
              <h3>Evidence Success Rate</h3>
              <p>CCTV footage is accepted as primary evidence in the vast majority of criminal prosecutions, dramatically improving outcomes for victims.</p>
            </div>

            <div className="why-card">
              <div className="why-card-icon">
                <Zap size={28} />
              </div>
              <h3>Faster Response</h3>
              <p>Live remote-monitoring means incidents can be verified and reported in real time cutting emergency response times significantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Last CTA */}
      <section className="detail-cta">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Secure Your Premises?</h2>
            <p>Join hundreds of satisfied clients who trust Safehive for their security needs.</p>
            <button onClick={() => onNavigate('quote')} className="btn-primary btn-large">Book Your Free Survey Now</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CCTVPage;
