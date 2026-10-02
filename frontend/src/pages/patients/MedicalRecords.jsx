import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyMedicalRecords } from "../../services/medicalRecordService";
import "./MedicalRecords.css";

const formatDate = (dateValue) => {
  if (!dateValue) return "Not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "Not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name = "") => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "DR"
  );
};

const MedicalRecords = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyMedicalRecords();

        const medicalRecords =
          response?.data?.medicalRecords ||
          response?.medicalRecords ||
          [];

        if (isMounted) {
          setRecords(Array.isArray(medicalRecords) ? medicalRecords : []);
        }
      } catch (err) {
        console.error("Fetch medical records error:", err);

        if (isMounted) {
          setError(
            err?.message ||
              "Unable to load your medical records. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMedicalRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return records;

    return records.filter((record) => {
      const doctorName =
        record?.doctor?.user?.name ||
        record?.doctor?.name ||
        "";

      const department =
        record?.doctor?.department ||
        record?.appointment?.department ||
        "";

      const diagnosis = record?.diagnosis || "";
      const treatment = record?.treatment || "";

      return [doctorName, department, diagnosis, treatment].some((value) =>
        String(value).toLowerCase().includes(search)
      );
    });
  }, [records, searchTerm]);

  const getDoctorName = (record) => {
    return (
      record?.doctor?.user?.name ||
      record?.doctor?.name ||
      "Doctor not available"
    );
  };

  const getDepartmentName = (record) => {
    return (
      record?.doctor?.department ||
      record?.appointment?.department ||
      "General Medicine"
    );
  };

  const getAppointmentDate = (record) => {
    return (
      record?.appointment?.appointmentDate ||
      record?.createdAt ||
      null
    );
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseDetails = () => {
    setSelectedRecord(null);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="medical-records-page">
      <section className="medical-records-header">
        <div>
          <span className="medical-records-eyebrow">
            PATIENT HEALTHCARE
          </span>

          <h1>My Medical Records</h1>

          <p>
            View your diagnosis, symptoms, treatment details, doctor notes,
            and follow-up information in one secure place.
          </p>
        </div>

        <div className="medical-records-header-icon">
          <span>📋</span>
        </div>
      </section>

      <section className="medical-records-summary">
        <div className="summary-card">
          <div className="summary-icon blue-icon">📁</div>
          <div>
            <span>Total Records</span>
            <strong>{records.length}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon green-icon">🩺</div>
          <div>
            <span>Medical History</span>
            <strong>{records.length > 0 ? "Available" : "Empty"}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon purple-icon">🔒</div>
          <div>
            <span>Access</span>
            <strong>Private</strong>
          </div>
        </div>
      </section>

      <section className="medical-records-section">
        <div className="medical-records-section-heading">
          <div>
            <h2>Medical History</h2>
            <p>Your latest medical consultation records</p>
          </div>

          <div className="records-count-badge">
            {filteredRecords.length} Records
          </div>
        </div>

        <div className="medical-records-toolbar">
          <div className="records-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search by doctor, department, diagnosis..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="medical-records-state">
            <div className="records-spinner" />
            <h3>Loading your medical records...</h3>
            <p>Please wait while we fetch your medical history.</p>
          </div>
        )}

        {!loading && error && (
          <div className="medical-records-state error-records-state">
            <div className="records-state-icon">⚠️</div>
            <h3>Unable to load records</h3>
            <p>{error}</p>

            <button type="button" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredRecords.length === 0 && (
          <div className="medical-records-state">
            <div className="records-state-icon">📂</div>
            <h3>
              {searchTerm
                ? "No matching records found"
                : "No medical records yet"}
            </h3>

            <p>
              {searchTerm
                ? "Try another doctor name, department, or diagnosis."
                : "Your medical records will appear here after your doctor creates them."}
            </p>

            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")}>
                Clear Search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredRecords.length > 0 && (
          <div className="medical-records-list">
            {filteredRecords.map((record, index) => {
              const doctorName = getDoctorName(record);
              const departmentName = getDepartmentName(record);
              const appointmentDate = getAppointmentDate(record);

              return (
                <article
                  className="medical-record-card"
                  key={record?._id || record?.id || index}
                >
                  <div className="record-card-top">
                    <div className="doctor-profile">
                      {record?.doctor?.profileImage ? (
                        <img
                          src={record.doctor.profileImage}
                          alt={doctorName}
                        />
                      ) : (
                        <div className="doctor-avatar">
                          {getInitials(doctorName)}
                        </div>
                      )}

                      <div>
                        <h3>{doctorName}</h3>
                        <p>{departmentName}</p>
                      </div>
                    </div>

                    <span className="record-status">
                      <span />
                      Completed
                    </span>
                  </div>

                  <div className="record-card-info">
                    <div className="record-info-item">
                      <span className="info-label">Appointment Date</span>
                      <strong>{formatDate(appointmentDate)}</strong>
                    </div>

                    <div className="record-info-item">
                      <span className="info-label">Diagnosis</span>
                      <strong>
                        {record?.diagnosis?.trim() || "Not mentioned"}
                      </strong>
                    </div>

                    <div className="record-info-item">
                      <span className="info-label">Follow-up Date</span>
                      <strong>
                        {record?.followUpDate
                          ? formatDate(record.followUpDate)
                          : "Not scheduled"}
                      </strong>
                    </div>
                  </div>

                  <div className="record-card-bottom">
                    <span className="record-created-date">
                      Created on {formatDateTime(record?.createdAt)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleViewRecord(record)}
                    >
                      View Details <span>→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedRecord && (
        <div
          className="record-modal-overlay"
          role="presentation"
          onClick={handleCloseDetails}
        >
          <section
            className="record-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="medical-record-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="record-modal-header">
              <div>
                <span>MEDICAL RECORD DETAILS</span>
                <h2 id="medical-record-modal-title">
                  {getDoctorName(selectedRecord)}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={handleCloseDetails}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="modal-doctor-info">
              <div className="doctor-avatar large-avatar">
                {getInitials(getDoctorName(selectedRecord))}
              </div>

              <div>
                <strong>{getDepartmentName(selectedRecord)}</strong>
                <p>
                  Appointment:{" "}
                  {formatDate(getAppointmentDate(selectedRecord))}
                </p>
              </div>
            </div>

            <div className="record-detail-grid">
              <div className="record-detail-box">
                <span>Symptoms</span>
                <p>{selectedRecord?.symptoms || "Not mentioned"}</p>
              </div>

              <div className="record-detail-box">
                <span>Diagnosis</span>
                <p>{selectedRecord?.diagnosis || "Not mentioned"}</p>
              </div>

              <div className="record-detail-box">
                <span>Treatment</span>
                <p>{selectedRecord?.treatment || "Not mentioned"}</p>
              </div>

              <div className="record-detail-box">
                <span>Doctor Notes</span>
                <p>{selectedRecord?.doctorNotes || "No notes available"}</p>
              </div>

              <div className="record-detail-box">
                <span>Follow-up Date</span>
                <p>
                  {selectedRecord?.followUpDate
                    ? formatDate(selectedRecord.followUpDate)
                    : "No follow-up scheduled"}
                </p>
              </div>

              <div className="record-detail-box">
                <span>Record Created</span>
                <p>{formatDate(selectedRecord?.createdAt)}</p>
              </div>
            </div>

            <div className="record-modal-footer">
              <button type="button" onClick={handleCloseDetails}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default MedicalRecords;