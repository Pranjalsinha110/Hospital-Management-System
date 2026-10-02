import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    AnimatePresence,
    motion
} from "framer-motion";

import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";

import {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    updateDepartmentStatus
} from "../../services/departmentService";

import "./AdminDepartments.css";


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
            staggerChildren: 0.07,
            delayChildren: 0.04
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
            duration: 0.4,
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
        y: 12,
        transition: {
            duration: 0.2
        }
    }
};


// =========================================================
// CONSTANTS
// =========================================================

const INITIAL_FORM = {
    name: "",
    description: ""
};


// =========================================================
// HELPERS
// =========================================================

const getDepartmentId = (department) => {
    return department?._id || department?.id || "";
};


const formatDate = (date) => {
    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(parsedDate);
};


const getDepartmentInitial = (name) => {
    return String(name || "D")
        .trim()
        .charAt(0)
        .toUpperCase();
};


// =========================================================
// MAIN COMPONENT
// =========================================================

const AdminDepartments = () => {

    // =====================================================
    // STATE
    // =====================================================

    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");


    // FORM MODAL

    const [showForm, setShowForm] = useState(false);

    const [formMode, setFormMode] = useState("create");

    const [editingDepartmentId, setEditingDepartmentId] =
        useState(null);

    const [form, setForm] = useState(INITIAL_FORM);

    const [formLoading, setFormLoading] = useState(false);

    const [formError, setFormError] = useState("");

    const [formSuccess, setFormSuccess] = useState("");


    // DETAILS MODAL

    const [showDetails, setShowDetails] = useState(false);

    const [selectedDepartment, setSelectedDepartment] =
        useState(null);

    const [detailsLoading, setDetailsLoading] = useState(false);

    const [detailsError, setDetailsError] = useState("");


    // STATUS MODAL

    const [showStatusConfirm, setShowStatusConfirm] =
        useState(false);

    const [statusDepartment, setStatusDepartment] =
        useState(null);

    const [statusLoading, setStatusLoading] = useState(false);

    const [statusError, setStatusError] = useState("");


    // =====================================================
    // LOAD DEPARTMENTS
    // =====================================================

    const loadDepartments = useCallback(
        async (showRefreshLoader = false) => {
            try {
                if (showRefreshLoader) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response = await getAllDepartments();

                const departmentData = Array.isArray(response?.data)
                    ? response.data
                    : [];

                setDepartments(departmentData);

            } catch (err) {
                console.error(
                    "Admin Departments Error:",
                    err
                );

                setError(
                    err?.message ||
                    "Failed to load departments."
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
        loadDepartments();
    }, [loadDepartments]);


    // =====================================================
    // FILTER DEPARTMENTS
    // =====================================================

    const filteredDepartments = useMemo(() => {
        const query = search.trim().toLowerCase();

        return departments.filter((department) => {
            const name = String(
                department?.name || ""
            ).toLowerCase();

            const description = String(
                department?.description || ""
            ).toLowerCase();

            const matchesSearch =
                !query ||
                name.includes(query) ||
                description.includes(query);

            const isActive = department?.isActive !== false;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && isActive) ||
                (statusFilter === "inactive" && !isActive);

            return matchesSearch && matchesStatus;
        });
    }, [
        departments,
        search,
        statusFilter
    ]);


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalDepartments = departments.length;

    const activeDepartments = departments.filter(
        (department) => department?.isActive !== false
    ).length;

    const inactiveDepartments = departments.filter(
        (department) => department?.isActive === false
    ).length;

    const filteredCount = filteredDepartments.length;


    // =====================================================
    // FORM HANDLING
    // =====================================================

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        if (formError) {
            setFormError("");
        }

        if (formSuccess) {
            setFormSuccess("");
        }
    };


    // =====================================================
    // OPEN CREATE MODAL
    // =====================================================

    const openCreateModal = () => {
        setFormMode("create");
        setEditingDepartmentId(null);
        setForm(INITIAL_FORM);
        setFormError("");
        setFormSuccess("");
        setShowForm(true);
    };


    // =====================================================
    // OPEN EDIT MODAL
    // =====================================================

    const openEditModal = (department) => {
        const departmentId = getDepartmentId(department);

        if (!departmentId) {
            setError("Department ID is missing.");
            return;
        }

        setFormMode("edit");
        setEditingDepartmentId(departmentId);

        setForm({
            name: department?.name || "",
            description: department?.description || ""
        });

        setFormError("");
        setFormSuccess("");
        setShowForm(true);
    };


    // =====================================================
    // CLOSE FORM MODAL
    // =====================================================

    const closeFormModal = () => {
        if (formLoading) {
            return;
        }

        setShowForm(false);
        setFormMode("create");
        setEditingDepartmentId(null);
        setForm(INITIAL_FORM);
        setFormError("");
        setFormSuccess("");
    };


    // =====================================================
    // CREATE / UPDATE DEPARTMENT
    // =====================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormError("");
        setFormSuccess("");

        const name = form.name.trim();
        const description = form.description.trim();

        if (!name) {
            setFormError("Department name is required.");
            return;
        }

        if (formMode === "edit" && !editingDepartmentId) {
            setFormError("Department ID is missing.");
            return;
        }

        const payload = {
            name,
            description
        };

        try {
            setFormLoading(true);

            let response;

            if (formMode === "create") {
                response = await createDepartment(payload);
            } else {
                response = await updateDepartment(
                    editingDepartmentId,
                    payload
                );
            }

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    (
                        formMode === "create"
                            ? "Failed to create department."
                            : "Failed to update department."
                    )
                );
            }

            setFormSuccess(
                response?.message ||
                (
                    formMode === "create"
                        ? "Department created successfully."
                        : "Department updated successfully."
                )
            );

            await loadDepartments(true);

            window.setTimeout(() => {
                setShowForm(false);
                setForm(INITIAL_FORM);
                setFormMode("create");
                setEditingDepartmentId(null);
                setFormError("");
                setFormSuccess("");
            }, 700);

        } catch (err) {
            console.error(
                "Save Department Error:",
                err
            );

            setFormError(
                err?.message ||
                (
                    formMode === "create"
                        ? "Failed to create department."
                        : "Failed to update department."
                )
            );

        } finally {
            setFormLoading(false);
        }
    };


    // =====================================================
    // OPEN DEPARTMENT DETAILS
    // =====================================================

    const handleViewDepartment = async (department) => {
        const departmentId = getDepartmentId(department);

        if (!departmentId) {
            setDetailsError("Department ID is missing.");
            setSelectedDepartment(department);
            setShowDetails(true);
            return;
        }

        setShowDetails(true);
        setDetailsLoading(true);
        setDetailsError("");
        setSelectedDepartment(department);

        try {
            const response = await getDepartmentById(departmentId);

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to load department details."
                );
            }

            if (response?.data) {
                setSelectedDepartment(response.data);
            }

        } catch (err) {
            console.error(
                "Get Department Details Error:",
                err
            );

            setDetailsError(
                err?.message ||
                "Failed to load department details."
            );

        } finally {
            setDetailsLoading(false);
        }
    };


    // =====================================================
    // CLOSE DETAILS MODAL
    // =====================================================

    const closeDetailsModal = () => {
        setShowDetails(false);
        setSelectedDepartment(null);
        setDetailsError("");
        setDetailsLoading(false);
    };


    // =====================================================
    // OPEN STATUS CONFIRMATION
    // =====================================================

    const openStatusConfirm = (department) => {
        if (!getDepartmentId(department)) {
            setError("Department ID is missing.");
            return;
        }

        setStatusDepartment(department);
        setStatusError("");
        setShowStatusConfirm(true);
    };


    // =====================================================
    // CLOSE STATUS CONFIRMATION
    // =====================================================

    const closeStatusConfirm = () => {
        if (statusLoading) {
            return;
        }

        setShowStatusConfirm(false);
        setStatusDepartment(null);
        setStatusError("");
    };


    // =====================================================
    // UPDATE DEPARTMENT STATUS
    // =====================================================

    const handleStatusUpdate = async () => {
        const departmentId = getDepartmentId(statusDepartment);

        if (!departmentId) {
            setStatusError("Department ID is missing.");
            return;
        }

        const nextStatus = statusDepartment?.isActive === false;

        try {
            setStatusLoading(true);
            setStatusError("");

            const response = await updateDepartmentStatus(
                departmentId,
                nextStatus
            );

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to update department status."
                );
            }

            await loadDepartments(true);

            setShowStatusConfirm(false);
            setStatusDepartment(null);
            setStatusError("");

        } catch (err) {
            console.error(
                "Update Department Status Error:",
                err
            );

            setStatusError(
                err?.message ||
                "Failed to update department status."
            );

        } finally {
            setStatusLoading(false);
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

            if (showForm && !formLoading) {
                closeFormModal();
            }

            if (showDetails) {
                closeDetailsModal();
            }

            if (showStatusConfirm && !statusLoading) {
                closeStatusConfirm();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [
        showForm,
        formLoading,
        showDetails,
        showStatusConfirm,
        statusLoading
    ]);


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="admin-departments-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <DashboardSidebar />


            {/* =================================================
                MAIN LAYOUT
            ================================================= */}

            <div className="admin-departments-main">

                <DashboardHeader />


                <main className="admin-departments-content">

                    {/* BACKGROUND */}

                    <div className="admin-departments-bg-orb departments-orb-one" />

                    <div className="admin-departments-bg-orb departments-orb-two" />

                    <div className="admin-departments-bg-grid" />


                    <motion.div
                        className="admin-departments-inner"
                        variants={pageVariants}
                        initial="hidden"
                        animate="visible"
                    >

                        {/* =================================================
                            PAGE HEADER
                        ================================================= */}

                        <motion.section
                            className="admin-departments-header"
                            variants={itemVariants}
                        >

                            <div className="admin-departments-title-area">

                                <span className="admin-departments-eyebrow">
                                    <i className="bx bx-buildings" />
                                    ADMINISTRATION
                                </span>


                                <h1>
                                    Department Management
                                </h1>


                                <p>
                                    Manage hospital departments,
                                    monitor their status and keep
                                    department information up to date.
                                </p>

                            </div>


                            <motion.button
                                type="button"
                                className="admin-departments-add-button"
                                onClick={openCreateModal}
                                whileHover={{
                                    y: -3,
                                    scale: 1.02
                                }}
                                whileTap={{
                                    scale: 0.97
                                }}
                            >

                                <i className="bx bx-plus" />

                                <span>
                                    Add Department
                                </span>

                            </motion.button>

                        </motion.section>


                        {/* =================================================
                            STATISTICS
                        ================================================= */}

                        <section className="admin-department-stat-grid">

                            {/* TOTAL */}

                            <motion.article
                                className="admin-department-stat-card"
                                variants={itemVariants}
                                whileHover={{
                                    y: -5
                                }}
                            >

                                <div className="admin-department-stat-icon total">
                                    <i className="bx bx-buildings" />
                                </div>


                                <div className="admin-department-stat-info">

                                    <span>
                                        Total Departments
                                    </span>

                                    <strong>
                                        {totalDepartments}
                                    </strong>

                                    <small>
                                        All registered departments
                                    </small>

                                </div>

                            </motion.article>


                            {/* ACTIVE */}

                            <motion.article
                                className="admin-department-stat-card"
                                variants={itemVariants}
                                whileHover={{
                                    y: -5
                                }}
                            >

                                <div className="admin-department-stat-icon active">
                                    <i className="bx bx-check-circle" />
                                </div>


                                <div className="admin-department-stat-info">

                                    <span>
                                        Active Departments
                                    </span>

                                    <strong>
                                        {activeDepartments}
                                    </strong>

                                    <small>
                                        Currently active
                                    </small>

                                </div>

                            </motion.article>


                            {/* INACTIVE */}

                            <motion.article
                                className="admin-department-stat-card"
                                variants={itemVariants}
                                whileHover={{
                                    y: -5
                                }}
                            >

                                <div className="admin-department-stat-icon inactive">
                                    <i className="bx bx-pause-circle" />
                                </div>


                                <div className="admin-department-stat-info">

                                    <span>
                                        Inactive Departments
                                    </span>

                                    <strong>
                                        {inactiveDepartments}
                                    </strong>

                                    <small>
                                        Currently inactive
                                    </small>

                                </div>

                            </motion.article>


                            {/* SHOWING */}

                            <motion.article
                                className="admin-department-stat-card"
                                variants={itemVariants}
                                whileHover={{
                                    y: -5
                                }}
                            >

                                <div className="admin-department-stat-icon showing">
                                    <i className="bx bx-filter-alt" />
                                </div>


                                <div className="admin-department-stat-info">

                                    <span>
                                        Showing
                                    </span>

                                    <strong>
                                        {filteredCount}
                                    </strong>

                                    <small>
                                        Matching departments
                                    </small>

                                </div>

                            </motion.article>

                        </section>


                        {/* =================================================
                            DEPARTMENT TABLE CARD
                        ================================================= */}

                        <motion.section
                            className="admin-departments-card"
                            variants={itemVariants}
                        >

                            {/* CARD HEADING */}

                            <div className="admin-departments-card-heading">

                                <div>

                                    <span className="admin-departments-card-label">
                                        HOSPITAL DIRECTORY
                                    </span>

                                    <h2>
                                        All Departments
                                    </h2>

                                    <p>
                                        View, search and manage hospital departments.
                                    </p>

                                </div>


                                <div className="admin-departments-live-badge">
                                    <span />
                                    Live data
                                </div>

                            </div>


                            {/* =================================================
                                TOOLBAR
                            ================================================= */}

                            <div className="admin-departments-toolbar">

                                <div className="admin-department-search">

                                    <i className="bx bx-search" />


                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search departments..."
                                        aria-label="Search departments"
                                    />


                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch("")}
                                            aria-label="Clear search"
                                        >
                                            <i className="bx bx-x" />
                                        </button>
                                    )}

                                </div>


                                <div className="admin-department-toolbar-actions">

                                    {/* STATUS FILTER */}

                                    <div className="admin-department-filter">

                                        <i className="bx bx-filter-alt" />


                                        <select
                                            value={statusFilter}
                                            onChange={(event) =>
                                                setStatusFilter(
                                                    event.target.value
                                                )
                                            }
                                            aria-label="Filter by status"
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


                                    {/* REFRESH */}

                                    <motion.button
                                        type="button"
                                        className="admin-department-refresh"
                                        onClick={() => loadDepartments(true)}
                                        disabled={refreshing}
                                        whileTap={{
                                            scale: 0.95
                                        }}
                                    >

                                        <i
                                            className={`bx bx-refresh ${
                                                refreshing ? "is-spinning" : ""
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
                                    className="admin-departments-error"
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
                                        <span>{error}</span>
                                    </div>


                                    <button
                                        type="button"
                                        onClick={() => loadDepartments()}
                                    >
                                        Retry
                                    </button>

                                </motion.div>
                            )}


                            {/* =================================================
                                TABLE
                            ================================================= */}

                            <div className="admin-departments-table-wrapper">

                                {loading ? (

                                    <div className="admin-department-loading">

                                        {[1, 2, 3, 4, 5].map((item) => (
                                            <div
                                                className="admin-department-skeleton"
                                                key={item}
                                            >
                                                <span />
                                                <span />
                                                <span />
                                                <span />
                                                <span />
                                            </div>
                                        ))}

                                    </div>

                                ) : filteredDepartments.length === 0 ? (

                                    <div className="admin-department-empty">

                                        <div className="admin-department-empty-icon">
                                            <i className="bx bx-buildings" />
                                        </div>


                                        <h3>
                                            No departments found
                                        </h3>


                                        <p>
                                            {departments.length === 0
                                                ? "No departments have been added yet."
                                                : "Try changing your search or filter options."}
                                        </p>


                                        {(
                                            search ||
                                            statusFilter !== "all"
                                        ) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearch("");
                                                    setStatusFilter("all");
                                                }}
                                            >
                                                Clear Filters
                                            </button>
                                        )}


                                        {departments.length === 0 && (
                                            <button
                                                type="button"
                                                onClick={openCreateModal}
                                            >
                                                <i className="bx bx-plus" />
                                                Add First Department
                                            </button>
                                        )}

                                    </div>

                                ) : (

                                    <table className="admin-departments-table">

                                        <thead>
                                            <tr>
                                                <th>
                                                    Department
                                                </th>

                                                <th>
                                                    Description
                                                </th>

                                                <th>
                                                    Created
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>


                                        <tbody>

                                            <AnimatePresence>

                                                {filteredDepartments.map(
                                                    (department, index) => {
                                                        const departmentId =
                                                            getDepartmentId(department);

                                                        const isActive =
                                                            department?.isActive !== false;

                                                        return (
                                                            <motion.tr
                                                                key={
                                                                    departmentId ||
                                                                    `${department?.name}-${index}`
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
                                                                    duration: 0.25,
                                                                    delay: Math.min(
                                                                        index * 0.025,
                                                                        0.2
                                                                    )
                                                                }}
                                                            >

                                                                {/* DEPARTMENT */}

                                                                <td>
                                                                    <div className="admin-department-person">

                                                                        <div className="admin-department-avatar">
                                                                            {getDepartmentInitial(
                                                                                department?.name
                                                                            )}
                                                                        </div>


                                                                        <div className="admin-department-person-info">

                                                                            <strong>
                                                                                {department?.name ||
                                                                                    "Unnamed Department"}
                                                                            </strong>

                                                                            <span>
                                                                                ID:{" "}
                                                                                {departmentId
                                                                                    ? departmentId.slice(-8)
                                                                                    : "Unavailable"}
                                                                            </span>

                                                                        </div>

                                                                    </div>
                                                                </td>


                                                                {/* DESCRIPTION */}

                                                                <td>
                                                                    <div className="admin-department-description">

                                                                        {department?.description?.trim()
                                                                            ? department.description
                                                                            : (
                                                                                <span className="admin-department-not-provided">
                                                                                    No description provided
                                                                                </span>
                                                                            )}

                                                                    </div>
                                                                </td>


                                                                {/* CREATED */}

                                                                <td>
                                                                    <div className="admin-department-date">
                                                                        <i className="bx bx-calendar" />

                                                                        <span>
                                                                            {formatDate(
                                                                                department?.createdAt
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </td>


                                                                {/* STATUS */}

                                                                <td>
                                                                    <span
                                                                        className={`admin-department-status ${
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


                                                                {/* ACTIONS */}

                                                                <td>
                                                                    <div className="admin-department-actions">

                                                                        <motion.button
                                                                            type="button"
                                                                            className="admin-department-action-btn view"
                                                                            onClick={() =>
                                                                                handleViewDepartment(
                                                                                    department
                                                                                )
                                                                            }
                                                                            title="View department"
                                                                            aria-label="View department"
                                                                            whileHover={{
                                                                                scale: 1.06
                                                                            }}
                                                                            whileTap={{
                                                                                scale: 0.94
                                                                            }}
                                                                        >
                                                                            <i className="bx bx-show" />
                                                                        </motion.button>


                                                                        <motion.button
                                                                            type="button"
                                                                            className="admin-department-action-btn edit"
                                                                            onClick={() =>
                                                                                openEditModal(
                                                                                    department
                                                                                )
                                                                            }
                                                                            title="Edit department"
                                                                            aria-label="Edit department"
                                                                            whileHover={{
                                                                                scale: 1.06
                                                                            }}
                                                                            whileTap={{
                                                                                scale: 0.94
                                                                            }}
                                                                        >
                                                                            <i className="bx bx-edit-alt" />
                                                                        </motion.button>


                                                                        <motion.button
                                                                            type="button"
                                                                            className={`admin-department-action-btn ${
                                                                                isActive
                                                                                    ? "deactivate"
                                                                                    : "activate"
                                                                            }`}
                                                                            onClick={() =>
                                                                                openStatusConfirm(
                                                                                    department
                                                                                )
                                                                            }
                                                                            title={
                                                                                isActive
                                                                                    ? "Deactivate department"
                                                                                    : "Activate department"
                                                                            }
                                                                            aria-label={
                                                                                isActive
                                                                                    ? "Deactivate department"
                                                                                    : "Activate department"
                                                                            }
                                                                            whileHover={{
                                                                                scale: 1.06
                                                                            }}
                                                                            whileTap={{
                                                                                scale: 0.94
                                                                            }}
                                                                        >
                                                                            <i
                                                                                className={`bx ${
                                                                                    isActive
                                                                                        ? "bx-pause"
                                                                                        : "bx-play"
                                                                                }`}
                                                                            />
                                                                        </motion.button>

                                                                    </div>
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
                                filteredDepartments.length > 0 && (
                                    <div className="admin-departments-footer">

                                        <span>
                                            Showing{" "}
                                            <strong>
                                                {filteredCount}
                                            </strong>{" "}
                                            of{" "}
                                            <strong>
                                                {totalDepartments}
                                            </strong>{" "}
                                            departments
                                        </span>


                                        <span>
                                            <i className="bx bx-shield-check" />
                                            Connected to hospital database
                                        </span>

                                    </div>
                                )}

                        </motion.section>

                    </motion.div>

                </main>

            </div>


            {/* =========================================================
                VIEW DEPARTMENT MODAL
            ========================================================= */}

            <AnimatePresence>

                {showDetails && (
                    <motion.div
                        className="admin-department-modal-overlay"
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
                                closeDetailsModal();
                            }
                        }}
                    >

                        <motion.div
                            className="admin-department-details-modal"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >

                            {/* MODAL HEADER */}

                            <div className="admin-department-modal-header">

                                <div>
                                    <span>
                                        DEPARTMENT PROFILE
                                    </span>

                                    <h2>
                                        Department Details
                                    </h2>
                                </div>


                                <button
                                    type="button"
                                    onClick={closeDetailsModal}
                                    aria-label="Close"
                                >
                                    <i className="bx bx-x" />
                                </button>

                            </div>


                            {/* LOADING */}

                            {detailsLoading ? (

                                <div className="admin-department-details-loading">

                                    <div className="admin-department-spinner">
                                        <i className="bx bx-loader-alt" />
                                    </div>

                                    <strong>
                                        Loading department details...
                                    </strong>

                                    <span>
                                        Fetching the latest information from the server.
                                    </span>

                                </div>

                            ) : detailsError ? (

                                <div className="admin-department-details-error">

                                    <i className="bx bx-error-circle" />

                                    <strong>
                                        Unable to load department
                                    </strong>

                                    <span>
                                        {detailsError}
                                    </span>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleViewDepartment(
                                                selectedDepartment
                                            )
                                        }
                                    >
                                        Try Again
                                    </button>

                                </div>

                            ) : selectedDepartment ? (

                                <div className="admin-department-details-body">

                                    {/* PROFILE HERO */}

                                    <div className="admin-department-profile-hero">

                                        <div className="admin-department-profile-avatar">
                                            {getDepartmentInitial(
                                                selectedDepartment?.name
                                            )}
                                        </div>


                                        <div className="admin-department-profile-info">

                                            <h3>
                                                {selectedDepartment?.name ||
                                                    "Unnamed Department"}
                                            </h3>


                                            <span>
                                                Hospital Department
                                            </span>


                                            <div
                                                className={`admin-department-profile-status ${
                                                    selectedDepartment?.isActive === false
                                                        ? "inactive"
                                                        : "active"
                                                }`}
                                            >
                                                <span />

                                                {selectedDepartment?.isActive === false
                                                    ? "Inactive Department"
                                                    : "Active Department"}
                                            </div>

                                        </div>

                                    </div>


                                    {/* INFORMATION */}

                                    <div className="admin-department-details-section">

                                        <div className="admin-department-details-section-title">
                                            <i className="bx bx-info-circle" />

                                            <span>
                                                Department Information
                                            </span>
                                        </div>


                                        <div className="admin-department-details-grid">

                                            <div className="admin-department-detail-item">
                                                <span>
                                                    Department Name
                                                </span>

                                                <strong>
                                                    {selectedDepartment?.name ||
                                                        "Not provided"}
                                                </strong>
                                            </div>


                                            <div className="admin-department-detail-item">
                                                <span>
                                                    Status
                                                </span>

                                                <strong>
                                                    {selectedDepartment?.isActive === false
                                                        ? "Inactive"
                                                        : "Active"}
                                                </strong>
                                            </div>


                                            <div className="admin-department-detail-item">
                                                <span>
                                                    Created At
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        selectedDepartment?.createdAt
                                                    )}
                                                </strong>
                                            </div>


                                            <div className="admin-department-detail-item">
                                                <span>
                                                    Last Updated
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        selectedDepartment?.updatedAt
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                    </div>


                                    {/* DESCRIPTION */}

                                    <div className="admin-department-details-section">

                                        <div className="admin-department-details-section-title">
                                            <i className="bx bx-detail" />

                                            <span>
                                                Description
                                            </span>
                                        </div>


                                        <div className="admin-department-description-box">
                                            {selectedDepartment?.description?.trim()
                                                ? selectedDepartment.description
                                                : "No description provided."}
                                        </div>

                                    </div>

                                </div>

                            ) : (

                                <div className="admin-department-details-error">
                                    <i className="bx bx-buildings" />

                                    <strong>
                                        Department not found
                                    </strong>

                                    <span>
                                        No department information is available.
                                    </span>
                                </div>

                            )}


                            {/* FOOTER */}

                            <div className="admin-department-modal-footer">

                                <button
                                    type="button"
                                    onClick={closeDetailsModal}
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
                CREATE / EDIT MODAL
            ========================================================= */}

            <AnimatePresence>

                {showForm && (
                    <motion.div
                        className="admin-department-modal-overlay"
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
                                closeFormModal();
                            }
                        }}
                    >

                        <motion.div
                            className="admin-department-form-modal"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >

                            {/* FORM HEADER */}

                            <div className="admin-department-modal-header">

                                <div>
                                    <span>
                                        DEPARTMENT MANAGEMENT
                                    </span>

                                    <h2>
                                        {formMode === "create"
                                            ? "Add New Department"
                                            : "Edit Department"}
                                    </h2>
                                </div>


                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    disabled={formLoading}
                                    aria-label="Close"
                                >
                                    <i className="bx bx-x" />
                                </button>

                            </div>


                            {/* FORM */}

                            <form onSubmit={handleSubmit}>

                                <div className="admin-department-form-body">

                                    <div className="admin-department-form-info">
                                        <i className="bx bx-info-circle" />

                                        <span>
                                            Enter the department name and
                                            description. The department name
                                            must be unique.
                                        </span>
                                    </div>


                                    {/* NAME */}

                                    <div className="admin-department-form-group">

                                        <label htmlFor="department-name">
                                            Department Name
                                            <span>*</span>
                                        </label>


                                        <div className="admin-department-input-wrap">
                                            <i className="bx bx-buildings" />

                                            <input
                                                id="department-name"
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={handleFormChange}
                                                placeholder="e.g. Cardiology"
                                                maxLength={100}
                                                required
                                                autoComplete="off"
                                                disabled={formLoading}
                                            />
                                        </div>

                                    </div>


                                    {/* DESCRIPTION */}

                                    <div className="admin-department-form-group">

                                        <label htmlFor="department-description">
                                            Description
                                            <span className="optional">
                                                Optional
                                            </span>
                                        </label>


                                        <div className="admin-department-textarea-wrap">
                                            <i className="bx bx-detail" />

                                            <textarea
                                                id="department-description"
                                                name="description"
                                                value={form.description}
                                                onChange={handleFormChange}
                                                placeholder="Describe the department..."
                                                rows={5}
                                                maxLength={1000}
                                                disabled={formLoading}
                                            />
                                        </div>


                                        <div className="admin-department-character-count">
                                            {form.description.length}/1000 characters
                                        </div>

                                    </div>


                                    {/* ERROR */}

                                    {formError && (
                                        <motion.div
                                            className="admin-department-form-error"
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
                                                {formError}
                                            </span>
                                        </motion.div>
                                    )}


                                    {/* SUCCESS */}

                                    {formSuccess && (
                                        <motion.div
                                            className="admin-department-form-success"
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
                                                {formSuccess}
                                            </span>
                                        </motion.div>
                                    )}

                                </div>


                                {/* FORM FOOTER */}

                                <div className="admin-department-form-footer">

                                    <button
                                        type="button"
                                        onClick={closeFormModal}
                                        disabled={formLoading}
                                    >
                                        Cancel
                                    </button>


                                    <motion.button
                                        type="submit"
                                        className="admin-department-save-button"
                                        disabled={formLoading}
                                        whileHover={{
                                            y: -2
                                        }}
                                        whileTap={{
                                            scale: 0.97
                                        }}
                                    >

                                        {formLoading ? (
                                            <>
                                                <i className="bx bx-loader-alt is-spinning" />

                                                {formMode === "create"
                                                    ? "Creating..."
                                                    : "Saving..."}
                                            </>
                                        ) : (
                                            <>
                                                <i
                                                    className={`bx ${
                                                        formMode === "create"
                                                            ? "bx-plus"
                                                            : "bx-check"
                                                    }`}
                                                />

                                                {formMode === "create"
                                                    ? "Create Department"
                                                    : "Save Changes"}
                                            </>
                                        )}

                                    </motion.button>

                                </div>

                            </form>

                        </motion.div>

                    </motion.div>
                )}

            </AnimatePresence>


            {/* =========================================================
                ACTIVATE / DEACTIVATE CONFIRMATION
            ========================================================= */}

            <AnimatePresence>

                {showStatusConfirm && statusDepartment && (
                    <motion.div
                        className="admin-department-modal-overlay"
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
                                closeStatusConfirm();
                            }
                        }}
                    >

                        <motion.div
                            className="admin-department-status-modal"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >

                            <div
                                className={`admin-department-status-modal-icon ${
                                    statusDepartment?.isActive === false
                                        ? "activate"
                                        : "deactivate"
                                }`}
                            >
                                <i
                                    className={`bx ${
                                        statusDepartment?.isActive === false
                                            ? "bx-check-circle"
                                            : "bx-pause-circle"
                                    }`}
                                />
                            </div>


                            <h2>
                                {statusDepartment?.isActive === false
                                    ? "Activate Department?"
                                    : "Deactivate Department?"}
                            </h2>


                            <p>
                                Are you sure you want to{" "}
                                {statusDepartment?.isActive === false
                                    ? "activate"
                                    : "deactivate"}{" "}
                                <strong>
                                    {statusDepartment?.name}
                                </strong>
                                ?
                            </p>


                            <div className="admin-department-status-note">
                                <i className="bx bx-info-circle" />

                                <span>
                                    {statusDepartment?.isActive === false
                                        ? "This department will be marked as active."
                                        : "This department will be marked as inactive."}
                                </span>
                            </div>


                            {statusError && (
                                <div className="admin-department-form-error">
                                    <i className="bx bx-error-circle" />
                                    <span>{statusError}</span>
                                </div>
                            )}


                            <div className="admin-department-status-actions">

                                <button
                                    type="button"
                                    onClick={closeStatusConfirm}
                                    disabled={statusLoading}
                                >
                                    Cancel
                                </button>


                                <motion.button
                                    type="button"
                                    className={
                                        statusDepartment?.isActive === false
                                            ? "activate"
                                            : "deactivate"
                                    }
                                    onClick={handleStatusUpdate}
                                    disabled={statusLoading}
                                    whileHover={{
                                        y: -2
                                    }}
                                    whileTap={{
                                        scale: 0.97
                                    }}
                                >

                                    {statusLoading ? (
                                        <>
                                            <i className="bx bx-loader-alt is-spinning" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i
                                                className={`bx ${
                                                    statusDepartment?.isActive === false
                                                        ? "bx-check"
                                                        : "bx-pause"
                                                }`}
                                            />

                                            {statusDepartment?.isActive === false
                                                ? "Activate"
                                                : "Deactivate"}
                                        </>
                                    )}

                                </motion.button>

                            </div>

                        </motion.div>

                    </motion.div>
                )}

            </AnimatePresence>

        </div>
    );
};


export default AdminDepartments;