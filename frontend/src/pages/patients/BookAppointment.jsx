import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { createAppointment } from "../../services/appointmentService";
import { getAllDepartments } from "../../services/departmentService";
import { getAvailableDoctors } from "../../services/doctorService";

import "./BookAppointment.css";

const initialFormData = {
  department: "",
  doctor: "",
  appointmentDate: "",
  appointmentTime: "",
  reason: "",
  consultationType: "In-Person",
};

const BookAppointment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  // Load active departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setError("");

        const response = await getAllDepartments();

        const departmentList = Array.isArray(response?.data)
          ? response.data
          : [];

        const activeDepartments = departmentList.filter(
          (department) => department.isActive === true
        );

        setDepartments(activeDepartments);
      } catch (err) {
        setError(
          err.message || "Departments can't load. Please try again."
        );
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Load available doctors according to selected department
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.department) {
        setDoctors([]);
        return;
      }

      const selectedDepartment = departments.find(
        (department) => department._id === formData.department
      );

      if (!selectedDepartment) {
        setDoctors([]);
        return;
      }

      try {
        setLoadingDoctors(true);
        setError("");

        const response = await getAvailableDoctors(
          selectedDepartment.name
        );

        const doctorList = Array.isArray(response?.data)
          ? response.data
          : [];

        setDoctors(doctorList);

        setFormData((previous) => ({
          ...previous,
          doctor: "",
        }));
      } catch (err) {
        setDoctors([]);
        setError(
          err.message || "Available doctors can't load. Please try again."
        );
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [formData.department, departments]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleDepartmentChange = (event) => {
    const departmentId = event.target.value;

    setFormData((previous) => ({
      ...previous,
      department: departmentId,
      doctor: "",
    }));

    setDoctors([]);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
   event.preventDefault();

  setError("");
  setSuccess("");

  if (!formData.department) {
    setError("Please select a department.");
    return;
  }

  if (!formData.doctor) {
    setError("Please select a doctor.");
    return;
  }

  if (!formData.appointmentDate) {
    setError("Please select appointment date.");
    return;
  }

  if (!formData.appointmentTime) {
    setError("Please select appointment time.");
    return;
  }

  if (!formData.reason.trim()) {
    setError("Please enter appointment reason.");
    return;
  }

  try {
    setSubmitting(true);

    const payload = {
      doctor: formData.doctor,
      department: formData.department,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      reason: formData.reason.trim(),
      consultationType: formData.consultationType,
    };

    const response = await createAppointment(payload);

    const appointmentId =
      response?.data?.appointment?._id ||
      response?.data?.appointment?.id;

    if (!appointmentId) {
      throw new Error(
        "Appointment ID server se receive nahi hua."
      );
    }

    // Appointment create hone ke baad directly payment page par redirect
    navigate(`/patient/payment/${appointmentId}`);
  } catch (err) {
    setError(
      err.message ||
        "Appointment can't be booked. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
  };

  return (
    <motion.section
      className="book-appointment-page"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="book-appointment-heading">
        <div>
          <span className="page-eyebrow">
            <i className="bx bx-calendar-heart" />
            Patient Services
          </span>

          <h1>Book an Appointment</h1>

          <p>
            Select your department, preferred doctor, date and consultation
            type to book your appointment.
          </p>
        </div>

        <button
          type="button"
          className="back-appointments-btn"
          onClick={() => navigate("/patient/appointments")}
        >
          <i className="bx bx-arrow-back" />
          My Appointments
        </button>
      </div>

      {error && (
        <motion.div
          className="appointment-alert appointment-alert-error"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <i className="bx bx-error-circle" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          className="appointment-alert appointment-alert-success"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <i className="bx bx-check-circle" />
          <span>{success}</span>
        </motion.div>
      )}

      <div className="appointment-form-layout">
        <div className="appointment-form-card">
          <div className="appointment-card-header">
            <div className="appointment-card-icon">
              <i className="bx bx-calendar-plus" />
            </div>

            <div>
              <h2>Appointment Details</h2>
              <p>Fill in the details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="appointment-form-grid">
              {/* Department */}
              <div className="appointment-field">
                <label htmlFor="department">
                  Department <span>*</span>
                </label>

                <div className="appointment-input-wrapper">
                  <i className="bx bx-buildings" />

                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleDepartmentChange}
                    disabled={loadingDepartments || submitting}
                    required
                  >
                    <option value="">
                      {loadingDepartments
                        ? "Loading departments..."
                        : "Select department"}
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department._id}
                        value={department._id}
                      >
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor */}
              <div className="appointment-field">
                <label htmlFor="doctor">
                  Doctor <span>*</span>
                </label>

                <div className="appointment-input-wrapper">
                  <i className="bx bx-user-md" />

                  <select
                    id="doctor"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    disabled={
                      !formData.department ||
                      loadingDoctors ||
                      submitting
                    }
                    required
                  >
                    <option value="">
                      {!formData.department
                        ? "First select department"
                        : loadingDoctors
                        ? "Loading doctors..."
                        : doctors.length === 0
                        ? "No doctors available"
                        : "Select doctor"}
                    </option>

                    {doctors.map((doctor) => (
                      <option
                        key={doctor._id}
                        value={doctor._id}
                      >
                        {doctor.user?.name || "Doctor"} —{" "}
                        {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div className="appointment-field">
                <label htmlFor="appointmentDate">
                  Appointment Date <span>*</span>
                </label>

                <div className="appointment-input-wrapper">
                  <i className="bx bx-calendar" />

                  <input
                    id="appointmentDate"
                    type="date"
                    name="appointmentDate"
                    min={today}
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {/* Time */}
              <div className="appointment-field">
                <label htmlFor="appointmentTime">
                  Appointment Time <span>*</span>
                </label>

                <div className="appointment-input-wrapper">
                  <i className="bx bx-time-five" />

                  <input
                    id="appointmentTime"
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {/* Consultation Type */}
              <div className="appointment-field appointment-full-field">
                <label htmlFor="consultationType">
                  Consultation Type <span>*</span>
                </label>

                <div className="consultation-options">
                  <label
                    className={
                      formData.consultationType === "In-Person"
                        ? "consultation-option selected"
                        : "consultation-option"
                    }
                  >
                    <input
                      type="radio"
                      name="consultationType"
                      value="In-Person"
                      checked={
                        formData.consultationType === "In-Person"
                      }
                      onChange={handleChange}
                      disabled={submitting}
                    />

                    <i className="bx bx-clinic" />

                    <span>
                      <strong>In-Person</strong>
                      <small>Visit hospital</small>
                    </span>
                  </label>

                  <label
                    className={
                      formData.consultationType === "Online"
                        ? "consultation-option selected"
                        : "consultation-option"
                    }
                  >
                    <input
                      type="radio"
                      name="consultationType"
                      value="Online"
                      checked={
                        formData.consultationType === "Online"
                      }
                      onChange={handleChange}
                      disabled={submitting}
                    />

                    <i className="bx bx-video" />

                    <span>
                      <strong>Online</strong>
                      <small>Video consultation</small>
                    </span>
                  </label>
                </div>
              </div>

              {/* Reason */}
              <div className="appointment-field appointment-full-field">
                <label htmlFor="reason">
                  Reason for Appointment <span>*</span>
                </label>

                <div className="appointment-input-wrapper appointment-textarea-wrapper">
                  <i className="bx bx-message-detail" />

                  <textarea
                    id="reason"
                    name="reason"
                    rows="4"
                    placeholder="Briefly describe your problem or reason for consultation..."
                    value={formData.reason}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="appointment-form-footer">
              <p>
                <i className="bx bx-info-circle" />
                Appointment confirmation depends on doctor availability.
              </p>

              <div className="appointment-form-actions">
                <button
                  type="button"
                  className="appointment-cancel-btn"
                  onClick={() => navigate("/patient/appointments")}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="appointment-submit-btn"
                  disabled={
                    submitting ||
                    loadingDepartments ||
                    loadingDoctors
                  }
                >
                  {submitting ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-calendar-check" />
                      Confirm Appointment
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <aside className="appointment-info-card">
          <div className="appointment-info-icon">
            <i className="bx bx-shield-check" />
          </div>

          <h3>Before You Book</h3>

          <ul>
            <li>
              <i className="bx bx-check" />
              Select an active department.
            </li>

            <li>
              <i className="bx bx-check" />
              Choose from available doctors.
            </li>

            <li>
              <i className="bx bx-check" />
              Select a future date and time.
            </li>

            <li>
              <i className="bx bx-check" />
              Provide an accurate appointment reason.
            </li>
          </ul>

          <div className="appointment-info-note">
            <i className="bx bx-lock-alt" />
            <span>
              Your patient identity is automatically taken from your login
              token.
            </span>
          </div>
        </aside>
      </div>
    </motion.section>
  );
};

export default BookAppointment;