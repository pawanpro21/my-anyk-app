import React from 'react';

export default function Footer() {
  return (
    <footer className="anyk-footer">
      
      {/* Follow Us Section */}
      <div className="anyk-follow-container">
        <h3 className="anyk-follow-title">Follow Us</h3>
        
        <div className="anyk-social-icons">
          
          <a className="anyk-social-icon social-facebook" href="https://www.facebook.com/share/1LuWWj6fqy/" target="_blank" rel="noreferrer" aria-label="Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>

          <a className="anyk-social-icon social-x" href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2H21l-6.53 7.462L22 22h-5.828l-4.564-5.967L6.39 22H3.633l6.984-7.984L2 2h5.976l4.126 5.448L18.244 2Zm-1.02 18.257h1.623L7.095 3.654H5.353l11.87 16.603Z"/>
            </svg>
          </a>

          <a className="anyk-social-icon social-instagram" href="https://www.instagram.com/anykoriginals?igsh=MXkwZ2s3bW5oMnlwZA==" target="_blank" rel="noreferrer" aria-label="Instagram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>

          <a className="anyk-social-icon social-linkedin" href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>

          <a className="anyk-social-icon social-youtube" href="https://youtube.com/@anykoriginals?si=AI1oBSEigV5sfreI" target="_blank" rel="noreferrer" aria-label="YouTube">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
            </svg>
          </a>

        </div>
      </div>

      {/* Copyright Text */}
      <p className="anyk-copyright">
        © Copyright 2026 anykoriginals.com. All rights reserved.
      </p>

    </footer>
  );
}
