import React, { useMemo, useState } from "react";
import "./Doctors.css";

const doctors = [
  {
    id: 1,
    name: "Dr. Ananya Sharma",
    specialty: "Cardiologist",
    experience: "14+ Years",
    rating: "4.9",
    patients: "2,000+",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=85",
    description:
      "Specialist in preventive cardiology, heart health and advanced cardiac care.",
    tags: ["Heart Care", "Preventive Care"],
  },
  {
    id: 2,
    name: "Dr. Rohan Mehta",
    specialty: "Neurologist",
    experience: "11+ Years",
    rating: "4.8",
    patients: "1,500+",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=700&q=85",
    description:
      "Focused on neurological disorders, migraine management and brain health.",
    tags: ["Brain Health", "Neurology"],
  },
  {
    id: 3,
    name: "Dr. Priya Verma",
    specialty: "Pediatrician",
    experience: "10+ Years",
    rating: "4.9",
    patients: "1,800+",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=700&q=85",
    description:
      "Dedicated to child wellness, preventive care and compassionate treatment.",
    tags: ["Child Care", "Vaccination"],
  },
  {
    id: 4,
    name: "Dr. Arjun Kapoor",
    specialty: "Orthopedic",
    experience: "16+ Years",
    rating: "4.8",
    patients: "2,400+",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=700&q=85",
    description:
      "Expert in joint care, sports injuries and modern orthopedic treatments.",
    tags: ["Joint Care", "Sports Injury"],
  },
  {
    id: 5,
    name: "Dr. Neha Singh",
    specialty: "Dermatologist",
    experience: "9+ Years",
    rating: "4.7",
    patients: "1,200+",
    image:
      "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=700&q=85",
    description:
      "Providing personalized skin, hair and cosmetic dermatology solutions.",
    tags: ["Skin Care", "Hair Care"],
  },
  {
    id: 6,
    name: "Dr. Vikram Rao",
    specialty: "General Physician",
    experience: "13+ Years",
    rating: "4.9",
    patients: "3,000+",
    image:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=700&q=85",
    description:
      "Experienced in complete family healthcare, diagnosis and wellness planning.",
    tags: ["Family Care", "Wellness"],
  },
];

const specialties = [
  "All Doctors",
  "Cardiologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedic",
  "Dermatologist",
  "General Physician",
];

