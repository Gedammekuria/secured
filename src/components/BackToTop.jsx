import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top coordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className={`back-to-top ${isVisible ? 'visible' : ''}`} onClick={scrollToTop}>
      <ChevronUp size={24} strokeWidth={3} />
      <style dangerouslySetInnerHTML={{ __html: `
        .back-to-top {
          position: fixed;
          bottom: 30px;
          left: 30px;
          width: 50px;
          height: 50px;
          background: var(--primary, #635bff);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1500;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 25px rgba(99, 91, 255, 0.4);
        }

        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .back-to-top:hover {
          background: var(--primary-hover, #7b73ff);
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(99, 91, 255, 0.5);
        }

        @media (max-width: 768px) {
          .back-to-top {
            bottom: 20px;
            left: 20px;
            width: 44px;
            height: 44px;
          }
        }
      `}} />
    </div>
  );
};

export default BackToTop;
