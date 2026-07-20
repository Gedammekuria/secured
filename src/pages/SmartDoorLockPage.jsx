import React, { useEffect } from 'react';
import { Lock, Fingerprint, Video, Shield, Smartphone, Wifi, CheckCircle, Zap, Eye, DoorOpen, KeyRound, Bell } from 'lucide-react';

const SmartDoorLockPage = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ringFeatures = [
    { title: "HD Video Doorbell", desc: "See, hear, and speak to visitors from your phone, tablet, or PC.", icon: <Video /> },
    { title: "Motion Detection", desc: "Get instant alerts when someone approaches your door, even before they ring.", icon: <Zap /> },
    { title: "Night Vision", desc: "Advanced infrared night vision ensures you see visitors clearly 24/7.", icon: <Eye /> },
    { title: "Two-Way Talk", desc: "Communicate with visitors in real time using built-in speaker and microphone.", icon: <Smartphone /> },
    { title: "Cloud Recording", desc: "Review footage at any time with secure cloud video history.", icon: <Shield /> },
    { title: "Wi-Fi Connected", desc: "Seamlessly connects to your home network for remote access anywhere.", icon: <Wifi /> },
  ];

  const glassFeatures = [
    { icon: <CheckCircle size={18} />, text: "Magnetic lock with 1,200 lbs holding force for frameless glass doors" },
    { icon: <CheckCircle size={18} />, text: "RFID card and PIN code access control" },
    { icon: <CheckCircle size={18} />, text: "Battery backup to prevent lockouts during power failures" },
    { icon: <CheckCircle size={18} />, text: "Audit trail logging see who entered and when" },
    { icon: <CheckCircle size={18} />, text: "Suitable for office, retail, and residential glass entrances" },
    { icon: <CheckCircle size={18} />, text: "Tamper alarm and forced-entry detection alerts" },
  ];

  return (
    <div className="service-detail-page alarm-page animate-fade-in">
      {/* Hero */}
      <section className="detail-hero hero-minimal" style={{ background: '#0a2540' }}>
        <div className="container text-center">
          <div className="hero-content-minimal mx-auto max-w-2xl">
            <h1 className="text-white">Smart Door Lock Systems</h1>
            <p className="text-white">
              Control who enters your property from video verification at the door to biometric fingerprint access and smart glass lock management.
            </p>
            <div className="hero-actions justify-center">
              <button onClick={() => onNavigate('smartdoorlock-quote')} className="btn-primary">Request a Smart Lock Installation</button>
            </div>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="trust-info-bar" style={{}}>
        <div className="container text-center">
          <div className="info-flex">
            <div className="info-point"><strong>Video</strong> Doorbell</div>
            <div className="info-divider"></div>
            <div className="info-point"><strong>Biometric</strong> Fingerprint</div>
            <div className="info-divider"></div>
            <div className="info-point"><strong>Smart Glass</strong> Locks</div>
            <div className="info-divider"></div>
            <div className="info-point"><strong>Remote</strong> Access</div>
          </div>
        </div>
      </section>

      {/* Ring Doorbell Section */}
      <section id="ring-doorbell" className="ajax-detail py-20">
        <div className="container">
          <div className="split-row items-center">
            <div className="split-text">
              {/* <span className="pill" style={{ color: '#111112ff' }}>Smart Entry</span> */}
              <h2>Ring Video Doorbell</h2>
              <p>
                Never miss a visitor. Our Ring Video Doorbell installation gives you a live HD view of your front door on your phone, from anywhere in the world. See who is at the door before they even knock.
              </p>
              <div className="ajax-features-list mt-4">
                {ringFeatures.map((f, i) => (
                  <div key={i} className="ajax-feature-item">
                    <div className="icon-box" style={{ background: 'rgba(30,136,229,0.1)', color: '#1e88e5' }}>{f.icon}</div>
                    <div>
                      <h4>{f.title}</h4>
                      <p style={{ fontSize: "13px" }}>{f.desc}</p>

                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="split-image">
              <div className="image-frame">
                <img
                  src="/assets/service/ring doorbell.png"
                  alt="Ring Video Doorbell"
                  width={600}
                  height={450}
                  className="rounded-2xl shadow-2xl"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biometric Smart Video Door Lock */}
      <section id="biometric-lock" className="gsm-detail py-24 bg-gray-50">
        <div className="container">
          <div className="split-row items-center reverted">
            <div className="split-text">
              {/* <span className="pill" style={{ color: '#111112ff' }}>Highest Security</span> */}
              <h2>Biometric Smart Video Door Lock</h2>
              <p>
                Our Biometric Smart Video Door Locks combine fingerprint authentication, PIN code, RFID card access, and a built-in camera all in one sleek, tamper-proof unit. Perfect for homes and offices that demand the highest level of access control.
              </p>
              <ul className="spec-checklist mt-8">
                <li><CheckCircle size={18} className="text-blue-500" /> Fingerprint recognition unlock in under 0.5 seconds</li>
                <li><CheckCircle size={18} className="text-blue-500" /> Built-in HD camera captures visitor photos on every entry attempt</li>
                <li><CheckCircle size={18} className="text-blue-500" /> Multiple access methods: fingerprint, PIN, RFID card, mobile app</li>
                <li><CheckCircle size={18} className="text-blue-500" /> Auto-lock after door closes no more forgotten unlocked doors</li>
                <li><CheckCircle size={18} className="text-blue-500" /> Tamper alarm activates on forced-entry attempts</li>
                <li><CheckCircle size={18} className="text-blue-500" /> Battery backup with low-battery warning alerts</li>
              </ul>
            </div>
            <div className="split-image">
              <div className="image-frame">
                <img
                  src="/assets/service/smart doorlock.jpg"
                  alt="Biometric Smart Video Door Lock"
                  width={600}
                  height={450}
                  className="rounded-2xl shadow-xl"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Glass Door Locks */}
      <section id="glass-lock" className="security-layers py-20">
        <div className="container">
          <div className="split-row items-center">
            <div className="split-text">
              {/* <span className="pill" style={{ color: '#111112ff' }}>Commercial Grade</span> */}
              <h2>Smart Glass Door Locks</h2>
              <p>
                Designed for offices, retail spaces, and modern commercial environments, our Smart Glass Door Lock solutions secure frameless glass doors with powerful electromagnetic locks and intuitive access control without compromising on aesthetics.
              </p>
              <ul className="spec-checklist mt-8">
                {glassFeatures.map((f, i) => (
                  <li key={i} style={{ color: '#1e88e5' }}>{f.icon} <span style={{ color: '#18191aff' }}>{f.text}</span></li>

                ))}
              </ul>
            </div>
            <div className="split-image">
              <div className="image-frame">
                <img
                  src="/assets/service/smart glass doorlock.jpg"
                  alt="Smart Glass Door Lock"
                  width={600}
                  height={450}
                  className="rounded-2xl shadow-2xl"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Smart Locks */}
      <section className="py-20" style={{ background: '#f8fafc' }}>
        <div className="container text-center">
          <h2>Why Upgrade to Smart Door Locks?</h2>
          <p className="max-w-2xl mx-auto mb-16" style={{ color: 'rgba(10,37,64,0.7)' }}>
            Traditional keys are lost, copied, or forgotten. Smart door locks give you full control know who enters, when, and stop unwanted access instantly.
          </p>
          <div className="layers-grid">
            <div className="layer-card">
              <div className="layer-icon" style={{ background: 'rgba(30,136,229,0.1)', color: '#1e88e5' }}><KeyRound /></div>
              <h4>Keyless Entry</h4>
              <p>Grant and revoke access instantly from your smartphone no keys to lose or duplicate.</p>
            </div>
            <div className="layer-card">
              <div className="layer-icon" style={{ background: 'rgba(30,136,229,0.1)', color: '#1e88e5' }}><Bell /></div>
              <h4>Instant Alerts</h4>
              <p>Receive real-time notifications on every door open, failed attempt, or tamper event.</p>
            </div>
            <div className="layer-card">
              <div className="layer-icon" style={{ background: 'rgba(30,136,229,0.1)', color: '#1e88e5' }}><DoorOpen /></div>
              <h4>Audit Trail</h4>
              <p>Full log of every access event ideal for home security and business compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="detail-cta">
        <div className="container">
          <div className="cta-box">
            <h2>Upgrade Your Entry Security Today</h2>
            <p>Our engineers will visit, assess your doors, and recommend the ideal Smart Lock system for your home or business.</p>
            <button onClick={() => onNavigate('smartdoorlock-quote')} className="btn-primary">Request Your Free Survey</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SmartDoorLockPage;
