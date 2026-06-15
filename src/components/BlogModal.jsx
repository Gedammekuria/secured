import React, { useEffect } from 'react';
import { X, Calendar, User, Clock, Share2, MessageCircle } from 'lucide-react';

const BlogModal = ({ post, onClose }) => {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!post) return null;

  return (
    <div 
      className="blog-modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 37, 64, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        animation: 'fadeIn 0.3s ease'
      }}
      onClick={onClose}
    >
      <div 
        className="blog-modal-content animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          backgroundColor: 'white',
          borderRadius: '32px',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          animation: 'slideUp 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '25px',
            right: '25px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            color: '#0a2540'
          }}
        >
          <X size={24} />
        </button>

        {/* Modal Hero Container */}
        <div style={{ position: 'relative', height: '400px', width: '100%' }}>
          <img 
            src={post.image} 
            alt={post.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '60px 40px 40px',
            background: 'linear-gradient(to top, rgba(10, 37, 64, 0.95) 0%, transparent 100%)',
            color: 'white'
          }}>
            <div className="d-flex gap-4 mb-3 opacity-80" style={{ fontSize: '14px', fontWeight: '600' }}>
              <span className="d-flex align-items-center gap-2"><Calendar size={16} /> {post.date}</span>
              <span className="d-flex align-items-center gap-2"><Clock size={16} /> 5 min read</span>
              <span className="d-flex align-items-center gap-2"><User size={16} /> {post.author}</span>
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', lineHeight: '1.2', margin: 0 }}>{post.title}</h2>
          </div>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '60px 40px' }}>
          <div className="blog-post-body" style={{ fontSize: '18px', lineHeight: '1.8', color: '#425466', maxWidth: '850px', margin: '0 auto' }}>
            <p className="lead" style={{ fontSize: '22px', color: '#0a2540', fontWeight: '600', marginBottom: '32px' }}>
              {post.excerpt}
            </p>
            
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            
            {!post.content && (
              <>
                <h3 style={{ color: '#0a2540', marginTop: '40px', marginBottom: '20px' }}>The Importance of Advanced Surveillance</h3>
                <p>In today's rapidly evolving security landscape, having a reliable surveillance system is no longer a luxury—it's a necessity. Clarity and reliability are the keys to a successful security strategy.</p>
                
                <blockquote style={{ borderLeft: '4px solid #635bff', padding: '20px 30px', margin: '40px 0', background: '#f8fafc', fontStyle: 'italic', borderRadius: '0 16px 16px 0' }}>
                  "Security is about the peace of mind that comes from knowing you are protected by the best technology available."
                </blockquote>
              </>
            )}

            <div className="mt-12 pt-12 border-top d-flex justify-content-between align-items-center" style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #f1f5f9' }}>
               <div className="d-flex gap-3">
                  <button className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', background: '#f1f5f9', border: 'none', color: '#0a2540' }}><Share2 size={18} /></button>
                  <button className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', background: '#f1f5f9', border: 'none', color: '#0a2540' }}><MessageCircle size={18} /></button>
               </div>
               <button 
                 onClick={onClose}
                 className="btn-primary" 
                 style={{ padding: '14px 30px', borderRadius: '14px', fontSize: '15px' }}
               >
                 Close Article
               </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default BlogModal;