function Doctors() {
  const [search, setSearch] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All Doctors");

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSpecialty =
        activeSpecialty === "All Doctors" ||
        doctor.specialty === activeSpecialty;

      const matchesSearch =
        !query ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesSpecialty && matchesSearch;
    });
  }, [search, activeSpecialty]);

  return (
    <main className="doctors-page">
      <section className="doctors-hero">
        <div className="doctors-hero-glow doctors-hero-glow-one" />
        <div className="doctors-hero-glow doctors-hero-glow-two" />

        <div className="doctors-hero-content">
          <span className="doctors-eyebrow">
            <span className="eyebrow-dot" />
            Our Medical Experts
          </span>

          <h1>
            Meet the People Behind
            <span> Better Healthcare</span>
          </h1>

          <p>
            Experienced specialists, compassionate care and a shared commitment
            to helping every patient live a healthier life.
          </p>

          <div className="doctors-hero-actions">
            <a href="#doctor-directory" className="doctor-primary-btn">
              Explore Doctors
              <span>↗</span>
            </a>

            <a href="#doctor-care" className="doctor-secondary-btn">
              Why Our Doctors?
            </a>
          </div>
        </div>

        <div className="doctors-hero-visual">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />

          <div className="hero-doctor-frame">
            <div className="hero-frame-shine" />
            <img
              src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=900&q=85"
              alt="Medical professional"
            />
          </div>

          <div className="floating-doctor-badge badge-rating">
            <span className="badge-icon">★</span>
            <div>
              <strong>4.9/5</strong>
              <small>Patient Rating</small>
            </div>
          </div>

          <div className="floating-doctor-badge badge-specialists">
            <span className="badge-icon">✚</span>
            <div>
              <strong>50+</strong>
              <small>Expert Doctors</small>
            </div>
          </div>
        </div>
      </section>

      <section className="doctor-directory-section" id="doctor-directory">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">FIND YOUR SPECIALIST</span>
            <h2>Our Dedicated Doctors</h2>
            <p>
              Meet our team of highly skilled professionals committed to your
              health and wellbeing.
            </p>
          </div>

          <div className="doctor-result-count">
            <strong>{filteredDoctors.length}</strong>
            <span>Available Profiles</span>
          </div>
        </div>

        <div className="doctor-controls">
          <div className="doctor-search-box">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search doctor or specialty..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="specialty-filter">
            {specialties.map((specialty) => (
              <button
                type="button"
                key={specialty}
                className={
                  activeSpecialty === specialty ? "active" : ""
                }
                onClick={() => setActiveSpecialty(specialty)}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {filteredDoctors.length > 0 ? (
          <div className="doctors-grid">
            {filteredDoctors.map((doctor, index) => (
              <article
                className="doctor-card"
                key={doctor.id}
                style={{ "--card-delay": `${index * 90}ms` }}
              >
                <div className="doctor-card-image">
                  <img src={doctor.image} alt={doctor.name} />
                  <span className="doctor-availability">
                    <span />
                    Available
                  </span>

                  <button
                    type="button"
                    className="doctor-favorite"
                    aria-label={`Save ${doctor.name}`}
                  >
                    ♡
                  </button>
                </div>

                <div className="doctor-card-content">
                  <span className="doctor-specialty">
                    {doctor.specialty}
                  </span>

                  <h3>{doctor.name}</h3>

                  <p>{doctor.description}</p>

                  <div className="doctor-tags">
                    {doctor.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="doctor-meta">
                    <div>
                      <strong>{doctor.experience}</strong>
                      <small>Experience</small>
                    </div>

                    <div>
                      <strong>{doctor.patients}</strong>
                      <small>Patients</small>
                    </div>

                    <div>
                      <strong>★ {doctor.rating}</strong>
                      <small>Rating</small>
                    </div>
                  </div>

                  <div className="doctor-card-footer">
                  
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="doctor-empty-state">
            <span>⌕</span>
            <h3>No doctors found</h3>
            <p>Try another doctor name or select a different specialty.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveSpecialty("All Doctors");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      <section className="doctor-care-section" id="doctor-care">
        <div className="doctor-care-copy">
          <span className="section-kicker">WHY CHOOSE OUR TEAM</span>
          <h2>Care That Feels Personal</h2>
          <p>
            Our doctors combine clinical expertise with empathy, clear
            communication and a patient-first approach.
          </p>
        </div>

        <div className="doctor-care-features">
          <div className="care-feature">
            <span>✚</span>
            <div>
              <h3>Experienced Specialists</h3>
              <p>Trusted professionals across multiple medical fields.</p>
            </div>
          </div>

          <div className="care-feature">
            <span>♡</span>
            <div>
              <h3>Patient-First Approach</h3>
              <p>Every treatment begins with listening and understanding.</p>
            </div>
          </div>

          <div className="care-feature">
            <span>⌁</span>
            <div>
              <h3>Modern Medical Care</h3>
              <p>Thoughtful treatment supported by advanced practices.</p>
            </div>
          </div>

          <div className="care-feature">
            <span>★</span>
            <div>
              <h3>Trusted by Families</h3>
              <p>Building long-term relationships through quality care.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="doctors-final-cta">
        <div>
          <span className="section-kicker">YOUR HEALTH MATTERS</span>
          <h2>Right Care. Right Doctor. Right Time.</h2>
          <p>
            Discover a medical team that is ready to support your healthcare
            journey.
          </p>
        </div>

        <a href="#doctor-directory" className="doctor-primary-btn">
          Find Your Doctor <span>↗</span>
        </a>
      </section>
    </main>
  );
}

export default Doctors;