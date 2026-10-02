import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";

import {
    getAllPatients,
    getPatientById,
    createPatient
} from "../../services/patientService";

import "./AdminPatients.css";


// =========================================================
// ANIMATIONS
// =========================================================

const pageVariants = {
    hidden: {
        opacity: 0
    },

    visible: {
        opacity: 1,

        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05
        }
    }
};


const itemVariants = {
    hidden: {
        opacity: 0,
        y: 18
    },

    visible: {
        opacity: 1,
        y: 0,

        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};


const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.94,
        y: 20
    },

    visible: {
        opacity: 1,
        scale: 1,
        y: 0,

        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    },

    exit: {
        opacity: 0,
        scale: 0.96,
        y: 15,

        transition: {
            duration: 0.2
        }
    }
};


// =========================================================
// INITIAL FORM
// =========================================================

const INITIAL_FORM = {
    user: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    medicalHistory: "",
    allergies: "",
    existingConditions: "",
    emergencyContact: {
        name: "",
        phone: "",
        relation: ""
    }
};


// =========================================================
// HELPERS
// =========================================================

const getPatientId = (patient) => {
    return patient?._id || patient?.id || "";
};


const getPatientName = (patient) => {
    return (
        patient?.user?.name ||
        patient?.name ||
        "Unknown Patient"
    );
};


const getPatientEmail = (patient) => {
    return (
        patient?.user?.email ||
        patient?.email ||
        "No email"
    );
};


const getPatientPhone = (patient) => {
    return (
        patient?.user?.phone ||
        patient?.phone ||
        "No phone"
    );
};


const getInitial = (patient) => {
    return getPatientName(patient)
        .charAt(0)
        .toUpperCase();
};


