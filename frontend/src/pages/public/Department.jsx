import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Department.css";

const departments = [
  {
    id: 1,
    icon: "❤️",
    name: "Cardiology",
    title: "Heart & Cardiovascular Care",
    description:
      "Advanced diagnosis and treatment for heart-related conditions with expert cardiac specialists.",
    services: ["ECG & Echo", "Heart Checkup", "Cardiac Consultation"],
    color: "#e94f64",
    lightColor: "#fff0f2",
  },
  {
    id: 2,
    icon: "🧠",
    name: "Neurology",
    title: "Brain & Nervous System Care",
    description:
      "Comprehensive care for neurological conditions with modern diagnostic facilities.",
    services: ["Brain Checkup", "Migraine Care", "Neuro Consultation"],
    color: "#7657e8",
    lightColor: "#f2efff",
  },
  {
    id: 3,
    icon: "🦴",
    name: "Orthopedics",
    title: "Bone & Joint Specialists",
    description:
      "Complete orthopedic care for bones, joints, muscles, injuries and mobility concerns.",
    services: ["Joint Pain", "Fracture Care", "Physiotherapy"],
    color: "#ed8b32",
    lightColor: "#fff5e9",
  },
  {
    id: 4,
    icon: "🫁",
    name: "Pulmonology",
    title: "Respiratory & Lung Care",
    description:
      "Expert treatment for breathing problems, lung diseases and respiratory conditions.",
    services: ["Asthma Care", "Lung Checkup", "Breathing Tests"],
    color: "#2498c7",
    lightColor: "#eaf8ff",
  },
  {
    id: 5,
    icon: "👶",
    name: "Pediatrics",
    title: "Specialized Child Healthcare",
    description:
      "Gentle, friendly and complete medical care for newborns, children and teenagers.",
    services: ["Child Checkup", "Vaccination", "Growth Monitoring"],
    color: "#e4a62b",
    lightColor: "#fff8e5",
  },
  {
    id: 6,
    icon: "🩺",
    name: "General Medicine",
    title: "Everyday Medical Care",
    description:
      "Personalized diagnosis, preventive care and treatment for common health concerns.",
    services: ["General Checkup", "Fever Treatment", "Health Screening"],
    color: "#159a9c",
    lightColor: "#e9fbfa",
  },
  {
    id: 7,
    icon: "🧬",
    name: "Gastroenterology",
    title: "Digestive System Care",
    description:
      "Complete care for digestive health, stomach, liver, intestine and related conditions.",
    services: ["Digestive Care", "Liver Checkup", "Endoscopy"],
    color: "#35a36d",
    lightColor: "#ecfbf2",
  },
  {
    id: 8,
    icon: "👁️",
    name: "Ophthalmology",
    title: "Complete Eye Care",
    description:
      "Modern eye examinations, vision correction and treatment for eye-related conditions.",
    services: ["Eye Testing", "Vision Checkup", "Eye Consultation"],
    color: "#3285d5",
    lightColor: "#edf5ff",
  },
];

const Department = () => {
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        department.name.toLowerCase().includes(searchText) ||
        department.title.toLowerCase().includes(searchText) ||
        department.description.toLowerCase().includes(searchText);

      const matchesFilter =
        selectedDepartment === "All" ||
        department.name === selectedDepartment;

      return matchesSearch && matchesFilter;
    });
  }, [search, selectedDepartment]);

  return (
    <div className="department-page">
      <section className="department-hero">
        <div className="department-hero-content">
          <span className="department-eyebrow">
            <span className="eyebrow-dot" />
            Excellence in Healthcare
          </span>

          <h1>
            Expert Care for
            <br />
            <span>Every Department.</span>
          </h1>

          <p>
            Discover specialized medical departments designed around your
            health, comfort and complete recovery. Our expert teams combine
            compassion, technology and clinical excellence.
          </p>

          <div className="department-hero-actions"> 
            <Link to="/patient/appointments/book" className="department-primary-btn">
              Book an Appointment <span>↗</span>
            </Link>

            <a href="#department-list" className="department-secondary-btn" >
              Explore Departments <span>↓</span>
            </a>
          </div>
        </div>

        <div className="department-hero-visual">
          <div className="department-orbit" />

          <div className="department-medical-card">
            <div className="medical-icon">🏥</div>
            <h3>Complete Healthcare</h3>
            <p>
              One trusted destination for diagnosis, consultation, treatment
              and long-term wellness.
            </p>
          </div>

          <div className="floating-stat stat-one">
            <span>👨‍⚕️</span>
            <div>
              <strong>50+</strong>
              Specialist Doctors
            </div>
          </div>

          <div className="floating-stat stat-two">
            <span>⭐</span>
            <div>
              <strong>24/7</strong>
              Patient Support
            </div>
          </div>
        </div>
      </section>

      <section className="department-list-section" id="department-list">
        <div className="department-heading">
          <span className="section-label">Our Specialties</span>
          <h2>Explore Our Medical Departments</h2>
          <p>
            Find the right department for your healthcare needs. Every
            specialty is supported by experienced professionals and modern
            medical facilities.
          </p>
        </div>

        <div className="department-toolbar">
          <div className="department-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search department..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
          >
            <option value="All">All Departments</option>

            {departments.map((department) => (
              <option key={department.id} value={department.name}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div className="department-grid">
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map((department, index) => (
              <article
                className="department-card"
                key={department.id}
                style={{
                  "--card-color": department.color,
                  "--card-light": department.lightColor,
                  animationDelay: `${index * 0.08}s`,
                }}
              >
                <div className="department-card-icon">{department.icon}</div>

                <h3>{department.name}</h3>

                <h4>{department.title}</h4>

                <p>{department.description}</p>

                <div className="department-services">
                  {department.services.map((service) => (
                    <span key={service}>{service}</span>
                  ))}
                </div>

                {/* <Link
                  to={`/departments/${department.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="department-card-link"
                >
                  View Department <span>→</span>
                </Link> */}
              </article>
            ))
          ) : (
            <div className="department-empty">
              <h3>No department found</h3>
              <p>Try searching with another department name.</p>
            </div>
          )}
        </div>
      </section>

      <section className="department-highlight">
        <div className="highlight-visual">
          <div className="highlight-circle">🩺</div>
          <span className="highlight-badge">✨ Patient-First Care</span>
        </div>

        <div className="highlight-content">
          <span className="section-label">Why Choose Our Departments</span>

          <h2>
            Healthcare that feels
            <br />
            personal and reliable.
          </h2>

          <p>
            We believe every patient deserves clear communication,
            personalized treatment and respectful care. Our departments work
            together to provide a smooth healthcare journey.
          </p>

          <div className="feature-list">
            <span>✓ Experienced Specialists</span>
            <span>✓ Modern Medical Equipment</span>
            <span>✓ Personalized Treatment</span>
            <span>✓ Comfortable Patient Care</span>
          </div>

          <Link to="/doctors" className="department-primary-btn">
            Meet Our Doctors <span>↗</span>
          </Link>
        </div>
      </section>

      <section className="department-cta">
        <div>
          <h2>Need help choosing a department?</h2>
          <p>
            Our care team can guide you toward the right specialist and
            appointment based on your health concerns.
          </p>
        </div>

        <Link to="/doctors" className="department-cta-btn">
          Get Assistance ↗
        </Link>
      </section>
    </div>
  );
};

export default Department;