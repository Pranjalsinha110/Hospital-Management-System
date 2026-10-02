import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { getDoctorAppointments } from "../../services/appointmentService";

import "./DoctorDashboard.css";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || "");
};

const getPatientName = (patient) => {
  if (!patient) return "Patient";
  if (typeof patient === "string") return "Patient";

  return (
    patient.user?.name ||
    patient.name ||
    patient.fullName ||
    "Patient"
  );
};

const getPatientEmail = (patient) => {
  if (!patient || typeof patient === "string") return "";
  return patient.user?.email || patient.email || "";
};

const getDepartmentName = (department) => {
  if (!department) return "Department";
  if (typeof department === "string") return department;
  return department.name || "Department";
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "Time unavailable";

  const [hours, minutes] = String(time).split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getDateKey = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const getTodayKey = () => getDateKey(new Date());

const getStatusClass = (status) => {
  switch (status) {
    case "Confirmed":
      return "confirmed";
    case "Completed":
      return "completed";
    case "Cancelled":
      return "cancelled";
    case "Rejected":
      return "rejected";
    case "Pending":
    default:
      return "pending";
  }
};

const getPaymentClass = (status) => {
  switch (status) {
    case "Paid":
      return "paid";
    case "Failed":
      return "failed";
    case "Refunded":
      return "refunded";
    case "Pending":
    default:
      return "payment-pending";
  }
};

const unwrapAppointments = (response) => {
  // Supports the common API response shape:
  // { success: true, data: { appointments: [...] } }
  // Also supports { data: [...] } and direct arrays.
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.appointments)) {
    return response.data.appointments;
  }
  if (Array.isArray(response?.appointments)) {
    return response.appointments;
  }

  return [];
};

const StatCard = ({ title, value, subtitle, icon, tone, delay }) => (
  <motion.article
    className={`doctor-stat-card ${tone}`}
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -5 }}
  >
    <div className="doctor-stat-top">
      <div className="doctor-stat-icon">
        <i className={`bx ${icon}`} />
      </div>
      <span className="doctor-stat-decoration">
        <i className="bx bx-trending-up" />
      </span>
    </div>

    <p>{title}</p>
    <strong>{value}</strong>
    <span className="doctor-stat-subtitle">{subtitle}</span>
  </motion.article>
);