const formatDate = (date) => {
    if (!date) {
        return "Not provided";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not provided";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(parsedDate);
};


// =========================================================
// MAIN COMPONENT
// =========================================================

const AdminPatients = () => {

    // =====================================================
    // STATE
    // =====================================================

    const [patients, setPatients] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");

    const [bloodGroupFilter, setBloodGroupFilter] =
        useState("all");

    const [selectedPatient, setSelectedPatient] =
        useState(null);

    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const [detailsError, setDetailsError] =
        useState("");

    const [showDetails, setShowDetails] =
        useState(false);

    const [showCreate, setShowCreate] =
        useState(false);

    const [createLoading, setCreateLoading] =
        useState(false);

    const [createError, setCreateError] =
        useState("");

    const [createSuccess, setCreateSuccess] =
        useState("");

    const [form, setForm] =
        useState(INITIAL_FORM);


    // =====================================================
    // LOAD PATIENTS
    // =====================================================

    const loadPatients = useCallback(
        async (showRefreshLoader = false) => {

            try {

                if (showRefreshLoader) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response =
                    await getAllPatients();

                const patientData =
                    Array.isArray(response?.data)
                        ? response.data
                        : [];

                setPatients(patientData);

            } catch (err) {

                console.error(
                    "Admin Patients Error:",
                    err
                );

                setError(
                    err?.message ||
                    "Failed to load patients."
                );

            } finally {

                setLoading(false);

                setRefreshing(false);
            }
        },
        []
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadPatients();

    }, [loadPatients]);


    // =====================================================
    // FILTERED PATIENTS
    // =====================================================

    const filteredPatients = useMemo(() => {

        const query =
            search.trim().toLowerCase();

        return patients.filter((patient) => {

            const name =
                getPatientName(patient)
                    .toLowerCase();

            const email =
                getPatientEmail(patient)
                    .toLowerCase();

            const phone =
                getPatientPhone(patient)
                    .toLowerCase();

            const bloodGroup =
                String(
                    patient?.bloodGroup || ""
                ).toLowerCase();

            const matchesSearch =
                !query ||
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                bloodGroup.includes(query);

            const isActive =
                patient?.user?.isActive !== false;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && isActive) ||
                (statusFilter === "inactive" && !isActive);

            const matchesBloodGroup =
                bloodGroupFilter === "all" ||
                patient?.bloodGroup === bloodGroupFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesBloodGroup
            );
        });

    }, [
        patients,
        search,
        statusFilter,
        bloodGroupFilter
    ]);


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalPatients =
        patients.length;


    const activePatients =
        patients.filter(
            (patient) =>
                patient?.user?.isActive !== false
        ).length;


    const inactivePatients =
        patients.filter(
            (patient) =>
                patient?.user?.isActive === false
        ).length;


    const filteredCount =
        filteredPatients.length;


    // =====================================================
    // OPEN PATIENT DETAILS
    // =====================================================

    const handleViewPatient = async (patient) => {

        const patientId =
            getPatientId(patient);

        if (!patientId) {
            setDetailsError(
                "Patient ID is missing."
            );

            setShowDetails(true);

            return;
        }

        try {

            setShowDetails(true);

            setDetailsLoading(true);

            setDetailsError("");

            setSelectedPatient(patient);

            const response =
                await getPatientById(patientId);

            if (response?.data) {

                setSelectedPatient(
                    response.data
                );
            }

        } catch (err) {

            console.error(
                "Get Patient Details Error:",
                err
            );

            setDetailsError(
                err?.message ||
                "Failed to load patient details."
            );

        } finally {

            setDetailsLoading(false);
        }
    };


    // =====================================================
    // CLOSE DETAILS
    // =====================================================

    const closeDetails = () => {

        setShowDetails(false);

        setDetailsError("");

        setSelectedPatient(null);
    };


    // =====================================================
    // OPEN CREATE MODAL
    // =====================================================

    const openCreatePatient = () => {

        setForm(INITIAL_FORM);

        setCreateError("");

        setCreateSuccess("");

        setShowCreate(true);
    };


    // =====================================================
    // CLOSE CREATE MODAL
    // =====================================================

    const closeCreatePatient = () => {

        if (createLoading) {
            return;
        }

        setShowCreate(false);

        setCreateError("");

        setCreateSuccess("");

        setForm(INITIAL_FORM);
    };


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleFormChange = (event) => {

        const {
            name,
            value
        } = event.target;


        if (
            name === "emergencyName" ||
            name === "emergencyPhone" ||
            name === "emergencyRelation"
        ) {

            setForm((previous) => ({

                ...previous,

                emergencyContact: {

                    ...previous.emergencyContact,

                    [name.replace(
                        "emergency",
                        ""
                    ).charAt(0).toLowerCase() +
                    name.replace(
                        "emergency",
                        ""
                    ).slice(1)]:
                        value
                }
            }));

            return;
        }


        setForm((previous) => ({

            ...previous,

            [name]: value
        }));
    };


    // =====================================================
    // CREATE PATIENT
    // =====================================================

    const handleCreatePatient = async (event) => {

        event.preventDefault();

        setCreateError("");

        setCreateSuccess("");


        if (!form.user.trim()) {

            setCreateError(
                "User ID is required."
            );

            return;
        }


        try {

            setCreateLoading(true);


            const payload = {

                user: form.user.trim(),

                dateOfBirth:
                    form.dateOfBirth ||
                    undefined,

                gender:
                    form.gender ||
                    undefined,

                bloodGroup:
                    form.bloodGroup ||
                    undefined,

                medicalHistory:
                    form.medicalHistory.trim(),

                allergies:
                    form.allergies.trim(),

                existingConditions:
                    form.existingConditions.trim(),

                emergencyContact: {

                    name:
                        form.emergencyContact.name.trim(),

                    phone:
                        form.emergencyContact.phone.trim(),

                    relation:
                        form.emergencyContact.relation.trim()
                }
            };


            const response =
                await createPatient(payload);


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    "Failed to create patient."
                );
            }


            setCreateSuccess(
                response?.message ||
                "Patient created successfully."
            );


            await loadPatients(true);


            setTimeout(() => {

                setShowCreate(false);

                setCreateSuccess("");

                setForm(INITIAL_FORM);

            }, 900);

        } catch (err) {

            console.error(
                "Create Patient Error:",
                err
            );

            setCreateError(
                err?.message ||
                "Failed to create patient."
            );

        } finally {

            setCreateLoading(false);
        }
    };


    // =====================================================
    // ESCAPE KEY
    // =====================================================

    useEffect(() => {

        const handleEscape = (event) => {

            if (event.key !== "Escape") {
                return;
            }

            if (showCreate && !createLoading) {
                closeCreatePatient();
            }

            if (showDetails) {
                closeDetails();
            }
        };


        document.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };

    }, [
        showCreate,
        createLoading,
        showDetails
    ]);


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="admin-patients-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <DashboardSidebar />


            {/* =================================================
                MAIN
            ================================================= */}

            <div className="admin-patients-main">

                <DashboardHeader />


                <main className="admin-patients-content">

                    {/* =================================================
                        BACKGROUND
                    ================================================= */}

                    <div className="admin-patients-bg-orb patients-orb-one" />

                    <div className="admin-patients-bg-orb patients-orb-two" />

                    <div className="admin-patients-bg-grid" />


                    <motion.div
                        className="admin-patients-inner"
                        variants={pageVariants}
                        initial="hidden"
                        animate="visible"
                    >

                        {/* =================================================
                            PAGE HEADER
                        ================================================= */}

                        <motion.section
                            className="admin-patients-header"
                            variants={itemVariants}
                        >

                            <div className="admin-patients-title-area">

                                <span className="admin-patients-eyebrow">

                                    <i className="bx bx-group" />

                                    PATIENT MANAGEMENT

                                </span>


                                <h1>
                                    Patients
                                </h1>


                                <p>
                                    Manage and monitor all registered
                                    patients from one place.
                                </p>

                            </div>


                            {/* <motion.button
                                type="button"
                                className="admin-patients-add-button"
                                onClick={openCreatePatient}
                                whileHover={{
                                    y: -3
                                }}
                                whileTap={{
                                    scale: 0.97
                                }}
                            >

                                <i className="bx bx-plus" />

                                <span>
                                    Add Patient
                                </span>

                            </motion.button> */}

                        </motion.section>


                        {/* =================================================
                            STAT CARDS
                        ================================================= */}

                        <section className="admin-patient-stat-grid">


                            {/* TOTAL */}

                            <motion.article
                                className="admin-patient-stat-card"
                                variants={itemVariants}
                                whileHover={{
                                    y: -5
                                }}
                            >

                                <div className="admin-patient-stat-icon patients">

                                    <i className="bx bx-group" />

                                </div>


                                <div>

                                    <span>
                                        Total Patients
                                    </span>

                                    <strong>
                                        {totalPatients}
                                    </strong>

                                </div>

                            </motion.article>


                            {/* ACTIVE */}

                            <motion.article
                                className="admin-patient-stat-card"
                                variants={itemVariants}
                                whileHover={{
                                    y: -5
                                }}
                            >

                                <div className="admin-patient-stat-icon active">

                                    <i className="bx bx-check-circle" />

                                </div>


                                <div>

                                    <span>
                                        Active Patients
                                    </span>

                                    <strong>
                                        {activePatients}
                                    </strong>

                                </div>

                            </motion.article>


                            {/* INACTIVE */}

                            <motion.article
                                className="admin-patient-stat-card"
                                variants={itemVariants}
                                whileHover={{
                                    y: -5
                                }}
                            >

                                <div className="admin-patient-stat-icon inactive">

                                    <i className="bx bx-pause-circle" />

                                </div>


                                <div>

                                    <span>
                                        Inactive Patients
                                    </span>

                                    <strong>
                                        {inactivePatients}
                                    </strong>

                                </div>

                            </motion.article>


                            {/* SHOWING */}

                            <motion.article
                                className="admin-patient-stat-card"
                                variants={itemVariants}
                                whileHover={{
                                    y: -5
                                }}
                            >

                                <div className="admin-patient-stat-icon showing">

                                    <i className="bx bx-filter-alt" />

                                </div>


                                <div>

                                    <span>
                                        Showing
                                    </span>

                                    <strong>
                                        {filteredCount}
                                    </strong>

                                </div>

                            </motion.article>

                        </section>


                        {/* =================================================
                            MAIN CARD
                        ================================================= */}

                        <motion.section
                            className="admin-patients-card"
                            variants={itemVariants}
                        >

                            {/* =================================================
                                TOOLBAR
                            ================================================= */}

                            <div className="admin-patients-toolbar">

                                <div className="admin-patient-search">

                                    <i className="bx bx-search" />


                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search by name, email, phone or blood group..."
                                    />


                                    {search && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSearch("")
                                            }
                                            aria-label="Clear search"
                                        >

                                            <i className="bx bx-x" />

                                        </button>

                                    )}

                                </div>


                                <div className="admin-patient-filters">


                                    {/* STATUS */}

                                    <div className="admin-patient-filter">

                                        <i className="bx bx-filter" />


                                        <select
                                            value={statusFilter}
                                            onChange={(event) =>
                                                setStatusFilter(
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="all">
                                                All Status
                                            </option>

                                            <option value="active">
                                                Active
                                            </option>

                                            <option value="inactive">
                                                Inactive
                                            </option>

                                        </select>

                                    </div>


                                    {/* BLOOD GROUP */}

                                    <div className="admin-patient-filter">

                                        <i className="bx bx-droplet" />


                                        <select
                                            value={bloodGroupFilter}
                                            onChange={(event) =>
                                                setBloodGroupFilter(
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="all">
                                                All Blood Groups
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


                                    {/* REFRESH */}

                                    <motion.button
                                        type="button"
                                        className="admin-patient-refresh"
                                        onClick={() =>
                                            loadPatients(true)
                                        }
                                        disabled={
                                            refreshing
                                        }
                                        whileTap={{
                                            scale: 0.95
                                        }}
                                    >

                                        <i
                                            className={`bx bx-refresh ${
                                                refreshing
                                                    ? "is-spinning"
                                                    : ""
                                            }`}
                                        />

                                        <span>
                                            Refresh
                                        </span>

                                    </motion.button>

                                </div>

                            </div>


                            {/* =================================================
                                ERROR
                            ================================================= */}

                            {error && (

                                <motion.div
                                    className="admin-patients-error"
                                    initial={{
                                        opacity: 0,
                                        y: -8
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                >

                                    <div>

                                        <i className="bx bx-error-circle" />

                                        <span>
                                            {error}
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            loadPatients()
                                        }
                                    >

                                        Retry

                                    </button>

                                </motion.div>

                            )}


                            {/* =================================================
                                TABLE / LIST
                            ================================================= */}

                            <div className="admin-patients-table-wrapper">

                                {loading ? (

                                    <div className="admin-patient-loading">

                                        {[1, 2, 3, 4, 5].map(
                                            (item) => (

                                                <div
                                                    className="admin-patient-skeleton"
                                                    key={item}
                                                >

                                                    <span />
                                                    <span />
                                                    <span />
                                                    <span />
                                                    <span />

                                                </div>

                                            )
                                        )}

                                    </div>

                                ) : filteredPatients.length === 0 ? (

                                    <div className="admin-patient-empty">

                                        <div className="admin-patient-empty-icon">

                                            <i className="bx bx-user-x" />

                                        </div>


                                        <h3>
                                            No patients found
                                        </h3>


                                        <p>
                                            Try changing your search
                                            or filter options.
                                        </p>


                                        {(search ||
                                            statusFilter !== "all" ||
                                            bloodGroupFilter !== "all") && (

                                            <button
                                                type="button"
                                                onClick={() => {

                                                    setSearch("");

                                                    setStatusFilter(
                                                        "all"
                                                    );

                                                    setBloodGroupFilter(
                                                        "all"
                                                    );

                                                }}
                                            >

                                                Clear Filters

                                            </button>

                                        )}

                                    </div>

                                ) : (

                                    <table className="admin-patients-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    Patient
                                                </th>

                                                <th>
                                                    Contact
                                                </th>

                                                <th>
                                                    Blood Group
                                                </th>

                                                <th>
                                                    Gender
                                                </th>

                                                <th>
                                                    Date of Birth
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            <AnimatePresence>

                                                {filteredPatients.map(
                                                    (
                                                        patient,
                                                        index
                                                    ) => {

                                                        const isActive =
                                                            patient?.user?.isActive !==
                                                            false;


                                                        return (

                                                            <motion.tr
                                                                key={
                                                                    getPatientId(
                                                                        patient
                                                                    ) ||
                                                                    index
                                                                }
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 10
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    y: -10
                                                                }}
                                                                transition={{
                                                                    duration:
                                                                        0.25,
                                                                    delay:
                                                                        Math.min(
                                                                            index *
                                                                                0.025,
                                                                            0.2
                                                                        )
                                                                }}
                                                            >

                                                                {/* PATIENT */}

                                                                <td>

                                                                    <div className="admin-patient-person">

                                                                        <div className="admin-patient-avatar">

                                                                            {getInitial(
                                                                                patient
                                                                            )}

                                                                        </div>


                                                                        <div className="admin-patient-person-info">

                                                                            <strong>
                                                                                {getPatientName(
                                                                                    patient
                                                                                )}
                                                                            </strong>


                                                                            <span>
                                                                                {getPatientEmail(
                                                                                    patient
                                                                                )}
                                                                            </span>

                                                                        </div>

                                                                    </div>

                                                                </td>


                                                                {/* CONTACT */}

                                                                <td>

                                                                    <div className="admin-patient-contact">

                                                                        <span>

                                                                            <i className="bx bx-phone" />

                                                                            {getPatientPhone(
                                                                                patient
                                                                            )}

                                                                        </span>


                                                                        <span>

                                                                            <i className="bx bx-envelope" />

                                                                            {getPatientEmail(
                                                                                patient
                                                                            )}

                                                                        </span>

                                                                    </div>

                                                                </td>


                                                                {/* BLOOD GROUP */}

                                                                <td>

                                                                    {patient?.bloodGroup ? (

                                                                        <span className="admin-blood-group">

                                                                            <i className="bx bx-droplet" />

                                                                            {
                                                                                patient.bloodGroup
                                                                            }

                                                                        </span>

                                                                    ) : (

                                                                        <span className="admin-not-provided">
                                                                            —
                                                                        </span>

                                                                    )}

                                                                </td>


                                                                {/* GENDER */}

                                                                <td>

                                                                    <span className="admin-patient-gender">

                                                                        {patient?.gender ||
                                                                            "Not provided"}

                                                                    </span>

                                                                </td>


                                                                {/* DOB */}

                                                                <td>

                                                                    <span className="admin-patient-date">

                                                                        {formatDate(
                                                                            patient?.dateOfBirth
                                                                        )}

                                                                    </span>

                                                                </td>


                                                                {/* STATUS */}

                                                                <td>

                                                                    <span
                                                                        className={`admin-patient-status ${
                                                                            isActive
                                                                                ? "active"
                                                                                : "inactive"
                                                                        }`}
                                                                    >

                                                                        <span />

                                                                        {isActive
                                                                            ? "Active"
                                                                            : "Inactive"}

                                                                    </span>

                                                                </td>


                                                                {/* ACTION */}

                                                                <td>

                                                                    <motion.button
                                                                        type="button"
                                                                        className="admin-patient-view-button"
                                                                        onClick={() =>
                                                                            handleViewPatient(
                                                                                patient
                                                                            )
                                                                        }
                                                                        whileHover={{
                                                                            scale: 1.04
                                                                        }}
                                                                        whileTap={{
                                                                            scale: 0.96
                                                                        }}
                                                                    >

                                                                        <i className="bx bx-show" />

                                                                        <span>
                                                                            View
                                                                        </span>

                                                                    </motion.button>

                                                                </td>

                                                            </motion.tr>

                                                        );
                                                    }
                                                )}

                                            </AnimatePresence>

                                        </tbody>

                                    </table>

                                )}

                            </div>


                            {/* =================================================
                                FOOTER
                            ================================================= */}

                            {!loading &&
                                filteredPatients.length >
                                    0 && (

                                    <div className="admin-patients-footer">

                                        <span>

                                            Showing{" "}
                                            <strong>
                                                {filteredPatients.length}
                                            </strong>{" "}
                                            of{" "}
                                            <strong>
                                                {patients.length}
                                            </strong>{" "}
                                            patients

                                        </span>


                                        <span>

                                            <i className="bx bx-shield-check" />

                                            Live database data

                                        </span>

                                    </div>

                                )}

                        </motion.section>

                    </motion.div>

                </main>

            </div>


            {/* =========================================================
                PATIENT DETAILS MODAL
            ========================================================= */}

            <AnimatePresence>

                {showDetails && (

                    <motion.div
                        className="admin-patient-modal-overlay"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeDetails();
                            }

                        }}
                    >

                        <motion.div
                            className="admin-patient-details-modal"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >

                            {/* MODAL HEADER */}

                            <div className="admin-patient-modal-header">

                                <div>

                                    <span>
                                        PATIENT PROFILE
                                    </span>


                                    <h2>
                                        Patient Details
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    onClick={closeDetails}
                                    aria-label="Close"
                                >

                                    <i className="bx bx-x" />

                                </button>

                            </div>


                            {detailsLoading ? (

                                <div className="admin-patient-details-loading">

                                    <div className="admin-details-spinner">

                                        <i className="bx bx-loader-alt" />

                                    </div>


                                    <strong>
                                        Loading patient details...
                                    </strong>


                                    <span>
                                        Fetching the latest information
                                        from the server.
                                    </span>

                                </div>

                            ) : detailsError ? (

                                <div className="admin-patient-details-error">

                                    <i className="bx bx-error-circle" />


                                    <strong>
                                        Unable to load patient
                                    </strong>


                                    <span>
                                        {detailsError}
                                    </span>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleViewPatient(
                                                selectedPatient
                                            )
                                        }
                                    >

                                        Try Again

                                    </button>

                                </div>

                            ) : selectedPatient ? (

                                <div className="admin-patient-details-body">

                                    {/* PROFILE HERO */}

                                    <div className="admin-patient-profile-hero">

                                        <div className="admin-patient-profile-avatar">

                                            {getInitial(
                                                selectedPatient
                                            )}

                                        </div>


                                        <div>

                                            <h3>
                                                {getPatientName(
                                                    selectedPatient
                                                )}
                                            </h3>


                                            <span>
                                                {getPatientEmail(
                                                    selectedPatient
                                                )}
                                            </span>


                                            <div className="admin-patient-profile-status">

                                                <span />

                                                {selectedPatient?.user
                                                    ?.isActive !== false
                                                    ? "Active Patient"
                                                    : "Inactive Patient"}

                                            </div>

                                        </div>

                                    </div>


                                    {/* PERSONAL INFORMATION */}

                                    <div className="admin-details-section">

                                        <div className="admin-details-section-title">

                                            <i className="bx bx-user" />

                                            <span>
                                                Personal Information
                                            </span>

                                        </div>


                                        <div className="admin-details-grid">

                                            <div className="admin-detail-item">

                                                <span>
                                                    Full Name
                                                </span>

                                                <strong>
                                                    {getPatientName(
                                                        selectedPatient
                                                    )}
                                                </strong>

                                            </div>


                                            <div className="admin-detail-item">

                                                <span>
                                                    Email
                                                </span>

                                                <strong>
                                                    {getPatientEmail(
                                                        selectedPatient
                                                    )}
                                                </strong>

                                            </div>


                                            <div className="admin-detail-item">

                                                <span>
                                                    Phone
                                                </span>

                                                <strong>
                                                    {getPatientPhone(
                                                        selectedPatient
                                                    )}
                                                </strong>

                                            </div>


                                            <div className="admin-detail-item">

                                                <span>
                                                    Date of Birth
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        selectedPatient?.dateOfBirth
                                                    )}
                                                </strong>

                                            </div>


                                            <div className="admin-detail-item">

                                                <span>
                                                    Gender
                                                </span>

                                                <strong>
                                                    {selectedPatient?.gender ||
                                                        "Not provided"}
                                                </strong>

                                            </div>


                                            <div className="admin-detail-item">

                                                <span>
                                                    Blood Group
                                                </span>

                                                <strong>
                                                    {selectedPatient?.bloodGroup ||
                                                        "Not provided"}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>


                                    {/* MEDICAL INFORMATION */}

                                    <div className="admin-details-section">

                                        <div className="admin-details-section-title">

                                            <i className="bx bx-plus-medical" />

                                            <span>
                                                Medical Information
                                            </span>

                                        </div>


                                        <div className="admin-medical-detail-list">

                                            <div className="admin-medical-detail">

                                                <span>
                                                    Medical History
                                                </span>


                                                <p>
                                                    {selectedPatient?.medicalHistory ||
                                                        "No medical history provided."}
                                                </p>

                                            </div>


                                            <div className="admin-medical-detail">

                                                <span>
                                                    Allergies
                                                </span>


                                                <p>
                                                    {selectedPatient?.allergies ||
                                                        "No allergies provided."}
                                                </p>

                                            </div>


                                            <div className="admin-medical-detail">

                                                <span>
                                                    Existing Conditions
                                                </span>


                                                <p>
                                                    {selectedPatient?.existingConditions ||
                                                        "No existing conditions provided."}
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    {/* EMERGENCY CONTACT */}

                                    <div className="admin-details-section">

                                        <div className="admin-details-section-title">

                                            <i className="bx bx-phone-call" />

                                            <span>
                                                Emergency Contact
                                            </span>

                                        </div>


                                        <div className="admin-details-grid">

                                            <div className="admin-detail-item">

                                                <span>
                                                    Name
                                                </span>

                                                <strong>
                                                    {selectedPatient
                                                        ?.emergencyContact
                                                        ?.name ||
                                                        "Not provided"}
                                                </strong>

                                            </div>


                                            <div className="admin-detail-item">

                                                <span>
                                                    Phone
                                                </span>

                                                <strong>
                                                    {selectedPatient
                                                        ?.emergencyContact
                                                        ?.phone ||
                                                        "Not provided"}
                                                </strong>

                                            </div>


                                            <div className="admin-detail-item">

                                                <span>
                                                    Relation
                                                </span>

                                                <strong>
                                                    {selectedPatient
                                                        ?.emergencyContact
                                                        ?.relation ||
                                                        "Not provided"}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            ) : (

                                <div className="admin-patient-details-error">

                                    <i className="bx bx-user-x" />

                                    <strong>
                                        Patient not found
                                    </strong>

                                    <span>
                                        No patient information is available.
                                    </span>

                                </div>

                            )}


                            {/* MODAL FOOTER */}

                            <div className="admin-patient-modal-footer">

                                <button
                                    type="button"
                                    onClick={closeDetails}
                                >

                                    <i className="bx bx-x" />

                                    Close

                                </button>

                            </div>

                        </motion.div>

                    </motion.div>

                )}

            </AnimatePresence>


            {/* =========================================================
                CREATE PATIENT MODAL
            ========================================================= */}

            <AnimatePresence>

                {showCreate && (

                    <motion.div
                        className="admin-patient-modal-overlay"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeCreatePatient();
                            }

                        }}
                    >

                        <motion.div
                            className="admin-patient-form-modal"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >

                            {/* FORM HEADER */}

                            <div className="admin-patient-modal-header">

                                <div>

                                    <span>
                                        PATIENT MANAGEMENT
                                    </span>


                                    <h2>
                                        Add New Patient
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeCreatePatient
                                    }
                                    disabled={
                                        createLoading
                                    }
                                    aria-label="Close"
                                >

                                    <i className="bx bx-x" />

                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handleCreatePatient
                                }
                            >

                                <div className="admin-patient-form-body">


                                    {/* API INFO */}

                                    <div className="admin-patient-form-info">

                                        <i className="bx bx-info-circle" />


                                        <span>
                                            A valid existing User ID with
                                            the <strong>patient</strong> role
                                            is required by the backend.
                                        </span>

                                    </div>


                                    {/* USER */}

                                    <div className="admin-form-section">

                                        <div className="admin-form-section-title">

                                            <i className="bx bx-user" />

                                            <span>
                                                User Information
                                            </span>

                                        </div>


                                        <div className="admin-form-group">

                                            <label htmlFor="patient-user">

                                                User ID
                                                <span>*</span>

                                            </label>


                                            <input
                                                id="patient-user"
                                                type="text"
                                                name="user"
                                                value={
                                                    form.user
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="Enter existing patient User ID"
                                                required
                                                autoComplete="off"
                                            />

                                        </div>

                                    </div>


                                    {/* PERSONAL */}

                                    <div className="admin-form-section">

                                        <div className="admin-form-section-title">

                                            <i className="bx bx-id-card" />

                                            <span>
                                                Personal Information
                                            </span>

                                        </div>


                                        <div className="admin-form-grid">


                                            {/* DOB */}

                                            <div className="admin-form-group">

                                                <label htmlFor="patient-dob">

                                                    Date of Birth

                                                </label>


                                                <input
                                                    id="patient-dob"
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={
                                                        form.dateOfBirth
                                                    }
                                                    onChange={
                                                        handleFormChange
                                                    }
                                                />

                                            </div>


                                            {/* GENDER */}

                                            <div className="admin-form-group">

                                                <label htmlFor="patient-gender">

                                                    Gender

                                                </label>


                                                <select
                                                    id="patient-gender"
                                                    name="gender"
                                                    value={
                                                        form.gender
                                                    }
                                                    onChange={
                                                        handleFormChange
                                                    }
                                                >

                                                    <option value="">
                                                        Select Gender
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


                                            {/* BLOOD */}

                                            <div className="admin-form-group">

                                                <label htmlFor="patient-blood">

                                                    Blood Group

                                                </label>


                                                <select
                                                    id="patient-blood"
                                                    name="bloodGroup"
                                                    value={
                                                        form.bloodGroup
                                                    }
                                                    onChange={
                                                        handleFormChange
                                                    }
                                                >

                                                    <option value="">
                                                        Select Blood Group
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


                                    {/* MEDICAL */}

                                    <div className="admin-form-section">

                                        <div className="admin-form-section-title">

                                            <i className="bx bx-plus-medical" />

                                            <span>
                                                Medical Information
                                            </span>

                                        </div>


                                        <div className="admin-form-group">

                                            <label htmlFor="patient-history">

                                                Medical History

                                            </label>


                                            <textarea
                                                id="patient-history"
                                                name="medicalHistory"
                                                value={
                                                    form.medicalHistory
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                rows="3"
                                                placeholder="Enter patient's medical history..."
                                            />

                                        </div>


                                        <div className="admin-form-group">

                                            <label htmlFor="patient-allergies">

                                                Allergies

                                            </label>


                                            <textarea
                                                id="patient-allergies"
                                                name="allergies"
                                                value={
                                                    form.allergies
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                rows="3"
                                                placeholder="Enter known allergies..."
                                            />

                                        </div>


                                        <div className="admin-form-group">

                                            <label htmlFor="patient-conditions">

                                                Existing Conditions

                                            </label>


                                            <textarea
                                                id="patient-conditions"
                                                name="existingConditions"
                                                value={
                                                    form.existingConditions
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                rows="3"
                                                placeholder="Enter existing medical conditions..."
                                            />

                                        </div>

                                    </div>


                                    {/* EMERGENCY */}

                                    <div className="admin-form-section">

                                        <div className="admin-form-section-title">

                                            <i className="bx bx-phone-call" />

                                            <span>
                                                Emergency Contact
                                            </span>

                                        </div>


                                        <div className="admin-form-grid">


                                            <div className="admin-form-group">

                                                <label htmlFor="emergency-name">

                                                    Name

                                                </label>


                                                <input
                                                    id="emergency-name"
                                                    type="text"
                                                    name="emergencyName"
                                                    value={
                                                        form.emergencyContact.name
                                                    }
                                                    onChange={
                                                        handleFormChange
                                                    }
                                                    placeholder="Contact person name"
                                                />

                                            </div>


                                            <div className="admin-form-group">

                                                <label htmlFor="emergency-phone">

                                                    Phone

                                                </label>


                                                <input
                                                    id="emergency-phone"
                                                    type="tel"
                                                    name="emergencyPhone"
                                                    value={
                                                        form.emergencyContact.phone
                                                    }
                                                    onChange={
                                                        handleFormChange
                                                    }
                                                    placeholder="Contact phone"
                                                />

                                            </div>


                                            <div className="admin-form-group">

                                                <label htmlFor="emergency-relation">

                                                    Relation

                                                </label>


                                                <input
                                                    id="emergency-relation"
                                                    type="text"
                                                    name="emergencyRelation"
                                                    value={
                                                        form.emergencyContact.relation
                                                    }
                                                    onChange={
                                                        handleFormChange
                                                    }
                                                    placeholder="e.g. Father, Mother"
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    {/* ERROR */}

                                    {createError && (

                                        <motion.div
                                            className="admin-patient-form-error"
                                            initial={{
                                                opacity: 0,
                                                y: -5
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0
                                            }}
                                        >

                                            <i className="bx bx-error-circle" />

                                            <span>
                                                {createError}
                                            </span>

                                        </motion.div>

                                    )}


                                    {/* SUCCESS */}

                                    {createSuccess && (

                                        <motion.div
                                            className="admin-patient-form-success"
                                            initial={{
                                                opacity: 0,
                                                y: -5
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0
                                            }}
                                        >

                                            <i className="bx bx-check-circle" />

                                            <span>
                                                {createSuccess}
                                            </span>

                                        </motion.div>

                                    )}

                                </div>


                                {/* FORM FOOTER */}

                                <div className="admin-patient-form-footer">

                                    <button
                                        type="button"
                                        onClick={
                                            closeCreatePatient
                                        }
                                        disabled={
                                            createLoading
                                        }
                                    >

                                        Cancel

                                    </button>


                                    <motion.button
                                        type="submit"
                                        className="admin-patient-save-button"
                                        disabled={
                                            createLoading
                                        }
                                        whileHover={{
                                            y: -2
                                        }}
                                        whileTap={{
                                            scale: 0.97
                                        }}
                                    >

                                        {createLoading ? (

                                            <>
                                                <i className="bx bx-loader-alt is-spinning" />

                                                Creating...

                                            </>

                                        ) : (

                                            <>
                                                <i className="bx bx-check" />

                                                Create Patient

                                            </>

                                        )}

                                    </motion.button>

                                </div>

                            </form>

                        </motion.div>

                    </motion.div>

                )}

            </AnimatePresence>

        </div>
    );
};


export default AdminPatients;