import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDepartments } from "../../services/departmentService";
import "./Departments.css";

const departmentIcons = {
  Cardiology: "❤️",
  Neurology: "🧠",
  Orthopedics: "🦴",
  Pediatrics: "👶",
  Dermatology: "🧴",
  Dentistry: "🦷",
  Gynecology: "👩‍⚕️",
  "General Medicine": "🩺",
  Emergency: "🚑",
  Radiology: "🩻",
  "ENT": "👂",
  Ophthalmology: "👁️",
  default: "🏥",
};

const getDepartmentIcon = (departmentName = "") => {
  const matchedKey = Object.keys(departmentIcons).find(
    (key) => key.toLowerCase() === departmentName.toLowerCase()
  );

  return departmentIcons[matchedKey] || departmentIcons.default;
};

const getDepartmentDescription = (description, departmentName) => {
  if (description?.trim()) return description;

  return `Get expert medical consultation and quality healthcare services from our ${departmentName} department.`;
};

const Departments = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDepartments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllDepartments();

        /*
          Supports common backend response formats:

          1. [ departments ]
          2. { data: [ departments ] }
          3. { departments: [ departments ] }
          4. { success: true, data: [ departments ] }
        */

        const departmentList =
          response?.departments ||
          response?.data ||
          response ||
          [];

        if (isMounted) {
          const activeDepartments = Array.isArray(departmentList)
            ? departmentList.filter(
                (department) =>
                  department?.isActive === undefined ||
                  department?.isActive === true
              )
            : [];

          setDepartments(activeDepartments);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);

        if (isMounted) {
          setError(
            err?.message ||
              "Unable to load departments. Please try again later."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDepartments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDepartments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return departments;

    return departments.filter((department) => {
      const name = department?.name?.toLowerCase() || "";
      const description = department?.description?.toLowerCase() || "";

      return (
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      );
    });
  }, [departments, searchTerm]);

  const handleFindDoctor = (departmentName) => {
    navigate("/patient/find-doctor", {
      state: {
        departmentName,
        department: departmentName,
      },
    });
  };

  const handleBookAppointment = (departmentName) => {
    navigate("/patient/appointments/book", {
      state: {
        departmentName,
        department: departmentName,
      },
    });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="departments-page">
      <section className="departments-hero">
        <div className="departments-hero-content">
          <div className="departments-badge">
            <span className="badge-dot" />
            Patient Healthcare Services
          </div>

          <h1>
            Find the Right
            <span> Medical Department</span>
          </h1>

          <p>
            Explore our specialized departments and connect with qualified
            healthcare professionals for your medical needs.
          </p>

          <div className="departments-hero-stats">
            <div className="hero-stat">
              <strong>{departments.length}</strong>
              <span>Departments</span>
            </div>

            <div className="hero-stat-divider" />

            <div className="hero-stat">
              <strong>24/7</strong>
              <span>Patient Support</span>
            </div>

            <div className="hero-stat-divider" />

            <div className="hero-stat">
              <strong>100%</strong>
              <span>Patient Focused</span>
            </div>
          </div>
        </div>

        <div className="departments-hero-visual" aria-hidden="true">
          <div className="hero-circle hero-circle-one" />
          <div className="hero-circle hero-circle-two" />
          <div className="hero-medical-card">
            <span className="medical-card-icon">🩺</span>
            <div>
              <strong>Quality Healthcare</strong>
              <small>Care you can trust</small>
            </div>
          </div>
          <div className="hero-floating-icon hero-floating-icon-one">❤️</div>
          <div className="hero-floating-icon hero-floating-icon-two">🧠</div>
          <div className="hero-floating-icon hero-floating-icon-three">🦴</div>
        </div>
      </section>

      <section className="departments-content">
        <div className="departments-section-heading">
          <div>
            <span className="section-eyebrow">OUR SPECIALTIES</span>
            <h2>Choose a Department</h2>
            <p>
              Select a department to find doctors and book your appointment.
            </p>
          </div>

          <div className="departments-count">
            <strong>{filteredDepartments.length}</strong>
            <span>Available</span>
          </div>
        </div>

        <div className="departments-toolbar">
          <div className="departments-search-wrapper">
            <span className="search-icon">⌕</span>

            <input
              type="search"
              placeholder="Search department..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search department"
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search-button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="departments-toolbar-note">
            <span>✓</span>
            Trusted medical care
          </div>
        </div>

        {loading && (
          <div className="departments-state">
            <div className="loading-spinner" />
            <h3>Loading departments...</h3>
            <p>Please wait while we fetch available departments.</p>
          </div>
        )}

        {!loading && error && (
          <div className="departments-state error-state">
            <div className="state-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>

            <button type="button" onClick={handleRetry} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredDepartments.length === 0 && (
          <div className="departments-state">
            <div className="state-icon">🔍</div>
            <h3>No departments found</h3>
            <p>
              {searchTerm
                ? "Try searching with another department name."
                : "No active departments are available right now."}
            </p>

            {searchTerm && (
              <button
                type="button"
                className="retry-button"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredDepartments.length > 0 && (
          <div className="departments-grid">
            {filteredDepartments.map((department, index) => {
              const departmentName = department?.name || "Medical Department";
              const description = getDepartmentDescription(
                department?.description,
                departmentName
              );

              return (
                <article
                  className="department-card"
                  key={department?._id || department?.id || departmentName}
                  style={{ "--card-index": index }}
                >
                  <div className="department-card-top">
                    <div className="department-icon">
                      {getDepartmentIcon(departmentName)}
                    </div>

                    <span className="department-status">
                      <span className="status-dot" />
                      Available
                    </span>
                  </div>

                  <div className="department-card-body">
                    <h3>{departmentName}</h3>

                    <p>{description}</p>
                  </div>

                  <div className="department-card-footer">
                    <button
                      type="button"
                      className="department-outline-button"
                      onClick={() => handleFindDoctor(departmentName)}
                    >
                      Find Doctors
                      <span>↗</span>
                    </button>

                    <button
                      type="button"
                      className="department-primary-button"
                      onClick={() => handleBookAppointment(departmentName)}
                    >
                      Book Now
                      <span>→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Departments;