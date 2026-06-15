import React, { useEffect } from 'react';
import { Bell, Shield, ShieldCheck, AlertTriangle, Smartphone, Wifi, ArrowRight, CheckCircle, Zap, Radio, Lock, Activity } from 'lucide-react';

const AlarmPage = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ajaxFeatures = [
    { title: "Jewish Technology", desc: "Patented radio technology for secure, long-range communication.", icon: <Radio /> },
    { title: "Anti-Jamming", desc: "Automatically detects interference and switches to clean frequencies.", icon: <Zap /> },
    { title: "Instant Alerts", desc: "Receive notifications in 0.15 seconds on your mobile devices.", icon: <Smartphone /> },
    { title: "5-Year Battery", desc: "Devices designed to last years without needing maintenance.", icon: <Activity /> }
  ];

  return (
    <div className="service-detail-page alarm-page animate-fade-in">
      {/* Simplified Hero Section */}
      <section className="detail-hero hero-minimal" style={{
        background: '#0a2540'
      }}>
        <div className="container text-center">
          <div className="hero-content-minimal mx-auto max-w-2xl">
            <h1 className="text-white">Smart Alarm Systems</h1>
            <p className="text-white">Professional-grade security that identifies threats instantly. From Ajax wireless to robust GSM systems.</p>
            <div className="hero-actions justify-center">
              <button onClick={() => onNavigate('alarm-quote')} className="btn-primary ">Request my alarm system</button>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Info Bar */}
      <section className="trust-info-bar warning-theme">
        <div className="container text-center">
          <div className="info-flex">
            <div className="info-point"><strong>0.15s</strong> Response</div>
            <div className="info-divider"></div>
            <div className="info-point"><strong>Up to 2,000m</strong> Range detectors Communicate</div>
            <div className="info-divider"></div>
            {/* <div className="info-point"><strong>GSM+IP</strong> Backup</div> */}
          </div>
        </div>
      </section>

      {/* Ajax Section */}
      <section id="ajax" className="ajax-detail py-20">
        <div className="container">
          <div className="split-row items-center">
            <div className="split-text">
              <span className="pill warning">Best Wireless Security</span>
              <h2>Ajax Alarm Security System</h2>
              <p>Ajax systems are designed for both residential and commercial use, offering unmatched reliability and professional-grade security that looks great in any environment.</p>

              <div className="ajax-features-list mt-10">
                {ajaxFeatures.map((f, i) => (
                  <div key={i} className="ajax-feature-item">
                    <div className="icon-box">{f.icon}</div>
                    <div>
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="split-image">
              <div className="image-frame warning">
                <img src="/assets/service/ajax.jpg" alt="Ajax Detector" className="rounded-2xl shadow-2xl" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GSM System Section */}
      <section className="gsm-detail py-24 bg-gray-50">
        <div className="container">
          <div className="split-row items-center reverse">
            <div className="split-text">
              <span className="pill warning">Reliable & Affordable</span>
              <h2>GSM Burglar Alarm Systems</h2>
              <p>Our GSM systems use cellular technology to ensure your security stay connected even if your internet line is cut. A reliable solution for properties where internet access might be unstable.</p>

              <ul className="spec-checklist mt-8">
                <li><CheckCircle size={18} className="text-orange-500" /> Multi-zone intrusion detection (Doors, Windows, Motion)</li>
                <li><CheckCircle size={18} className="text-orange-500" /> SMS and Automated Voice Calls on alarm trigger</li>
                <li><CheckCircle size={18} className="text-orange-500" /> Internal battery backup for power failure scenarios</li>
                <li><CheckCircle size={18} className="text-orange-500" /> Simple to use remote controls and keypad entry</li>
              </ul>


            </div>
            <div className="split-image">
              <div className="image-frame">
                <img src="/assets/service/GSm burglar alarm.jpg" alt="Burglar Alarm" className="rounded-2xl shadow-xl" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section className="security-layers py-20">
        <div className="container text-center">
          <h2>Layers of Protection</h2>
          <p className="max-w-2xl mx-auto mb-16">We don't just install alarms; we build a peace around your property.</p>

          <div className="layers-grid">
            <div className="layer-card">
              <div className="layer-icon"><Bell /></div>
              <h4>Deterrence</h4>
              <p>Visible outdoor sirens and high-profile signage to prevent break-ins before they happen.</p>
            </div>
            <div className="layer-card">
              <div className="layer-icon"><ShieldCheck /></div>
              <h4>Detection</h4>
              <p>Highly sensitive motion sensors and glass-break detectors that identify intruders instantly.</p>
            </div>
            <div className="layer-card">
              <div className="layer-icon"><Activity /></div>
              <h4>Response</h4>
              <p>Immediate mobile alerts and automated sirens to alert neighbors and security teams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Last CTA */}
      <section className="detail-cta ">
        <div className="container">
          <div className="cta-box">
            <h2>Don't Wait For An Intrusion</h2>
            <p>Secure your property today with the most reliable alarm systems.</p>
            <button onClick={() => onNavigate('alarm-quote')} className="btn-primary ">Request Your Free Survey</button>

          </div>
        </div>
      </section>
    </div>
  );
};

export default AlarmPage;
