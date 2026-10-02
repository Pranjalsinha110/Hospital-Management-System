import React, { useCallback, useEffect, useMemo, useState } from "react";

import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";

import { getAllPatients } from "../../services/patientService";
import {
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
} from "../../services/appointmentService";

import "./AdminAppointments.css";

/* Icons without lucide-react */
const Icon = ({ name, size = 18, className = "" }) => {
  const icons = {
    search: "⌕",
    users: "♧",
    calendar: "▦",
    clock: "◷",
    check: "✓",
    cross: "✕",
    alert: "⚠",
    eye: "◉",
    refresh: "↻",
    user: "♙",
    doctor: "⚕",
    building: "▤",
    card: "▣",
    phone: "☎",
    mail: "✉",
    chevron: "›",
    filter: "☷",
    file: "▤",
    activity: "⌁",
  };

  return (
    <span
      className={`admin-app-icon ${className}`}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {icons[name] || "•"}
    </span>
  );
};

const AdminAppointments = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  // =====================================================
  // HELPERS
  // =====================================================

  const getErrorMessage = (err) =>
    err?.message || "Something went wrong. Please try again.";

  const getPatientId = (patient) => {
    if (!patient) return "";

    const id = patient._id || patient.id;

    return id ? String(id) : "";
  };

  const getAppointmentId = (appointment) => {
    if (!appointment) return "";

    const id = appointment._id || appointment.id;

    return id ? String(id) : "";
  };

  const getPatientName = (patient) =>
    patient?.user?.name ||
    patient?.name ||
    "Unnamed Patient";

  const getAppointmentPatientId = (appointment) => {
    const patient = appointment?.patient;

    if (!patient) return "";

    if (typeof patient === "string") {
      return patient;
    }

    return String(patient._id || patient.id || "");
  };

  const getPatientAppointments = (patient) => {
    const patientId = getPatientId(patient);

    if (!patientId) return [];

    return appointments.filter(
      (appointment) =>
        getAppointmentPatientId(appointment) === patientId
    );
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(parsedDate);
  };

  const formatTime = (time) => {
    if (!time) return "Not available";

    const match = String(time).match(/^(\d{2}):(\d{2})$/);

    if (!match) return time;

    let hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
  };

  // =====================================================
  // RESPONSE HELPERS
  // =====================================================

  const extractArray = (response, key) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }

    return [];
  };

  // =====================================================
  // FETCH PATIENTS AND APPOINTMENTS
  // =====================================================

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsResponse, appointmentsResponse] =
        await Promise.all([
          getAllPatients(),
          getAllAppointments(),
        ]);

      if (!patientsResponse?.success) {
        throw new Error(
          patientsResponse?.message || "Failed to fetch patients."
        );
      }

      if (!appointmentsResponse?.success) {
        throw new Error(
          appointmentsResponse?.message ||
            "Failed to fetch appointments."
        );
      }

      const patientData = extractArray(
        patientsResponse,
        "patients"
      );

      const appointmentData = extractArray(
        appointmentsResponse,
        "appointments"
      );

      setPatients(patientData);
      setAppointments(appointmentData);

      setSelectedPatient((previous) => {
        if (!previous) return null;

        return (
          patientData.find(
            (patient) =>
              getPatientId(patient) === getPatientId(previous)
          ) || null
        );
      });

      setSelectedAppointment((previous) => {
        if (!previous) return null;

        const updatedAppointment = appointmentData.find(
          (appointment) =>
            getAppointmentId(appointment) ===
            getAppointmentId(previous)
        );

        return updatedAppointment || previous;
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =====================================================
  // SEARCH PATIENTS
  // =====================================================

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const name = String(getPatientName(patient)).toLowerCase();

      const email = String(
        patient?.user?.email || patient?.email || ""
      ).toLowerCase();

      const phone = String(
        patient?.user?.phone || patient?.phone || ""
      ).toLowerCase();

      return (
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      );
    });
  }, [patients, search]);

  // =====================================================
  // APPOINTMENT STATISTICS
  // =====================================================

  const totalAppointments = appointments.length;

  const appointmentCounts = {
    pending: appointments.filter(
      (item) => item.status === "Pending"
    ).length,

    confirmed: appointments.filter(
      (item) => item.status === "Confirmed"
    ).length,

    completed: appointments.filter(
      (item) => item.status === "Completed"
    ).length,

    cancelled: appointments.filter(
      (item) => item.status === "Cancelled"
    ).length,
  };

  // =====================================================
  // SELECT PATIENT
  // =====================================================

  const openPatient = (patient) => {
    setSelectedPatient(patient);
    setSelectedAppointment(null);
    setStatusFilter("All");
    setPaymentFilter("All");
    setError("");
    setSuccess("");
  };

  const closePatient = () => {
    setSelectedPatient(null);
    setSelectedAppointment(null);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // VIEW APPOINTMENT DETAILS
  // =====================================================

  const openAppointmentDetails = async (appointment) => {
    const appointmentId = getAppointmentId(appointment);

    if (!appointmentId) {
      setError("Appointment ID is missing.");
      return;
    }

    setDetailsLoading(true);
    setError("");

    try {
      const response = await getAppointmentById(appointmentId);

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message ||
            "Failed to fetch appointment details."
        );
      }

      setSelectedAppointment(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDetailsLoading(false);
    }
  };

  // =====================================================
  // CANCEL APPOINTMENT
  // =====================================================

  const handleCancelAppointment = async (appointment) => {
    const appointmentId = getAppointmentId(appointment);

    if (!appointmentId) {
      setError("Appointment ID is missing.");
      return;
    }

    if (appointment.status === "Completed") {
      setError("Completed appointment cannot be cancelled.");
      return;
    }

    if (appointment.status === "Cancelled") {
      setError("Appointment is already cancelled.");
      return;
    }

    if (appointment.status === "Rejected") {
      setError("Rejected appointment cannot be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    setCancellingId(appointmentId);
    setError("");
    setSuccess("");

    try {
      const response = await cancelAppointment(appointmentId);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to cancel appointment."
        );
      }

      // Update appointment list locally
      setAppointments((previous) =>
        previous.map((item) =>
          getAppointmentId(item) === appointmentId
            ? {
                ...item,
                status:
                  response?.data?.appointment?.status ||
                  "Cancelled",
                paymentStatus:
                  response?.data?.appointment?.paymentStatus ||
                  item.paymentStatus,
              }
            : item
        )
      );

      // Update selected appointment details
      setSelectedAppointment((previous) => {
        if (
          !previous ||
          getAppointmentId(previous) !== appointmentId
        ) {
          return previous;
        }

        return {
          ...previous,
          status:
            response?.data?.appointment?.status || "Cancelled",
          paymentStatus:
            response?.data?.appointment?.paymentStatus ||
            previous.paymentStatus,
        };
      });

      setSuccess(
        response?.message || "Appointment cancelled successfully."
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  // =====================================================
  // FILTER SELECTED PATIENT APPOINTMENTS
  // =====================================================

  const selectedPatientAppointments = selectedPatient
    ? getPatientAppointments(selectedPatient)
    : [];

  const visibleAppointments = selectedPatientAppointments.filter(
    (appointment) => {
      const matchesStatus =
        statusFilter === "All" ||
        appointment.status === statusFilter;

      const matchesPayment =
        paymentFilter === "All" ||
        appointment.paymentStatus === paymentFilter;

      return matchesStatus && matchesPayment;
    }
  );

  // =====================================================
  // STATUS BADGES
  // =====================================================

  const getStatusClass = (status) =>
    String(status || "unknown")
      .toLowerCase()
      .replace(/\s+/g, "-");

  const renderStatus = (status) => (
    <span className={`appointment-status ${getStatusClass(status)}`}>
      <span className="appointment-status-dot" />
      {status || "Unknown"}
    </span>
  );

  const renderPaymentStatus = (status) => (
    <span className={`payment-status ${getStatusClass(status)}`}>
      {status || "Unknown"}
    </span>
  );

  const detailPatient = selectedAppointment?.patient;
  const detailDoctor = selectedAppointment?.doctor;
  const detailDepartment = selectedAppointment?.department;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-appointments-page">
      <DashboardSidebar />

      <div className="admin-appointments-main">
        <DashboardHeader />

        <main className="admin-appointments-content">
          <div className="appointments-page-heading">
            <div>
              <div className="appointments-eyebrow">
                <Icon name="activity" size={15} />
                HOSPITAL MANAGEMENT
              </div>

              <h1>Appointment Management</h1>

              <p>
                Manage patient appointments, view details and track
                appointment status.
              </p>
            </div>

            <button
              type="button"
              className="appointments-refresh-btn"
              onClick={fetchData}
              disabled={loading}
            >
              <Icon
                name="refresh"
                size={16}
                className={loading ? "appointments-spinning" : ""}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="appointments-alert appointments-alert-error">
              <Icon name="alert" size={18} />
              <span>{error}</span>
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                <Icon name="cross" size={17} />
              </button>
            </div>
          )}

          {success && (
            <div className="appointments-alert appointments-alert-success">
              <Icon name="check" size={18} />
              <span>{success}</span>
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => setSuccess("")}
              >
                <Icon name="cross" size={17} />
              </button>
            </div>
          )}

          {/* APPOINTMENT STATISTICS */}
          <section className="appointments-stats-grid">
            <div className="appointment-stat-card stat-total">
              <div className="appointment-stat-icon">
                <Icon name="calendar" size={22} />
              </div>
              <div>
                <span>Total Appointments</span>
                <strong>{totalAppointments}</strong>
              </div>
            </div>

            <div className="appointment-stat-card stat-pending">
              <div className="appointment-stat-icon">
                <Icon name="clock" size={22} />
              </div>
              <div>
                <span>Pending</span>
                <strong>{appointmentCounts.pending}</strong>
              </div>
            </div>

            <div className="appointment-stat-card stat-confirmed">
              <div className="appointment-stat-icon">
                <Icon name="check" size={22} />
              </div>
              <div>
                <span>Confirmed</span>
                <strong>{appointmentCounts.confirmed}</strong>
              </div>
            </div>

            <div className="appointment-stat-card stat-completed">
              <div className="appointment-stat-icon">
                <Icon name="calendar" size={22} />
              </div>
              <div>
                <span>Completed</span>
                <strong>{appointmentCounts.completed}</strong>
              </div>
            </div>

            <div className="appointment-stat-card stat-cancelled">
              <div className="appointment-stat-icon">
                <Icon name="cross" size={22} />
              </div>
              <div>
                <span>Cancelled</span>
                <strong>{appointmentCounts.cancelled}</strong>
              </div>
            </div>
          </section>

          {/* PATIENTS / APPOINTMENTS PANEL */}
          <section className="appointments-panel">
            <div className="appointments-panel-heading">
              <div>
                <h2>
                  {selectedPatient
                    ? "Patient Appointments"
                    : "Patients"}
                </h2>

                <p>
                  {selectedPatient
                    ? `Appointments for ${getPatientName(selectedPatient)}`
                    : "Select a patient to view their appointments."}
                </p>
              </div>

              {selectedPatient && (
                <button
                  type="button"
                  className="appointments-back-btn"
                  onClick={closePatient}
                >
                  <Icon name="chevron" size={16} />
                  All Patients
                </button>
              )}
            </div>

            {!selectedPatient ? (
              <>
                <div className="appointments-toolbar">
                  <div className="appointments-search">
                    <Icon name="search" size={18} />
                    <input
                      type="search"
                      placeholder="Search patient by name, email or phone..."
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                    />
                  </div>

                  <div className="appointments-result-count">
                    <Icon name="users" size={16} />
                    {filteredPatients.length} patients
                  </div>
                </div>

                <div className="appointments-table-wrapper">
                  <table className="appointments-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Contact</th>
                        <th>Gender</th>
                        <th>Appointments</th>
                        <th>Account</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6">
                            <div className="appointments-loading">
                              <span className="appointments-loader" />
                              Loading patients...
                            </div>
                          </td>
                        </tr>
                      ) : filteredPatients.length === 0 ? (
                        <tr>
                          <td colSpan="6">
                            <div className="appointments-empty">
                              <Icon name="users" size={32} />
                              <strong>No patients found</strong>
                              <span>
                                Try changing your search or refresh the
                                list.
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredPatients.map((patient) => {
                          const patientId = getPatientId(patient);
                          const patientAppointments =
                            getPatientAppointments(patient);

                          return (
                            <tr
                              key={
                                patientId || getPatientName(patient)
                              }
                            >
                              <td>
                                <div className="patient-cell">
                                  <div className="patient-avatar">
                                    {getPatientName(patient)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  <div>
                                    <strong>
                                      {getPatientName(patient)}
                                    </strong>

                                    <small>
                                      ID:{" "}
                                      {patientId
                                        ? patientId
                                            .slice(-6)
                                            .toUpperCase()
                                        : "N/A"}
                                    </small>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div className="patient-contact-cell">
                                  <span>
                                    <Icon name="mail" size={13} />
                                    {patient?.user?.email ||
                                      patient?.email ||
                                      "No email"}
                                  </span>

                                  <span>
                                    <Icon name="phone" size={13} />
                                    {patient?.user?.phone ||
                                      patient?.phone ||
                                      "No phone"}
                                  </span>
                                </div>
                              </td>

                              <td>{patient?.gender || "N/A"}</td>

                              <td>
                                <span className="patient-appointment-count">
                                  <Icon name="calendar" size={15} />
                                  {patientAppointments.length}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`patient-account-status ${
                                    patient?.user?.isActive
                                      ? "active"
                                      : "inactive"
                                  }`}
                                >
                                  {patient?.user?.isActive
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="patient-view-btn"
                                  onClick={() => openPatient(patient)}
                                >
                                  View Appointments
                                  <Icon name="chevron" size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                {/* SELECTED PATIENT */}
                <div className="selected-patient-card">
                  <div className="selected-patient-avatar">
                    {getPatientName(selectedPatient)
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="selected-patient-info">
                    <span>SELECTED PATIENT</span>
                    <strong>{getPatientName(selectedPatient)}</strong>
                    <small>
                      {selectedPatient?.user?.email ||
                        selectedPatient?.email ||
                        "No email"}
                    </small>
                  </div>

                  <div className="selected-patient-total">
                    <strong>
                      {selectedPatientAppointments.length}
                    </strong>
                    <span>Total appointments</span>
                  </div>
                </div>

                {/* FILTERS */}
                <div className="appointments-toolbar appointment-filters">
                  <label className="appointment-filter-control">
                    <Icon name="filter" size={16} />
                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value)
                      }
                    >
                      <option value="All">All statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </label>

                  <label className="appointment-filter-control">
                    <Icon name="card" size={16} />
                    <select
                      value={paymentFilter}
                      onChange={(event) =>
                        setPaymentFilter(event.target.value)
                      }
                    >
                      <option value="All">All payments</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </label>

                  <span className="appointments-result-count">
                    {visibleAppointments.length} appointments
                  </span>
                </div>

                {/* APPOINTMENTS TABLE */}
                <div className="appointments-table-wrapper">
                  <table className="appointments-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Department</th>
                        <th>Date &amp; Time</th>
                        <th>Consultation</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7">
                            <div className="appointments-loading">
                              <span className="appointments-loader" />
                              Loading appointments...
                            </div>
                          </td>
                        </tr>
                      ) : visibleAppointments.length === 0 ? (
                        <tr>
                          <td colSpan="7">
                            <div className="appointments-empty">
                              <Icon name="calendar" size={32} />
                              <strong>No appointments available</strong>
                              <span>
                                No appointment data was returned for this
                                patient, or the selected filters have no
                                matches.
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        visibleAppointments.map((appointment) => {
                          const appointmentId =
                            getAppointmentId(appointment);

                          const canCancel = [
                            "Pending",
                            "Confirmed",
                          ].includes(appointment.status);

                          return (
                            <tr key={appointmentId}>
                              <td>
                                <div className="doctor-cell">
                                  <div className="doctor-avatar">
                                    <Icon name="doctor" size={16} />
                                  </div>

                                  <div>
                                    <strong>
                                      {appointment?.doctor?.user?.name ||
                                        appointment?.doctor?.name ||
                                        "Doctor"}
                                    </strong>

                                    <small>
                                      {appointment?.doctor
                                        ?.specialization ||
                                        "Specialization N/A"}
                                    </small>
                                  </div>
                                </div>
                              </td>

                              <td>
                                {appointment?.department?.name ||
                                  "N/A"}
                              </td>

                              <td>
                                <div className="appointment-date-cell">
                                  <strong>
                                    {formatDate(
                                      appointment.appointmentDate
                                    )}
                                  </strong>

                                  <small>
                                    <Icon name="clock" size={12} />
                                    {formatTime(
                                      appointment.appointmentTime
                                    )}
                                  </small>
                                </div>
                              </td>

                              <td>
                                {appointment.consultationType || "N/A"}
                              </td>

                              <td>
                                {renderStatus(appointment.status)}
                              </td>

                              <td>
                                {renderPaymentStatus(
                                  appointment.paymentStatus
                                )}
                              </td>

                              <td>
                                <div className="appointment-actions">
                                  <button
                                    type="button"
                                    className="appointment-icon-btn view"
                                    title="View details"
                                    onClick={() =>
                                      openAppointmentDetails(
                                        appointment
                                      )
                                    }
                                  >
                                    <Icon name="eye" size={16} />
                                  </button>

                                  {canCancel && (
                                    <button
                                      type="button"
                                      className="appointment-icon-btn cancel"
                                      title="Cancel appointment"
                                      disabled={
                                        cancellingId === appointmentId
                                      }
                                      onClick={() =>
                                        handleCancelAppointment(
                                          appointment
                                        )
                                      }
                                    >
                                      {cancellingId ===
                                      appointmentId ? (
                                        <span className="small-spinner" />
                                      ) : (
                                        <Icon
                                          name="cross"
                                          size={16}
                                        />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {/* APPOINTMENT DETAILS MODAL */}
      {selectedAppointment && (
        <div
          className="appointment-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAppointment(null);
            }
          }}
        >
          <section
            className="appointment-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-details-title"
          >
            <div className="appointment-modal-header">
              <div>
                <span>APPOINTMENT DETAILS</span>
                <h2 id="appointment-details-title">
                  Appointment Information
                </h2>
              </div>

              <button
                type="button"
                className="appointment-modal-close"
                onClick={() => setSelectedAppointment(null)}
                aria-label="Close details"
              >
                <Icon name="cross" size={20} />
              </button>
            </div>

            <div className="appointment-modal-body">
              <div className="appointment-modal-status-row">
                {renderStatus(selectedAppointment.status)}
                {renderPaymentStatus(
                  selectedAppointment.paymentStatus
                )}
              </div>

              <div className="appointment-detail-grid">
                <div className="appointment-detail-item">
                  <span>
                    <Icon name="user" size={15} />
                    Patient
                  </span>

                  <strong>
                    {detailPatient?.user?.name ||
                      detailPatient?.name ||
                      getPatientName(selectedPatient)}
                  </strong>
                </div>

                <div className="appointment-detail-item">
                  <span>
                    <Icon name="doctor" size={15} />
                    Doctor
                  </span>

                  <strong>
                    {detailDoctor?.user?.name ||
                      detailDoctor?.name ||
                      "Not available"}
                  </strong>
                </div>

                <div className="appointment-detail-item">
                  <span>
                    <Icon name="building" size={15} />
                    Department
                  </span>

                  <strong>
                    {detailDepartment?.name || "Not available"}
                  </strong>
                </div>

                <div className="appointment-detail-item">
                  <span>
                    <Icon name="calendar" size={15} />
                    Appointment date
                  </span>

                  <strong>
                    {formatDate(
                      selectedAppointment.appointmentDate
                    )}
                  </strong>
                </div>

                <div className="appointment-detail-item">
                  <span>
                    <Icon name="clock" size={15} />
                    Appointment time
                  </span>

                  <strong>
                    {formatTime(
                      selectedAppointment.appointmentTime
                    )}
                  </strong>
                </div>

                <div className="appointment-detail-item">
                  <span>
                    <Icon name="activity" size={15} />
                    Consultation
                  </span>

                  <strong>
                    {selectedAppointment.consultationType || "N/A"}
                  </strong>
                </div>
              </div>

              <div className="appointment-reason-box">
                <span>
                  <Icon name="file" size={15} />
                  Reason for appointment
                </span>

                <p>
                  {selectedAppointment.reason ||
                    "No reason provided."}
                </p>
              </div>

              <div className="appointment-modal-footer">
                <button
                  type="button"
                  className="appointment-modal-secondary"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Close
                </button>

                {["Pending", "Confirmed"].includes(
                  selectedAppointment.status
                ) && (
                  <button
                    type="button"
                    className="appointment-modal-danger"
                    disabled={
                      cancellingId ===
                      getAppointmentId(selectedAppointment)
                    }
                    onClick={() =>
                      handleCancelAppointment(selectedAppointment)
                    }
                  >
                    <Icon name="cross" size={16} />
                    {cancellingId ===
                    getAppointmentId(selectedAppointment)
                      ? "Cancelling..."
                      : "Cancel Appointment"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {detailsLoading && (
        <div className="appointment-details-loading">
          <span className="appointments-loader" />
          Loading appointment details...
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;