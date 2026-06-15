import React, { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import BlogModal from '../components/BlogModal';

const BlogPage = () => {
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const posts = [
    {
      id: 1,
      title: "5 Reasons to Install a 4K CCTV System Today",
      excerpt: "Resolution matters more than ever. Discover why 4K is the new standard for modern surveillance and how it helps in identifying intruders.",
      content: `
        <h3 style="color: #0a2540; margin-bottom: 20px;">1. Superior Detail & Clarity</h3>
        <p>A 4K camera has four times the resolution of standard 1080p. This means you can zoom in on faces, license plates, and other critical details without losing clarity.</p>
        
        <h3 style="color: #0a2540; margin-top: 40px; margin-bottom: 20px;">2. Future-Proofing Your Security</h3>
        <p>As display technology evolves, having 1080p or lower resolution will quickly feel outdated. 4K ensures your footage is usable for years to come.</p>
        
        <h3 style="color: #0a2540; margin-top: 40px; margin-bottom: 20px;">3. Better Night Vision Performance</h3>
        <p>Modern 4K sensors are designed with larger pixels that capture more light, providing significantly better performance in low-light environments compared to older HD models.</p>
      `,
      date: "June 12, 2026",
      author: "Security Expert",
      tag: "CCTV",
      image: "https://images.unsplash.com/photo-1557597774-951872b3fc28?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "Self-Monitoring vs. Professional Monitoring",
      excerpt: "Is it enough to just have alerts on your phone? We break down the pros and cons of professional monitoring centers vs self-managed systems.",
      content: `
        <h3 style="color: #0a2540; margin-bottom: 20px;">The Rise of Self-Monitoring</h3>
        <p>With smart home apps, many users feel they can manage their own security. While this saves on monthly costs, it assumes you are always by your phone and have a stable connection.</p>
        
        <h3 style="color: #0a2540; margin-top: 40px; margin-bottom: 20px;">The Professional Advantage</h3>
        <p>Professional monitoring ensures that even if you are asleep, in a meeting, or without signal, a trained operator is ready to dispatch emergency services immediately.</p>
      `,
      date: "June 08, 2026",
      author: "Support Team",
      tag: "Alarm Systems",
      image: "https://images.unsplash.com/photo-1558002038-103792e07a70?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "Protecting Your Business: A Guide to Commercial Security",
      excerpt: "Commercial properties have unique security challenges. Learn how to design an integrated ecosystem that protects your assets and employees.",
      content: `
        <h3 style="color: #0a2540; margin-bottom: 20px;">Securing Large Perimeters</h3>
        <p>Commercial security isn't just about cameras; it's about integrated access control, perimeter alarms, and intelligent software that can track movement across thousands of square feet.</p>
      `,
      date: "May 28, 2026",
      author: "Director",
      tag: "Business",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="blog-page pb-20">
      {/* Hero Header */}
      <section className="blog-hero py-24 bg-dark text-white text-center" style={{ paddingBottom: '140px' }}>
        <div className="container animate-fade-up">
          <div className="badge-light mb-4" style={{ backgroundColor: 'rgba(99, 91, 255, 0.15)', color: '#a89fff', border: '1px solid rgba(159, 150, 255, 0.2)' }}>Insights & News</div>
          <h1 className="display-4 font-weight-bold mb-3">The Safehive Blog</h1>
          <p className="lead opacity-70 mx-auto" style={{ maxWidth: '650px', fontSize: '1.1rem' }}>
            Expert advice, technical guides, and the latest trends in the world of smart security. Straight from our engineering team to you.
          </p>
        </div>
      </section>

      {/* Blog Cards Grid */}
      {/* <section className="container" style={{ marginTop: '40px', position: 'relative', zIndex: 10, paddingBottom: '60px' }}>
        <div className="content-grid">
          {posts.map((post, index) => (
            <div key={index} className="blog-card bg-white rounded-32 shadow-lg overflow-hidden border-0 d-flex flex-column h-100">
              <div style={{ height: '220px', width: '100%', overflow: 'hidden' }}>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} 
                  className="transition-transform"
                />
              </div>
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontSize: '12px', fontWeight: 'bold', color: '#635bff', opacity: 0.8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {post.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {post.author}</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', lineHeight: '1.4', color: '#0a2540', marginBottom: '16px' }}>{post.title}</h3>
                <p style={{ fontSize: '15px', color: '#425466', lineHeight: '1.6', marginBottom: '0', flex: 1 }}>{post.excerpt}</p>
                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                  <button 
                    onClick={() => setSelectedPost(post)}
                    style={{ background: 'none', border: 'none', padding: 0, color: '#635bff', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    Read Full Article <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* Blog Detail Modal */}
      {selectedPost && (
        <BlogModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Newsletter / CTA Section to fill the page */}
      <section className="container section-margin">
        <div className="bg-light rounded-32 text-center" style={{ backgroundColor: '#f8fafc', padding: 'min(60px, 8vw)' }}>
          <h2 className="font-weight-bold mb-3" style={{ color: '#0a2540' }}>Stay Informed</h2>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: '550px' }}>Subscribe to our newsletter to receive the latest security tips and exclusive offers directly in your inbox.</p>
          <div className="mx-auto flex-mobile-column" style={{ maxWidth: '500px', display: 'flex', gap: '12px' }}>
            <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
            <button className="btn-primary" style={{ padding: '16px 28px', borderRadius: '12px', whiteSpace: 'nowrap' }}>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
