import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Camera, Bell, Info } from 'lucide-react';

const FAQPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['All', 'CCTV Camera', 'Alarm System'];

  const faqs = [
    {
      category: "CCTV Camera",
      questions: [
        {
          q: "How long are CCTV recordings stored?",
          a: "Most of our systems are configured to store between 14 to 30 days of footage. This depends on the number of cameras, the recording quality, and the size of the Hard Drive installed. We use H.265+ compression to maximize storage efficiency."
        },
        {
          q: "Can I view my cameras on my phone when I'm away?",
          a: "Absolutely. All our systems come with secure mobile integration. You can view live feeds, playback recordings, and receive instant motion alerts directly on your smartphone from anywhere in the world with an internet connection."
        },
        {
          q: "What is the difference between IP and Analog cameras?",
          a: "IP (Internet Protocol) cameras transmit digital signals over a network cable, offering higher resolution and more advanced features like smart analytics. Analog cameras use coaxial cables and generally have lower resolution than IP cameras."
        },

        {
          q: "Will my cameras still record if my internet goes down?",
          a: "Yes, The cameras send footage directly to the NVR or DVR recorder via physical cables or a local network switch. The system will continue to record 24/7 . However, you will temporarily lose the ability to check live views  until the internet is restored."
        },
        {
          q: "What happens when the storage hard drive fills up?",
          a: "You don't need to manually delete files. The system is designed to run on a continuous loop. When the hard drive hits 100% capacity, it automatically overwrites the oldest footage first. If your system holds 30 days of video, Day 31 will automatically replace Day 1."
        },
        {
          q: "Do I need to clean the camera lenses?",
          a: "Yes, occasionally. Outdoor cameras are exposed to dust, rain spots, and insects. Every 3 to 6 months: Gently wipe the camera lens housing with a soft microfiber cloth and a bit of water or lens cleaner. Never use harsh chemicals like Windex or abrasive paper towels, as they can scratch the lens or degrade the anti-glare coatings, ruining night vision clarity."
        },
        {
          q: "What happens to the CCTV system during a power outage?",
          a: "When the power cuts out, the entire system shuts down and recording stops. We highly recommend plugging the main recorder box (NVR/DVR) into an Uninterruptible Power Supply (UPS). A UPS is a backup battery surge protector that will keep your cameras running for an extra 20 to 60 minutes during a blackout, giving you continuous security coverage.Once power returns, the system is programmed to reboot automatically and resume recording right where it left off. You do not need to reprogram anything."
        }
      ]
    },
    {
      category: "Alarm System",
      questions: [
        {
          q: "Is the alarm systems require a monthly subscription?",
          a: "No, neither the Ajax system nor a standard GSM Burglar Alarm requires a mandatory monthly subscription to protect your home. You can fully self-monitor both systems for free."
        },
        {
          q: "What happens if my Wi-Fi goes down?",
          a: "Our Ajax Alarm systems use a combination of Ethernet, Wi-Fi, and Dual SIM cards (cellular) to ensure that your security never goes offline, even if your home internet is interrupted."
        },
        {
          q: "Are the sensors pet-friendly?",
          a: "Yes, our smart motion detectors use algorithms to ignore pets up to 20kg and 50cm in height, preventing false alarms while still detecting human movement reliably."
        },
        {
          q: "Can I call me and send texts on the alarm system?",
          a: "Yes, both systems use a cellular SIM card inside the main panel to reach your phone, Ajax uses calls and texts purely as an emergency backup to its smartphone app, whereas a GSM Alarm relies on calls and texts as its primary way of communicating with you."
        },
        {
          q: "Do I need internet for the alarm to communicate with me?",
          a: "In Ajax System: No, but it prefers it. Ajax uses dual-path communication. Its main connection is internet-based (via an Ethernet cable to your router or Wi-Fi). If your home internet goes down, it instantly and automatically fails over to its internal mobile SIM card to send messages and make emergency calls. In GSM Alarm: It doesn't use home internet at all. A standard GSM panel operates strictly like an old-school mobile phone. It relies entirely on the cellular towers via the SIM card slotted directly into the back of the panel to route its calls and text messages to you. "
        },
        {
          q: "What happens if I move houses or want to expand the system later?",
          a: " For both alarm systems if you expand your home, buying a new sensor and pairing it you can do easily. If you move houses, you can take the system with you and reinstall it at your new property. "
        },
        {
          q: "How does a power outage affect my Ajax or GSM alarm system?",
          a: "When the main electricity grid goes down, neither system stops working immediately. Both are engineered with internal battery backups so an intruder cannot disable your security simply by tripping your main circuit breaker or cutting the power lines."
        }


      ]
    }
  ];

  const flatFaqs = faqs.flatMap(cat => cat.questions.map(q => ({ ...q, category: cat.category })));

  const filteredFaqs = activeFilter === 'All'
    ? flatFaqs
    : flatFaqs.filter(faq => faq.category === activeFilter);

  return (
    <div className="faq-page pb-20">
      {/* Hero Header */}
      <section className="faq-hero text-white text-center  py-24 rounded-32">
        <div className="container">
          <h1 className="display-4 font-weight-bold mb-6" >Frequently Asked Questions</h1>
          <p className="lead opacity-70 mx-auto" style={{ maxWidth: '700px' }}>
            You need to know about our installed systems.
          </p>
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
              onClick={() => {
                setActiveFilter(cat);
                setOpenIndex(0); // Reset accordion on filter
              }}
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

      {/* FAQ Content */}
      <section className="container mt-5" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="faq-container bg-white rounded-32 shadow-lg">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item border-bottom py-4 ${openIndex === index ? 'active' : ''}`}
              >
                <div
                  className="faq-question d-flex align-items-center justify-content-between cursor-pointer"
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}
                >
                  <div className="d-flex align-items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="faq-icon-small">
                      {faq.category === 'Alarm System' ? <Bell size={18} /> :
                        faq.category === 'CCTV Camera' ? <Camera size={18} /> : <Info size={18} />}
                    </div>
                    <h4 className="h5 mb-0 font-weight-bold" style={{ margin: 0 }}>{faq.q}</h4>
                  </div>
                  <div className="faq-chevron">
                    {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                <div className="faq-answer">
                  <p className="text-muted mb-0 lead" style={{ fontSize: '16px' }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="p-5 text-center text-muted">
                No questions found in this category.
              </div>
            )}
          </div>

          {/* Contact CTA */}

          {/*
          <div className="mt-5 text-center p-5 bg-gray-50 rounded-24" style={{ padding: '40px', marginTop: '40px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '24px', textAlign: 'center' }}>
            <HelpCircle className="text-primary mb-3" size={40} style={{ color: '#635bff', marginBottom: '20px' }} />
            <h3>Still have questions?</h3>
            <p className="text-muted mb-4">If you can't find what you're looking for, our friendly team is ready to help.</p>
            <div className="mx-auto flex-mobile-column" style={{ maxWidth: '450px', display: 'flex', gap: '10px' }}>

              <button
                onClick={() => onNavigate('cctv-quote')}
                className="btn-primary"
                style={{
                  padding: '14px 24px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  fontWeight: '700'
                }}
              >
                Get Support
              </button>
            </div>
          </div>
          */}
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
