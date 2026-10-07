import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PrivacyPolicy.css";

const sections = [
  {
    id: "introduction",
    number: "01",
    title: "Introduction",
    content: [
      "Welcome to our Hospital Management System. We are committed to protecting the privacy, security, and confidentiality of the information entrusted to us by our patients, doctors, staff members, and other users.",
      "This Privacy Policy explains what information we may collect, how we use and protect that information, and the choices you have regarding your personal information when using our website and digital services.",
      "By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy."
    ]
  },
  {
    id: "information-collection",
    number: "02",
    title: "Information We Collect",
    content: [
      "Depending on how you interact with our services, we may collect information that you voluntarily provide to us or information generated through your use of the platform."
    ],
    bullets: [
      "Personal information such as your name, email address, phone number, and contact details.",
      "Account information including login credentials and profile details.",
      "Appointment-related information such as appointment date, time, department, and selected healthcare professional.",
      "Information provided when communicating with hospital staff or using support services.",
      "Technical information such as browser type, device information, IP address, and general usage data.",
      "Any other information that you voluntarily provide while using our services."
    ]
  },
  {
    id: "use-of-information",
    number: "03",
    title: "How We Use Your Information",
    content: [
      "We use collected information only for legitimate operational, administrative, security, and service-related purposes."
    ],
    bullets: [
      "To create and manage user accounts.",
      "To schedule, manage, and communicate about appointments.",
      "To provide and improve healthcare-related services.",
      "To respond to questions, requests, and support inquiries.",
      "To maintain the security and reliability of our systems.",
      "To detect, prevent, and investigate unauthorized activity.",
      "To improve website functionality, user experience, and service quality.",
      "To comply with applicable legal and regulatory requirements."
    ]
  },
  {
    id: "medical-information",
    number: "04",
    title: "Medical & Health Information",
    content: [
      "Healthcare-related information is treated as sensitive information and should only be accessed by authorized individuals for legitimate healthcare or administrative purposes.",
      "Where applicable, medical information may include appointment details, consultation information, medical history, prescriptions, diagnoses, reports, and other information necessary for providing healthcare services.",
      "We take reasonable administrative, technical, and organizational measures to protect such information against unauthorized access, alteration, disclosure, or loss."
    ]
  },
  {
    id: "account-security",
    number: "05",
    title: "Account & Authentication Information",
    content: [
      "Some features of our platform may require you to create an account. You are responsible for keeping your login credentials confidential and for activities performed through your account.",
      "Please notify the appropriate hospital or system administrator immediately if you believe your account credentials have been compromised or if you notice unauthorized activity."
    ]
  },
  {
    id: "appointments",
    number: "06",
    title: "Appointment Information",
    content: [
      "When you schedule or manage an appointment through our platform, we may process information required to coordinate that appointment.",
      "This may include your identity, selected department, healthcare professional, appointment date and time, contact information, and other details necessary to provide the requested service.",
      "Appointment information may be shared internally with authorized hospital personnel involved in scheduling, administration, or healthcare delivery."
    ]
  },
  {
    id: "data-security",
    number: "07",
    title: "Data Protection & Security",
    content: [
      "We take reasonable steps to protect personal information from unauthorized access, misuse, alteration, disclosure, and destruction.",
      "Security measures may include access controls, authentication mechanisms, secure data transmission, system monitoring, and restricted access to sensitive information.",
      "However, no digital system or method of electronic transmission can be guaranteed to be completely secure. While we work to protect your information, we cannot guarantee absolute security."
    ]
  },
  {
    id: "cookies",
    number: "08",
    title: "Cookies & Similar Technologies",
    content: [
      "Our website may use cookies or similar technologies to improve functionality, remember preferences, understand usage patterns, and enhance the overall user experience.",
      "You may be able to control or disable cookies through your browser settings. However, disabling certain cookies may affect the functionality of some parts of the website."
    ]
  },
  {
    id: "data-sharing",
    number: "09",
    title: "Data Sharing & Disclosure",
    content: [
      "We do not intend to sell or rent your personal information. Information may be shared only when reasonably necessary for providing services, operating the platform, protecting users, or complying with legal obligations."
    ],
    bullets: [
      "Authorized hospital doctors, medical professionals, and staff.",
      "Service providers who support hosting, security, communication, or technical operations.",
      "Government authorities or regulatory bodies when required by applicable law.",
      "Professional advisors where reasonably necessary to protect our legal rights.",
      "Other parties with your consent or as otherwise permitted by law."
    ]
  },
  {
    id: "third-party-services",
    number: "10",
    title: "Third-Party Services",
    content: [
      "Our platform may rely on third-party technologies or services for hosting, authentication, analytics, communication, payment processing, or other operational functions.",
      "Third-party services may process information according to their own privacy policies. We encourage users to review the privacy practices of any external service they interact with through our platform."
    ]
  },
  {
    id: "data-retention",
    number: "11",
    title: "Data Retention",
    content: [
      "We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including providing services, maintaining appropriate records, resolving disputes, enforcing agreements, and complying with legal or regulatory obligations.",
      "Retention periods may vary depending on the type of information and the purpose for which it was collected."
    ]
  },
  {
    id: "your-rights",
    number: "12",
    title: "Your Privacy Rights",
    content: [
      "Depending on applicable law, you may have certain rights regarding your personal information."
    ],
    bullets: [
      "Request access to certain personal information we hold about you.",
      "Request correction of inaccurate or incomplete information.",
      "Request deletion of information where legally permitted.",
      "Withdraw consent where processing is based on consent.",
      "Raise concerns regarding how your information is being handled.",
      "Request additional information about our privacy practices."
    ]
  },
  {
    id: "children",
    number: "13",
    title: "Children's Privacy",
    content: [
      "Our digital services are not intended to encourage children to independently create accounts or submit personal information without appropriate parental or guardian involvement.",
      "Where healthcare services are provided to minors, information may be collected and processed as necessary for legitimate healthcare and administrative purposes and in accordance with applicable law."
    ]
  },
  {
    id: "policy-changes",
    number: "14",
    title: "Changes to This Privacy Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements, or privacy practices.",
      "When changes are made, the updated version will be published on this page along with the revised effective date. We encourage you to review this page periodically."
    ]
  },
  {
    id: "contact",
    number: "15",
    title: "Contact Us",
    content: [
      "If you have questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact the hospital administration or the designated privacy representative through the official contact channels provided on our website."
    ]
  }
];

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);

      const sectionElements = sections
        .map((section) => document.getElementById(section.id))
        .filter(Boolean);

      let currentSection = "introduction";

      sectionElements.forEach((element) => {
        const rect = element.getBoundingClientRect();

        if (rect.top <= 180) {
          currentSection = element.id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const animatedElements = document.querySelectorAll(
      ".privacy-reveal"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("privacy-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    animatedElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const target = document.getElementById(id);

    if (!target) return;

    const offset = 110;
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      offset;

    window.scrollTo({
      top,
      behavior: "smooth"
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <main className="privacy-page">
      {/* Background decoration */}
      <div className="privacy-background" aria-hidden="true">
        <span className="privacy-orb privacy-orb-one" />
        <span className="privacy-orb privacy-orb-two" />
        <span className="privacy-orb privacy-orb-three" />
        <div className="privacy-grid" />
      </div>

      {/* Hero */}
      <section className="privacy-hero">
        <div className="privacy-container">
          <div className="privacy-breadcrumb privacy-reveal">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Privacy Policy</span>
          </div>

          <div className="privacy-hero-content privacy-reveal">
            <div className="privacy-badge">
              <span className="privacy-badge-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3L19 6V11.5C19 16.2 16.1 20.2 12 21C7.9 20.2 5 16.2 5 11.5V6L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12L11 14L15.5 9.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Your Privacy Matters
            </div>

            <h1>
              Privacy <span>Policy</span>
            </h1>

            <p>
              Your trust is important to us. Learn how we collect,
              use, protect, and manage your information while you
              use our healthcare services.
            </p>

            <div className="privacy-hero-meta">
              <div className="privacy-meta-item">
                <span className="privacy-meta-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="4"
                      y="5"
                      width="16"
                      height="15"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 3V7M16 3V7M4 10H20"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <span>
                  <small>Last Updated</small>
                  <strong>October 2026</strong>
                </span>
              </div>

              <div className="privacy-meta-divider" />

              <div className="privacy-meta-item">
                <span className="privacy-meta-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 3L19 6V11.5C19 16.2 16.1 20.2 12 21C7.9 20.2 5 16.2 5 11.5V6L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 12H14.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <span>
                  <small>Information</small>
                  <strong>15 Sections</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="privacy-content-section">
        <div className="privacy-container privacy-layout">
          {/* Sidebar */}
          <aside className="privacy-sidebar privacy-reveal">
            <div className="privacy-sidebar-inner">
              <div className="privacy-sidebar-heading">
                <span>Contents</span>
                <span className="privacy-section-count">
                  15
                </span>
              </div>

              <nav className="privacy-nav">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className={
                      activeSection === section.id
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      scrollToSection(section.id)
                    }
                  >
                    <span className="privacy-nav-number">
                      {section.number}
                    </span>

                    <span className="privacy-nav-title">
                      {section.title}
                    </span>

                    <span className="privacy-nav-arrow">
                      →
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Policy */}
          <article className="privacy-document">
            <div className="privacy-intro-card privacy-reveal">
              <div className="privacy-intro-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3L19 6V11.5C19 16.2 16.1 20.2 12 21C7.9 20.2 5 16.2 5 11.5V6L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V12"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="15.5"
                    r="0.8"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div>
                <h2>Your privacy, our responsibility.</h2>
                <p>
                  We believe healthcare should be built on trust.
                  Protecting your personal information is an
                  important part of delivering a safe and reliable
                  digital healthcare experience.
                </p>
              </div>
            </div>

            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="privacy-policy-section privacy-reveal"
              >
                <div className="privacy-section-heading">
                  <span className="privacy-number">
                    {section.number}
                  </span>

                  <div>
                    <span className="privacy-overline">
                      Section {section.number}
                    </span>

                    <h2>{section.title}</h2>
                  </div>
                </div>

                <div className="privacy-section-body">
                  {section.content?.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}

                  {section.bullets && (
                    <ul className="privacy-list">
                      {section.bullets.map((bullet, index) => (
                        <li key={index}>
                          <span className="privacy-check">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6 12.5L10 16.5L18 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>

                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}

            {/* Final Note */}
            <div className="privacy-final-card privacy-reveal">
              <div className="privacy-final-glow" />

              <div className="privacy-final-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3L19 6V11.5C19 16.2 16.1 20.2 12 21C7.9 20.2 5 16.2 5 11.5V6L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12L11 14L15.5 9.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <span>Privacy Commitment</span>
                <h3>
                  Your information deserves to be protected.
                </h3>
                <p>
                  We continuously work to maintain a secure,
                  transparent, and trustworthy healthcare
                  experience for everyone who uses our platform.
                </p>
              </div>
            </div>

            {/* Bottom navigation */}
            <div className="privacy-bottom-navigation privacy-reveal">
              <Link to="/" className="privacy-back-home">
                <span className="privacy-back-icon">←</span>
                <span>
                  <small>Return to</small>
                  <strong>Home</strong>
                </span>
              </Link>

              <Link
                to="/terms"
                className="privacy-next-link"
              >
                <span>
                  <small>Next document</small>
                  <strong>Terms & Conditions</strong>
                </span>

                <span className="privacy-next-icon">
                  →
                </span>
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Scroll To Top */}
      <button
        type="button"
        className={`privacy-scroll-top ${
          showScrollTop ? "show" : ""
        }`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 19V5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M6 11L12 5L18 11"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </main>
  );
};

export default PrivacyPolicy;