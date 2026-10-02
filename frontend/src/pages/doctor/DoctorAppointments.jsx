import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDoctorAppointments } from "../../services/appointmentService";
import "./DoctorAppointments.css";

const PAGE_SIZE = 8;

const FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
  "Rejected",
];

const STATUS_CONFIG = {
  Pending: {
    color: "#d97706",
    background: "#fff7e6",
    border: "#fbd38d",
    icon: "◷",
  },
  Confirmed: {
    color: "#2563eb",
    background: "#eff6ff",
    border: "#bfdbfe",
    icon: "✓",
  },
  Completed: {
    color: "#059669",
    background: "#ecfdf5",
    border: "#a7f3d0",
    icon: "✓",
  },
  Cancelled: {
    color: "#dc2626",
    background: "#fef2f2",
    border: "#fecaca",
    icon: "×",
  },
  Rejected: {
    color: "#9333ea",
    background: "#faf5ff",
    border: "#e9d5ff",
    icon: "!",
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    color: "#64748b",
    background: "#f1f5f9",
    border: "#cbd5e1",
    icon: "•",
  };

const getAppointmentId = (appointment) =>
  appointment?._id || appointment?.id || "";

const getPatient = (appointment) => {
  const patient = appointment?.patient;

  return patient && typeof patient === "object" ? patient : {};
};

const getPatientName = (appointment) => {
  const patient = getPatient(appointment);

  return (
    patient.name ||
    patient.fullName ||
    patient.user?.name ||
    patient.user?.fullName ||
    [patient.user?.firstName, patient.user?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Patient"
  );
};

const getPatientEmail = (appointment) => {
  const patient = getPatient(appointment);
  return patient.email || patient.user?.email || "";
};

const getPatientId = (appointment) => {
  const patient = appointment?.patient;

  if (!patient) return "";
  if (typeof patient === "string") return patient;

  return patient._id || patient.id || "";
};

const getDepartmentName = (appointment) => {
  const department = appointment?.department;

  if (!department) return "Not specified";
  if (typeof department === "string") return department;

  return department.name || "Not specified";
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("") || "PT";

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatLongDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "Time unavailable";

  const match = String(time).match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return time;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return time;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getAppointmentTimestamp = (appointment) => {
  const date = appointment?.appointmentDate;

  if (!date) return 0;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return 0;

  const time = String(appointment?.appointmentTime || "").match(
    /^(\d{1,2}):(\d{2})$/
  );

  if (time) {
    parsed.setHours(Number(time[1]), Number(time[2]), 0, 0);
  }

  return parsed.getTime();
};

function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <span
      className="da-status"
      style={{
        color: config.color,
        backgroundColor: config.background,
        borderColor: config.border,
      }}
    >
      <span className="da-status-icon">{config.icon}</span>
      {status || "Unknown"}
    </span>
  );
}

function StatCard({ title, value, icon, color, subtitle, delay }) {
  return (
    <motion.div
      className="da-stat-card"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5 }}
    >
      <div className="da-stat-top">
        <div
          className="da-stat-icon"
          style={{
            backgroundColor: color.background,
            color: color.foreground,
          }}
        >
          {icon}
        </div>

        <span className="da-stat-title">{title}</span>
      </div>

      <div className="da-stat-value">{value}</div>
      <p className="da-stat-subtitle">{subtitle}</p>
    </motion.div>
  );
}

