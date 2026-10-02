import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Home.css';

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -45 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 45 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const services = [
  {
    icon: 'bx-calendar-check',
    title: 'Easy Appointments',
    description:
      'Book your consultation quickly with a simple and convenient process.',
  },
  {
    icon: 'bx-user-check',
    title: 'Trusted Doctors',
    description:
      'Connect with qualified healthcare professionals across specialties.',
  },
  {
    icon: 'bx-folder-open',
    title: 'Digital Records',
    description:
      'Keep your important healthcare information organized and accessible.',
  },
  {
    icon: 'bx-bot',
    title: 'AI Healthcare Help',
    description:
      'Get general healthcare information through our smart assistant.',
  },
];

const departments = [
  {
    icon: 'bx bx-heart',
    title: 'Cardiology',
    description: 'Heart health and cardiovascular care.',
  },
  {
    icon: 'bx-brain',
    title: 'Neurology',
    description: 'Specialized care for the nervous system.',
  },
  {
    icon: 'bx-body',
    title: 'Orthopedics',
    description: 'Bone, joint and movement-related care.',
  },
  {
    icon: 'bx-plus-medical',
    title: 'General Medicine',
    description: 'Everyday healthcare and medical guidance.',
  },
];

const steps = [
  {
    number: '01',
    icon: 'bx-search-alt-2',
    title: 'Choose a Department',
    description: 'Explore the healthcare service you need.',
  },
  {
    number: '02',
    icon: 'bx-user-plus',
    title: 'Find a Doctor',
    description: 'Select a suitable healthcare professional.',
  },
  {
    number: '03',
    icon: 'bx-calendar-check',
    title: 'Book Appointment',
    description: 'Choose your preferred date and time.',
  },
  {
    number: '04',
    icon: 'bx-heart',
    title: 'Receive Care',
    description: 'Continue your healthcare journey with confidence.',
  },
];

