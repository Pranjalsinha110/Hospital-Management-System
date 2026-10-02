import React, { useState } from "react";
import "./Contact.css";

const contactChannels = [
  {
    id: "phone",
    icon: "📞",
    badge: "24/7 Helpline",
    title: "Direct Calling",
    desc: "Speak with front-desk reception & patient coordinators",
    value: "+91 98765 43210",
    link: "tel:+919876543210",
    actionText: "Call Hospital",
  },
  {
    id: "email",
    icon: "✉️",
    badge: "Fast Response",
    title: "Official Email",
    desc: "Inquiries, reports, billing, and general feedback",
    value: "Hospital management",
    link: "mailto:hospitalmanagement125@gmail.com",
    actionText: "Send Mail",
  },
  {
    id: "location",
    icon: "📍",
    badge: "Main Campus",
    title: "Hospital Center",
    desc: "branch all over india",
    value: "India",
    link: "https://maps.google.com/?q=Patna+Bihar",
    actionText: "Open Maps",
  },
  {
    id: "hours",
    icon: "🏥",
    badge: "Emergency Open",
    title: "OPD & Critical Care",
    desc: "Outpatient: 8:00 AM - 8:00 PM | Trauma: Non-stop",
    value: "Open 365 Days",
    link: "#emergency",
    actionText: "View Schedule",
  },
];

const liveStatusMetrics = [
  {
    id: "trauma",
    label: "Trauma & Emergency",
    value: "Ready & On-Duty",
    indicator: "status-active",
    detail: "4 Rapid Teams Standing By",
  },
  {
    id: "icu",
    label: "Critical Care (ICU)",
    value: "Beds Available",
    indicator: "status-active",
    detail: "Immediate Ventilator Support",
  },
  {
    id: "diagnostics",
    label: "Diagnostic Lab & Imaging",
    value: "24/7 Continuous",
    indicator: "status-active",
    detail: "CT, MRI, Ultrasound Active",
  },
  {
    id: "pharmacy",
    label: "Central Pharmacy",
    value: "Open Counter",
    indicator: "status-active",
    detail: "Full Life-Saving Stock",
  },
];

const careSteps = [
  {
    step: "01",
    title: "Instant Connection",
    desc: "Call our reception line or reach triage directly at the front desk.",
    icon: "📲",
  },
  {
    step: "02",
    title: "Quick Medical Triage",
    desc: "Senior nursing staff categorizes care urgency within 3 minutes.",
    icon: "🩺",
  },
  {
    step: "03",
    title: "Specialist Consultation",
    desc: "Direct guidance by board-certified consultants and dedicated surgeons.",
    icon: "👨‍⚕️",
  },
];

const faqs = [
  {
    question: "How do I schedule an outpatient consultation?",
    answer:
      "You can call our central appointment desk directly at +91 98765 43210 or walk into our main reception during OPD hours (8:00 AM to 8:00 PM).",
  },
  {
    question: "What should I do in case of a medical emergency?",
    answer:
      "For severe or time-critical emergencies, dial our 24/7 hotline immediately or come straight to the Red Triage Zone at our main emergency entrance.",
  },
  {
    question: "Are diagnostic and pharmacy counters open all night?",
    answer:
      "Yes. Our digital lab, radiology suites (CT/MRI/X-Ray), and central pharmacy counters operate non-stop 24 hours a day, 365 days a year.",
  },
  {
    question: "Can I choose a specific department or doctor?",
    answer:
      "Yes. When you call our desk, our patient care officers will provide available consultation slots for your requested department or senior doctor.",
  },
];

