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
        }
      ]
    },
    {
      category: "Alarm System",
      questions: [
        {
          q: "Do your alarm systems require a monthly subscription?",
          a: "We offer both self-monitored and professionally monitored options. With a self-monitored system, you receive alerts directly and there are no mandatory monthly fees. Professional monitoring includes access to our 24/7 Response Center for a small monthly service fee."
        },
        {
          q: "What happens if my Wi-Fi goes down?",
          a: "Our Ajax Alarm systems use a combination of Ethernet, Wi-Fi, and Dual SIM cards (cellular) to ensure that your security never goes offline, even if your home internet is interrupted."
        },
        {
          q: "Are the sensors pet-friendly?",
          a: "Yes, our smart motion detectors use algorithms to ignore pets up to 20kg and 50cm in height, preventing false alarms while still detecting human movement reliably."
        }
      ]
    }
  ];

  const flatFaqs = faqs.flatMap(cat => cat.questions.map(q => ({ ...q, category: cat.category })));

  const filteredFaqs = activeFilter === 'All'
    ? flatFaqs
    : flatFaqs.filter(faq => faq.category === activeFilter);

  return (
    <div className="faq-page pb-24">
      {/* Hero Header */}
      <section className="faq-hero text-white text-center">
        <div className="container">
          <h1 className="display-4 font-weight-bold mb-4">Frequently Asked Questions</h1>
          <p className="lead opacity-70 mx-auto" style={{ maxWidth: '700px' }}>
            Everything you need to know about our installed systems.
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
          <div className="mt-5 text-center p-5 bg-gray-50 rounded-24" style={{ padding: '40px', marginTop: '40px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '24px', textAlign: 'center' }}>
            <HelpCircle className="text-primary mb-3" size={40} style={{ color: '#635bff', marginBottom: '20px' }} />
            <h3>Still have questions?</h3>
            <p className="text-muted mb-4">If you can't find what you're looking for, our friendly team is ready to help.</p>
            <div className="mx-auto flex-mobile-column" style={{ maxWidth: '450px', display: 'flex', gap: '10px' }}>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: '15px'
                }}
              />
              <button
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
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
