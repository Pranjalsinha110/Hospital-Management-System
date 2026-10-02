import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    getDoctorPatients,
} from "../../services/patientService";
import "./DoctorPatients.css";

const ITEMS_PER_PAGE = 8;

const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return "—";

    const birthDate = new Date(dateOfBirth);

    if (Number.isNaN(birthDate.getTime())) return "—";

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age >= 0 ? age : "—";
};

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getPatientName = (patient) => {
    return patient?.user?.name || "Patient";
};

const getInitials = (name) => {
    if (!name || name === "Patient") return "PT";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
};

const getErrorMessage = (error) => {
    return (
        error?.message ||
        "Unable to load patients. Please try again."
    );
};

const PatientAvatar = ({ name, size = "normal" }) => (
    <div className={`dp-avatar dp-avatar-${size}`}>
        <span>{getInitials(name)}</span>
    </div>
);

const StatCard = ({ title, value, subtitle, icon, delay = 0 }) => (
    <motion.div
        className="dp-stat-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -4 }}
    >
        <div className={`dp-stat-icon dp-stat-icon-${icon}`}>
            {icon === "patients" && (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="10" cy="7" r="4" />
                    <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            )}
            {icon === "male" && (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="10" cy="14" r="5" />
                    <path d="M14 10 21 3M15 3h6v6" />
                </svg>
            )}
            {icon === "female" && (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M12 13v8M9 18h6" />
                </svg>
            )}
            {icon === "blood" && (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 22a7 7 0 0 0 7-7c0-4-7-13-7-13S5 11 5 15a7 7 0 0 0 7 7Z" />
                    <path d="M9 15a3 3 0 0 0 3 3" />
                </svg>
            )}
        </div>

        <div className="dp-stat-content">
            <span className="dp-stat-title">{title}</span>
            <strong className="dp-stat-value">{value}</strong>
            <span className="dp-stat-subtitle">{subtitle}</span>
        </div>
    </motion.div>
);

const PatientDetailsModal = ({ patient, onClose }) => {
    if (!patient) return null;

    const name = getPatientName(patient);
    const user = patient.user || {};
    const emergency = patient.emergencyContact || {};

    return (
        <AnimatePresence>
            <motion.div
                className="dp-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                        onClose();
                    }
                }}
            >
                <motion.div
                    className="dp-modal"
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="dp-modal-title"
                >
                    <div className="dp-modal-header">
                        <div className="dp-modal-heading">
                            <span className="dp-modal-eyebrow">
                                PATIENT PROFILE
                            </span>
                            <h2 id="dp-modal-title">Patient details</h2>
                        </div>

                        <button
                            type="button"
                            className="dp-icon-button"
                            onClick={onClose}
                            aria-label="Close patient details"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="m18 6-12 12M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="dp-modal-profile">
                        <PatientAvatar name={name} size="large" />

                        <div className="dp-modal-profile-info">
                            <h3>{name}</h3>
                            <p>{user.email || "Email not available"}</p>
                            <span className="dp-profile-badge">
                                Patient
                            </span>
                        </div>
                    </div>

                    <div className="dp-detail-section">
                        <h3>Personal information</h3>

                        <div className="dp-detail-grid">
                            <div className="dp-detail-item">
                                <span>Age</span>
                                <strong>
                                    {getAge(patient.dateOfBirth) === "—"
                                        ? "Not available"
                                        : `${getAge(patient.dateOfBirth)} years`}
                                </strong>
                            </div>

                            <div className="dp-detail-item">
                                <span>Gender</span>
                                <strong>{patient.gender || "—"}</strong>
                            </div>

                            <div className="dp-detail-item">
                                <span>Blood group</span>
                                <strong>
                                    {patient.bloodGroup || "—"}
                                </strong>
                            </div>

                            <div className="dp-detail-item">
                                <span>Date of birth</span>
                                <strong>
                                    {formatDate(patient.dateOfBirth)}
                                </strong>
                            </div>

                            <div className="dp-detail-item">
                                <span>Phone</span>
                                <strong>{user.phone || "—"}</strong>
                            </div>

                            <div className="dp-detail-item">
                                <span>Email</span>
                                <strong className="dp-break-text">
                                    {user.email || "—"}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="dp-detail-section">
                        <h3>Medical information</h3>

                        <div className="dp-medical-info">
                            <div className="dp-medical-item">
                                <span className="dp-medical-dot dp-dot-blue" />
                                <div>
                                    <strong>Medical history</strong>
                                    <p>
                                        {patient.medicalHistory || "No information available"}
                                    </p>
                                </div>
                            </div>

                            <div className="dp-medical-item">
                                <span className="dp-medical-dot dp-dot-orange" />
                                <div>
                                    <strong>Allergies</strong>
                                    <p>
                                        {patient.allergies || "No information available"}
                                    </p>
                                </div>
                            </div>

                            <div className="dp-medical-item">
                                <span className="dp-medical-dot dp-dot-green" />
                                <div>
                                    <strong>Existing conditions</strong>
                                    <p>
                                        {patient.existingConditions || "No information available"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dp-detail-section">
                        <h3>Emergency contact</h3>

                        <div className="dp-detail-grid">
                            <div className="dp-detail-item">
                                <span>Name</span>
                                <strong>{emergency.name || "—"}</strong>
                            </div>

                            <div className="dp-detail-item">
                                <span>Phone</span>
                                <strong>{emergency.phone || "—"}</strong>
                            </div>

                            <div className="dp-detail-item">
                                <span>Relation</span>
                                <strong>{emergency.relation || "—"}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="dp-modal-footer">
                        <span>
                            Patient ID: {patient._id || "—"}
                        </span>
                        <button
                            type="button"
                            className="dp-primary-button"
                            onClick={onClose}
                        >
                            Done
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const PatientRow = ({ patient, index, onView }) => {
    const name = getPatientName(patient);

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.035, 0.3) }}
        >
            <td>
                <div className="dp-patient-cell">
                    <PatientAvatar name={name} />
                    <div className="dp-patient-name-wrap">
                        <strong>{name}</strong>
                        <span>
                            {patient.user?.email || "Email not available"}
                        </span>
                    </div>
                </div>
            </td>

            <td>
                <span className="dp-age">
                    {getAge(patient.dateOfBirth) === "—"
                        ? "—"
                        : `${getAge(patient.dateOfBirth)} yrs`}
                </span>
            </td>

            <td>
                <span className="dp-gender">
                    {patient.gender || "—"}
                </span>
            </td>

            <td>
                {patient.bloodGroup ? (
                    <span className="dp-blood-badge">
                        {patient.bloodGroup}
                    </span>
                ) : (
                    <span className="dp-muted">—</span>
                )}
            </td>

            <td>
                <span className="dp-date">
                    {formatDate(patient.updatedAt || patient.createdAt)}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    className="dp-view-button"
                    onClick={() => onView(patient)}
                >
                    View profile
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </td>
        </motion.tr>
    );
};

const DoctorPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [genderFilter, setGenderFilter] = useState("all");
    const [bloodFilter, setBloodFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const fetchPatients = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await getDoctorPatients();

            // Supports both { data: [...] } and direct array responses.
            const result = Array.isArray(response)
                ? response
                : response?.data;

            if (!Array.isArray(result)) {
                throw new Error("Invalid patient data received from server.");
            }

            setPatients(result);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const filteredPatients = useMemo(() => {
        const query = search.trim().toLowerCase();

        return patients.filter((patient) => {
            const name = getPatientName(patient).toLowerCase();
            const email = (patient.user?.email || "").toLowerCase();
            const phone = (patient.user?.phone || "").toLowerCase();
            const patientId = (patient._id || "").toLowerCase();

            const matchesSearch =
                !query ||
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                patientId.includes(query);

            const matchesGender =
                genderFilter === "all" ||
                (patient.gender || "").toLowerCase() === genderFilter;

            const matchesBlood =
                bloodFilter === "all" ||
                (patient.bloodGroup || "").toLowerCase() === bloodFilter;

            return matchesSearch && matchesGender && matchesBlood;
        });
    }, [patients, search, genderFilter, bloodFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)
    );

    const visiblePatients = filteredPatients.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, genderFilter, bloodFilter]);

    const maleCount = patients.filter(
        (patient) => (patient.gender || "").toLowerCase() === "male"
    ).length;

    const femaleCount = patients.filter(
        (patient) => (patient.gender || "").toLowerCase() === "female"
    ).length;

    const bloodGroups = useMemo(
        () => [...new Set(
            patients
                .map((patient) => patient.bloodGroup)
                .filter(Boolean)
        )].sort(),
        [patients]
    );

    const clearFilters = () => {
        setSearch("");
        setGenderFilter("all");
        setBloodFilter("all");
        setCurrentPage(1);
    };

    return (
        <div className="dp-page">
            <div className="dp-container">
                <motion.div
                    className="dp-hero"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    <div className="dp-hero-content">
                        <div className="dp-hero-eyebrow">
                            <span className="dp-hero-pulse" />
                            DOCTOR WORKSPACE
                        </div>

                        <h1>
                            My <span>Patients</span>
                        </h1>

                        <p>
                            Manage your patients and access their available
                            medical information in one place.
                        </p>

                        <div className="dp-hero-meta">
                            <span className="dp-hero-meta-icon">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="10" cy="7" r="4" />
                                    <path d="M20 8v6M17 11h6" />
                                </svg>
                            </span>
                            <span>
                                {patients.length} patients in your care
                            </span>
                        </div>
                    </div>

                    <div className="dp-hero-art" aria-hidden="true">
                        <div className="dp-hero-orbit dp-orbit-one" />
                        <div className="dp-hero-orbit dp-orbit-two" />
                        <div className="dp-hero-circle">
                            <svg viewBox="0 0 120 120">
                                <path d="M60 17c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20Z" />
                                <path d="M22 104c0-21 17-38 38-38s38 17 38 38" />
                                <path d="M60 76v22M49 87h22" />
                            </svg>
                        </div>
                        <div className="dp-hero-float dp-float-one">
                            <span>+</span>
                        </div>
                        <div className="dp-hero-float dp-float-two">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                <div className="dp-stats-grid">
                    <StatCard
                        title="Total patients"
                        value={loading ? "—" : patients.length}
                        subtitle="Your patient list"
                        icon="patients"
                        delay={0.05}
                    />
                    <StatCard
                        title="Male patients"
                        value={loading ? "—" : maleCount}
                        subtitle="Based on available profiles"
                        icon="male"
                        delay={0.1}
                    />
                    <StatCard
                        title="Female patients"
                        value={loading ? "—" : femaleCount}
                        subtitle="Based on available profiles"
                        icon="female"
                        delay={0.15}
                    />
                    <StatCard
                        title="Blood groups"
                        value={loading ? "—" : bloodGroups.length}
                        subtitle="Unique groups recorded"
                        icon="blood"
                        delay={0.2}
                    />
                </div>

                <motion.section
                    className="dp-panel"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 }}
                >
                    <div className="dp-panel-header">
                        <div>
                            <span className="dp-section-eyebrow">
                                PATIENT DIRECTORY
                            </span>
                            <h2>Patients overview</h2>
                            <p>
                                Search and view the patients linked to your appointments.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="dp-refresh-button"
                            onClick={() => fetchPatients(true)}
                            disabled={refreshing || loading}
                        >
                            <svg
                                className={refreshing ? "dp-spin" : ""}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M20 7v5h-5M4 17v-5h5" />
                                <path d="M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2" />
                            </svg>
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    <div className="dp-toolbar">
                        <label className="dp-search">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Search name, email, phone or ID..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="dp-clear-search"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </label>

                        <div className="dp-filter-group">
                            <select
                                aria-label="Filter by gender"
                                value={genderFilter}
                                onChange={(event) => setGenderFilter(event.target.value)}
                            >
                                <option value="all">All genders</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>

                            <select
                                aria-label="Filter by blood group"
                                value={bloodFilter}
                                onChange={(event) => setBloodFilter(event.target.value)}
                            >
                                <option value="all">All blood groups</option>
                                {bloodGroups.map((group) => (
                                    <option key={group} value={group.toLowerCase()}>
                                        {group}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="dp-error" role="alert">
                            <div className="dp-error-icon">!</div>
                            <div>
                                <strong>Unable to load patients</strong>
                                <p>{error}</p>
                            </div>
                            <button
                                type="button"
                                className="dp-retry-button"
                                onClick={() => fetchPatients()}
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {!error && loading ? (
                        <div className="dp-loading">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div className="dp-skeleton-row" key={item}>
                                    <div className="dp-skeleton-avatar" />
                                    <div className="dp-skeleton-lines">
                                        <span />
                                        <span />
                                    </div>
                                    <span className="dp-skeleton-cell" />
                                    <span className="dp-skeleton-cell" />
                                    <span className="dp-skeleton-cell" />
                                </div>
                            ))}
                        </div>
                    ) : !error && (
                        <>
                            <div className="dp-table-wrap">
                                <table className="dp-table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Age</th>
                                            <th>Gender</th>
                                            <th>Blood group</th>
                                            <th>Profile updated</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <AnimatePresence mode="popLayout">
                                            {visiblePatients.map((patient, index) => (
                                                <PatientRow
                                                    key={patient._id}
                                                    patient={patient}
                                                    index={index}
                                                    onView={setSelectedPatient}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {filteredPatients.length === 0 ? (
                                <div className="dp-empty">
                                    <div className="dp-empty-icon">
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <circle cx="11" cy="11" r="7" />
                                            <path d="m20 20-4-4" />
                                        </svg>
                                    </div>

                                    <h3>
                                        {patients.length === 0
                                            ? "No patients found"
                                            : "No matching patients"}
                                    </h3>

                                    <p>
                                        {patients.length === 0
                                            ? "Patients linked to your appointments will appear here."
                                            : "Try changing your search or filters."}
                                    </p>

                                    {(search || genderFilter !== "all" || bloodFilter !== "all") && (
                                        <button
                                            type="button"
                                            className="dp-primary-button"
                                            onClick={clearFilters}
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="dp-table-footer">
                                    <span>
                                        Showing{" "}
                                        <strong>
                                            {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                            {"–"}
                                            {Math.min(
                                                currentPage * ITEMS_PER_PAGE,
                                                filteredPatients.length
                                            )}
                                        </strong>
                                        {" "}of{" "}
                                        <strong>{filteredPatients.length}</strong>
                                        {" "}patients
                                    </span>

                                    <div className="dp-pagination">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                            disabled={currentPage === 1}
                                            aria-label="Previous page"
                                        >
                                            ‹
                                        </button>

                                        <span>
                                            Page <strong>{currentPage}</strong> of{" "}
                                            <strong>{totalPages}</strong>
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                            disabled={currentPage === totalPages}
                                            aria-label="Next page"
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </motion.section>
            </div>

            <AnimatePresence>
                {selectedPatient && (
                    <PatientDetailsModal
                        patient={selectedPatient}
                        onClose={() => setSelectedPatient(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DoctorPatients;