function Contact() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="contact-viewport">
      {/* Background Ambient Glows */}
      <div className="ambient-glow glow-primary" />
      <div className="ambient-glow glow-secondary" />

      {/* Hero Section */}
      <section className="contact-hero-container">
        <div className="hero-text-column">
          <div className="status-pill">
            <span className="live-pulse" />
            <span>24/7 HEALTHCARE NETWORK ACTIVE</span>
          </div>

          <h1 className="hero-main-title">
            Compassionate Care, <br />
            <span className="gradient-highlight">Always Within Reach.</span>
          </h1>

          <p className="hero-subtext">
            Connect directly with  Hospital Management. Whether you have inquiries
            regarding emergency triage, outpatient clinics, or hospital
            facilities, our dedicated medical coordinators are standing by.
          </p>

          <div className="hero-cta-wrapper">
            <a href="tel:+919876543210" className="btn-primary-action">
              <span>Call Helpline</span>
              <span className="btn-icon">→</span>
            </a>
            <a href="#operational-hub" className="btn-secondary-action">
              <span className="pulse-icon">●</span>
              <span>Live Campus Status</span>
            </a>
          </div>

          <div className="verified-metrics">
            <div className="metric-box">
              <strong>99.4%</strong>
              <span>Patient Satisfaction</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-box">
              <strong>&lt; 5 Mins</strong>
              <span>Emergency Triage</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-box">
              <strong>50+</strong>
              <span>Specialists On-Call</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Hub */}
        <div className="hero-visual-hub">
          <div className="ring-pulse ring-outer" />
          <div className="ring-pulse ring-inner" />

          <div className="central-medical-unit">
            <div className="unit-header">
              <div className="indicator-group">
                <span className="active-dot" />
                <span className="indicator-label">Live Reception Desk</span>
              </div>
              <span className="unit-tag">Verified</span>
            </div>

            <div className="medical-emblem-core">
              <span>✚</span>
            </div>

            <h3 className="unit-heading">Hospital Management Central Desk</h3>
            <p className="unit-caption">
              Direct line for triage, specialist care & patient coordination.
            </p>

            <div className="unit-footer-info">
              <div className="footer-stat">
                <small>Campus</small>
                <strong>Patna Main Wing</strong>
              </div>
              <div className="footer-stat">
                <small>Operational</small>
                <strong className="status-highlight">Open 24/7</strong>
              </div>
            </div>
          </div>

          {/* Floating Pill Badges */}
          <div className="floating-stat-pill pill-north">
            <span className="pill-icon">⚡</span>
            <div>
              <strong>Quick Response</strong>
              <small>Immediate assistance</small>
            </div>
          </div>

          <div className="floating-stat-pill pill-south">
            <span className="pill-icon">🛡️</span>
            <div>
              <strong>NABH Accredited</strong>
              <small>Certified Excellence</small>
            </div>
          </div>
        </div>
      </section>

      {/* Communication Channels Section */}
      <section className="contact-channels-section">
        <div className="content-heading-block">
          <span className="sub-kicker">GET IN TOUCH</span>
          <h2 className="master-heading">We’re Always Happy to Hear From You</h2>
          <p className="master-subheading">
            Choose the easiest way to connect with our hospital support team.
          </p>
        </div>

        <div className="channels-grid">
          {contactChannels.map((channel) => (
            <div className="channel-card" key={channel.id}>
              <div className="channel-top">
                <div className="channel-icon-shield">{channel.icon}</div>
                <span className="channel-tag">{channel.badge}</span>
              </div>

              <h4 className="channel-title">{channel.title}</h4>
              <p className="channel-desc">{channel.desc}</p>
              <span className="channel-value">{channel.value}</span>

              <a
                href={channel.link}
                className="channel-action-link"
                target={channel.link.startsWith("http") ? "_blank" : undefined}
                rel={channel.link.startsWith("http") ? "noreferrer" : undefined}
              >
                <span>{channel.actionText}</span>
                <span className="link-arrow">↗</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Operational Hub (Replaces Form) */}
      <section className="operational-showcase-section" id="operational-hub">
        {/* Left Column: Live Readiness Telemetry */}
        <div className="readiness-card-container">
          <div className="readiness-header">
            <div className="readiness-badge">
              <span className="live-radar-dot" />
              <span>LIVE HOSPITAL STATUS</span>
            </div>
            <h3 className="readiness-title">Real-Time Facility Readiness</h3>
            <p className="readiness-description">
              Our central operations center monitors unit preparedness every second
              to assure rapid response times for arriving patients.
            </p>
          </div>

          <div className="telemetry-grid">
            {liveStatusMetrics.map((item) => (
              <div className="telemetry-box" key={item.id}>
                <div className="telemetry-top">
                  <span className={`status-bubble ${item.indicator}`} />
                  <span className="telemetry-name">{item.label}</span>
                </div>
                <strong className="telemetry-value">{item.value}</strong>
                <small className="telemetry-detail">{item.detail}</small>
              </div>
            ))}
          </div>

          {/* Interactive Care Triage Steps */}
          <div className="triage-steps-wrapper">
            <h4 className="triage-steps-title">Patient Arrival Journey</h4>
            <div className="triage-tabs">
              {careSteps.map((step, idx) => (
                <button
                  type="button"
                  key={step.step}
                  className={`triage-step-btn ${activeStep === idx ? "step-active" : ""}`}
                  onClick={() => setActiveStep(idx)}
                >
                  <span className="step-number">{step.step}</span>
                  <span className="step-btn-title">{step.title}</span>
                </button>
              ))}
            </div>

            <div className="active-step-card">
              <div className="step-icon-badge">{careSteps[activeStep].icon}</div>
              <div className="step-body-copy">
                <h5>{careSteps[activeStep].title}</h5>
                <p>{careSteps[activeStep].desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hospital Location & Campus Map */}
        <div className="location-visual-card">
          <div className="location-info-header">
            <span className="sub-kicker">FIND OUR HOSPITAL</span>
            <h3 className="location-card-title">We’re Closer Than You Think</h3>
            <p className="location-card-text">
              Centrally located with multi-lane direct ambulance routes, fast triage access,
              and dedicated visitor parking.
            </p>
          </div>

          <div className="simulated-map-display">
            <div className="map-grid-matrix" />
            <div className="map-transit-line transit-primary" />
            <div className="map-transit-line transit-secondary" />

            <div className="map-marker-pin">
              <span className="pin-pulse" />
              <div className="pin-core">✚</div>
            </div>

            <div className="map-meta-tag">
              <strong>Hospital Management</strong>
              <span>Branch all over India</span>
            </div>
          </div>

          <div className="location-details-list">
            <div className="loc-item">
              <span className="loc-icon">📍</span>
              <div>
                <strong>Hospital Address</strong>
                <p>Branch all over India</p>
              </div>
            </div>

            <div className="loc-item">
              <span className="loc-icon">🕒</span>
              <div>
                <strong>Operational Hours</strong>
                <p>Emergency 24/7 | OPD Consults: 8:00 AM – 8:00 PM</p>
              </div>
            </div>
          </div>

          <div className="location-footer-actions">
            <a
              href="https://maps.google.com/?q=Patna+Bihar"
              target="_blank"
              rel="noreferrer"
              className="directions-link"
            >
              <span>Open in Google Maps</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* Emergency Action Banner */}
      <section className="emergency-highlight-strip" id="emergency">
        <div className="emergency-pulse-orb" />
        <div className="strip-content-left">
          <div className="emergency-symbol-badge">🚑</div>
          <div className="strip-text-group">
            <span className="emergency-pill-label">EMERGENCY ASSISTANCE</span>
            <h3 className="strip-title">Need Immediate Medical Help?</h3>
            <p className="strip-desc">
              Do not wait in an emergency. Contact our rapid response team for immediate assistance.
            </p>
          </div>
        </div>

        <div className="strip-content-right">
          <a href="tel:+919876543210" className="emergency-phone-btn">
            <span>Call 24/7 Hotline</span>
            <strong>+91 98765 43210</strong>
          </a>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="faq-main-wrapper">
        <div className="content-heading-block">
          <span className="sub-kicker">COMMON QUESTIONS</span>
          <h2 className="master-heading">Frequently Asked Questions</h2>
          <p className="master-subheading">
            Here are answers to some common questions from our patients.
          </p>
        </div>

        <div className="accordion-shelf">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={faq.question}
                className={`accordion-row ${isOpen ? "row-expanded" : ""}`}
              >
                <button
                  type="button"
                  className="accordion-trigger"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span className="trigger-text">{faq.question}</span>
                  <span className="trigger-icon">{isOpen ? "−" : "+"}</span>
                </button>

                <div className="accordion-collapse">
                  <div className="accordion-body">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Contact;