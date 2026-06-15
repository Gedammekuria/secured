import React, { useEffect } from 'react';
import { Camera, Bell, CheckCircle, Clock, Smartphone, Users, Shield, Zap, Globe, Eye, ArrowRight } from 'lucide-react';

const ServicesPage = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="services-page-view animate-fade-in">
      <section className="services-hero">
        <div className="container">
          <h1>Expert Security Solutions</h1>
          <p>Protecting what matters most with advanced surveillance and smart alarm systems.</p>
        </div>
      </section>
      {/* CCTV Section: Image Left, Text Right */}
      <section className="service-split cctv-bg" id="cctv-section">
        <div className="container">
          <div className="split-row">
            <div className="split-image">
              <div className="image-frame">
                <img src="/assets/service/camera install.png" alt="Professional CCTV Systems" loading="lazy" />
                <div className="image-overlay-accent"></div>
              </div>
            </div>
            <div className="split-text">
              <h2>CCTV Camera Systems</h2>
              <p>Experience total visibility with our state-of-the-art CCTV solutions. From high-definition indoor monitoring to rugged outdoor horizontally and vertically zoom systems, we ensure every corner of your property is protected.</p>

              <ul className="service-features-list">
                <li>
                  <div className="feature-icon-sm"><Users size={18} /></div>
                  <div>
                    <strong>IP Cameras</strong>
                    <span>High-definition digital cameras that transmit video data over a network cable (LAN) or internet connection.</span>
                  </div>
                </li>
                <li>
                  <div className="feature-icon-sm"><Shield size={18} /></div>
                  <div>
                    <strong>Analog Cameras</strong>
                    <span>transmit video signals over coaxial cables to a central Digital Video Recorder (DVR).</span>
                  </div>
                </li>
                <li>
                  <div className="feature-icon-sm"><Camera size={18} /></div>
                  <div>
                    <strong>PTZ Cameras</strong>
                    <span>allow operators to remotely move the lens horizontally (pan), vertically (tilt), and zoom in for close-up detail.</span>
                  </div>
                </li>
                <li>
                  <div className="feature-icon-sm"><Zap size={18} /></div>
                  <div>
                    <strong>Wireless Systems</strong>
                    <span>Security setups that transmit video data over Wi-Fi or cellular networks,.</span>
                  </div>
                </li>
                <li>
                  <div className="feature-icon-sm"><Eye size={18} /></div>
                  <div>
                    <strong>Mini Cameras</strong>
                    <span>Compact, low-profile cameras designed for discreet surveillance.</span>
                  </div>
                </li>
              </ul>

              <div className="service-actions">
                <button onClick={() => onNavigate('quote')} className="btn-primary">Quote Now</button>
                <button onClick={() => onNavigate('cctv')} className="btn-outline">View More <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alarm Section: Text Left, Image Right (Reverted) */}
      <section className="service-split alarm-bg" id="alarm-section">
        <div className="container">
          <div className="split-row">
            <div className="split-text">
              <h2>Alarm Systems</h2>
              <p>Detect threats before they escalate. Our intelligent alarm systems combine instant sensors with professional-grade security to provide reliable protection for your home or business.</p>

              <ul className="service-features-list">
                <li>
                  <div className="feature-icon-sm warning"><Shield size={18} /></div>
                  <div>
                    <strong>Ajax Security</strong>
                    <span>Wireless anti-jamming technology and instant alerts.</span>
                  </div>
                </li>
                <li>
                  <div className="feature-icon-sm warning"><Bell size={18} /></div>
                  <div>
                    <strong>GSM Burglar Alarms</strong>
                    <span>Multi-zone intrusion detection sensors.</span>
                  </div>
                </li>
              </ul>

              <div className="service-actions">
                <button onClick={() => onNavigate('quote')} className="btn-primary warning-btn">Quote Now</button>
                <button onClick={() => onNavigate('alarm')} className="btn-outline">View More <ArrowRight size={16} /></button>
              </div>
            </div>
            <div className="split-image">
              <div className="image-frame">
                <img src="/assets/service/ajax control.jpg" alt="Smart Alarm Systems" loading="lazy" />
                <div className="image-overlay-accent warning"></div>
              </div>
            </div>
          </div>
        </div>
      </section>



      <section className="services-support">
        <div className="container">
          <div className="support-grid">
            <div className="support-item">
              <span className="support-icon"><Clock size={28} /></span>
              <h4>24/7 Monitoring</h4>
              <p>Professional monitoring services for round-the-clock peace of mind.</p>
            </div>
            <div className="support-item">

              <span className="support-icon"><Smartphone size={28} /></span>
              <h4>Access with Smart Devices</h4>
              <p>Control and monitor your entire security suite from your iOS or Android device.</p>
            </div>
            <div className="support-item">
              <span className="support-icon"><Users size={28} /></span>
              <h4>Professional Support</h4>
              <p>Expert engineers available for technical assistance whenever you need.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="container cta-container">
          <div className="cta-content">
            <h2>Elevate Your Security Today</h2>
            <p>Ready to experience professional-grade protection? Our experts are standing by to design your custom security blueprint.</p>
            <button onClick={() => onNavigate('quote')} className="btn-primary">Get Your Free Quote Now</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