const EmptyAppointments = () => (
  <div className="doctor-empty-state">
    <div className="doctor-empty-icon">
      <i className="bx bx-calendar-x" />
    </div>
    <h3>No appointments found</h3>
    <p>
      Appointments assigned to your account will appear here.
    </p>
  </div>
);

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAppointments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getDoctorAppointments();
      const list = unwrapAppointments(response);

      setAppointments(list);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load your appointments. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const todayKey = getTodayKey();

  const stats = useMemo(() => {
    const todayAppointments = appointments.filter(
      (appointment) =>
        getDateKey(appointment.appointmentDate) === todayKey
    );

    return {
      total: appointments.length,
      today: todayAppointments.length,
      pending: appointments.filter(
        (appointment) => appointment.status === "Pending"
      ).length,
      confirmed: appointments.filter(
        (appointment) => appointment.status === "Confirmed"
      ).length,
      completed: appointments.filter(
        (appointment) => appointment.status === "Completed"
      ).length,
    };
  }, [appointments, todayKey]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return [...appointments]
      .filter((appointment) => {
        if (
          appointment.status === "Cancelled" ||
          appointment.status === "Rejected" ||
          appointment.status === "Completed"
        ) {
          return false;
        }

        if (!appointment.appointmentDate) return false;

        const appointmentDate = new Date(
          appointment.appointmentDate
        );

        if (Number.isNaN(appointmentDate.getTime())) return false;

        const [hours, minutes] = String(
          appointment.appointmentTime || "00:00"
        )
          .split(":")
          .map(Number);

        appointmentDate.setHours(
          Number.isFinite(hours) ? hours : 0,
          Number.isFinite(minutes) ? minutes : 0,
          0,
          0
        );

        return appointmentDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.appointmentDate);
        const dateB = new Date(b.appointmentDate);

        const [hoursA = 0, minutesA = 0] = String(
          a.appointmentTime || "00:00"
        )
          .split(":")
          .map(Number);

        const [hoursB = 0, minutesB = 0] = String(
          b.appointmentTime || "00:00"
        )
          .split(":")
          .map(Number);

        dateA.setHours(hoursA, minutesA, 0, 0);
        dateB.setHours(hoursB, minutesB, 0, 0);

        return dateA - dateB;
      })
      .slice(0, 5);
  }, [appointments]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        const dateA = new Date(a.appointmentDate || 0);
        const dateB = new Date(b.appointmentDate || 0);

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [appointments]);

  const appointmentForToday = useMemo(() => {
    return appointments
      .filter(
        (appointment) =>
          getDateKey(appointment.appointmentDate) === todayKey
      )
      .sort((a, b) =>
        String(a.appointmentTime || "").localeCompare(
          String(b.appointmentTime || "")
        )
      )
      .slice(0, 4);
  }, [appointments, todayKey]);

  return (
    <div className="doctor-dashboard">
      {/* PAGE INTRO */}
      <motion.section
        className="doctor-welcome"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="doctor-welcome-content">
          <span className="doctor-welcome-eyebrow">
            DOCTOR WORKSPACE
          </span>

          <h1>
            Welcome back, <span>Doctor</span>
          </h1>

          <p>
            Here is an overview of your appointments and daily activity.
          </p>

          <div className="doctor-welcome-date">
            <i className="bx bx-calendar" />
            <span>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="doctor-welcome-art" aria-hidden="true">
          <div className="doctor-art-circle doctor-art-circle-one" />
          <div className="doctor-art-circle doctor-art-circle-two" />
          <div className="doctor-art-cross">
            <i className="bx bx-plus-medical" />
          </div>
          <div className="doctor-art-card">
            <i className="bx bx-heart" />
            <span>Patient care</span>
          </div>
        </div>
      </motion.section>

      {/* ERROR */}
      {error && (
        <div className="doctor-dashboard-error" role="alert">
          <div>
            <i className="bx bx-error-circle" />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => fetchAppointments(true)}
            disabled={refreshing}
          >
            Retry
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <section className="doctor-stats-grid">
        <StatCard
          title="Total appointments"
          value={loading ? "—" : stats.total}
          subtitle="Appointments assigned to you"
          icon="bx-calendar-check"
          tone="stat-blue"
          delay={0.05}
        />

        <StatCard
          title="Today's appointments"
          value={loading ? "—" : stats.today}
          subtitle="Scheduled for today"
          icon="bx-calendar-event"
          tone="stat-purple"
          delay={0.1}
        />

        <StatCard
          title="Pending appointments"
          value={loading ? "—" : stats.pending}
          subtitle="Awaiting further action"
          icon="bx-time-five"
          tone="stat-orange"
          delay={0.15}
        />

        <StatCard
          title="Completed appointments"
          value={loading ? "—" : stats.completed}
          subtitle="Marked as completed"
          icon="bx-check-circle"
          tone="stat-green"
          delay={0.2}
        />
      </section>

      {/* MAIN GRID */}
      <section className="doctor-dashboard-main-grid">
        {/* TODAY */}
        <motion.article
          className="doctor-panel doctor-today-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <div className="doctor-panel-header">
            <div>
              <span className="doctor-panel-eyebrow">
                YOUR SCHEDULE
              </span>
              <h2>Today's appointments</h2>
            </div>

            <Link
              to="/doctor/appointments"
              className="doctor-panel-link"
            >
              View all <i className="bx bx-right-arrow-alt" />
            </Link>
          </div>

          {loading ? (
            <div className="doctor-loading-state">
              <span className="doctor-spinner" />
              <p>Loading today's appointments...</p>
            </div>
          ) : appointmentForToday.length === 0 ? (
            <EmptyAppointments />
          ) : (
            <div className="doctor-today-list">
              {appointmentForToday.map((appointment, index) => {
                const patient = appointment.patient;

                return (
                  <motion.div
                    className="doctor-today-item"
                    key={getId(appointment) || index}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <div className="doctor-today-time">
                      <strong>
                        {formatTime(appointment.appointmentTime)}
                      </strong>
                      <span>
                        {appointment.consultationType || "In-Person"}
                      </span>
                    </div>

                    <div className="doctor-today-patient">
                      <div className="doctor-patient-avatar">
                        {getPatientName(patient)
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="doctor-today-patient-info">
                        <strong>{getPatientName(patient)}</strong>
                        <span>
                          {getDepartmentName(appointment.department)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`doctor-status-badge ${getStatusClass(
                        appointment.status
                      )}`}
                    >
                      {appointment.status || "Pending"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.article>

        {/* UPCOMING */}
        <motion.article
          className="doctor-panel doctor-upcoming-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
        >
          <div className="doctor-panel-header">
            <div>
              <span className="doctor-panel-eyebrow">
                NEXT IN LINE
              </span>
              <h2>Upcoming appointments</h2>
            </div>

            <div className="doctor-panel-header-icon">
              <i className="bx bx-calendar" />
            </div>
          </div>

          {loading ? (
            <div className="doctor-loading-state">
              <span className="doctor-spinner" />
              <p>Loading schedule...</p>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <EmptyAppointments />
          ) : (
            <div className="doctor-upcoming-list">
              {upcomingAppointments.map((appointment, index) => (
                <div
                  className="doctor-upcoming-item"
                  key={getId(appointment) || index}
                >
                  <div className="doctor-upcoming-date">
                    <strong>
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                      })}
                    </strong>
                    <span>
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString("en-IN", {
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="doctor-upcoming-info">
                    <strong>
                      {getPatientName(appointment.patient)}
                    </strong>
                    <span>
                      {formatTime(appointment.appointmentTime)} ·{" "}
                      {appointment.consultationType || "In-Person"}
                    </span>
                  </div>

                  <span
                    className={`doctor-status-dot ${getStatusClass(
                      appointment.status
                    )}`}
                    title={appointment.status || "Pending"}
                  />
                </div>
              ))}
            </div>
          )}
        </motion.article>
      </section>

      {/* RECENT APPOINTMENTS */}
      <motion.section
        className="doctor-panel doctor-recent-panel"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.34 }}
      >
        <div className="doctor-panel-header">
          <div>
            <span className="doctor-panel-eyebrow">
              APPOINTMENT ACTIVITY
            </span>
            <h2>Recent appointments</h2>
          </div>

          <Link
            to="/doctor/appointments"
            className="doctor-panel-link"
          >
            Manage appointments
            <i className="bx bx-right-arrow-alt" />
          </Link>
        </div>

        {loading ? (
          <div className="doctor-loading-state">
            <span className="doctor-spinner" />
            <p>Loading appointments...</p>
          </div>
        ) : recentAppointments.length === 0 ? (
          <EmptyAppointments />
        ) : (
          <div className="doctor-table-wrapper">
            <table className="doctor-appointments-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Department</th>
                  <th>Date & time</th>
                  <th>Consultation</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentAppointments.map((appointment, index) => (
                  <tr key={getId(appointment) || index}>
                    <td>
                      <div className="doctor-table-patient">
                        <div className="doctor-patient-avatar">
                          {getPatientName(appointment.patient)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getPatientName(appointment.patient)}
                          </strong>
                          <span>
                            {getPatientEmail(appointment.patient) ||
                              "Patient"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {getDepartmentName(appointment.department)}
                    </td>

                    <td>
                      <div className="doctor-table-date">
                        <strong>
                          {formatDate(appointment.appointmentDate)}
                        </strong>
                        <span>
                          {formatTime(appointment.appointmentTime)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="doctor-consultation-type">
                        {appointment.consultationType || "In-Person"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`doctor-payment-badge ${getPaymentClass(
                          appointment.paymentStatus
                        )}`}
                      >
                        {appointment.paymentStatus || "Pending"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`doctor-status-badge ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>

      {/* FOOTER */}
      <div className="doctor-dashboard-footer">
        <div>
          <i className="bx bx-shield-check" />
          <span>
            Your dashboard displays appointments returned for your account.
          </span>
        </div>

        <button
          type="button"
          className="doctor-refresh-button"
          onClick={() => fetchAppointments(true)}
          disabled={loading || refreshing}
        >
          <i
            className={`bx bx-refresh ${
              refreshing ? "doctor-refreshing" : ""
            }`}
          />
          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
      </div>
    </div>
  );
};

export default DoctorDashboard;