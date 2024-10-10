import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">About Us</h3>
          <ul className="footer-links">
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/team">Our Team</Link></li>
            <li><Link to="/careers">Careers</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Resources</h3>
          <ul className="footer-links">
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/tutorials">Tutorials</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Contact</h3>
          <ul className="footer-links">
            <li><a href="mailto:info@cloudblog.com">info@cloudblog.com</a></li>
            <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
            <li><Link to="/contact">Contact Form</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Follow Us</h3>
          <ul className="footer-links">
            <li><a href="https://twitter.com/cloudblog" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li><a href="https://facebook.com/cloudblog" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://linkedin.com/company/cloudblog" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Cloud Blog. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;