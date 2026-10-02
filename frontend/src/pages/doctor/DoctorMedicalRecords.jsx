import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getDoctorMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
} from "../../services/medicalRecordService";
import { getDoctorAppointments } from "../../services/appointmentService";
import "./DoctorMedicalRecords.css";

const PAGE_SIZE = 8;

const initialForm = {
  appointmentId: "",
  symptoms: "",
  diagnosis: "",
  doctorNotes: "",
  treatment: "",
  followUpDate: "",
};

const getResponseData = (response) => response?.data ?? response;

const getRecordsFromResponse = (response) => {
  const data = getResponseData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.medicalRecords)) return data.medicalRecords;
  if (Array.isArray(data?.records)) return data.records;

  return [];
};

const getAppointmentsFromResponse = (response) => {
  const data = getResponseData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.appointments)) return data.appointments;

  return [];
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const getPatientName = (record) => {
  const patient = record?.patient;
  const user = patient?.user;

  if (typeof user === "string") return "Patient";
  if (user?.name) return user.name;

  return patient?.name || patient?.fullName || "Patient";
};

const getPatientEmail = (record) => {
  const user = record?.patient?.user;

  if (typeof user === "object" && user?.email) {
    return user.email;
  }

  return record?.patient?.email || "";
};

const getAppointmentDate = (record) => {
  return (
    record?.appointment?.appointmentDate ||
    record?.appointmentDate ||
    record?.createdAt ||
    null
  );
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name) => {
  if (!name) return "P";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

const isEligibleAppointment = (appointment) => {
  const status = String(appointment?.status || "").toLowerCase();
  const paymentStatus = String(
    appointment?.paymentStatus || ""
  ).toLowerCase();

  return (
    paymentStatus === "paid" &&
    !["pending", "cancelled", "rejected"].includes(status)
  );
};

const getAppointmentPatientName = (appointment) => {
  const patient = appointment?.patient;
  const user = patient?.user;

  if (typeof user === "object" && user?.name) return user.name;
  if (patient?.name) return patient.name;
  if (patient?.fullName) return patient.fullName;

  return "Patient";
};

const getAppointmentLabel = (appointment) => {
  const patientName = getAppointmentPatientName(appointment);
  const date = formatDate(appointment?.appointmentDate);
  const time = appointment?.appointmentTime || "";

  return `${patientName} • ${date}${time ? ` • ${time}` : ""}`;
};

const DoctorMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState(null);
  const [formMode, setFormMode] = useState("create");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getDoctorMedicalRecords();

      if (response?.success === false) {
        throw new Error(response.message || "Unable to load records.");
      }

      setRecords(getRecordsFromResponse(response));
    } catch (err) {
      setError(
        getErrorMessage(err, "Medical records load nahi ho paaye.")
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    setAppointmentsLoading(true);

    try {
      const response = await getDoctorAppointments();

      if (response?.success === false) {
        throw new Error(response.message || "Unable to load appointments.");
      }

      setAppointments(getAppointmentsFromResponse(response));
    } catch (err) {
      setAppointments([]);
      setFormError(
        getErrorMessage(
          err,
          "Appointments load nahi ho paaye. Thodi der baad try karein."
        )
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const recordedAppointmentIds = useMemo(() => {
    return new Set(
      records
        .map((record) => getId(record?.appointment))
        .filter(Boolean)
    );
  }, [records]);

  const eligibleAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const appointmentId = getId(appointment);

      return (
        appointmentId &&
        isEligibleAppointment(appointment) &&
        !recordedAppointmentIds.has(appointmentId)
      );
    });
  }, [appointments, recordedAppointmentIds]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const patientName = getPatientName(record).toLowerCase();
      const diagnosis = String(record?.diagnosis || "").toLowerCase();
      const symptoms = String(record?.symptoms || "").toLowerCase();
      const treatment = String(record?.treatment || "").toLowerCase();
      const email = getPatientEmail(record).toLowerCase();

      const matchesSearch =
        !query ||
        patientName.includes(query) ||
        diagnosis.includes(query) ||
        symptoms.includes(query) ||
        treatment.includes(query) ||
        email.includes(query);

      const recordDate = new Date(
        record?.createdAt || getAppointmentDate(record) || 0
      );

      const now = new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      let matchesDate = true;

      if (dateFilter === "today") {
        matchesDate =
          !Number.isNaN(recordDate.getTime()) &&
          recordDate >= today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        matchesDate =
          !Number.isNaN(recordDate.getTime()) &&
          recordDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        matchesDate =
          !Number.isNaN(recordDate.getTime()) &&
          recordDate >= monthAgo;
      }

      return matchesSearch && matchesDate;
    });
  }, [records, search, dateFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / PAGE_SIZE)
  );

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const todayCount = records.filter((record) => {
      const date = new Date(record?.createdAt || 0);
      return !Number.isNaN(date.getTime()) && date >= today;
    }).length;

    const withFollowUp = records.filter(
      (record) => record?.followUpDate
    ).length;

    return {
      total: records.length,
      today: todayCount,
      followUps: withFollowUp,
      availableAppointments: eligibleAppointments.length,
    };
  }, [records, eligibleAppointments]);

  const openCreateModal = async () => {
    setFormMode("create");
    setSelectedRecord(null);
    setDetailsRecord(null);
    setForm(initialForm);
    setFormError("");
    setSuccessMessage("");
    setModalOpen(true);

    await loadAppointments();
  };

  const openEditModal = (record) => {
    setFormMode("edit");
    setSelectedRecord(record);
    setDetailsRecord(null);
    setFormError("");
    setSuccessMessage("");

    setForm({
      appointmentId: getId(record?.appointment),
      symptoms: record?.symptoms || "",
      diagnosis: record?.diagnosis || "",
      doctorNotes: record?.doctorNotes || "",
      treatment: record?.treatment || "",
      followUpDate: record?.followUpDate
        ? new Date(record.followUpDate).toISOString().slice(0, 10)
        : "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (formMode === "create" && !form.appointmentId) {
      setFormError("Please select an appointment.");
      return;
    }

    if (!form.diagnosis.trim() && !form.symptoms.trim()) {
      setFormError("Symptoms ya diagnosis mein se kam se kam ek fill karein.");
      return;
    }

    const payload = {
      symptoms: form.symptoms.trim(),
      diagnosis: form.diagnosis.trim(),
      doctorNotes: form.doctorNotes.trim(),
      treatment: form.treatment.trim(),
      followUpDate: form.followUpDate || null,
    };

    setSaving(true);

    try {
      let response;

      if (formMode === "create") {
        response = await createMedicalRecord({
          appointmentId: form.appointmentId,
          ...payload,
        });
      } else {
        response = await updateMedicalRecord(
          getId(selectedRecord),
          payload
        );
      }

      if (response?.success === false) {
        throw new Error(response.message || "Unable to save medical record.");
      }

      setSuccessMessage(
        formMode === "create"
          ? "Medical record successfully created."
          : "Medical record successfully updated."
      );

      await loadRecords();

      window.setTimeout(() => {
        setModalOpen(false);
        setSuccessMessage("");
      }, 900);
    } catch (err) {
      setFormError(
        getErrorMessage(err, "Medical record save nahi ho paaya.")
      );
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (record) => {
    setDetailsLoading(true);
    setDetailsRecord(record);

    try {
      const response = await getMedicalRecordById(getId(record));

      if (response?.success === false) {
        throw new Error(response.message || "Unable to load record details.");
      }

      const data = getResponseData(response);
      const fetchedRecord = data?.medicalRecord || data?.record || data;

      if (fetchedRecord && typeof fetchedRecord === "object") {
        setDetailsRecord(fetchedRecord);
      }
    } catch (err) {
      // The list response is still available, so keep showing it.
      setDetailsRecord(record);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailsRecord(null);
    setDetailsLoading(false);
  };

  const renderRecordCard = (record, index) => {
    const patientName = getPatientName(record);
    const appointmentDate = getAppointmentDate(record);

    return (
      <motion.article
        className="dmr-record-card"
        key={getId(record) || index}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.045 }}
        whileHover={{ y: -4 }}
      >
        <div className="dmr-card-top">
          <div className="dmr-patient-avatar">
            {getInitials(patientName)}
          </div>

          <div className="dmr-patient-info">
            <h3>{patientName}</h3>
            <p>
              {getPatientEmail(record) || "Patient medical record"}
            </p>
          </div>

          <span className="dmr-record-badge">Medical record</span>
        </div>

        <div className="dmr-card-divider" />

        <div className="dmr-card-diagnosis">
          <span className="dmr-field-label">Diagnosis</span>
          <p>{record?.diagnosis?.trim() || "Not specified"}</p>
        </div>

        <div className="dmr-card-meta">
          <div>
            <span className="dmr-field-label">Appointment date</span>
            <strong>{formatDate(appointmentDate)}</strong>
          </div>

          <div>
            <span className="dmr-field-label">Follow-up</span>
            <strong>
              {record?.followUpDate
                ? formatDate(record.followUpDate)
                : "Not scheduled"}
            </strong>
          </div>
        </div>

        <div className="dmr-card-actions">
          <button
            type="button"
            className="dmr-btn dmr-btn-light"
            onClick={() => openDetails(record)}
          >
            View details
            <span aria-hidden="true">↗</span>
          </button>

          <button
            type="button"
            className="dmr-btn dmr-btn-primary"
            onClick={() => openEditModal(record)}
          >
            Edit record
            <span aria-hidden="true">✎</span>
          </button>
        </div>
      </motion.article>
    );
  };

  return (
    <div className="dmr-page">
      <div className="dmr-page-bg" aria-hidden="true">
        <span className="dmr-bg-orb dmr-bg-orb-one" />
        <span className="dmr-bg-orb dmr-bg-orb-two" />
      </div>

      <div className="dmr-content">
        <motion.section
          className="dmr-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="dmr-hero-copy">
            <div className="dmr-eyebrow">
              <span className="dmr-eyebrow-dot" />
              DOCTOR WORKSPACE
            </div>

            <h1>
              Medical <span>Records</span>
            </h1>

            <p>
              Manage your patients' consultation records, diagnoses,
              treatments and follow-up plans in one place.
            </p>

            <div className="dmr-hero-actions">
              <button
                type="button"
                className="dmr-btn dmr-btn-hero"
                onClick={openCreateModal}
              >
                <span className="dmr-plus-icon">+</span>
                Create medical record
              </button>

              <button
                type="button"
                className="dmr-btn dmr-btn-hero-outline"
                onClick={loadRecords}
                disabled={loading}
              >
                <span className={loading ? "dmr-refresh-spin" : ""}>↻</span>
                Refresh
              </button>
            </div>
          </div>

          <div className="dmr-hero-art" aria-hidden="true">
            <div className="dmr-art-circle dmr-art-circle-back" />
            <div className="dmr-art-circle dmr-art-circle-front" />
            <div className="dmr-art-document">
              <div className="dmr-art-document-top">
                <span className="dmr-art-cross">+</span>
                <span>MEDICAL</span>
              </div>
              <div className="dmr-art-line dmr-art-line-long" />
              <div className="dmr-art-line" />
              <div className="dmr-art-line dmr-art-line-short" />
              <div className="dmr-art-check">✓</div>
            </div>
            <div className="dmr-art-pill dmr-art-pill-one">✚</div>
            <div className="dmr-art-pill dmr-art-pill-two">✓</div>
          </div>
        </motion.section>

        <section className="dmr-stats-grid">
          <motion.div
            className="dmr-stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="dmr-stat-icon dmr-stat-blue">▤</div>
            <div className="dmr-stat-copy">
              <span>Total records</span>
              <strong>{loading ? "—" : stats.total}</strong>
              <small>Records created by you</small>
            </div>
          </motion.div>

          <motion.div
            className="dmr-stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
          >
            <div className="dmr-stat-icon dmr-stat-green">✓</div>
            <div className="dmr-stat-copy">
              <span>Created today</span>
              <strong>{loading ? "—" : stats.today}</strong>
              <small>Today's new records</small>
            </div>
          </motion.div>

          <motion.div
            className="dmr-stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="dmr-stat-icon dmr-stat-purple">◷</div>
            <div className="dmr-stat-copy">
              <span>Follow-ups</span>
              <strong>{loading ? "—" : stats.followUps}</strong>
              <small>Records with follow-up dates</small>
            </div>
          </motion.div>

          <motion.div
            className="dmr-stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
          >
            <div className="dmr-stat-icon dmr-stat-orange">＋</div>
            <div className="dmr-stat-copy">
              <span>Ready for records</span>
              <strong>{loading ? "—" : stats.availableAppointments}</strong>
              <small>Eligible appointments</small>
            </div>
          </motion.div>
        </section>

        <section className="dmr-records-section">
          <div className="dmr-section-heading">
            <div>
              <span className="dmr-section-kicker">YOUR PATIENT DATA</span>
              <h2>All medical records</h2>
              <p>View and manage the records created under your account.</p>
            </div>

            <span className="dmr-total-pill">
              {filteredRecords.length} records
            </span>
          </div>

          <div className="dmr-toolbar">
            <label className="dmr-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patient, diagnosis, symptoms..."
                aria-label="Search medical records"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>

            <label className="dmr-filter">
              <span>Time period</span>
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </label>
          </div>

          {error && (
            <div className="dmr-alert dmr-alert-error" role="alert">
              <span>!</span>
              <div>
                <strong>Unable to load records</strong>
                <p>{error}</p>
              </div>
              <button type="button" onClick={loadRecords}>
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="dmr-loading-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="dmr-skeleton-card" key={index}>
                  <div className="dmr-skeleton-head">
                    <span />
                    <div>
                      <i />
                      <i />
                    </div>
                  </div>
                  <i className="dmr-skeleton-line" />
                  <i className="dmr-skeleton-line dmr-skeleton-short" />
                  <div className="dmr-skeleton-footer">
                    <i />
                    <i />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <motion.div
              className="dmr-empty-state"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="dmr-empty-icon">▤</div>
              <h3>
                {records.length === 0
                  ? "No medical records yet"
                  : "No matching records"}
              </h3>
              <p>
                {records.length === 0
                  ? "Once you create a medical record for an eligible appointment, it will appear here."
                  : "Try changing your search term or selected time period."}
              </p>
              {records.length === 0 && (
                <button
                  type="button"
                  className="dmr-btn dmr-btn-primary"
                  onClick={openCreateModal}
                >
                  + Create your first record
                </button>
              )}
            </motion.div>
          ) : (
            <>
              <div className="dmr-record-grid">
                <AnimatePresence mode="popLayout">
                  {paginatedRecords.map(renderRecordCard)}
                </AnimatePresence>
              </div>

              {totalPages > 1 && (
                <div className="dmr-pagination">
                  <span>
                    Showing{" "}
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredRecords.length
                    )}{" "}
                    of {filteredRecords.length}
                  </span>

                  <div className="dmr-page-controls">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;

                      return (
                        <button
                          type="button"
                          key={page}
                          className={currentPage === page ? "active" : ""}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="dmr-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <motion.div
              className="dmr-modal dmr-form-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dmr-form-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <div className="dmr-modal-header">
                <div>
                  <span className="dmr-section-kicker">
                    DOCTOR WORKSPACE
                  </span>
                  <h2 id="dmr-form-title">
                    {formMode === "create"
                      ? "Create medical record"
                      : "Edit medical record"}
                  </h2>
                  <p>
                    {formMode === "create"
                      ? "Select an eligible appointment and add consultation details."
                      : "Update the consultation details below."}
                  </p>
                </div>

                <button
                  type="button"
                  className="dmr-modal-close"
                  onClick={closeModal}
                  disabled={saving}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="dmr-form-body">
                  {formMode === "create" && (
                    <div className="dmr-form-group">
                      <label htmlFor="dmr-appointment">
                        Appointment <span className="dmr-required">*</span>
                      </label>

                      <select
                        id="dmr-appointment"
                        name="appointmentId"
                        value={form.appointmentId}
                        onChange={handleFormChange}
                        disabled={appointmentsLoading || saving}
                        required
                      >
                        <option value="">
                          {appointmentsLoading
                            ? "Loading appointments..."
                            : "Select appointment"}
                        </option>

                        {eligibleAppointments.map((appointment) => (
                          <option
                            key={getId(appointment)}
                            value={getId(appointment)}
                          >
                            {getAppointmentLabel(appointment)}
                          </option>
                        ))}
                      </select>

                      <small>
                        Only paid appointments with an eligible status are
                        shown. Appointments that already have a record are
                        excluded.
                      </small>

                      {!appointmentsLoading &&
                        eligibleAppointments.length === 0 && (
                          <div className="dmr-inline-note">
                            No eligible appointments are available for a new
                            record.
                          </div>
                        )}
                    </div>
                  )}

                  <div className="dmr-form-group">
                    <label htmlFor="dmr-symptoms">Symptoms</label>
                    <textarea
                      id="dmr-symptoms"
                      name="symptoms"
                      value={form.symptoms}
                      onChange={handleFormChange}
                      placeholder="Describe the patient's symptoms..."
                      maxLength={2000}
                      rows={3}
                      disabled={saving}
                    />
                    <small>{form.symptoms.length}/2000 characters</small>
                  </div>

                  <div className="dmr-form-group">
                    <label htmlFor="dmr-diagnosis">Diagnosis</label>
                    <textarea
                      id="dmr-diagnosis"
                      name="diagnosis"
                      value={form.diagnosis}
                      onChange={handleFormChange}
                      placeholder="Enter diagnosis..."
                      maxLength={2000}
                      rows={3}
                      disabled={saving}
                    />
                    <small>{form.diagnosis.length}/2000 characters</small>
                  </div>

                  <div className="dmr-form-group">
                    <label htmlFor="dmr-treatment">Treatment</label>
                    <textarea
                      id="dmr-treatment"
                      name="treatment"
                      value={form.treatment}
                      onChange={handleFormChange}
                      placeholder="Describe the treatment plan..."
                      maxLength={5000}
                      rows={3}
                      disabled={saving}
                    />
                    <small>{form.treatment.length}/5000 characters</small>
                  </div>

                  <div className="dmr-form-group">
                    <label htmlFor="dmr-doctor-notes">Doctor notes</label>
                    <textarea
                      id="dmr-doctor-notes"
                      name="doctorNotes"
                      value={form.doctorNotes}
                      onChange={handleFormChange}
                      placeholder="Additional consultation notes..."
                      maxLength={5000}
                      rows={3}
                      disabled={saving}
                    />
                    <small>{form.doctorNotes.length}/5000 characters</small>
                  </div>

                  <div className="dmr-form-group">
                    <label htmlFor="dmr-follow-up">Follow-up date</label>
                    <input
                      id="dmr-follow-up"
                      type="date"
                      name="followUpDate"
                      value={form.followUpDate}
                      onChange={handleFormChange}
                      disabled={saving}
                    />
                    <small>
                      Leave blank if no follow-up is required.
                    </small>
                  </div>

                  {formError && (
                    <div className="dmr-alert dmr-alert-error" role="alert">
                      <span>!</span>
                      <p>{formError}</p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="dmr-alert dmr-alert-success" role="status">
                      <span>✓</span>
                      <p>{successMessage}</p>
                    </div>
                  )}
                </div>

                <div className="dmr-modal-footer">
                  <button
                    type="button"
                    className="dmr-btn dmr-btn-light"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="dmr-btn dmr-btn-primary"
                    disabled={
                      saving ||
                      (formMode === "create" &&
                        (appointmentsLoading ||
                          eligibleAppointments.length === 0))
                    }
                  >
                    {saving ? (
                      <>
                        <span className="dmr-button-spinner" />
                        Saving...
                      </>
                    ) : formMode === "create" ? (
                      "Create record"
                    ) : (
                      "Save changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILS MODAL */}
      <AnimatePresence>
        {detailsRecord && (
          <motion.div
            className="dmr-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeDetails();
            }}
          >
            <motion.div
              className="dmr-modal dmr-details-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dmr-details-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <div className="dmr-modal-header">
                <div>
                  <span className="dmr-section-kicker">
                    MEDICAL RECORD DETAILS
                  </span>
                  <h2 id="dmr-details-title">Patient consultation</h2>
                  <p>Review the saved medical record.</p>
                </div>

                <button
                  type="button"
                  className="dmr-modal-close"
                  onClick={closeDetails}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="dmr-details-body">
                {detailsLoading && (
                  <div className="dmr-details-loading">
                    <span className="dmr-button-spinner" />
                    Loading record details...
                  </div>
                )}

                <div className="dmr-details-patient">
                  <div className="dmr-patient-avatar dmr-details-avatar">
                    {getInitials(getPatientName(detailsRecord))}
                  </div>
                  <div>
                    <h3>{getPatientName(detailsRecord)}</h3>
                    <p>
                      {getPatientEmail(detailsRecord) ||
                        "Patient medical record"}
                    </p>
                  </div>
                </div>

                <div className="dmr-details-meta">
                  <div>
                    <span>Appointment date</span>
                    <strong>
                      {formatDate(getAppointmentDate(detailsRecord))}
                    </strong>
                  </div>
                  <div>
                    <span>Record created</span>
                    <strong>{formatDateTime(detailsRecord?.createdAt)}</strong>
                  </div>
                  <div>
                    <span>Follow-up date</span>
                    <strong>
                      {formatDate(detailsRecord?.followUpDate)}
                    </strong>
                  </div>
                </div>

                <div className="dmr-detail-field">
                  <span>Symptoms</span>
                  <p>{detailsRecord?.symptoms || "No symptoms recorded."}</p>
                </div>

                <div className="dmr-detail-field">
                  <span>Diagnosis</span>
                  <p>{detailsRecord?.diagnosis || "No diagnosis recorded."}</p>
                </div>

                <div className="dmr-detail-field">
                  <span>Treatment</span>
                  <p>{detailsRecord?.treatment || "No treatment recorded."}</p>
                </div>

                <div className="dmr-detail-field">
                  <span>Doctor notes</span>
                  <p>
                    {detailsRecord?.doctorNotes ||
                      "No additional notes recorded."}
                  </p>
                </div>
              </div>

              <div className="dmr-modal-footer">
                <button
                  type="button"
                  className="dmr-btn dmr-btn-light"
                  onClick={closeDetails}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="dmr-btn dmr-btn-primary"
                  onClick={() => openEditModal(detailsRecord)}
                >
                  Edit record
                  <span aria-hidden="true">✎</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorMedicalRecords;