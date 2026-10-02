import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

const hospitalStats = [
  { number: "15+", label: "Years of Excellence" },
  { number: "50K+", label: "Happy Patients" },
  { number: "120+", label: "Medical Experts" },
  { number: "24/7", label: "Emergency Support" },
];

const hospitalValues = [
  {
    icon: "🩺",
    title: "Patient First",
    description:
      "Every decision we make prioritizes patient safety, comfort, and recovery.",
  },
  {
    icon: "💙",
    title: "Compassionate Care",
    description:
      "We treat patients and their families with respect, empathy, and understanding.",
  },
  {
    icon: "🔬",
    title: "Advanced Technology",
    description:
      "We utilize modern medical technology and advanced treatment methods to deliver quality healthcare.",
  },
  {
    icon: "🤝",
    title: "Trusted Teamwork",
    description:
      "Our doctors, nurses, and support staff work together to provide coordinated and comprehensive healthcare.",
  },
];

const journey = [
  {
    year: "2010",
    title: "Our Beginning",
    description:
      "Our hospital was established with a vision to make quality healthcare accessible to everyone.",
  },
  {
    year: "2015",
    title: "Growing Expertise",
    description:
      "We expanded our healthcare services by introducing specialist doctors and advanced medical departments.",
  },
  {
    year: "2020",
    title: "Digital Healthcare",
    description:
      "We enhanced our digital services, including appointment management, patient records, and online support.",
  },
  {
    year: "2026",
    title: "A Healthier Tomorrow",
    description:
      "We remain committed to improving healthcare through innovation, technology, trust, and compassionate care.",
  },
];

const facilities = [
  "Advanced Diagnostic Services",
  "Modern Operation Theatres",
  "24/7 Emergency Department",
  "Experienced Medical Specialists",
  "Clean and Comfortable Patient Rooms",
  "Digital Patient Management",
];

const About = () => {
  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-background">
          <span className="hero-orb hero-orb-one"></span>
          <span className="hero-orb hero-orb-two"></span>
          <span className="hero-grid"></span>
        </div>

        <div className="about-container about-hero-content">
          <div className="about-hero-text reveal-up">
            <span className="section-badge">ABOUT OUR HOSPITAL</span>

            <h1>
              Care That Feels
              <span> Personal.</span>
            </h1>

            <p>
              We combine advanced medical care with compassion, trust, and
              technology to provide every patient with a safe, comfortable,
              and personalized healthcare experience.
            </p>

            <div className="about-hero-actions">
              <Link to="/doctors" className="about-primary-btn">
                Meet Our Doctors
                <span>→</span>
              </Link>

              <Link to="/contact" className="about-secondary-btn">
                Contact Hospital
              </Link>
            </div>
          </div>

          <div className="about-hero-visual reveal-right">
            <div className="hero-image-card">
              <div className="hero-image-placeholder">
                <div className="medical-cross">✚</div>
                <h3>Healthcare With Heart</h3>
                <p>Modern treatment. Human connection.</p>
              </div>

              <div className="floating-care-card">
                <span className="floating-icon">✓</span>
                <div>
                  <strong>Trusted Care</strong>
                  <small>Every patient matters</small>
                </div>
              </div>

              <div className="floating-time-card">
                <span>24/7</span>
                <small>Emergency Care</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats-section">
        <div className="about-container about-stats-grid">
          {hospitalStats.map((stat, index) => (
            <div
              className="about-stat-card reveal-up"
              style={{ animationDelay: `${index * 0.12}s` }}
              key={stat.label}
            >
              <h2>{stat.number}</h2>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="about-story-section">
        <div className="about-container about-story-grid">
          <div className="about-story-visual reveal-left">
            <div className="story-main-card">
              <div className="story-symbol">❤</div>
              <h3>More Than Treatment</h3>
              <p>
                We believe healthcare is not only about treating illness, but
                also about building confidence, hope and trust.
              </p>
            </div>

            <div className="story-mini-card story-mini-one">
              <span>🧑‍⚕️</span>
              <strong>Expert Doctors</strong>
            </div>

            <div className="story-mini-card story-mini-two">
              <span>🛡️</span>
              <strong>Patient Safety</strong>
            </div>
          </div>

          <div className="about-story-content reveal-right">
            <span className="section-badge">OUR STORY</span>

            <h2>
              A Better Healthcare Experience,
              <span> Every Single Day.</span>
            </h2>

            <p>
              Our hospital is built on a simple yet powerful belief: every
              patient deserves quality medical treatment, dignity,
              transparency, and emotional support.
            </p>

            <p>
              Our multidisciplinary team continuously enhances its expertise,
              technology, and processes to deliver reliable, efficient, and
              high-quality healthcare services.
            </p>

            <div className="story-highlight">
              <span>“</span>
              <p>
                Your health is our responsibility, and your trust is our
                greatest achievement.
              </p>
            </div>

            <Link to="/departments" className="text-link">
              Explore Our Departments <span>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values-section">
        <div className="about-container">
          <div className="about-section-heading reveal-up">
            <span className="section-badge">WHAT DRIVES US</span>
            <h2>
              Our Core <span>Values</span>
            </h2>
            <p>
              Our commitment to meaningful healthcare is reflected in the
              principles that guide every service and patient interaction.
            </p>
          </div>

          <div className="about-values-grid">
            {hospitalValues.map((value, index) => (
              <article
                className="value-card reveal-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                key={value.title}
              >
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
                <span className="value-card-line"></span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="about-facilities-section">
        <div className="about-container about-facilities-grid">
          <div className="about-facilities-content reveal-left">
            <span className="section-badge">OUR FACILITIES</span>

            <h2>
              Designed Around
              <span> Your Comfort.</span>
            </h2>

            <p>
              We continuously focus on maintaining a safe, hygienic, and
              patient-friendly environment through modern facilities and
              comprehensive healthcare services.
            </p>

            <div className="facility-list">
              {facilities.map((facility) => (
                <div className="facility-item" key={facility}>
                  <span>✓</span>
                  <p>{facility}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="facility-visual reveal-right">
            <div className="facility-big-card">
              <div className="facility-circle">
                <span>✚</span>
              </div>
              <h3>Complete Care</h3>
              <p>From diagnosis to recovery, we stand beside you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="about-journey-section">
        <div className="about-container">
          <div className="about-section-heading reveal-up">
            <span className="section-badge">OUR JOURNEY</span>
            <h2>
              Growing With
              <span> Your Trust.</span>
            </h2>
            <p>
              Our journey continues to be shaped by innovation, dedication,
              and the trust of our patients.
            </p>
          </div>

          <div className="journey-timeline">
            {journey.map((item, index) => (
              <div
                className={`journey-item ${
                  index % 2 === 0 ? "journey-left" : "journey-right"
                } reveal-up`}
                style={{ animationDelay: `${index * 0.12}s` }}
                key={item.year}
              >
                <div className="journey-content">
                  <span className="journey-year">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="journey-dot"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <div className="about-container">
          <div className="about-cta-card reveal-up">
            <div>
              <span className="section-badge section-badge-light">
                LET'S TAKE CARE OF YOU
              </span>

              <h2>
                Your Health Deserves
                <span> The Best Care.</span>
              </h2>

              <p>
                Expert doctors, modern facilities, and compassionate support —
                everything you need for a better healthcare experience.
              </p>
            </div>

            <div className="about-cta-actions">
              <Link to="/doctors" className="about-cta-primary">
                Find a Doctor <span>→</span>
              </Link>

              <Link to="/contact" className="about-cta-outline">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;

