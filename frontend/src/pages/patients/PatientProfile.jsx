import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import patientService from "../../services/patientService";

import "./PatientProfile.css";

const PatientProfile = () => {
  const navigate = useNavigate();

  // =========================================================
  // PROFILE STATES
  // =========================================================

  const [patientProfile, setPatientProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
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
  // GET LOGGED-IN USER ID FROM JWT
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
        "=".repeat(
          (4 - (base64.length % 4)) % 4
        );

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
        "Unable to decode logged-in user:",
        err
      );

      return null;
    }
  }, []);

  // =========================================================
  // GET VALUE FROM PATIENT USER OBJECT
  // =========================================================

  const getPatientUserId = (patient) => {
    if (!patient?.user) {
      return null;
    }

    if (typeof patient.user === "string") {
      return patient.user;
    }

    return (
      patient.user?._id ||
      patient.user?.id ||
      null
    );
  };

  // =========================================================
  // FETCH MY PATIENT PROFILE
  // =========================================================
  //
  // Backend available:
  //
  // GET /patients
  //
  // There is no /patients/me GET endpoint in the current
  // backend, so we fetch patients and find the current
  // logged-in patient's profile using the JWT user ID.
  //
  // =========================================================

  const fetchMyPatientProfile = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const currentUserId =
          getLoggedInUserId();

        if (!currentUserId) {
          setPatientProfile(null);

          setError(
            "Unable to identify your account. Please login again."
          );

          return;
        }

        const response =
          await patientService.getAllPatients();

        const patients = Array.isArray(
          response?.data
        )
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        const currentPatient = patients.find(
          (patient) => {
            const patientUserId =
              getPatientUserId(patient);

            return (
              patientUserId &&
              String(patientUserId) ===
                String(currentUserId)
            );
          }
        );

        if (!currentPatient) {
          setPatientProfile(null);

          setError(
            "Your patient profile could not be found."
          );

          return;
        }

        setPatientProfile(currentPatient);

        populateForm(currentPatient);
      } catch (err) {
        console.error(
          "Fetch patient profile error:",
          err
        );

        setPatientProfile(null);

        setError(
          err?.message ||
            "Unable to load your patient profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [getLoggedInUserId]
  );

  // =========================================================
  // POPULATE FORM FROM PROFILE
  // =========================================================

  const populateForm = (profile) => {
    if (!profile) {
      return;
    }

    setFormData({
      dateOfBirth: profile.dateOfBirth
        ? formatDateForInput(profile.dateOfBirth)
        : "",

      gender: profile.gender || "",

      bloodGroup:
        profile.bloodGroup || "",

      medicalHistory:
        profile.medicalHistory || "",

      allergies:
        profile.allergies || "",

      existingConditions:
        profile.existingConditions || "",

      emergencyContact: {
        name:
          profile.emergencyContact?.name ||
          "",

        phone:
          profile.emergencyContact?.phone ||
          "",

        relation:
          profile.emergencyContact?.relation ||
          "",
      },
    });
  };

  // =========================================================
  // FORMAT DATE FOR HTML DATE INPUT
  // =========================================================

  const formatDateForInput = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // FORMAT DATE FOR DISPLAY
  // =========================================================

  const formatDisplayDate = (dateValue) => {
    if (!dateValue) {
      return "Not provided";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not provided";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // =========================================================
  // CALCULATE AGE
  // =========================================================

  const calculateAge = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    const birthDate = new Date(dateValue);

    if (Number.isNaN(birthDate.getTime())) {
      return null;
    }

    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  };

  // =========================================================
  // FORMATTED AGE
  // =========================================================

  const patientAge = useMemo(() => {
    return calculateAge(
      patientProfile?.dateOfBirth
    );
  }, [patientProfile?.dateOfBirth]);

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchMyPatientProfile();
  }, [fetchMyPatientProfile]);

  // =========================================================
  // HANDLE NORMAL FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // =========================================================
  // HANDLE EMERGENCY CONTACT CHANGE
  // =========================================================

  const handleEmergencyContactChange = (
    event
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,

      emergencyContact: {
        ...previous.emergencyContact,
        [name]: value,
      },
    }));

    if (error) {
      setError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // =========================================================
  // START EDITING
  // =========================================================

  const handleEdit = () => {
    if (!patientProfile) {
      return;
    }

    populateForm(patientProfile);

    setError("");

    setSuccessMessage("");

    setIsEditing(true);
  };

  // =========================================================
  // CANCEL EDITING
  // =========================================================

  const handleCancelEdit = () => {
    if (saving) {
      return;
    }

    populateForm(patientProfile);

    setError("");

    setSuccessMessage("");

    setIsEditing(false);
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    if (!formData.dateOfBirth) {
      return "Please select your date of birth.";
    }

    if (!formData.gender) {
      return "Please select your gender.";
    }

    if (!formData.bloodGroup) {
      return "Please select your blood group.";
    }

    if (
      !formData.emergencyContact.name.trim()
    ) {
      return "Please enter your emergency contact name.";
    }

    if (
      !formData.emergencyContact.phone.trim()
    ) {
      return "Please enter your emergency contact phone number.";
    }

    if (
      !formData.emergencyContact.relation.trim()
    ) {
      return "Please enter your emergency contact relation.";
    }

    return "";
  };

  // =========================================================
  // UPDATE PATIENT PROFILE
  // =========================================================
  //
  // Backend:
  //
  // PUT /patients/me
  //
  // Existing patientService.updateMyPatient()
  // is used here.
  //
  // =========================================================

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");

    setSuccessMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSaving(true);

      const payload = {
        dateOfBirth:
          formData.dateOfBirth,

        gender:
          formData.gender,

        bloodGroup:
          formData.bloodGroup,

        medicalHistory:
          formData.medicalHistory.trim(),

        allergies:
          formData.allergies.trim(),

        existingConditions:
          formData.existingConditions.trim(),

        emergencyContact: {
          name:
            formData.emergencyContact.name.trim(),

          phone:
            formData.emergencyContact.phone.trim(),

          relation:
            formData.emergencyContact.relation.trim(),
        },
      };

      const response =
        await patientService.updateMyPatient(
          payload
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to update patient profile."
        );
      }

      // -----------------------------------------------------
      // Get updated patient from response
      // -----------------------------------------------------

      const updatedPatient =
        response?.data?.patient ||
        response?.data ||
        null;

      if (updatedPatient) {
        setPatientProfile(
          updatedPatient
        );

        populateForm(
          updatedPatient
        );
      } else {
        // ---------------------------------------------------
        // If backend response doesn't return patient,
        // fetch latest profile again.
        // ---------------------------------------------------

        await fetchMyPatientProfile();
      }

      setIsEditing(false);

      setSuccessMessage(
        "Your patient profile has been updated successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Update patient profile error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update your patient profile. Please try again."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // REFRESH PROFILE
  // =========================================================

  const handleRefresh = async () => {
    if (loading || saving) {
      return;
    }

    await fetchMyPatientProfile();
  };

  // =========================================================
  // USER INFORMATION
  // =========================================================

  const userInfo =
    patientProfile?.user &&
    typeof patientProfile.user ===
      "object"
      ? patientProfile.user
      : null;

  const patientName =
    userInfo?.name ||
    userInfo?.fullName ||
    userInfo?.username ||
    "Patient";

  const patientEmail =
    userInfo?.email ||
    "Account email";

  // =========================================================
  // PATIENT INITIALS
  // =========================================================

  const patientInitials = useMemo(() => {
    const name =
      patientName || "Patient";

    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${
        words[words.length - 1][0]
      }`.toUpperCase();
    }

    return name
      .slice(0, 2)
      .toUpperCase();
  }, [patientName]);

  // =========================================================
  // PROFILE COMPLETION
  // =========================================================

  const profileCompletion = useMemo(() => {
    if (!patientProfile) {
      return 0;
    }

    const fields = [
      patientProfile.dateOfBirth,
      patientProfile.gender,
      patientProfile.bloodGroup,
      patientProfile.medicalHistory,
      patientProfile.allergies,
      patientProfile.existingConditions,
      patientProfile.emergencyContact?.name,
      patientProfile.emergencyContact?.phone,
      patientProfile.emergencyContact?.relation,
    ];

    const completed = fields.filter(
      (field) =>
        field !== undefined &&
        field !== null &&
        String(field).trim() !== ""
    ).length;

    return Math.round(
      (completed / fields.length) * 100
    );
  }, [patientProfile]);

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="patient-profile-page">
        <div className="patient-profile-loading">
          <motion.div
            className="patient-profile-loading-orb"
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
            <i className="bx bx-user" />
          </motion.div>

          <div>
            <h3>
              Loading your profile
            </h3>

            <p>
              Please wait while we fetch your
              healthcare information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PROFILE NOT FOUND
  // =========================================================

  if (!patientProfile) {
    return (
      <div className="patient-profile-page">
        <motion.div
          className="patient-profile-not-found"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <div className="profile-not-found-icon">
            <i className="bx bx-user-x" />
          </div>

          <span className="profile-page-kicker">
            Patient Profile
          </span>

          <h1>
            Profile not available
          </h1>

          <p>
            {error ||
              "We could not find your patient profile. Please create your profile from the dashboard."}
          </p>

          <div className="profile-not-found-actions">
            <button
              type="button"
              onClick={handleRefresh}
              className="profile-secondary-button"
            >
              <i className="bx bx-refresh" />
              Try Again
            </button>

            <Link
              to="/patient/dashboard"
              className="profile-primary-button"
            >
              <i className="bx bx-home-alt" />
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================
  // MAIN PROFILE PAGE
  // =========================================================

  return (
    <div className="patient-profile-page">

      {/* =====================================================
          PAGE HERO
      ====================================================== */}

      <motion.section
        className="patient-profile-hero"
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
        }}
      >
        <div className="patient-profile-hero-glow hero-glow-one" />

        <div className="patient-profile-hero-glow hero-glow-two" />

        <div className="patient-profile-hero-content">

          <div className="patient-profile-breadcrumb">
            <Link to="/patient/dashboard">
              Dashboard
            </Link>

            <i className="bx bx-chevron-right" />

            <span>My Profile</span>
          </div>

          <div className="patient-profile-hero-main">

            <div className="patient-profile-avatar">
              <span>
                {patientInitials}
              </span>

              <div className="profile-avatar-status">
                <i className="bx bx-check" />
              </div>
            </div>

            <div className="patient-profile-identity">
              <span className="profile-page-kicker">
                Patient Profile
              </span>

              <h1>
                {patientName}
              </h1>

              <p>
                <i className="bx bx-envelope" />
                {patientEmail}
              </p>

              <div className="profile-identity-tags">
                <span>
                  <i className="bx bx-shield-check" />
                  Verified Profile
                </span>

                <span>
                  <i className="bx bx-lock-alt" />
                  Secure Information
                </span>
              </div>
            </div>

            <div className="patient-profile-hero-actions">

              <button
                type="button"
                className="profile-refresh-button"
                onClick={handleRefresh}
                disabled={loading || saving}
              >
                <i className="bx bx-refresh" />
                <span>Refresh</span>
              </button>

              {!isEditing && (
                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={handleEdit}
                >
                  <i className="bx bx-edit-alt" />
                  <span>Edit Profile</span>
                </button>
              )}

              {isEditing && (
                <button
                  type="button"
                  className="profile-cancel-top-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <i className="bx bx-x" />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* =====================================================
          SUCCESS / ERROR ALERTS
      ====================================================== */}

      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="patient-profile-alert profile-alert-success"
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
          >
            <div className="profile-alert-icon">
              <i className="bx bx-check-circle" />
            </div>

            <div>
              <strong>
                Profile updated
              </strong>

              <span>
                {successMessage}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
              aria-label="Close success message"
            >
              <i className="bx bx-x" />
            </button>
          </motion.div>
        )}

        {error && isEditing && (
          <motion.div
            className="patient-profile-alert profile-alert-error"
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
          >
            <div className="profile-alert-icon">
              <i className="bx bx-error-circle" />
            </div>

            <div>
              <strong>
                Please check your information
              </strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error message"
            >
              <i className="bx bx-x" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          PROFILE OVERVIEW
      ====================================================== */}

      <motion.section
        className="patient-profile-overview-grid"
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
          delay: 0.1,
        }}
      >

        {/* PROFILE COMPLETION */}

        <article className="profile-overview-card profile-completion-card">

          <div className="overview-card-heading">
            <div className="overview-card-icon icon-blue">
              <i className="bx bx-user-check" />
            </div>

            <div>
              <span>
                Profile Status
              </span>

              <h3>
                Profile Completion
              </h3>
            </div>
          </div>

          <div className="profile-completion-content">

            <div
              className="profile-progress-circle"
              style={{
                "--profile-progress":
                  `${profileCompletion}%`,
              }}
            >
              <div>
                <strong>
                  {profileCompletion}%
                </strong>

                <span>
                  Complete
                </span>
              </div>
            </div>

            <div className="profile-completion-copy">
              <strong>
                {profileCompletion === 100
                  ? "Your profile is complete"
                  : "Keep your profile updated"}
              </strong>

              <p>
                Complete healthcare information
                helps keep your patient record
                accurate.
              </p>

              {!isEditing &&
                profileCompletion < 100 && (
                  <button
                    type="button"
                    onClick={handleEdit}
                  >
                    Complete Profile
                    <i className="bx bx-right-arrow-alt" />
                  </button>
                )}
            </div>
          </div>
        </article>

        {/* QUICK HEALTH SUMMARY */}

        <article className="profile-overview-card">

          <div className="overview-card-heading">
            <div className="overview-card-icon icon-green">
              <i className="bx bx-plus-medical" />
            </div>

            <div>
              <span>
                Health Summary
              </span>

              <h3>
                Quick Information
              </h3>
            </div>
          </div>

          <div className="health-summary-grid">

            <div className="health-summary-item">
              <span>
                <i className="bx bx-calendar" />
                Age
              </span>

              <strong>
                {patientAge !== null
                  ? `${patientAge} Years`
                  : "Not provided"}
              </strong>
            </div>

            <div className="health-summary-item">
              <span>
                <i className="bx bx-male-female" />
                Gender
              </span>

              <strong>
                {patientProfile.gender ||
                  "Not provided"}
              </strong>
            </div>

            <div className="health-summary-item">
              <span>
                <i className="bx bx-droplet" />
                Blood Group
              </span>

              <strong className="blood-group-value">
                {patientProfile.bloodGroup ||
                  "Not provided"}
              </strong>
            </div>

            <div className="health-summary-item">
              <span>
                <i className="bx bx-phone-call" />
                Emergency
              </span>

              <strong>
                {patientProfile
                  .emergencyContact?.name ||
                  "Not provided"}
              </strong>
            </div>

          </div>
        </article>
      </motion.section>

      {/* =====================================================
          PROFILE FORM / VIEW
      ====================================================== */}

      <form
        className={`patient-profile-details ${
          isEditing
            ? "profile-details-editing"
            : ""
        }`}
        onSubmit={handleSave}
      >

        {/* ===================================================
            PERSONAL INFORMATION
        ==================================================== */}

        <motion.section
          className="patient-profile-section-card"
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
            delay: 0.16,
          }}
        >

          <div className="profile-section-header">

            <div className="profile-section-title">
              <div className="profile-section-icon profile-icon-blue">
                <i className="bx bx-id-card" />
              </div>

              <div>
                <span>
                  Personal Details
                </span>

                <h2>
                  Personal Health Information
                </h2>

                <p>
                  Your basic healthcare information
                  and identification details.
                </p>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                className="section-edit-button"
                onClick={handleEdit}
              >
                <i className="bx bx-edit-alt" />
                Edit
              </button>
            )}
          </div>

          <div className="profile-info-grid">

            {/* DATE OF BIRTH */}

            <div className="profile-info-item">

              <div className="profile-info-label">
                <i className="bx bx-calendar" />
                <span>
                  Date of Birth
                </span>
              </div>

              {isEditing ? (
                <div className="profile-input-wrapper">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={
                      formData.dateOfBirth
                    }
                    onChange={handleChange}
                    max={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    disabled={saving}
                  />
                </div>
              ) : (
                <strong>
                  {formatDisplayDate(
                    patientProfile.dateOfBirth
                  )}
                </strong>
              )}
            </div>

            {/* GENDER */}

            <div className="profile-info-item">

              <div className="profile-info-label">
                <i className="bx bx-user" />
                <span>
                  Gender
                </span>
              </div>

              {isEditing ? (
                <div className="profile-input-wrapper">
                  <select
                    name="gender"
                    value={
                      formData.gender
                    }
                    onChange={handleChange}
                    disabled={saving}
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
              ) : (
                <strong>
                  {patientProfile.gender ||
                    "Not provided"}
                </strong>
              )}
            </div>

            {/* BLOOD GROUP */}

            <div className="profile-info-item">

              <div className="profile-info-label">
                <i className="bx bx-droplet" />
                <span>
                  Blood Group
                </span>
              </div>

              {isEditing ? (
                <div className="profile-input-wrapper">
                  <select
                    name="bloodGroup"
                    value={
                      formData.bloodGroup
                    }
                    onChange={handleChange}
                    disabled={saving}
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
              ) : (
                <strong className="blood-group-display">
                  {patientProfile.bloodGroup ||
                    "Not provided"}
                </strong>
              )}
            </div>

          </div>
        </motion.section>

        {/* ===================================================
            MEDICAL INFORMATION
        ==================================================== */}

        <motion.section
          className="patient-profile-section-card"
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
            delay: 0.22,
          }}
        >

          <div className="profile-section-header">

            <div className="profile-section-title">
              <div className="profile-section-icon profile-icon-purple">
                <i className="bx bx-plus-medical" />
              </div>

              <div>
                <span>
                  Healthcare Information
                </span>

                <h2>
                  Medical Information
                </h2>

                <p>
                  Important health information
                  associated with your profile.
                </p>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                className="section-edit-button"
                onClick={handleEdit}
              >
                <i className="bx bx-edit-alt" />
                Edit
              </button>
            )}
          </div>

          <div className="profile-medical-stack">

            {/* MEDICAL HISTORY */}

            <div className="profile-text-info">

              <div className="profile-text-info-header">
                <div className="profile-text-icon icon-purple">
                  <i className="bx bx-history" />
                </div>

                <div>
                  <strong>
                    Medical History
                  </strong>

                  <span>
                    Previous medical history
                  </span>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  name="medicalHistory"
                  rows="4"
                  value={
                    formData.medicalHistory
                  }
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Enter any important previous medical history..."
                />
              ) : (
                <p
                  className={
                    !patientProfile
                      .medicalHistory
                      ? "empty-profile-text"
                      : ""
                  }
                >
                  {patientProfile.medicalHistory ||
                    "No medical history has been added."}
                </p>
              )}
            </div>

            {/* ALLERGIES */}

            <div className="profile-text-info">

              <div className="profile-text-info-header">
                <div className="profile-text-icon icon-red">
                  <i className="bx bx-error" />
                </div>

                <div>
                  <strong>
                    Allergies
                  </strong>

                  <span>
                    Medicine, food or other allergies
                  </span>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  name="allergies"
                  rows="4"
                  value={
                    formData.allergies
                  }
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Mention any medicine, food or other allergies..."
                />
              ) : (
                <p
                  className={
                    !patientProfile
                      .allergies
                      ? "empty-profile-text"
                      : ""
                  }
                >
                  {patientProfile.allergies ||
                    "No allergies have been added."}
                </p>
              )}
            </div>

            {/* EXISTING CONDITIONS */}

            <div className="profile-text-info">

              <div className="profile-text-info-header">
                <div className="profile-text-icon icon-orange">
                  <i className="bx bx-pulse" />
                </div>

                <div>
                  <strong>
                    Existing Conditions
                  </strong>

                  <span>
                    Current health conditions
                  </span>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  name="existingConditions"
                  rows="4"
                  value={
                    formData.existingConditions
                  }
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Mention any existing health conditions..."
                />
              ) : (
                <p
                  className={
                    !patientProfile
                      .existingConditions
                      ? "empty-profile-text"
                      : ""
                  }
                >
                  {patientProfile.existingConditions ||
                    "No existing conditions have been added."}
                </p>
              )}
            </div>

          </div>
        </motion.section>

        {/* ===================================================
            EMERGENCY CONTACT
        ==================================================== */}

        <motion.section
          className="patient-profile-section-card emergency-profile-card"
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
            delay: 0.28,
          }}
        >

          <div className="profile-section-header">

            <div className="profile-section-title">

              <div className="profile-section-icon profile-icon-red">
                <i className="bx bx-phone-call" />
              </div>

              <div>
                <span>
                  Emergency Information
                </span>

                <h2>
                  Emergency Contact
                </h2>

                <p>
                  Someone we can contact in case
                  of an emergency.
                </p>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                className="section-edit-button"
                onClick={handleEdit}
              >
                <i className="bx bx-edit-alt" />
                Edit
              </button>
            )}
          </div>

          <div className="emergency-contact-grid">

            {/* NAME */}

            <div className="emergency-contact-item">

              <div className="emergency-contact-icon">
                <i className="bx bx-user" />
              </div>

              <div>
                <span>
                  Contact Name
                </span>

                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={
                      formData
                        .emergencyContact
                        .name
                    }
                    onChange={
                      handleEmergencyContactChange
                    }
                    disabled={saving}
                    placeholder="Full name"
                  />
                ) : (
                  <strong>
                    {patientProfile
                      .emergencyContact
                      ?.name ||
                      "Not provided"}
                  </strong>
                )}
              </div>
            </div>

            {/* PHONE */}

            <div className="emergency-contact-item">

              <div className="emergency-contact-icon">
                <i className="bx bx-phone" />
              </div>

              <div>
                <span>
                  Contact Phone
                </span>

                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={
                      formData
                        .emergencyContact
                        .phone
                    }
                    onChange={
                      handleEmergencyContactChange
                    }
                    disabled={saving}
                    placeholder="Phone number"
                  />
                ) : (
                  <strong>
                    {patientProfile
                      .emergencyContact
                      ?.phone ||
                      "Not provided"}
                  </strong>
                )}
              </div>
            </div>

            {/* RELATION */}

            <div className="emergency-contact-item">

              <div className="emergency-contact-icon">
                <i className="bx bx-group" />
              </div>

              <div>
                <span>
                  Relation
                </span>

                {isEditing ? (
                  <input
                    type="text"
                    name="relation"
                    value={
                      formData
                        .emergencyContact
                        .relation
                    }
                    onChange={
                      handleEmergencyContactChange
                    }
                    disabled={saving}
                    placeholder="e.g. Father, Mother, Spouse"
                  />
                ) : (
                  <strong>
                    {patientProfile
                      .emergencyContact
                      ?.relation ||
                      "Not provided"}
                  </strong>
                )}
              </div>
            </div>

          </div>
        </motion.section>

        {/* ===================================================
            EDIT ACTION BAR
        ==================================================== */}

        <AnimatePresence>
          {isEditing && (
            <motion.div
              className="patient-profile-save-bar"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 20,
              }}
            >

              <div className="save-bar-info">

                <div className="save-bar-icon">
                  <i className="bx bx-lock-alt" />
                </div>

                <div>
                  <strong>
                    You're editing your profile
                  </strong>

                  <span>
                    Your information is securely
                    saved to your patient record.
                  </span>
                </div>

              </div>

              <div className="save-bar-actions">

                <button
                  type="button"
                  className="save-bar-cancel"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-bar-submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" />

                      <span>
                        Saving Changes...
                      </span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-check" />

                      <span>
                        Save Changes
                      </span>
                    </>
                  )}
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </form>

      {/* =====================================================
          BOTTOM SECURITY NOTE
      ====================================================== */}

      <motion.div
        className="patient-profile-security-note"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          delay: 0.35,
        }}
      >
        <div className="security-note-icon">
          <i className="bx bx-shield-quarter" />
        </div>

        <div>
          <strong>
            Your health information is private
          </strong>

          <span>
            Your patient profile information is
            securely stored and used only for
            healthcare-related services.
          </span>
        </div>

        <i className="bx bx-lock-alt security-lock-icon" />
      </motion.div>

    </div>
  );
};

export default PatientProfile;