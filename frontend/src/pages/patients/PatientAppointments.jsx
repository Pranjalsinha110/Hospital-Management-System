import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  cancelAppointment,
  getMyAppointments,
} from "../../services/appointmentService";

import "./PatientAppointments.css";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyAppointments();

      setAppointments(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError(err.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDoctorName = (appointment) => {
    const doctor = appointment?.doctor;

    if (!doctor) return "Doctor";

    if (doctor.user?.name) {
      return `Dr. ${doctor.user.name}`;
    }

    if (doctor.name) {
      return doctor.name.startsWith("Dr.")
        ? doctor.name
        : `Dr. ${doctor.name}`;
    }

    return doctor.specialization || "Assigned Doctor";
  };

  const getDoctorInitials = (appointment) => {
    const doctorName = getDoctorName(appointment)
      .replace(/^Dr\.\s*/i, "")
      .trim();

    return doctorName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "DR";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "status-confirmed";

      case "Completed":
        return "status-completed";

      case "Cancelled":
        return "status-cancelled";

      case "Rejected":
        return "status-rejected";

      case "Pending":
      default:
        return "status-pending";
    }
  };

  const getPaymentClass = (paymentStatus) => {
    switch (paymentStatus) {
      case "Paid":
        return "payment-paid";

      case "Failed":
        return "payment-failed";

      case "Refunded":
        return "payment-refunded";

      case "Pending":
      default:
        return "payment-pending";
    }
  };

  const canCancelAppointment = (appointment) => {
    return (
      appointment?.status !== "Completed" &&
      appointment?.status !== "Cancelled" &&
      appointment?.status !== "Rejected"
    );
  };

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const doctorName = getDoctorName(appointment).toLowerCase();

      const departmentName =
        appointment?.department?.name?.toLowerCase() || "";

      const specialization =
        appointment?.doctor?.specialization?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        doctorName.includes(normalizedSearch) ||
        departmentName.includes(normalizedSearch) ||
        specialization.includes(normalizedSearch) ||
        appointment?.appointmentTime?.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        appointment?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const handleCancelAppointment = async () => {
    if (!cancelTarget?._id) return;

    try {
      setCancelling(true);
      setActionError("");
      setSuccessMessage("");

      const response = await cancelAppointment(cancelTarget._id);

      const updatedAppointment = response?.data?.appointment;

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment._id === cancelTarget._id
            ? {
                ...appointment,
                status: updatedAppointment?.status || "Cancelled",
                paymentStatus:
                  updatedAppointment?.paymentStatus ||
                  appointment.paymentStatus,
              }
            : appointment
        )
      );

      setSuccessMessage(
        response?.message || "Appointment cancelled successfully."
      );

      setCancelTarget(null);
    } catch (err) {
      setActionError(err.message || "Unable to cancel appointment.");
    } finally {
      setCancelling(false);
    }
  };

  const totalAppointments = appointments.length;

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Pending" ||
      appointment.status === "Confirmed"
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length;

  const cancelledAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Cancelled" ||
      appointment.status === "Rejected"
  ).length;

  if (loading) {
    return (
      <section className="appointments-page">
        <div className="appointments-heading">
          <div className="heading-skeleton skeleton-block" />
          <div className="subheading-skeleton skeleton-block" />
        </div>

        <div className="appointment-stats-grid">
          {[1, 2, 3, 4].map((item) => (
            <div className="appointment-stat-card skeleton-card" key={item}>
              <div className="skeleton-circle" />
              <div className="skeleton-lines">
                <div className="skeleton-line short" />
                <div className="skeleton-line long" />
              </div>
            </div>
          ))}
        </div>

        <div className="appointments-list-skeleton">
          {[1, 2, 3].map((item) => (
            <div className="appointment-skeleton-card" key={item}>
              <div className="skeleton-circle large" />
              <div className="skeleton-lines">
                <div className="skeleton-line medium" />
                <div className="skeleton-line long" />
                <div className="skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="appointments-page">
      <div className="appointments-heading">
        <div>
          <span className="section-eyebrow">
            <i className="bx bx-calendar-check" />
            Patient portal
          </span>

          <h1>My Appointments</h1>

          <p>
            Track your consultations, appointment schedules and payment
            status in one place.
          </p>
        </div>

        <div className="heading-decoration">
          <i className="bx bx-calendar-heart" />
        </div>
      </div>

      {successMessage && (
        <motion.div
          className="appointment-alert success-alert"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <i className="bx bx-check-circle" />
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Close success message"
          >
            <i className="bx bx-x" />
          </button>
        </motion.div>
      )}

      {error && (
        <div className="appointment-alert error-alert">
          <i className="bx bx-error-circle" />
          <span>{error}</span>

          <button type="button" onClick={fetchAppointments}>
            Try again
          </button>
        </div>
      )}

      <div className="appointment-stats-grid">
        <div className="appointment-stat-card">
          <div className="stat-icon blue-icon">
            <i className="bx bx-calendar" />
          </div>

          <div>
            <span>Total appointments</span>
            <strong>{totalAppointments}</strong>
          </div>
        </div>

        <div className="appointment-stat-card">
          <div className="stat-icon green-icon">
            <i className="bx bx-calendar-check" />
          </div>

          <div>
            <span>Upcoming</span>
            <strong>{upcomingAppointments}</strong>
          </div>
        </div>

        <div className="appointment-stat-card">
          <div className="stat-icon purple-icon">
            <i className="bx bx-check-shield" />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedAppointments}</strong>
          </div>
        </div>

        <div className="appointment-stat-card">
          <div className="stat-icon orange-icon">
            <i className="bx bx-calendar-x" />
          </div>

          <div>
            <span>Cancelled / Rejected</span>
            <strong>{cancelledAppointments}</strong>
          </div>
        </div>
      </div>

      <div className="appointments-toolbar">
        <div className="appointment-search-box">
          <i className="bx bx-search" />

          <input
            type="search"
            placeholder="Search doctor, department..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="appointment-filter-box">
          <i className="bx bx-filter-alt" />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter appointments by status"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button
          type="button"
          className="refresh-appointments-button"
          onClick={fetchAppointments}
          title="Refresh appointments"
        >
          <i className="bx bx-refresh" />
          Refresh
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <motion.div
          className="appointments-empty-state"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-icon">
            <i className="bx bx-calendar-x" />
          </div>

          <h2>
            {appointments.length === 0
              ? "No appointments yet"
              : "No matching appointments"}
          </h2>

          <p>
            {appointments.length === 0
              ? "Your booked appointments will appear here."
              : "Try changing your search term or status filter."}
          </p>

          {appointments.length > 0 && (
            <button
              type="button"
              className="clear-filter-button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
              }}
            >
              Clear filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="appointments-list">
          <AnimatePresence>
            {filteredAppointments.map((appointment, index) => (
              <motion.article
                className="appointment-card"
                key={appointment._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.04,
                }}
              >
                <div className="appointment-card-top">
                  <div className="doctor-summary">
                    <div className="doctor-avatar">
                      {getDoctorInitials(appointment)}
                    </div>

                    <div>
                      <h3>{getDoctorName(appointment)}</h3>

                      <p>
                        {appointment?.doctor?.specialization ||
                          "Medical Specialist"}
                      </p>

                      <span className="department-label">
                        <i className="bx bx-building-house" />
                        {appointment?.department?.name ||
                          "Department unavailable"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`appointment-status ${getStatusClass(
                      appointment.status
                    )}`}
                  >
                    <span className="status-dot" />
                    {appointment.status || "Pending"}
                  </span>
                </div>

                <div className="appointment-card-divider" />

                <div className="appointment-information-grid">
                  <div className="appointment-info-item">
                    <span>
                      <i className="bx bx-calendar" />
                      Date
                    </span>

                    <strong>
                      {formatDate(appointment.appointmentDate)}
                    </strong>
                  </div>

                  <div className="appointment-info-item">
                    <span>
                      <i className="bx bx-time-five" />
                      Time
                    </span>

                    <strong>{appointment.appointmentTime || "--:--"}</strong>
                  </div>

                  <div className="appointment-info-item">
                    <span>
                      <i className="bx bx-video" />
                      Consultation
                    </span>

                    <strong>
                      {appointment.consultationType || "In-Person"}
                    </strong>
                  </div>

                  <div className="appointment-info-item">
                    <span>
                      <i className="bx bx-credit-card" />
                      Payment
                    </span>

                    <strong
                      className={`payment-status ${getPaymentClass(
                        appointment.paymentStatus
                      )}`}
                    >
                      {appointment.paymentStatus || "Pending"}
                    </strong>
                  </div>
                </div>

                {appointment.reason && (
                  <div className="appointment-reason">
                    <span>Reason for visit</span>
                    <p>{appointment.reason}</p>
                  </div>
                )}

                <div className="appointment-card-bottom">
                  <span className="appointment-reference">
                    Appointment ID:{" "}
                    {appointment._id
                      ? `${appointment._id.slice(-8).toUpperCase()}`
                      : "Unavailable"}
                  </span>

                  {canCancelAppointment(appointment) && (
                    <button
                      type="button"
                      className="cancel-appointment-button"
                      onClick={() => {
                        setActionError("");
                        setCancelTarget(appointment);
                      }}
                    >
                      <i className="bx bx-calendar-x" />
                      Cancel appointment
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {cancelTarget && (
          <motion.div
            className="cancel-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="cancel-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cancel-modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
            >
              <div className="cancel-modal-icon">
                <i className="bx bx-calendar-x" />
              </div>

              <h2 id="cancel-modal-title">Cancel appointment?</h2>

              <p>
                Are you sure you want to cancel this appointment? This
                action cannot be undone from this screen.
              </p>

              <div className="cancel-modal-appointment">
                <strong>{getDoctorName(cancelTarget)}</strong>

                <span>
                  {formatDate(cancelTarget.appointmentDate)} at{" "}
                  {cancelTarget.appointmentTime}
                </span>
              </div>

              {actionError && (
                <div className="modal-error-message">
                  <i className="bx bx-error-circle" />
                  {actionError}
                </div>
              )}

              <div className="cancel-modal-actions">
                <button
                  type="button"
                  className="keep-appointment-button"
                  onClick={() => {
                    setCancelTarget(null);
                    setActionError("");
                  }}
                  disabled={cancelling}
                >
                  Keep appointment
                </button>

                <button
                  type="button"
                  className="confirm-cancel-button"
                  onClick={handleCancelAppointment}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <span className="button-spinner" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-check" />
                      Confirm cancellation
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PatientAppointments;