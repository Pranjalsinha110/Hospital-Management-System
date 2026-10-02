import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiFetch from "../../services/api";

import "./PatientDashboard.css";

const PatientDashboard = () => {
  const navigate = useNavigate();

  // =========================================================
  // APPOINTMENT STATES
  // =========================================================

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // PATIENT PROFILE STATES
  // =========================================================

  const [patientProfile, setPatientProfile] = useState(null);
  const [patientProfileLoading, setPatientProfileLoading] =
    useState(true);

  const [patientProfileError, setPatientProfileError] =
    useState("");

  const [showCreatePatientModal, setShowCreatePatientModal] =
    useState(false);

  const [creatingPatient, setCreatingPatient] =
    useState(false);

  const [patientFormError, setPatientFormError] =
    useState("");

  const [patientFormSuccess, setPatientFormSuccess] =
    useState("");

  // =========================================================
  // PATIENT FORM
  // =========================================================

  const [patientForm, setPatientForm] = useState({
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    medicalHistory: "",
    allergies: "",
    existingConditions: "",
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
  });

  // =========================================================
  // GET CURRENT USER ID
  // =========================================================
  //
  // We don't ask the patient to enter User ID.
  //
  // The logged-in JWT token contains the user identity.
  // This helper supports common JWT payload formats:
  // userId / id / _id / sub
  //
  // =========================================================

  const getLoggedInUserId = useCallback(() => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return null;
      }

      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const base64Url = parts[1];

      const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const paddedBase64 =
        base64 +
        "=".repeat((4 - (base64.length % 4)) % 4);

      const decodedPayload = JSON.parse(
        window.atob(paddedBase64)
      );

      return (
        decodedPayload?.userId ||
        decodedPayload?.id ||
        decodedPayload?._id ||
        decodedPayload?.sub ||
        null
      );
    } catch (err) {
      console.error(
        "Unable to get logged-in user ID:",
        err
      );

      return null;
    }
  }, []);

  // =========================================================
  // FETCH PATIENT PROFILE
  // =========================================================
  //
  // Current backend:
  //
  // GET /patients
  //
  // This returns Patient documents with populated User.
  //
  // We use the logged-in User ID to determine whether the
  // current user already has a Patient profile.
  //
  // =========================================================

  const fetchPatientProfile = useCallback(async () => {
    try {
      setPatientProfileLoading(true);
      setPatientProfileError("");

      const currentUserId = getLoggedInUserId();

      if (!currentUserId) {
        setPatientProfile(null);

        setPatientProfileError(
          "Unable to identify your account. Please login again."
        );

        return;
      }

      const response = await apiFetch("/patients");

      const patients = Array.isArray(response?.data)
        ? response.data
        : [];

      const currentPatient = patients.find((patient) => {
        const patientUserId =
          typeof patient?.user === "string"
            ? patient.user
            : patient?.user?._id ||
              patient?.user?.id ||
              null;

        return (
          patientUserId &&
          String(patientUserId) === String(currentUserId)
        );
      });

      setPatientProfile(currentPatient || null);
    } catch (err) {
      console.error(
        "Patient profile fetch error:",
        err
      );

      setPatientProfile(null);

      setPatientProfileError(
        err?.message ||
          "Unable to check your patient profile."
      );
    } finally {
      setPatientProfileLoading(false);
    }
  }, [getLoggedInUserId]);

  // =========================================================
  // FETCH PATIENT APPOINTMENTS
  // Backend:
  // GET /appointments/my
  // =========================================================

  const fetchAppointments = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await apiFetch(
          "/appointments/my"
        );

        const appointmentData = Array.isArray(
          response?.data
        )
          ? response.data
          : [];

        setAppointments(appointmentData);
      } catch (err) {
        console.error(
          "Patient dashboard appointment error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load your appointments. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // =========================================================
  // INITIAL DATA LOAD
  // =========================================================

  useEffect(() => {
    fetchAppointments();
    fetchPatientProfile();
  }, [fetchAppointments, fetchPatientProfile]);

  // =========================================================
  // FORM HANDLERS
  // =========================================================

  const handlePatientFormChange = (event) => {
    const { name, value } = event.target;

    setPatientForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (patientFormError) {
      setPatientFormError("");
    }

    if (patientFormSuccess) {
      setPatientFormSuccess("");
    }
  };

  const handleEmergencyContactChange = (event) => {
    const { name, value } = event.target;

    setPatientForm((previous) => ({
      ...previous,
      emergencyContact: {
        ...previous.emergencyContact,
        [name]: value,
      },
    }));

    if (patientFormError) {
      setPatientFormError("");
    }

    if (patientFormSuccess) {
      setPatientFormSuccess("");
    }
  };

  // =========================================================
  // OPEN CREATE PROFILE MODAL
  // =========================================================

  const openCreatePatientModal = () => {
    setPatientFormError("");
    setPatientFormSuccess("");

    setPatientForm({
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      medicalHistory: "",
      allergies: "",
      existingConditions: "",
      emergencyContact: {
        name: "",
        phone: "",
        relation: "",
      },
    });

    setShowCreatePatientModal(true);
  };

  // =========================================================
  // CLOSE CREATE PROFILE MODAL
  // =========================================================

  const closeCreatePatientModal = () => {
    if (creatingPatient) {
      return;
    }

    setShowCreatePatientModal(false);
    setPatientFormError("");
    setPatientFormSuccess("");
  };

  // =========================================================
  // CREATE PATIENT PROFILE
  // Backend:
  // POST /patients
  //
  // Current backend expects:
  //
  // {
  //   user,
  //   dateOfBirth,
  //   gender,
  //   bloodGroup,
  //   medicalHistory,
  //   allergies,
  //   existingConditions,
  //   emergencyContact
  // }
  //
  // User ID is automatically taken from JWT.
  // =========================================================

  const handleCreatePatientProfile = async (event) => {
    event.preventDefault();

    setPatientFormError("");
    setPatientFormSuccess("");

    const currentUserId = getLoggedInUserId();

    if (!currentUserId) {
      setPatientFormError(
        "Your login session could not be verified. Please login again."
      );

      return;
    }

    // -------------------------------------------------------
    // Basic validation
    // -------------------------------------------------------

    if (!patientForm.dateOfBirth) {
      setPatientFormError(
        "Please select your date of birth."
      );

      return;
    }

    if (!patientForm.gender) {
      setPatientFormError("Please select your gender.");

      return;
    }

    if (!patientForm.bloodGroup) {
      setPatientFormError(
        "Please select your blood group."
      );

      return;
    }

    if (!patientForm.emergencyContact.name.trim()) {
      setPatientFormError(
        "Please enter your emergency contact name."
      );

      return;
    }

    if (!patientForm.emergencyContact.phone.trim()) {
      setPatientFormError(
        "Please enter your emergency contact phone number."
      );

      return;
    }

    if (!patientForm.emergencyContact.relation.trim()) {
      setPatientFormError(
        "Please enter your emergency contact relation."
      );

      return;
    }

    try {
      setCreatingPatient(true);

      const payload = {
        // IMPORTANT:
        // User ID is automatically attached here.
        user: currentUserId,

        dateOfBirth: patientForm.dateOfBirth,
        gender: patientForm.gender,
        bloodGroup: patientForm.bloodGroup,

        medicalHistory:
          patientForm.medicalHistory.trim(),

        allergies: patientForm.allergies.trim(),

        existingConditions:
          patientForm.existingConditions.trim(),

        emergencyContact: {
          name: patientForm.emergencyContact.name.trim(),
          phone:
            patientForm.emergencyContact.phone.trim(),
          relation:
            patientForm.emergencyContact.relation.trim(),
        },
      };

      const response = await apiFetch("/patients", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to create patient profile."
        );
      }

      // -----------------------------------------------------
      // Patient created successfully
      // -----------------------------------------------------

      const createdPatient =
        response?.data?.patient || null;

      setPatientProfile(createdPatient);

      setPatientFormSuccess(
        "Your patient profile has been created successfully."
      );

      // Small delay so user can see success message
      setTimeout(() => {
        setShowCreatePatientModal(false);
        setPatientFormSuccess("");
      }, 900);
    } catch (err) {
      console.error(
        "Create patient profile error:",
        err
      );

      setPatientFormError(
        err?.message ||
          "Unable to create your patient profile. Please try again."
      );
    } finally {
      setCreatingPatient(false);
    }
  };

  // =========================================================
  // REFRESH EVERYTHING
  // =========================================================

  const handleDashboardRefresh = async () => {
    await Promise.all([
      fetchAppointments(true),
      fetchPatientProfile(),
    ]);
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getId = (value) => {
    if (!value) return null;

    if (typeof value === "string") return value;

    return value._id || value.id || null;
  };

  const getDoctorName = (doctor) => {
    if (!doctor) return "Doctor";

    if (doctor.user?.name) {
      return doctor.user.name;
    }

    if (doctor.name) {
      return doctor.name;
    }

    if (doctor.fullName) {
      return doctor.fullName;
    }

    return "Doctor";
  };

  const getDoctorInitials = (doctor) => {
    const name = getDoctorName(doctor);

    if (name === "Doctor") return "DR";

    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${
        words[words.length - 1][0]
      }`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  const getDepartmentName = (department) => {
    if (!department) return "General Consultation";

    return (
      department.name ||
      department.title ||
      "General Consultation"
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatDay = (dateValue) => {
    if (!dateValue) return "--";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
    }).format(date);
  };

  const formatMonth = (dateValue) => {
    if (!dateValue) return "---";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "---";
    }

    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
    })
      .format(date)
      .toUpperCase();
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "Time unavailable";

    const [hourString, minuteString] =
      timeValue.split(":");

    const hour = Number(hourString);
    const minute = Number(minuteString);

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {
      return timeValue;
    }

    const date = new Date();

    date.setHours(hour, minute, 0, 0);

    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "status-confirmed";

      case "Completed":
        return "status-completed";

      case "Pending":
        return "status-pending";

      case "Cancelled":
        return "status-cancelled";

      case "Rejected":
        return "status-rejected";

      default:
        return "status-default";
    }
  };

  const getPaymentClass = (paymentStatus) => {
    switch (paymentStatus) {
      case "Paid":
        return "payment-paid";

      case "Pending":
        return "payment-pending";

      case "Failed":
        return "payment-failed";

      case "Refunded":
        return "payment-refunded";

      default:
        return "payment-default";
    }
  };

  // =========================================================
  // DERIVED DASHBOARD DATA
  // =========================================================

  const dashboardStats = useMemo(() => {
    const total = appointments.length;

    const upcoming = appointments.filter(
      (appointment) =>
        appointment.status === "Pending" ||
        appointment.status === "Confirmed"
    ).length;

    const completed = appointments.filter(
      (appointment) =>
        appointment.status === "Completed"
    ).length;

    const pendingPayments = appointments.filter(
      (appointment) =>
        appointment.paymentStatus === "Pending"
    ).length;

    return {
      total,
      upcoming,
      completed,
      pendingPayments,
    };
  }, [appointments]);

  // =========================================================
  // UPCOMING APPOINTMENTS
  // =========================================================

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return appointments
      .filter((appointment) => {
        if (
          appointment.status !== "Pending" &&
          appointment.status !== "Confirmed"
        ) {
          return false;
        }

        if (!appointment.appointmentDate) {
          return false;
        }

        const appointmentDate = new Date(
          appointment.appointmentDate
        );

        if (Number.isNaN(appointmentDate.getTime())) {
          return false;
        }

        return appointmentDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.appointmentDate
        ).getTime();

        const dateB = new Date(
          b.appointmentDate
        ).getTime();

        if (dateA !== dateB) {
          return dateA - dateB;
        }

        return String(
          a.appointmentTime || ""
        ).localeCompare(
          String(b.appointmentTime || "")
        );
      });
  }, [appointments]);

  // =========================================================
  // RECENT APPOINTMENTS
  // =========================================================

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        const dateA = new Date(
          a.appointmentDate ||
            a.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b.appointmentDate ||
            b.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [appointments]);

  // =========================================================
  // NEXT APPOINTMENT
  // =========================================================

  const nextAppointment =
    upcomingAppointments[0] || null;

  // =========================================================
  // NAVIGATION
  // =========================================================

  const openAppointment = (appointment) => {
    const id = getId(appointment);

    if (!id) return;

    navigate(`/patient/appointments/${id}`);
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="patient-dashboard">
        <div className="dashboard-loading">
          <motion.div
            className="loading-orb"
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.65, 1, 0.65],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <i className="bx bx-plus-medical" />
          </motion.div>

          <div className="loading-content">
            <h3>Preparing your dashboard</h3>

            <p>
              Loading your latest healthcare
              information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN DASHBOARD
  // =========================================================

  return (
    <div className="patient-dashboard">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <motion.section
        className="patient-welcome-section"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <div className="welcome-copy">
          <div className="welcome-eyebrow">
            <span className="welcome-pulse" />
            Patient Portal
          </div>

          <h1>
            Your health,
            <span> your care, your way.</span>
          </h1>

          <p>
            Stay on top of your appointments and keep
            your healthcare journey organized from one
            secure place.
          </p>
        </div>

        <div className="welcome-actions">
          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={handleDashboardRefresh}
            disabled={refreshing}
          >
            <i
              className={`bx ${
                refreshing
                  ? "bx-loader-alt bx-spin"
                  : "bx-refresh"
              }`}
            />

            <span>
              {refreshing
                ? "Refreshing"
                : "Refresh"}
            </span>
          </button>

          <Link
            to="/patient/appointments/book"
            className="primary-dashboard-button"
          >
            <i className="bx bx-calendar-plus" />

            <span>Book Appointment</span>
          </Link>
        </div>
      </motion.section>

      {/* =====================================================
          CREATE PATIENT PROFILE PROMPT
      ====================================================== */}

      {!patientProfileLoading &&
        !patientProfile &&
        !patientProfileError && (
          <motion.section
            className="patient-profile-create-banner"
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.05,
            }}
          >
            <div className="patient-profile-banner-glow profile-glow-one" />
            <div className="patient-profile-banner-glow profile-glow-two" />

            <div className="patient-profile-banner-icon">
              <i className="bx bx-user-plus" />
            </div>

            <div className="patient-profile-banner-content">
              <span className="profile-banner-kicker">
                Profile setup
              </span>

              <h2>
                Complete your patient profile
              </h2>

              <p>
                Add your health information, blood group
                and emergency contact so we can keep your
                patient record complete.
              </p>

              <div className="profile-banner-meta">
                <span>
                  <i className="bx bx-check-circle" />
                  Secure profile
                </span>

                <span>
                  <i className="bx bx-lock-alt" />
                  Private information
                </span>
              </div>
            </div>

            <button
              type="button"
              className="create-profile-button"
              onClick={openCreatePatientModal}
            >
              <span>Create Patient Profile</span>
              <i className="bx bx-right-arrow-alt" />
            </button>
          </motion.section>
        )}

      {/* =====================================================
          PATIENT PROFILE CHECK ERROR
      ====================================================== */}

      {!patientProfileLoading &&
        patientProfileError && (
          <motion.div
            className="patient-profile-check-error"
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <div className="patient-profile-check-error-icon">
              <i className="bx bx-info-circle" />
            </div>

            <div>
              <strong>
                Patient profile status unavailable
              </strong>

              <span>
                {patientProfileError}
              </span>
            </div>

            <button
              type="button"
              onClick={fetchPatientProfile}
            >
              Retry
            </button>
          </motion.div>
        )}

      {/* =====================================================
          PROFILE CREATED SUMMARY
      ====================================================== */}

      {!patientProfileLoading &&
        patientProfile &&
        patientProfileError === "" && (
          <motion.section
            className="patient-profile-complete-banner"
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
          >
            <div className="patient-profile-complete-icon">
              <i className="bx bx-check-circle" />
            </div>

            <div className="patient-profile-complete-content">
              <strong>
                Patient profile completed
              </strong>

              <span>
                Your healthcare information is saved
                securely.
              </span>
            </div>

            <Link
              to="/patient/profile"
              className="patient-profile-complete-link"
            >
              View Profile
              <i className="bx bx-right-arrow-alt" />
            </Link>
          </motion.section>
        )}

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <motion.div
          className="dashboard-error"
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <div className="dashboard-error-icon">
            <i className="bx bx-error-circle" />
          </div>

          <div className="dashboard-error-content">
            <strong>
              Unable to load appointments
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => fetchAppointments()}
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <section className="patient-stat-grid">
        <motion.article
          className="patient-stat-card stat-blue"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.08,
          }}
        >
          <div className="stat-card-top">
            <div className="stat-icon">
              <i className="bx bx-calendar-check" />
            </div>

            <span className="stat-card-label">
              Total Appointments
            </span>
          </div>

          <div className="stat-value">
            {dashboardStats.total}
          </div>

          <div className="stat-footer">
            <span>All appointments</span>

            <i className="bx bx-right-arrow-alt" />
          </div>
        </motion.article>

        <motion.article
          className="patient-stat-card stat-green"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.14,
          }}
        >
          <div className="stat-card-top">
            <div className="stat-icon">
              <i className="bx bx-time-five" />
            </div>

            <span className="stat-card-label">
              Upcoming
            </span>
          </div>

          <div className="stat-value">
            {dashboardStats.upcoming}
          </div>

          <div className="stat-footer">
            <span>Pending or confirmed</span>

            <i className="bx bx-right-arrow-alt" />
          </div>
        </motion.article>

        <motion.article
          className="patient-stat-card stat-purple"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.2,
          }}
        >
          <div className="stat-card-top">
            <div className="stat-icon">
              <i className="bx bx-check-shield" />
            </div>

            <span className="stat-card-label">
              Completed
            </span>
          </div>

          <div className="stat-value">
            {dashboardStats.completed}
          </div>

          <div className="stat-footer">
            <span>Completed visits</span>

            <i className="bx bx-right-arrow-alt" />
          </div>
        </motion.article>

        <motion.article
          className="patient-stat-card stat-orange"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.26,
          }}
        >
          <div className="stat-card-top">
            <div className="stat-icon">
              <i className="bx bx-wallet" />
            </div>

            <span className="stat-card-label">
              Payment Pending
            </span>
          </div>

          <div className="stat-value">
            {dashboardStats.pendingPayments}
          </div>

          <div className="stat-footer">
            <span>Need your attention</span>

            <i className="bx bx-right-arrow-alt" />
          </div>
        </motion.article>
      </section>

      {/* =====================================================
          MAIN CONTENT GRID
      ====================================================== */}

      <section className="patient-main-grid">

        {/* ===================================================
            NEXT APPOINTMENT
        ==================================================== */}

        <motion.article
          className="next-appointment-card"
          initial={{
            opacity: 0,
            x: -18,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.28,
          }}
        >
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Your schedule
              </span>

              <h2>Next Appointment</h2>
            </div>

            <Link
              to="/patient/appointments"
              className="section-link"
            >
              View all

              <i className="bx bx-right-arrow-alt" />
            </Link>
          </div>

          {nextAppointment ? (
            <div className="next-appointment-body">
              <div className="appointment-date-block">
                <span>
                  {formatMonth(
                    nextAppointment.appointmentDate
                  )}
                </span>

                <strong>
                  {formatDay(
                    nextAppointment.appointmentDate
                  )}
                </strong>

                <small>
                  {formatDate(
                    nextAppointment.appointmentDate
                  ).split(",")[0]}
                </small>
              </div>

              <div className="appointment-details">
                <div className="doctor-row">
                  <div className="doctor-avatar">
                    {getDoctorInitials(
                      nextAppointment.doctor
                    )}
                  </div>

                  <div className="doctor-info">
                    <h3>
                      {getDoctorName(
                        nextAppointment.doctor
                      )}
                    </h3>

                    <p>
                      {nextAppointment.doctor
                        ?.specialization ||
                        "Medical Specialist"}
                    </p>
                  </div>
                </div>

                <div className="appointment-meta-grid">
                  <div className="appointment-meta">
                    <i className="bx bx-building-house" />

                    <div>
                      <span>Department</span>

                      <strong>
                        {getDepartmentName(
                          nextAppointment.department
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="appointment-meta">
                    <i className="bx bx-time-five" />

                    <div>
                      <span>Time</span>

                      <strong>
                        {formatTime(
                          nextAppointment.appointmentTime
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="appointment-meta">
                    <i className="bx bx-video" />

                    <div>
                      <span>Consultation</span>

                      <strong>
                        {nextAppointment.consultationType ||
                          "In-Person"}
                      </strong>
                    </div>
                  </div>

                  <div className="appointment-meta">
                    <i className="bx bx-credit-card" />

                    <div>
                      <span>Payment</span>

                      <strong
                        className={getPaymentClass(
                          nextAppointment.paymentStatus
                        )}
                      >
                        {nextAppointment.paymentStatus ||
                          "Pending"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="next-appointment-footer">
                  <span
                    className={`appointment-status ${getStatusClass(
                      nextAppointment.status
                    )}`}
                  >
                    <span className="status-dot" />

                    {nextAppointment.status ||
                      "Pending"}
                  </span>

                  <Link
                    to="/patient/appointments"
                    className="section-link"
                  >
                    View Details

                    <i className="bx bx-right-arrow-alt" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-next-appointment">
              <div className="empty-state-icon">
                <i className="bx bx-calendar-x" />
              </div>

              <div>
                <h3>
                  No upcoming appointment
                </h3>

                <p>
                  You don't have any pending or
                  confirmed appointments right now.
                </p>

                <Link
                  to="/patient/appointments"
                  className="empty-state-button"
                >
                  <i className="bx bx-calendar-plus" />

                  Book an Appointment
                </Link>
              </div>
            </div>
          )}
        </motion.article>

        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        <motion.article
          className="quick-actions-card"
          initial={{
            opacity: 0,
            x: 18,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.34,
          }}
        >
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Explore
              </span>

              <h2>Quick Actions</h2>
            </div>
          </div>

          <div className="quick-actions-grid">

            <Link
              to="/patient/appointments"
              className="quick-action"
            >
              <span className="quick-action-icon icon-blue">
                <i className="bx bx-calendar-plus" />
              </span>

              <span>
                <strong>Appointments</strong>

                <small>
                  Manage your visits
                </small>
              </span>

              <i className="bx bx-chevron-right" />
            </Link>

            <Link
              to="/patient/find-doctor"
              className="quick-action"
            >
              <span className="quick-action-icon icon-green">
                <i className="bx bx-user-plus" />
              </span>

              <span>
                <strong>Find a Doctor</strong>

                <small>
                  Explore specialists
                </small>
              </span>

              <i className="bx bx-chevron-right" />
            </Link>

            <Link
              to="/patient/medical-records"
              className="quick-action"
            >
              <span className="quick-action-icon icon-purple">
                <i className="bx bx-book" />
              </span>

              <span>
                <strong>Medical Records</strong>

                <small>
                  View your records
                </small>
              </span>

              <i className="bx bx-chevron-right" />
            </Link>

            <Link
              to="/patient/ai"
              className="quick-action ai-action"
            >
              <span className="quick-action-icon icon-ai">
                <i className="bx bx-bot" />
              </span>

              <span>
                <strong>AI Assistant</strong>

                <small>
                  Ask a health question
                </small>
              </span>

              <i className="bx bx-chevron-right" />
            </Link>

            <Link
              to="/patient/profile"
              className="quick-action"
            >
              <span className="quick-action-icon icon-teal">
                <i className="bx bx-user-circle" />
              </span>

              <span>
                <strong>My Profile</strong>

                <small>
                  Manage your information
                </small>
              </span>

              <i className="bx bx-chevron-right" />
            </Link>
          </div>
        </motion.article>
      </section>

      {/* =====================================================
          RECENT APPOINTMENTS
      ====================================================== */}

      <motion.section
        className="recent-appointments-card"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 0.4,
        }}
      >
        <div className="section-heading recent-heading">
          <div>
            <span className="section-kicker">
              Activity
            </span>

            <h2>Recent Appointments</h2>
          </div>

          <Link
            to="/patient/appointments"
            className="section-link"
          >
            View all

            <i className="bx bx-right-arrow-alt" />
          </Link>
        </div>

        {recentAppointments.length > 0 ? (
          <div className="recent-appointments-list">
            {recentAppointments.map(
              (appointment, index) => {
                const appointmentId =
                  getId(appointment);

                return (
                  <motion.div
                    className="recent-appointment-row"
                    key={
                      appointmentId ||
                      `${appointment.appointmentDate}-${appointment.appointmentTime}-${index}`
                    }
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.35,
                      delay:
                        0.45 + index * 0.06,
                    }}
                  >
                    <div className="recent-date">
                      <strong>
                        {formatDay(
                          appointment.appointmentDate
                        )}
                      </strong>

                      <span>
                        {formatMonth(
                          appointment.appointmentDate
                        )}
                      </span>
                    </div>

                    <div className="recent-doctor">
                      <div className="recent-doctor-avatar">
                        {getDoctorInitials(
                          appointment.doctor
                        )}
                      </div>

                      <div>
                        <strong>
                          {getDoctorName(
                            appointment.doctor
                          )}
                        </strong>

                        <span>
                          {getDepartmentName(
                            appointment.department
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="recent-time">
                      <i className="bx bx-time-five" />

                      <span>
                        {formatTime(
                          appointment.appointmentTime
                        )}
                      </span>
                    </div>

                    <div className="recent-consultation">
                      <i
                        className={
                          appointment.consultationType ===
                          "Online"
                            ? "bx bx-video"
                            : "bx bx-clinic"
                        }
                      />

                      <span>
                        {appointment.consultationType ||
                          "In-Person"}
                      </span>
                    </div>

                    <div className="recent-status">
                      <span
                        className={`appointment-status ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        <span className="status-dot" />

                        {appointment.status ||
                          "Pending"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="recent-view-button"
                      onClick={() =>
                        openAppointment(
                          appointment
                        )
                      }
                      disabled={!appointmentId}
                      aria-label="View appointment details"
                    >
                      <i className="bx bx-chevron-right" />
                    </button>
                  </motion.div>
                );
              }
            )}
          </div>
        ) : (
          <div className="recent-empty-state">
            <div>
              <i className="bx bx-calendar" />
            </div>

            <h3>
              No appointment history yet
            </h3>

            <p>
              Your appointments will appear here
              once you book one.
            </p>

            <Link
              to="/patient/appointments"
              className="empty-state-button"
            >
              Book Your First Appointment
            </Link>
          </div>
        )}
      </motion.section>

      {/* =====================================================
          HEALTHCARE ASSISTANT BANNER
      ====================================================== */}

      <motion.section
        className="patient-ai-banner"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 0.48,
        }}
      >
        <div className="ai-banner-glow ai-glow-one" />

        <div className="ai-banner-glow ai-glow-two" />

        <div className="ai-banner-icon">
          <i className="bx bx-bot" />
        </div>

        <div className="ai-banner-content">
          <span>
            Healthcare Assistant
          </span>

          <h2>
            Have a health-related question?
          </h2>

          <p>
            Ask our AI assistant for general
            healthcare information and guidance.
          </p>
        </div>
      </motion.section>

      {/* =====================================================
          CREATE PATIENT PROFILE MODAL
      ====================================================== */}

      <AnimatePresence>
        {showCreatePatientModal && (
          <motion.div
            className="patient-profile-modal-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                closeCreatePatientModal();
              }
            }}
          >
            <motion.div
              className="patient-profile-modal"
              initial={{
                opacity: 0,
                y: 28,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              transition={{
                duration: 0.28,
                ease: "easeOut",
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="patient-profile-modal-title"
            >

              {/* =================================================
                  MODAL HEADER
              ================================================== */}

              <div className="patient-profile-modal-header">
                <div className="patient-profile-modal-heading">
                  <div className="patient-profile-modal-icon">
                    <i className="bx bx-user-plus" />
                  </div>

                  <div>
                    <span>
                      Patient Registration
                    </span>

                    <h2 id="patient-profile-modal-title">
                      Create Patient Profile
                    </h2>

                    <p>
                      Complete your healthcare
                      information below.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="patient-profile-modal-close"
                  onClick={closeCreatePatientModal}
                  disabled={creatingPatient}
                  aria-label="Close"
                >
                  <i className="bx bx-x" />
                </button>
              </div>

              {/* =================================================
                  MODAL FORM
              ================================================== */}

              <form
                className="patient-profile-form"
                onSubmit={
                  handleCreatePatientProfile
                }
              >

                {/* ===============================================
                    PERSONAL HEALTH INFORMATION
                ================================================ */}

                <div className="patient-profile-form-section">
                  <div className="patient-profile-form-section-heading">
                    <div className="form-section-icon">
                      <i className="bx bx-id-card" />
                    </div>

                    <div>
                      <h3>
                        Personal Health Information
                      </h3>

                      <p>
                        Tell us a few important
                        details about your health.
                      </p>
                    </div>
                  </div>

                  <div className="patient-profile-form-grid">

                    {/* DATE OF BIRTH */}

                    <div className="patient-profile-form-group">
                      <label htmlFor="dateOfBirth">
                        Date of Birth
                        <span>*</span>
                      </label>

                      <div className="patient-profile-input-wrapper">
                        <i className="bx bx-calendar" />

                        <input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={
                            patientForm.dateOfBirth
                          }
                          onChange={
                            handlePatientFormChange
                          }
                          max={
                            new Date()
                              .toISOString()
                              .split("T")[0]
                          }
                          disabled={creatingPatient}
                        />
                      </div>
                    </div>

                    {/* GENDER */}

                    <div className="patient-profile-form-group">
                      <label htmlFor="gender">
                        Gender
                        <span>*</span>
                      </label>

                      <div className="patient-profile-input-wrapper">
                        <i className="bx bx-user" />

                        <select
                          id="gender"
                          name="gender"
                          value={
                            patientForm.gender
                          }
                          onChange={
                            handlePatientFormChange
                          }
                          disabled={
                            creatingPatient
                          }
                        >
                          <option value="">
                            Select gender
                          </option>

                          <option value="Male">
                            Male
                          </option>

                          <option value="Female">
                            Female
                          </option>

                          <option value="Other">
                            Other
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* BLOOD GROUP */}

                    <div className="patient-profile-form-group">
                      <label htmlFor="bloodGroup">
                        Blood Group
                        <span>*</span>
                      </label>

                      <div className="patient-profile-input-wrapper">
                        <i className="bx bx-droplet" />

                        <select
                          id="bloodGroup"
                          name="bloodGroup"
                          value={
                            patientForm.bloodGroup
                          }
                          onChange={
                            handlePatientFormChange
                          }
                          disabled={
                            creatingPatient
                          }
                        >
                          <option value="">
                            Select blood group
                          </option>

                          <option value="A+">
                            A+
                          </option>

                          <option value="A-">
                            A-
                          </option>

                          <option value="B+">
                            B+
                          </option>

                          <option value="B-">
                            B-
                          </option>

                          <option value="AB+">
                            AB+
                          </option>

                          <option value="AB-">
                            AB-
                          </option>

                          <option value="O+">
                            O+
                          </option>

                          <option value="O-">
                            O-
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===============================================
                    MEDICAL INFORMATION
                ================================================ */}

                <div className="patient-profile-form-section">
                  <div className="patient-profile-form-section-heading">
                    <div className="form-section-icon">
                      <i className="bx bx-plus-medical" />
                    </div>

                    <div>
                      <h3>
                        Medical Information
                      </h3>

                      <p>
                        This information helps keep
                        your medical profile complete.
                      </p>
                    </div>
                  </div>

                  <div className="patient-profile-form-stack">

                    {/* MEDICAL HISTORY */}

                    <div className="patient-profile-form-group">
                      <label htmlFor="medicalHistory">
                        Medical History
                      </label>

                      <textarea
                        id="medicalHistory"
                        name="medicalHistory"
                        rows="3"
                        placeholder="Enter any important previous medical history..."
                        value={
                          patientForm.medicalHistory
                        }
                        onChange={
                          handlePatientFormChange
                        }
                        disabled={creatingPatient}
                      />
                    </div>

                    {/* ALLERGIES */}

                    <div className="patient-profile-form-group">
                      <label htmlFor="allergies">
                        Allergies
                      </label>

                      <textarea
                        id="allergies"
                        name="allergies"
                        rows="3"
                        placeholder="Mention any medicine, food or other allergies..."
                        value={
                          patientForm.allergies
                        }
                        onChange={
                          handlePatientFormChange
                        }
                        disabled={creatingPatient}
                      />
                    </div>

                    {/* EXISTING CONDITIONS */}

                    <div className="patient-profile-form-group">
                      <label htmlFor="existingConditions">
                        Existing Conditions
                      </label>

                      <textarea
                        id="existingConditions"
                        name="existingConditions"
                        rows="3"
                        placeholder="Mention any existing health conditions..."
                        value={
                          patientForm.existingConditions
                        }
                        onChange={
                          handlePatientFormChange
                        }
                        disabled={creatingPatient}
                      />
                    </div>
                  </div>
                </div>

                {/* ===============================================
                    EMERGENCY CONTACT
                ================================================ */}

                <div className="patient-profile-form-section">
                  <div className="patient-profile-form-section-heading">
                    <div className="form-section-icon emergency-form-icon">
                      <i className="bx bx-phone-call" />
                    </div>

                    <div>
                      <h3>
                        Emergency Contact
                      </h3>

                      <p>
                        Someone we can contact in
                        case of an emergency.
                      </p>
                    </div>
                  </div>

                  <div className="patient-profile-form-grid">

                    {/* CONTACT NAME */}

                    <div className="patient-profile-form-group">
                      <label htmlFor="emergencyName">
                        Contact Name
                        <span>*</span>
                      </label>

                      <div className="patient-profile-input-wrapper">
                        <i className="bx bx-user" />

                        <input
                          id="emergencyName"
                          name="name"
                          type="text"
                          placeholder="Full name"
                          value={
                            patientForm
                              .emergencyContact
                              .name
                          }
                          onChange={
                            handleEmergencyContactChange
                          }
                          disabled={
                            creatingPatient
                          }
                        />
                      </div>
                    </div>

                    {/* CONTACT PHONE */}

                    <div className="patient-profile-form-group">
                      <label htmlFor="emergencyPhone">
                        Contact Phone
                        <span>*</span>
                      </label>

                      <div className="patient-profile-input-wrapper">
                        <i className="bx bx-phone" />

                        <input
                          id="emergencyPhone"
                          name="phone"
                          type="tel"
                          placeholder="Phone number"
                          value={
                            patientForm
                              .emergencyContact
                              .phone
                          }
                          onChange={
                            handleEmergencyContactChange
                          }
                          disabled={
                            creatingPatient
                          }
                        />
                      </div>
                    </div>

                    {/* RELATION */}

                    <div className="patient-profile-form-group">
                      <label htmlFor="emergencyRelation">
                        Relation with you
                        <span>*</span>
                      </label>

                      <div className="patient-profile-input-wrapper">
                        <i className="bx bx-group" />

                        <input
                          id="emergencyRelation"
                          name="relation"
                          type="text"
                          placeholder="e.g. Father, Mother, Spouse"
                          value={
                            patientForm
                              .emergencyContact
                              .relation
                          }
                          onChange={
                            handleEmergencyContactChange
                          }
                          disabled={
                            creatingPatient
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===============================================
                    FORM ERROR
                ================================================ */}

                {patientFormError && (
                  <motion.div
                    className="patient-profile-form-error"
                    initial={{
                      opacity: 0,
                      y: -6,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                  >
                    <i className="bx bx-error-circle" />

                    <span>
                      {patientFormError}
                    </span>
                  </motion.div>
                )}

                {/* ===============================================
                    FORM SUCCESS
                ================================================ */}

                {patientFormSuccess && (
                  <motion.div
                    className="patient-profile-form-success"
                    initial={{
                      opacity: 0,
                      y: -6,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                  >
                    <i className="bx bx-check-circle" />

                    <span>
                      {patientFormSuccess}
                    </span>
                  </motion.div>
                )}

                {/* ===============================================
                    FORM FOOTER
                ================================================ */}

                <div className="patient-profile-form-footer">
                  <div className="profile-form-security">
                    <i className="bx bx-lock-alt" />

                    <span>
                      Your information is securely
                      stored.
                    </span>
                  </div>

                  <div className="patient-profile-form-actions">
                    <button
                      type="button"
                      className="patient-profile-cancel-button"
                      onClick={
                        closeCreatePatientModal
                      }
                      disabled={creatingPatient}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="patient-profile-submit-button"
                      disabled={creatingPatient}
                    >
                      {creatingPatient ? (
                        <>
                          <i className="bx bx-loader-alt bx-spin" />

                          <span>
                            Creating Profile...
                          </span>
                        </>
                      ) : (
                        <>
                          <i className="bx bx-check" />

                          <span>
                            Create Profile
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDashboard;