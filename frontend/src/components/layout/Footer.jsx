import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-glow footer-glow-one" />
      <div className="footer-glow footer-glow-two" />

      <div className="container">
        <div className="footer-top">

          <motion.div
            className="footer-brand-column"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Link to="/" className="footer-brand">
              <span className="footer-brand-icon">
                <i className="bx bx-plus" />
              </span>

              <span>
                <strong>Hospital Management</strong>
                <small>Healthcare Platform</small>
              </span>
            </Link>

            <p>
              Making healthcare simpler, smarter and more connected
              for everyone. Discover trusted care and a better
              healthcare experience in one place.
            </p>

            <div className="footer-socials">
              <a href="#facebook" aria-label="Facebook">
                <i className="bx bxl-facebook" />
              </a>

              <a href="#instagram" aria-label="Instagram">
                <i className="bx bxl-instagram" />
              </a>

              <a href="#linkedin" aria-label="LinkedIn">
                <i className="bx bxl-linkedin" />
              </a>

              <a href="#twitter" aria-label="Twitter">
                <i className="bx bxl-twitter" />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="footer-link-column"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h3>Quick Links</h3>

            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/doctors">Find a Doctor</Link>
            <Link to="/departments">Departments</Link>
          </motion.div>

          <motion.div
            className="footer-link-column"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ once: true, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h3>Patient Care</h3>

            <Link to="/patient/appointments/book">
              Book Appointment
            </Link>

            <Link to="/patient/appointments">
              My Appointments
            </Link>

            <Link to="/ai-assistant">
              AI Assistant
            </Link>

            <Link to="/contact">
              Contact Support
            </Link>
          </motion.div>

          <motion.div
            className="footer-contact-column"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h3>Get In Touch</h3>

            <div className="footer-contact-item">
              <i className="bx bx-map" />
              <span>All Over India</span>
            </div>

            <div className="footer-contact-item">
              <i className="bx bx-phone" />
              <span>+91 98765 43210</span>
            </div>

            <div className="footer-contact-item">
              <i className="bx bx-envelope" />
              <span>hospitalmanagement125@gmail.com</span>
            </div>

            <div className="footer-emergency">
              <i className="bx bx-first-aid" />

              <div>
                <span>Emergency Assistance</span>
                <strong>Call your local emergency number</strong>
              </div>
            </div>
          </motion.div>

        </div>

        <div className="footer-newsletter">
          <div>
            <span className="footer-newsletter-label">
              Stay Connected
            </span>

            <h3>Healthcare updates, made simple.</h3>
          </div>

          <Link to="/contact" className="footer-newsletter-btn">
            Contact Us
            <i className="bx bx-right-arrow-alt" />
          </Link>
        </div>

        <div className="footer-bottom">
          <p>
            © {currentYear} Hospital Management All rights reserved.
          </p>

          <div className="footer-bottom-links">
            <Link to="/terms">Developed by Pranjal</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;