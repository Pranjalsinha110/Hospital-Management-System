import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./TermsConditions.css";

const sections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of Terms",
    heading: "Your agreement with us",
    content: [
      "By accessing or using the Hospital Management System, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use the platform.",
      "These terms apply to patients, doctors, healthcare professionals, administrators, and other authorized users of the platform."
    ]
  },
  {
    id: "services",
    number: "02",
    title: "Our Services",
    heading: "What the platform provides",
    content: [
      "Our platform provides digital tools designed to simplify hospital and healthcare management. Depending on your role, available features may include appointment booking, doctor discovery, department information, medical record management, payment processing, and administrative services.",
      "The availability of specific features may vary depending on your account type, hospital configuration, and system availability."
    ]
  },
  {
    id: "accounts",
    number: "03",
    title: "User Accounts",
    heading: "Keeping your account secure",
    content: [
      "Certain features require you to create and maintain an account. You are responsible for providing accurate information and keeping your login credentials confidential.",
      "You are responsible for all activity performed through your account. If you believe your account has been accessed without authorization, you should notify the appropriate system administrator or support team immediately."
    ],
    bullets: [
      "Provide accurate and complete registration information.",
      "Keep your password and authentication details confidential.",
      "Do not share your account with unauthorized individuals.",
      "Notify us promptly about suspected unauthorized access.",
      "Use the platform only for lawful and legitimate purposes."
    ]
  },
  {
    id: "appointments",
    number: "04",
    title: "Appointments",
    heading: "Booking and managing appointments",
    content: [
      "Patients may use the platform to search for doctors, view available appointment slots, and request or book appointments.",
      "An appointment is subject to doctor availability and hospital scheduling policies. Appointment availability shown on the platform may change without prior notice.",
      "Users are expected to provide accurate appointment information and arrive on time for scheduled consultations."
    ]
  },
  {
    id: "cancellation",
    number: "05",
    title: "Cancellation & Rescheduling",
    heading: "Managing your appointments responsibly",
    content: [
      "Appointments may be cancelled or rescheduled according to the hospital's applicable policies and availability.",
      "Repeated late cancellations, missed appointments, or misuse of the appointment system may result in temporary restrictions or other appropriate actions."
    ],
    bullets: [
      "Cancel appointments as early as reasonably possible.",
      "Check your appointment details before visiting the hospital.",
      "Follow any cancellation or rescheduling requirements provided by the hospital.",
      "Contact the hospital directly when urgent changes are required."
    ]
  },
  {
    id: "payments",
    number: "06",
    title: "Payments & Fees",
    heading: "Payment responsibilities",
    content: [
      "Certain services available through the platform may require payment. Applicable consultation fees, service charges, or other costs will be presented where appropriate.",
      "Payments may be processed through third-party payment providers. By making a payment, you agree to provide accurate payment information and comply with the applicable terms of the payment provider.",
      "Refunds, cancellations, and payment disputes may be subject to the hospital's refund policy and applicable payment-provider rules."
    ]
  },
  {
    id: "medical",
    number: "07",
    title: "Medical Information",
    heading: "Important healthcare disclaimer",
    content: [
      "The platform is designed to support healthcare administration and communication. It does not replace professional medical judgment, diagnosis, or emergency medical care.",
      "Information displayed through the platform should not be treated as a substitute for consultation with a qualified healthcare professional.",
      "For medical emergencies, users should immediately contact the appropriate emergency medical service or visit the nearest emergency department."
    ]
  },
  {
    id: "records",
    number: "08",
    title: "Medical Records",
    heading: "Access and responsibility",
    content: [
      "Where supported, the platform may allow authorized users to view or manage medical records and related healthcare information.",
      "Users must not attempt to access, modify, copy, distribute, or disclose medical records belonging to another person without proper authorization."
    ],
    bullets: [
      "Access records only when you are authorized to do so.",
      "Do not share confidential medical information without permission.",
      "Do not attempt to bypass system access controls.",
      "Report suspected unauthorized access or incorrect information."
    ]
  },
  {
    id: "acceptable-use",
    number: "09",
    title: "Acceptable Use",
    heading: "Use the platform responsibly",
    content: [
      "You agree to use the platform responsibly and in compliance with applicable laws, regulations, and hospital policies.",
      "Any activity that compromises the security, availability, integrity, or proper operation of the platform is prohibited."
    ],
    bullets: [
      "Do not attempt unauthorized access to the platform.",
      "Do not introduce malware, malicious code, or harmful content.",
      "Do not interfere with the operation of the system.",
      "Do not impersonate another user or healthcare professional.",
      "Do not use the platform for fraudulent or unlawful activities.",
      "Do not scrape, copy, or commercially exploit platform content without authorization."
    ]
  },
  {
    id: "intellectual-property",
    number: "10",
    title: "Intellectual Property",
    heading: "Our content and technology",
    content: [
      "The platform, including its software, interface, design, branding, graphics, text, logos, and other original content, may be protected by applicable intellectual property laws.",
      "You may use the platform only for its intended healthcare and administrative purposes. No ownership rights are transferred to you through your use of the platform."
    ]
  },
  {
    id: "third-party",
    number: "11",
    title: "Third-Party Services",
    heading: "External services and integrations",
    content: [
      "The platform may integrate with third-party services such as payment providers, authentication services, communication systems, analytics tools, or other external technologies.",
      "Third-party services may operate under their own terms, conditions, and privacy policies. We are not responsible for the policies or practices of independent third-party providers."
    ]
  },
  {
    id: "availability",
    number: "12",
    title: "Service Availability",
    heading: "Keeping the system available",
    content: [
      "We aim to provide a reliable and secure platform, but uninterrupted availability cannot be guaranteed.",
      "The platform may occasionally become unavailable due to maintenance, upgrades, technical issues, network failures, security incidents, or circumstances beyond our reasonable control."
    ]
  },
  {
    id: "disclaimer",
    number: "13",
    title: "Disclaimer of Warranties",
    heading: "Use of the platform",
    content: [
      "The platform is provided on an as-available basis. While we make reasonable efforts to maintain accurate and reliable services, we do not guarantee that the platform will always be uninterrupted, error-free, completely secure, or free from technical issues.",
      "Users should independently verify important healthcare, appointment, billing, or other critical information when necessary."
    ]
  },
  {
    id: "liability",
    number: "14",
    title: "Limitation of Liability",
    heading: "Our responsibility",
    content: [
      "To the extent permitted by applicable law, we will not be responsible for indirect, incidental, special, consequential, or unforeseeable losses arising from your use of, or inability to use, the platform.",
      "Nothing in these terms is intended to exclude or limit liability where such exclusion or limitation is not permitted by applicable law."
    ]
  },
  {
    id: "termination",
    number: "15",
    title: "Account Suspension & Termination",
    heading: "When access may be restricted",
    content: [
      "Access to the platform may be suspended, restricted, or terminated if a user violates these Terms & Conditions, applicable laws, security requirements, or hospital policies.",
      "Where appropriate, users may also request account closure subject to applicable legal, medical-record, billing, and administrative requirements."
    ]
  },
  {
    id: "changes",
    number: "16",
    title: "Changes to These Terms",
    heading: "Keeping our terms up to date",
    content: [
      "We may update these Terms & Conditions from time to time to reflect changes in our services, technology, legal requirements, or operational practices.",
      "When significant changes are made, we may provide an appropriate notice through the platform or other available communication channels."
    ]
  },
  {
    id: "governing-law",
    number: "17",
    title: "Governing Law",
    heading: "Applicable legal framework",
    content: [
      "These Terms & Conditions shall be interpreted and applied in accordance with applicable laws and regulations governing the operation and use of the platform.",
      "Any disputes arising from the use of the platform will be handled in accordance with the applicable legal and jurisdictional requirements."
    ]
  },
  {
    id: "contact",
    number: "18",
    title: "Contact Us",
    heading: "We're here to help",
    content: [
      "If you have questions, concerns, or requests regarding these Terms & Conditions, please contact the hospital administration or the appropriate support team."
    ]
  }
];

