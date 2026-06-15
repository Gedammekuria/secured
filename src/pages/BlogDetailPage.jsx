import React, { useEffect } from 'react';
import { Calendar, User, ArrowLeft, Share2, MessageCircle, Clock } from 'lucide-react';

const BlogDetailPage = ({ post, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!post) return null;

  return (
    <div className="blog-detail-page pb-24">
      {/* Hero Header */}
      <section className="blog-hero text-white text-center" style={{ paddingBottom: '160px' }}>
        <div className="container">
          <button
            onClick={onBack}
            className="badge-light mb-4 text-center cursor-pointer"
            style={{ border: 'none', background: 'rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Blog
          </button>
          <div className="d-flex justify-content-center gap-4 mb-4 opacity-70" style={{ fontSize: '14px', fontWeight: '600' }}>
            <span className="d-flex align-items-center gap-2"><Calendar size={16} /> {post.date}</span>
            <span className="d-flex align-items-center gap-2"><Clock size={16} /> 5 min read</span>
            <span className="d-flex align-items-center gap-2"><User size={16} /> {post.author}</span>
          </div>
          <h1 className="display-4 font-weight-bold mb-4" style={{ maxWidth: '900px', margin: '0 auto' }}>{post.title}</h1>
        </div>
      </section>

      {/* Article Content */}
      <section className="container" style={{ marginTop: '-100px', position: 'relative', zIndex: 10 }}>
        <div className="bg-white rounded-32 shadow-lg overflow-hidden">
          <img src={post.image} alt={post.title} style={{ width: '100%', height: '500px', objectFit: 'cover' }} />

          <div className="p-5 p-md-5 mx-auto" style={{ maxWidth: '900px', padding: '60px 40px' }}>
            <div className="blog-post-body" style={{ fontSize: '18px', lineHeight: '1.8', color: '#425466' }}>
              <p className="lead" style={{ fontSize: '22px', color: '#0a2540', fontWeight: '600', marginBottom: '32px' }}>
                {post.excerpt}
              </p>

              <div dangerouslySetInnerHTML={{ __html: post.content }} />

              {/* Fallback content if HTML is missing */}
              {!post.content && (
                <>
                  <h3 style={{ color: '#0a2540', marginTop: '40px', marginBottom: '20px' }}>The Importance of Advanced Surveillance</h3>
                  <p>In today's rapidly evolving security landscape, having a reliable surveillance system is no longer a luxury—it's a necessity. Whether you are protecting a residential property or a complex commercial facility, the quality of your benefit and the intelligence of your software determine your level of peace of mind.</p>

                  <p>Our engineering team at SafeHive focuses on three core pillars: Clarity, Reliability, and Accessibility. By combining 4K resolution with AI-powered detection, we ensure that every event is recorded with precision and that you are alerted only when it truly matters.</p>

                  <blockquote style={{ borderLeft: '4px solid #635bff', padding: '20px 30px', margin: '40px 0', background: '#f8fafc', fontStyle: 'italic', borderRadius: '0 16px 16px 0' }}>
                    "Security is not a product, but a process. It starts with a comprehensive survey and ends with a robust, scalable system that grows with your needs."
                  </blockquote>

                  <h3 style={{ color: '#0a2540', marginTop: '40px', marginBottom: '20px' }}>Key Takeaways</h3>
                  <ul>
                    <li>Higher resolution leads to better identification.</li>
                    <li>Integrated systems offer superior control.</li>
                    <li>Professional installation ensures no blind spots.</li>
                    <li>Remote access keeps you protected 24/7.</li>
                  </ul>
                </>
              )}
            </div>

            <div className="mt-12 pt-12 border-top d-flex justify-content-between align-items-center" style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #f1f5f9' }}>
              <div className="d-flex gap-3">
                <button className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', background: '#f1f5f9', border: 'none', color: '#0a2540' }}><Share2 size={18} /></button>
                <button className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', background: '#f1f5f9', border: 'none', color: '#0a2540' }}><MessageCircle size={18} /></button>
              </div>
              <button onClick={onBack} className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '12px', background: 'transparent', border: '1.5px solid #e2e8f0', color: '#64748b', fontWeight: '700' }}>
                Back to Blog List
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogDetailPage;