function AppointmentDetails({ appointment, onClose }) {
  const patient = getPatient(appointment);
  const patientName = getPatientName(appointment);
  const patientId = getPatientId(appointment);
  const appointmentId = getAppointmentId(appointment);

  const medicalHistory = patient.medicalHistory;
  const allergies = patient.allergies;
  const existingConditions = patient.existingConditions;

  return (
    <motion.div
      className="da-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        className="da-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="da-modal-title"
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.97 }}
        transition={{ duration: 0.25 }}
      >
        <div className="da-modal-header">
          <div>
            <span className="da-modal-eyebrow">APPOINTMENT DETAILS</span>
            <h2 id="da-modal-title">Appointment Overview</h2>
          </div>

          <button
            type="button"
            className="da-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="da-modal-patient">
          <div className="da-avatar da-avatar-large">
            {getInitials(patientName)}
          </div>

          <div className="da-modal-patient-info">
            <h3>{patientName}</h3>
            <p>
              {getPatientEmail(appointment) || "Email not available"}
            </p>
            <StatusBadge status={appointment.status} />
          </div>
        </div>

        <div className="da-detail-grid">
          <div className="da-detail-item">
            <span>Appointment date</span>
            <strong>{formatLongDate(appointment.appointmentDate)}</strong>
          </div>

          <div className="da-detail-item">
            <span>Appointment time</span>
            <strong>{formatTime(appointment.appointmentTime)}</strong>
          </div>

          <div className="da-detail-item">
            <span>Department</span>
            <strong>{getDepartmentName(appointment)}</strong>
          </div>

          <div className="da-detail-item">
            <span>Consultation type</span>
            <strong>
              {appointment.consultationType || "Not specified"}
            </strong>
          </div>

          <div className="da-detail-item">
            <span>Payment status</span>
            <strong>{appointment.paymentStatus || "Not specified"}</strong>
          </div>

          <div className="da-detail-item">
            <span>Gender</span>
            <strong>{patient.gender || "Not available"}</strong>
          </div>

          <div className="da-detail-item">
            <span>Blood group</span>
            <strong>{patient.bloodGroup || "Not available"}</strong>
          </div>

          <div className="da-detail-item">
            <span>Date of birth</span>
            <strong>
              {patient.dateOfBirth
                ? formatDate(patient.dateOfBirth)
                : "Not available"}
            </strong>
          </div>
        </div>

        <div className="da-detail-section">
          <h4>Reason for appointment</h4>
          <p>{appointment.reason || "No reason provided."}</p>
        </div>

        {allergies && (
          <div className="da-detail-section">
            <h4>Allergies</h4>
            <p>{allergies}</p>
          </div>
        )}

        {existingConditions && (
          <div className="da-detail-section">
            <h4>Existing conditions</h4>
            <p>{existingConditions}</p>
          </div>
        )}

        {medicalHistory && (
          <div className="da-detail-section">
            <h4>Medical history</h4>
            <p>{medicalHistory}</p>
          </div>
        )}

        <div className="da-modal-footer">
          <div className="da-reference">
            <span>Appointment ID</span>
            <strong title={appointmentId}>
              {appointmentId ? `#${appointmentId.slice(-8)}` : "Unavailable"}
            </strong>
          </div>

          {patientId && (
            <div className="da-reference">
              <span>Patient ID</span>
              <strong title={patientId}>#{patientId.slice(-8)}</strong>
            </div>
          )}

          <button
            type="button"
            className="da-primary-button"
            onClick={onClose}
          >
            Close details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmptyState({ search, filter, error }) {
  const hasSearch = Boolean(search.trim());
  const hasFilter = filter !== "All";

  let title = "No appointments yet";
  let description = "Your appointments will appear here when available.";

  if (error) {
    title = "Appointments unavailable";
    description = "Please refresh the list or try again.";
  } else if (hasSearch || hasFilter) {
    title = "No matching appointments";
    description = "Try changing your search or selected filter.";
  }

  return (
    <div className="da-empty">
      <div className="da-empty-icon">▦</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [page, setPage] = useState(1);

  const loadAppointments = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getDoctorAppointments();

      // Backend response: { success, message, data: [...] }
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setAppointments(data);
    } catch (err) {
      setError(
        err?.message ||
          "Appointments load nahi ho paaye. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "Pending").length,
      confirmed: appointments.filter((a) => a.status === "Confirmed").length,
      completed: appointments.filter((a) => a.status === "Completed").length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return appointments
      .filter((appointment) => {
        const matchesFilter =
          activeFilter === "All" || appointment.status === activeFilter;

        const searchableText = [
          getPatientName(appointment),
          getPatientEmail(appointment),
          getDepartmentName(appointment),
          appointment.reason,
          appointment.status,
          appointment.consultationType,
          appointment.appointmentTime,
          getAppointmentId(appointment),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesFilter && (!query || searchableText.includes(query));
      })
      .sort((a, b) => {
        const first = getAppointmentTimestamp(a);
        const second = getAppointmentTimestamp(b);

        return sortOrder === "upcoming" ? first - second : second - first;
      });
  }, [appointments, search, activeFilter, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAppointments.length / PAGE_SIZE)
  );

  const visibleAppointments = filteredAppointments.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search, activeFilter, sortOrder]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="da-page">
      <motion.section
        className="da-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="da-hero-decoration da-decoration-one" />
        <div className="da-hero-decoration da-decoration-two" />

        <div className="da-hero-content">
          <span className="da-hero-kicker">
            <span className="da-live-dot" />
            DOCTOR PORTAL
          </span>

          <h1>My Appointments</h1>

          <p>
            Manage your schedule, review patient details, and keep track of
            your consultations.
          </p>
        </div>

        <div className="da-hero-actions">
          <button
            type="button"
            className="da-hero-button"
            onClick={() => loadAppointments(true)}
            disabled={loading || refreshing}
          >
            <span className={refreshing ? "da-spin" : ""}>↻</span>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </motion.section>

      {error && (
        <motion.div
          className="da-error"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>{error}</span>
          <button
            type="button"
            className="da-retry"
            onClick={() => loadAppointments()}
          >
            Try again
          </button>
        </motion.div>
      )}

      <section className="da-stats">
        <StatCard
          title="Total Appointments"
          value={loading ? "—" : stats.total}
          icon="▦"
          color={{ background: "#eaf2ff", foreground: "#2563eb" }}
          subtitle="All your appointments"
          delay={0.05}
        />

        <StatCard
          title="Pending"
          value={loading ? "—" : stats.pending}
          icon="◷"
          color={{ background: "#fff7e6", foreground: "#d97706" }}
          subtitle="Awaiting confirmation"
          delay={0.1}
        />

        <StatCard
          title="Confirmed"
          value={loading ? "—" : stats.confirmed}
          icon="✓"
          color={{ background: "#eff6ff", foreground: "#2563eb" }}
          subtitle="Scheduled appointments"
          delay={0.15}
        />

        <StatCard
          title="Completed"
          value={loading ? "—" : stats.completed}
          icon="✓"
          color={{ background: "#ecfdf5", foreground: "#059669" }}
          subtitle="Completed consultations"
          delay={0.2}
        />
      </section>

      <motion.section
        className="da-panel"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
      >
        <div className="da-panel-heading">
          <div>
            <h2>Appointment Schedule</h2>
            <p>View and search your patient appointments</p>
          </div>

          <span className="da-count">
            {loading ? "..." : filteredAppointments.length}
          </span>
        </div>

        <div className="da-toolbar">
          <div className="da-search-wrap">
            <span className="da-search-icon">⌕</span>
            <input
              className="da-search"
              type="search"
              placeholder="Search patient, department, reason..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search appointments"
            />
          </div>

          <div className="da-toolbar-right">
            <select
              className="da-select"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-label="Sort appointments"
            >
              <option value="upcoming">Date: Oldest first</option>
              <option value="latest">Date: Newest first</option>
            </select>
          </div>
        </div>

        <div className="da-filter-row">
          {FILTERS.map((filter) => (
            <button
              type="button"
              key={filter}
              className={`da-filter ${
                activeFilter === filter ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
              {filter === "All" && !loading ? ` (${stats.total})` : ""}
            </button>
          ))}
        </div>

        <div className="da-table-wrap">
          <table className="da-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Department</th>
                <th>Consultation</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td>
                      <div className="da-patient">
                        <div
                          className="da-skeleton"
                          style={{ width: 38, height: 38 }}
                        />
                        <div className="da-skeleton-content">
                          <div
                            className="da-skeleton"
                            style={{ width: 100 }}
                          />
                          <div
                            className="da-skeleton"
                            style={{ width: 65 }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        className="da-skeleton"
                        style={{ width: 100 }}
                      />
                      <div
                        className="da-skeleton"
                        style={{ width: 65 }}
                      />
                    </td>
                    <td>
                      <div className="da-skeleton" style={{ width: 90 }} />
                    </td>
                    <td>
                      <div className="da-skeleton" style={{ width: 80 }} />
                    </td>
                    <td>
                      <div className="da-skeleton" style={{ width: 70 }} />
                    </td>
                    <td>
                      <div className="da-skeleton" style={{ width: 75 }} />
                    </td>
                  </tr>
                ))
              ) : visibleAppointments.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {visibleAppointments.map((appointment, index) => {
                    const patientName = getPatientName(appointment);
                    const patientEmail = getPatientEmail(appointment);
                    const appointmentId = getAppointmentId(appointment);

                    return (
                      <motion.tr
                        key={
                          appointmentId ||
                          `${index}-${patientName}-${appointment.appointmentDate}`
                        }
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.025,
                        }}
                      >
                        <td>
                          <div className="da-patient">
                            <div className="da-avatar">
                              {getInitials(patientName)}
                            </div>

                            <div>
                              <div className="da-patient-name">
                                {patientName}
                              </div>
                              <div className="da-patient-sub">
                                {patientEmail ||
                                  (appointmentId
                                    ? `ID: ${appointmentId.slice(-8)}`
                                    : "Patient")}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="da-date">
                            {formatDate(appointment.appointmentDate)}
                          </div>
                          <div className="da-time">
                            {formatTime(appointment.appointmentTime)}
                          </div>
                        </td>

                        <td>{getDepartmentName(appointment)}</td>

                        <td>
                          <span className="da-type">
                            <span>
                              {appointment.consultationType === "Online"
                                ? "◉"
                                : "✚"}
                            </span>
                            {appointment.consultationType || "Not specified"}
                          </span>
                        </td>

                        <td>
                          <StatusBadge status={appointment.status} />
                        </td>

                        <td>
                          <button
                            type="button"
                            className="da-view-button"
                            onClick={() =>
                              setSelectedAppointment(appointment)
                            }
                          >
                            View details <span>↗</span>
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      search={search}
                      filter={activeFilter}
                      error={error}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredAppointments.length > 0 && (
          <div className="da-pagination">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredAppointments.length)} of{" "}
              {filteredAppointments.length} appointments
            </span>

            <div className="da-page-controls">
              <button
                type="button"
                className="da-page-button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              )
                .filter(
                  (number) =>
                    number === 1 ||
                    number === totalPages ||
                    Math.abs(number - page) <= 1
                )
                .map((number, index, pages) => (
                  <span key={number} className="da-page-number">
                    {index > 0 && pages[index - 1] !== number - 1 && (
                      <span className="da-page-ellipsis">…</span>
                    )}
                    <button
                      type="button"
                      className={`da-page-button ${
                        page === number ? "active" : ""
                      }`}
                      onClick={() => setPage(number)}
                    >
                      {number}
                    </button>
                  </span>
                ))}

              <button
                type="button"
                className="da-page-button"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </motion.section>

      <AnimatePresence>
        {selectedAppointment && (
          <AppointmentDetails
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}