const Home = () => {
  return (
    <main className="home-page">

      {/* ================= HERO ================= */}
      <section className="home-hero">
        <div className="hero-background-shape hero-shape-one" />
        <div className="hero-background-shape hero-shape-two" />
        <div className="hero-grid-pattern" />

        <div className="container">
          <div className="row align-items-center g-5">

            <motion.div
              className="col-lg-7"
              variants={fadeLeft}
              initial="hidden"
              animate="visible"
            >
              <div className="home-hero-badge">
                <span className="status-dot" />
                <i className="bx bx-shield-quarter" />
                Your Health. Our Priority.
              </div>

              <h1 className="home-hero-title">
                A simpler way to
                <span> care for your health.</span>
              </h1>

              <p className="home-hero-description">
                Discover a smarter healthcare experience designed to help
                you find doctors, manage appointments and stay connected
                with the care you deserve.
              </p>

              <div className="home-hero-actions">
                <Link
                  to="/patient/appointments/book"
                  className="home-primary-btn"
                >
                  <span>Book Appointment</span>
                  <i className="bx bx-right-arrow-alt" />
                </Link>

                <Link to="/doctors" className="home-secondary-btn">
                  <i className="bx bx-user-plus" />
                  Find a Doctor
                </Link>
              </div>

              <div className="home-hero-trust">
                <div>
                  <i className="bx bx-check-circle" />
                  <span>Patient-focused care</span>
                </div>

                <div>
                  <i className="bx bx-lock-alt" />
                  <span>Secure experience</span>
                </div>

                <div>
                  <i className="bx bx-support" />
                  <span>Helpful support</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="col-lg-5"
              variants={fadeRight}
              initial="hidden"
              animate="visible"
            >
              <div className="home-hero-visual">

                <div className="hero-orbit hero-orbit-one" />
                <div className="hero-orbit hero-orbit-two" />
                <div className="hero-orbit-dot orbit-dot-one" />
                <div className="hero-orbit-dot orbit-dot-two" />

                <motion.div
                  className="hero-main-card"
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="hero-card-header">
                    <div className="hero-card-brand">
                      <div className="hero-card-logo">
                        <i className="bx bx-plus" />
                      </div>

                      <div>
                        <span>Hospital Management Platform</span>
                        <h3>Hospital Management</h3>
                      </div>
                    </div>

                    <div className="hero-card-menu">
                      <i className="bx bx-dots-horizontal-rounded" />
                    </div>
                  </div>

                  <div className="hero-card-center">
                    <div className="hero-heart-circle">
                      <div className="heart-pulse-ring" />
                      <i className="bx bx-heart" />
                    </div>

                    <div className="hero-pulse-bars">
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                    <p>Your wellness, simplified.</p>
                  </div>

                  <div className="hero-card-bottom">
                    <div>
                      <span>Healthcare Experience</span>
                      <strong>Simple & Connected</strong>
                    </div>

                    <div className="hero-available">
                      <span />
                      Available
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="hero-floating-card hero-floating-card-one"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="floating-card-icon">
                    <i className="bx bx-calendar-check" />
                  </div>

                  <div>
                    <span>Appointments</span>
                    <strong>Easy Booking</strong>
                  </div>
                </motion.div>

                <motion.div
                  className="hero-floating-card hero-floating-card-two"
                  animate={{ y: [0, 9, 0] }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="floating-card-icon">
                    <i className="bx bx-bot" />
                  </div>

                  <div>
                    <span>AI Assistant</span>
                    <strong>Healthcare Help</strong>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="home-trust-section">
        <div className="container">
          <div className="home-trust-card">

            <div className="trust-item">
              <div className="trust-icon">
                <i className="bx bx-user-check" />
              </div>
              <div>
                <strong>Qualified Professionals</strong>
                <span>Healthcare support</span>
              </div>
            </div>

            <div className="trust-divider" />

            <div className="trust-item">
              <div className="trust-icon">
                <i className="bx bx-calendar-heart" />
              </div>
              <div>
                <strong>Simple Booking</strong>
                <span>Convenient appointments</span>
              </div>
            </div>

            <div className="trust-divider" />

            <div className="trust-item">
              <div className="trust-icon">
                <i className="bx bx-lock-alt" />
              </div>
              <div>
                <strong>Private & Secure</strong>
                <span>Designed for your privacy</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= INTRO ================= */}
      <section className="home-intro-section">
        <div className="container">
          <div className="row align-items-center g-5">

            <motion.div
              className="col-lg-6"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="section-label">
                <span />
                Better Healthcare Experience
              </div>

              <h2 className="section-title">
                Healthcare made
                <span> easier for everyone.</span>
              </h2>

              <p className="section-description">
                We bring essential healthcare services into one smooth,
                user-friendly experience so you can spend less time
                managing healthcare and more time focusing on yourself.
              </p>

              <div className="intro-highlight">
                <div className="intro-highlight-icon">
                  <i className="bx bx-check-shield" />
                </div>

                <div>
                  <strong>Designed around your needs</strong>
                  <p>
                    Clear navigation, helpful information and a simple
                    healthcare journey.
                  </p>
                </div>
              </div>

              <Link to="/about" className="text-link">
                Discover more about us
                <i className="bx bx-right-arrow-alt" />
              </Link>
            </motion.div>

            <motion.div
              className="col-lg-6"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="intro-visual">
                <div className="intro-glow" />

                <div className="intro-dashboard-card">
                  <div className="dashboard-top">
                    <div>
                      <span>YOUR HEALTHCARE JOURNEY</span>
                      <h3>Connected Care</h3>
                    </div>

                    <div className="dashboard-icon">
                      <i className="bx bx-pulse" />
                    </div>
                  </div>

                  <div className="dashboard-progress">
                    <span />
                  </div>

                  <div className="dashboard-step active">
                    <div className="dashboard-step-icon">
                      <i className="bx bx-search-alt-2" />
                    </div>

                    <div>
                      <strong>Find a Doctor</strong>
                      <span>Explore healthcare professionals</span>
                    </div>

                    <i className="bx bx-check-circle step-check" />
                  </div>

                  <div className="dashboard-connector" />

                  <div className="dashboard-step active">
                    <div className="dashboard-step-icon">
                      <i className="bx bx-calendar-check" />
                    </div>

                    <div>
                      <strong>Book Appointment</strong>
                      <span>Choose a suitable time</span>
                    </div>

                    <i className="bx bx-check-circle step-check" />
                  </div>

                  <div className="dashboard-connector" />

                  <div className="dashboard-step">
                    <div className="dashboard-step-icon">
                      <i className="bx bx-heart" />
                    </div>

                    <div>
                      <strong>Receive Care</strong>
                      <span>Continue your health journey</span>
                    </div>

                    <i className="bx bx-arrow-up-right step-check" />
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="home-services-section">
        <div className="container">

          <motion.div
            className="section-heading-centered"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="section-label centered">
              <span />
              What We Offer
            </div>

            <h2 className="section-title">
              Everything you need for
              <span> better care.</span>
            </h2>

            <p className="section-description">
              Explore a range of helpful features created to make your
              healthcare experience more convenient.
            </p>
          </motion.div>

          <div className="row g-4">
            {services.map((service, index) => (
              <motion.div
                className="col-md-6 col-lg-3"
                key={service.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="service-card">
                  <div className="service-card-icon">
                    <i className={`bx ${service.icon}`} />
                  </div>

                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
{/* 
                  <div className="service-card-arrow">
                    <i className="bx bx-right-arrow-alt" />
                  </div> */}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= DEPARTMENTS ================= */}
      <section className="home-departments-section">
        <div className="container">

          <div className="section-heading-row">
            <div>
              <div className="section-label">
                <span />
                Explore Healthcare
              </div>

              <h2 className="section-title">
                Our medical
                <span> departments.</span>
              </h2>

              <p className="section-description">
                Learn about different areas of healthcare and discover
                the services that may be right for you.
              </p>
            </div>

            <Link to="/departments" className="section-link">
              View Departments
              <i className="bx bx-right-arrow-alt" />
            </Link>
          </div>

          <div className="row g-4">
            {departments.map((department, index) => (
              <motion.div
                className="col-md-6 col-lg-3"
                key={department.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link to="/departments" className="department-card">
                  <div className="department-icon">
                    <i className={`bx ${department.icon}`} />
                  </div>

                  <h3>{department.title}</h3>
                  <p>{department.description}</p>

                  <span>
                    Explore
                    <i className="bx bx-right-arrow-alt" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="home-process-section">
        <div className="container">

          <motion.div
            className="section-heading-centered"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="section-label centered">
              <span />
              Simple Process
            </div>

            <h2 className="section-title">
              Healthcare in
              <span> four simple steps.</span>
            </h2>

            <p className="section-description">
              We keep your healthcare journey simple, clear and easy
              to understand.
            </p>
          </motion.div>

          <div className="process-grid">
            {steps.map((step, index) => (
              <motion.div
                className="process-card"
                key={step.number}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="process-number">{step.number}</div>

                <div className="process-icon">
                  <i className={`bx ${step.icon}`} />
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>

                {index !== steps.length - 1 && (
                  <div className="process-arrow">
                    <i className="bx bx-right-arrow-alt" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= AI SECTION ================= */}
      <section className="home-ai-section">
        <div className="container">
          <div className="home-ai-card">

            <div className="ai-orb ai-orb-one" />
            <div className="ai-orb ai-orb-two" />

            <div className="row align-items-center g-5">

              <motion.div
                className="col-lg-7"
                variants={fadeLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="section-label light-label">
                  <span />
                  AI Healthcare Assistant
                </div>

                <h2>
                  Have a healthcare
                  <span> question?</span>
                </h2>

                <p>
                  Get general healthcare information through our
                  integrated AI assistant. For emergencies, diagnosis
                  or treatment decisions, always consult a qualified
                  healthcare professional.
                </p>

                {/* <Link to="/ai-assistant" className="home-primary-btn light-btn">
                  <span>Ask AI Assistant</span>
                  <i className="bx bx-right-arrow-alt" />
                </Link> */}
              </motion.div>

              <motion.div
                className="col-lg-5"
                variants={fadeRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="ai-chat-card">
                  <div className="ai-chat-header">
                    <div className="ai-avatar">
                      <i className="bx bx-bot" />
                    </div>

                    <div>
                      <strong>AI Assistant</strong>
                      <span>
                        <i className="bx bxs-circle" />
                        Available to help
                      </span>
                    </div>
                  </div>

                  <div className="ai-chat-message">
                    Hello! How can I help with your healthcare question?
                  </div>

                  <div className="ai-chat-message user-message">
                    I want general information about appointments.
                  </div>

                  <div className="ai-chat-footer">
                    <span>Smart support</span>
                    <i className="bx bx-sparkles" />
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="home-cta-section">
        <div className="container">
          <motion.div
            className="home-cta-card"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="cta-decoration cta-decoration-one" />
            <div className="cta-decoration cta-decoration-two" />

            <div className="row align-items-center g-4">

              <div className="col-lg-8">
                <div className="section-label">
                  <span />
                  Your Health Matters
                </div>

                <h2>
                  Take the next step toward
                  <span> better healthcare.</span>
                </h2>

                <p>
                  Explore our services, find a doctor and begin your
                  healthcare journey with confidence.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <Link to="/patient/appointments/book" className="home-primary-btn">
                  <span>Book Appointment</span>
                  <i className="bx bx-right-arrow-alt" />
                </Link>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
};

export default Home;