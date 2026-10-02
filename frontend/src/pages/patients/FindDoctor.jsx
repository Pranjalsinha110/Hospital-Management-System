import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { getAllDepartments } from "../../services/departmentService";
import { getAvailableDoctors } from "../../services/doctorService";

import "./FindDoctor.css";

const FindDoctor = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState("all");

  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [error, setError] = useState("");
  const [expandedDoctor, setExpandedDoctor] = useState(null);

  /*
   * Load active departments
   */
  useEffect(() => {
    let isMounted = true;

    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setError("");

        const response = await getAllDepartments();

        const departmentList = Array.isArray(response?.data)
          ? response.data
          : [];

        const activeDepartments = departmentList.filter(
          (department) => department?.isActive === true
        );

        if (isMounted) {
          setDepartments(activeDepartments);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.message ||
              "Departments load nahi ho pa rahe hain. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingDepartments(false);
        }
      }
    };

    loadDepartments();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * Load doctors according to selected department
   */
  useEffect(() => {
    let isMounted = true;

    const loadDoctors = async () => {
      if (!selectedDepartment) {
        setDoctors([]);
        return;
      }

      const department = departments.find(
        (item) => item?._id === selectedDepartment
      );

      if (!department?.name) {
        setDoctors([]);
        return;
      }

      try {
        setLoadingDoctors(true);
        setError("");
        setExpandedDoctor(null);

        const response = await getAvailableDoctors(department.name);

        const doctorList = Array.isArray(response?.data)
          ? response.data
          : [];

        if (isMounted) {
          setDoctors(doctorList);
        }
      } catch (err) {
        if (isMounted) {
          setDoctors([]);
          setError(
            err?.message ||
              "Available doctors load nahi ho pa rahe hain."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingDoctors(false);
        }
      }
    };

    loadDoctors();

    return () => {
      isMounted = false;
    };
  }, [selectedDepartment, departments]);

  /*
   * Extract unique specializations
   */
  const specializations = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor?.specialization)
      .filter(Boolean)
      .map((value) => value.trim());

    return ["all", ...Array.from(new Set(values))];
  }, [doctors]);

  /*
   * Filter doctors by search and specialization
   */
  const filteredDoctors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const doctorName = doctor?.user?.name || "";
      const specialization = doctor?.specialization || "";
      const qualification = doctor?.qualification || "";
      const departmentName = doctor?.department?.name || "";

      const searchableText = `
        ${doctorName}
        ${specialization}
        ${qualification}
        ${departmentName}
      `.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesSpecialization =
        selectedSpecialization === "all" ||
        specialization === selectedSpecialization;

      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, searchTerm, selectedSpecialization]);

  const selectedDepartmentName = useMemo(() => {
    return (
      departments.find(
        (department) => department?._id === selectedDepartment
      )?.name || ""
    );
  }, [departments, selectedDepartment]);

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
    setSearchTerm("");
    setSelectedSpecialization("all");
    setError("");
    setExpandedDoctor(null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSpecialization("all");
  };

  const handleBookAppointment = (doctor) => {
    /*
     * Existing BookAppointment page ko doctor preselect karne ke liye
     * doctorId aur departmentId navigation state mein bhej rahe hain.
     *
     * Agar BookAppointment.jsx mein abhi state handling nahi hai,
     * tab bhi page normally open hoga.
     */
    navigate("/patient/appointments/book", {
      state: {
        doctorId: doctor?._id || "",
        departmentId:
          doctor?.department?._id || selectedDepartment || "",
      },
    });
  };

  const getDoctorInitials = (name = "") => {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      return "DR";
    }

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const formatFee = (fee) => {
    if (fee === undefined || fee === null || fee === "") {
      return "Fee not available";
    }

    const numericFee = Number(fee);

    if (Number.isNaN(numericFee)) {
      return `₹${fee}`;
    }

    return `₹${numericFee.toLocaleString("en-IN")}`;
  };

  const formatAvailableDays = (days) => {
    if (!Array.isArray(days) || days.length === 0) {
      return "Schedule not updated";
    }

    return days
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(", ");
  };

  const formatAvailableTime = (availableTime) => {
    if (!availableTime?.start || !availableTime?.end) {
      return "Time not updated";
    }

    return `${availableTime.start} - ${availableTime.end}`;
  };

  return (
    <motion.section
      className="find-doctor-page"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="find-doctor-hero">
        <div className="find-doctor-hero-content">
          <span className="find-doctor-eyebrow">
            <i className="bx bx-first-aid" />
            Patient Care
          </span>

          <h1>Find the Right Doctor for You</h1>

          <p>
            Search experienced doctors, explore their specialties, and
            book your consultation with confidence.
          </p>

          <div className="find-doctor-hero-points">
            <span>
              <i className="bx bx-check-circle" />
              Verified doctor profiles
            </span>

            <span>
              <i className="bx bx-check-circle" />
              Easy appointment booking
            </span>

            <span>
              <i className="bx bx-check-circle" />
              Patient-friendly care
            </span>
          </div>
        </div>

        <div className="find-doctor-hero-visual">
          <div className="hero-visual-circle hero-circle-one" />
          <div className="hero-visual-circle hero-circle-two" />

          <div className="hero-doctor-icon">
            <i className="bx bx-heart" />
          </div>

          <div className="hero-floating-card hero-floating-card-top">
            <i className="bx bx-shield-check" />
            <span>Trusted Care</span>
          </div>

          <div className="hero-floating-card hero-floating-card-bottom">
            <i className="bx bx-calendar-check" />
            <span>Easy Booking</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          className="find-doctor-alert"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <i className="bx bx-error-circle" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Search and filters */}
      <div className="find-doctor-filter-card">
        <div className="find-doctor-filter-heading">
          <div className="filter-heading-icon">
            <i className="bx bx-search-alt-2" />
          </div>

          <div>
            <h2>Search Doctors</h2>
            <p>Choose a department and find your preferred doctor.</p>
          </div>
        </div>

        <div className="find-doctor-filter-grid">
          <div className="find-doctor-field department-field">
            <label htmlFor="doctor-department">
              <i className="bx bx-buildings" />
              Department
            </label>

            <select
              id="doctor-department"
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              disabled={loadingDepartments}
            >
              <option value="">
                {loadingDepartments
                  ? "Loading departments..."
                  : "Select department"}
              </option>

              {departments.map((department) => (
                <option
                  key={department?._id}
                  value={department?._id}
                >
                  {department?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="find-doctor-field search-field">
            <label htmlFor="doctor-search">
              <i className="bx bx-search" />
              Search by name or specialty
            </label>

            <div className="doctor-search-wrapper">
              <i className="bx bx-search" />

              <input
                id="doctor-search"
                type="text"
                placeholder="e.g. Dr. Sharma, Cardiologist..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                disabled={!selectedDepartment || loadingDoctors}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <i className="bx bx-x" />
                </button>
              )}
            </div>
          </div>

          <div className="find-doctor-field specialization-field">
            <label htmlFor="doctor-specialization">
              <i className="bx bx-filter-alt" />
              Specialization
            </label>

            <select
              id="doctor-specialization"
              value={selectedSpecialization}
              onChange={(event) =>
                setSelectedSpecialization(event.target.value)
              }
              disabled={!selectedDepartment || loadingDoctors}
            >
              {specializations.map((specialization) => (
                <option
                  key={specialization}
                  value={specialization}
                >
                  {specialization === "all"
                    ? "All specializations"
                    : specialization}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="find-doctor-filter-footer">
          <div className="filter-result-summary">
            <i className="bx bx-info-circle" />

            <span>
              {selectedDepartment
                ? `${filteredDoctors.length} doctor${
                    filteredDoctors.length !== 1 ? "s" : ""
                  } found`
                : "Select a department to view available doctors"}
            </span>

            {selectedDepartmentName && (
              <strong>{selectedDepartmentName}</strong>
            )}
          </div>

          <button
            type="button"
            className="reset-filter-button"
            onClick={handleResetFilters}
            disabled={!searchTerm && selectedSpecialization === "all"}
          >
            <i className="bx bx-reset" />
            Reset filters
          </button>
        </div>
      </div>

      {/* Doctor list */}
      <div className="find-doctor-list-section">
        <div className="find-doctor-list-heading">
          <div>
            <span className="section-small-label">
              <i className="bx bx-user-voice" />
              Available Specialists
            </span>

            <h2>
              {selectedDepartment
                ? `Doctors in ${selectedDepartmentName}`
                : "Explore Our Doctors"}
            </h2>
          </div>

          {selectedDepartment && !loadingDoctors && (
            <span className="doctor-count-badge">
              {filteredDoctors.length} Available
            </span>
          )}
        </div>

        {!selectedDepartment && (
          <div className="find-doctor-empty-state">
            <div className="empty-state-icon">
              <i className="bx bx-search-alt" />
            </div>

            <h3>Start Your Doctor Search</h3>

            <p>
              Select a department above to see doctors who are currently
              available for appointments.
            </p>
          </div>
        )}

        {selectedDepartment && loadingDoctors && (
          <div className="doctor-card-grid">
            {[1, 2, 3].map((item) => (
              <div className="doctor-skeleton-card" key={item}>
                <div className="skeleton skeleton-avatar" />
                <div className="skeleton skeleton-line skeleton-title" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short-line" />
                <div className="skeleton skeleton-button" />
              </div>
            ))}
          </div>
        )}

        {selectedDepartment &&
          !loadingDoctors &&
          filteredDoctors.length === 0 && (
            <div className="find-doctor-empty-state">
              <div className="empty-state-icon">
                <i className="bx bx-user-x" />
              </div>

              <h3>No Doctors Found</h3>

              <p>
                We could not find any doctors matching your selected
                filters. Try another specialization or search term.
              </p>

              <button
                type="button"
                className="empty-reset-button"
                onClick={handleResetFilters}
              >
                <i className="bx bx-reset" />
                Clear Filters
              </button>
            </div>
          )}

        {selectedDepartment &&
          !loadingDoctors &&
          filteredDoctors.length > 0 && (
            <div className="doctor-card-grid">
              {filteredDoctors.map((doctor, index) => {
                const doctorName = doctor?.user?.name || "Doctor";
                const initials = getDoctorInitials(doctorName);
                const isExpanded = expandedDoctor === doctor?._id;

                return (
                  <motion.article
                    className="doctor-profile-card"
                    key={doctor?._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    layout
                  >
                    <div className="doctor-card-top">
                      <div className="doctor-avatar-wrapper">
                        {doctor?.profileImage ? (
                          <img
                            src={doctor.profileImage}
                            alt={`${doctorName} profile`}
                            className="doctor-avatar-image"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              event.currentTarget.nextSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}

                        <div
                          className="doctor-avatar-fallback"
                          style={{
                            display: doctor?.profileImage
                              ? "none"
                              : "flex",
                          }}
                        >
                          {initials}
                        </div>

                        <span
                          className="doctor-online-dot"
                          title="Available doctor"
                        />
                      </div>

                      <div className="doctor-card-top-info">
                        <span className="doctor-available-label">
                          <i className="bx bx-check-circle" />
                          Available
                        </span>

                        <h3>{doctorName}</h3>

                        <p>{doctor?.specialization || "Specialist"}</p>
                      </div>
                    </div>

                    <div className="doctor-card-divider" />

                    <div className="doctor-card-details">
                      <div className="doctor-detail-item">
                        <i className="bx bx-graduation" />

                        <div>
                          <span>Qualification</span>
                          <strong>
                            {doctor?.qualification || "Not updated"}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-detail-item">
                        <i className="bx bx-briefcase-alt-2" />

                        <div>
                          <span>Experience</span>
                          <strong>
                            {doctor?.experience !== undefined &&
                            doctor?.experience !== null
                              ? `${doctor.experience} years`
                              : "Not updated"}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-detail-item">
                        <i className="bx bx-wallet" />

                        <div>
                          <span>Consultation Fee</span>
                          <strong>{formatFee(doctor?.consultationFee)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="doctor-schedule-preview">
                      <div>
                        <i className="bx bx-calendar-week" />
                        <span>
                          {formatAvailableDays(doctor?.availableDays)}
                        </span>
                      </div>

                      <div>
                        <i className="bx bx-time-five" />
                        <span>
                          {formatAvailableTime(doctor?.availableTime)}
                        </span>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          className="doctor-expanded-details"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="expanded-detail-row">
                            <i className="bx bx-building-house" />
                            <div>
                              <span>Department</span>
                              <strong>
                                {doctor?.department?.name ||
                                  selectedDepartmentName ||
                                  "Not updated"}
                              </strong>
                            </div>
                          </div>

                          <div className="expanded-detail-row">
                            <i className="bx bx-notepad" />
                            <div>
                              <span>About Doctor</span>
                              <p>
                                {doctor?.bio ||
                                  "Doctor profile description is not available yet."}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="doctor-card-actions">
                      <button
                        type="button"
                        className="doctor-details-button"
                        onClick={() =>
                          setExpandedDoctor(
                            isExpanded ? null : doctor?._id
                          )
                        }
                      >
                        <i
                          className={
                            isExpanded
                              ? "bx bx-chevron-up"
                              : "bx bx-info-circle"
                          }
                        />

                        {isExpanded ? "Less Details" : "View Details"}
                      </button>

                      <button
                        type="button"
                        className="doctor-book-button"
                        onClick={() => handleBookAppointment(doctor)}
                      >
                        <i className="bx bx-calendar-check" />
                        Book Now
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
      </div>
    </motion.section>
  );
};

export default FindDoctor;