const TermsConditions = () => {
  const [activeSection, setActiveSection] = useState("acceptance");
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-15% 0px -65% 0px",
        threshold: 0
      }
    );

    sectionElements.forEach((section) => observer.observe(section));

    const handleScroll = () => {
      setShowTopButton(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);

    const revealElements = document.querySelectorAll(".terms-reveal");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("terms-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08
      }
    );

    revealElements.forEach((element) =>
      revealObserver.observe(element)
    );

    return () => {
      observer.disconnect();
      revealObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleSectionClick = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  return (
    <div className="terms-page">
      {/* Animated Background */}
      <div className="terms-background">
        <div className="terms-orb terms-orb-one"></div>
        <div className="terms-orb terms-orb-two"></div>
        <div className="terms-orb terms-orb-three"></div>
        <div className="terms-grid"></div>
      </div>

      {/* Hero Section */}
      <section className="terms-hero">
        <div className="terms-container">
          <div className="terms-breadcrumb terms-reveal">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Terms & Conditions</span>
          </div>

          <div className="terms-hero-content terms-reveal">
            <div className="terms-badge">
              <span className="terms-badge-dot"></span>
              Legal Information
            </div>

            <h1>
              Terms &
              <span> Conditions</span>
            </h1>

            <p className="terms-hero-description">
              Please read these terms carefully before using our
              hospital management platform. They explain your
              responsibilities, rights, and the rules that govern
              your use of our services.
            </p>

            <div className="terms-meta">
              <div className="terms-meta-item">
                <span className="terms-meta-icon">◷</span>
                <div>
                  <small>Last Updated</small>
                  <strong>October 2026</strong>
                </div>
              </div>

              <div className="terms-meta-divider"></div>

              <div className="terms-meta-item">
                <span className="terms-meta-icon">✓</span>
                <div>
                  <small>Document</small>
                  <strong>18 Sections</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="terms-main">
        <div className="terms-container terms-layout">

          {/* Sticky Table of Contents */}
          <aside className="terms-sidebar terms-reveal">
            <div className="terms-sidebar-inner">
              <div className="terms-sidebar-header">
                <span className="terms-sidebar-label">
                  On this page
                </span>

                <span className="terms-sidebar-count">
                  {sections.length}
                </span>
              </div>

              <nav className="terms-toc">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className={`terms-toc-item ${
                      activeSection === section.id
                        ? "terms-toc-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleSectionClick(section.id)
                    }
                  >
                    <span className="terms-toc-number">
                      {section.number}
                    </span>

                    <span className="terms-toc-title">
                      {section.title}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Policy Content */}
          <div className="terms-content">

            {/* Intro Card */}
            <div className="terms-intro-card terms-reveal">
              <div className="terms-intro-icon">
                <span>§</span>
              </div>

              <div>
                <span className="terms-intro-label">
                  Please Read Carefully
                </span>

                <h2>
                  Understanding these terms
                </h2>

                <p>
                  These Terms & Conditions establish the rules
                  and responsibilities that apply when using our
                  hospital management platform. By accessing or
                  using the platform, you acknowledge that you
                  have read, understood, and agreed to these terms.
                </p>
              </div>
            </div>

            {/* Sections */}
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="terms-section terms-reveal"
              >
                <div className="terms-section-number">
                  {section.number}
                </div>

                <div className="terms-section-body">
                  <span className="terms-section-overline">
                    {section.title}
                  </span>

                  <h2>{section.heading}</h2>

                  <div className="terms-section-text">
                    {section.content.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>

                  {section.bullets && (
                    <ul className="terms-list">
                      {section.bullets.map((item, index) => (
                        <li key={index}>
                          <span className="terms-check">
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}

            {/* Final Commitment Card */}
            <div className="terms-final-card terms-reveal">
              <div className="terms-final-glow"></div>

              <div className="terms-final-icon">
                ✓
              </div>

              <div className="terms-final-content">
                <span>Our Commitment</span>

                <h2>
                  Built around trust,
                  <br />
                  responsibility & transparency.
                </h2>

                <p>
                  We are committed to providing a reliable,
                  secure, and responsible digital healthcare
                  experience while continuously improving our
                  platform and services.
                </p>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="terms-bottom-nav terms-reveal">
              <Link to="/" className="terms-back-link">
                <span>←</span>
                Back to Home
              </Link>

              <Link
                to="/privacy-policy"
                className="terms-privacy-link"
              >
                Privacy Policy
                <span>→</span>
              </Link>
            </div>

          </div>
        </div>
      </main>

      {/* Floating Back To Top */}
      <button
        type="button"
        className={`terms-top-button ${
          showTopButton ? "terms-top-visible" : ""
        }`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <span>↑</span>
      </button>
    </div>
  );
};

export default TermsConditions;