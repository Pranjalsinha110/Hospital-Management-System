import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";

import { getAdminDashboard } from "../../services/adminService";

import "./AdminDashboard.css";


/*
 * =========================================================
 * EMPTY DASHBOARD DATA
 * =========================================================
 */

const EMPTY_DASHBOARD_DATA = {
  statistics: {
    totalPatients: 0,
    totalDoctors: 0,
    totalDepartments: 0,
    activeDepartments: 0,
  },

  analytics: {
    patients: [],
    doctors: [],
    departments: [],
  },

  recentPatients: [],

  departments: [],
};


/*
 * =========================================================
 * ANIMATIONS
 * =========================================================
 */

const containerVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};


const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};


/*
 * =========================================================
 * STAT CARD
 * =========================================================
 */

const AdminStatCard = ({
  title,
  value,
  icon,
  description,
  className = "",
}) => {
  return (
    <motion.article
      className={`admin-stat-card ${className}`}
      variants={itemVariants}
      whileHover={{
        y: -6,
        transition: {
          duration: 0.2,
        },
      }}
    >

      <div className="admin-stat-card-glow" />


      <div className="admin-stat-card-top">

        <div className="admin-stat-icon">

          <i className={`bx ${icon}`} />

        </div>

      </div>


      <div className="admin-stat-content">

        <span className="admin-stat-title">
          {title}
        </span>


        <strong className="admin-stat-value">
          {value}
        </strong>


        <span className="admin-stat-description">
          {description}
        </span>

      </div>


      <div className="admin-stat-card-shine" />

    </motion.article>
  );
};


/*
 * =========================================================
 * EMPTY STATE
 * =========================================================
 */

const EmptyState = ({
  icon = "bx-inbox",
  title = "No data available",
  description =
    "There is nothing to display right now.",
}) => {
  return (
    <div className="admin-empty-state">

      <div className="admin-empty-icon">

        <i className={`bx ${icon}`} />

      </div>


      <strong>
        {title}
      </strong>


      <span>
        {description}
      </span>

    </div>
  );
};


/*
 * =========================================================
 * MAIN ADMIN DASHBOARD
 * =========================================================
 */

const AdminDashboard = () => {

  /*
   * -------------------------------------------------------
   * STATE
   * -------------------------------------------------------
   */

  const [
    dashboardData,
    setDashboardData,
  ] = useState(
    EMPTY_DASHBOARD_DATA
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /*
   * =======================================================
   * LOAD DASHBOARD
   * =======================================================
   */

  const loadDashboard = async () => {

    try {

      setLoading(true);

      setError("");


      const data =
        await getAdminDashboard();


      setDashboardData(
        data || EMPTY_DASHBOARD_DATA
      );

    } catch (err) {

      console.error(
        "Admin Dashboard Error:",
        err
      );


      setError(
        err?.message ||
          "Unable to load dashboard data."
      );

    } finally {

      setLoading(false);

    }
  };


  /*
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */

  useEffect(() => {

    let mounted = true;


    const load = async () => {

      try {

        setLoading(true);

        setError("");


        const data =
          await getAdminDashboard();


        if (!mounted) {
          return;
        }


        setDashboardData(
          data ||
            EMPTY_DASHBOARD_DATA
        );

      } catch (err) {

        if (!mounted) {
          return;
        }


        console.error(
          "Admin Dashboard Error:",
          err
        );


        setError(
          err?.message ||
            "Unable to load dashboard data."
        );

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    };


    load();


    return () => {
      mounted = false;
    };

  }, []);


  /*
   * =======================================================
   * STATISTICS
   * =======================================================
   */

  const statistics = useMemo(() => {

    return (
      dashboardData?.statistics ||
      EMPTY_DASHBOARD_DATA.statistics
    );

  }, [dashboardData]);


  /*
   * =======================================================
   * DEPARTMENTS
   * =======================================================
   */

  const departments = useMemo(() => {

    return (
      dashboardData?.departments ||
      []
    );

  }, [dashboardData]);


  /*
   * =======================================================
   * RECENT PATIENTS
   * =======================================================
   */

  const recentPatients = useMemo(() => {

    return (
      dashboardData?.recentPatients ||
      []
    );

  }, [dashboardData]);


  /*
   * =======================================================
   * DOCTORS
   * =======================================================
   */

  const doctors = useMemo(() => {

    return (
      dashboardData?.analytics?.doctors ||
      []
    );

  }, [dashboardData]);


  /*
   * =======================================================
   * NUMBER FORMATTER
   * =======================================================
   */

  const formatNumber = (value) => {

    const number =
      Number(value);


    if (!Number.isFinite(number)) {
      return "0";
    }


    return new Intl.NumberFormat(
      "en-IN"
    ).format(number);
  };


  /*
   * =======================================================
   * CURRENT DATE
   * =======================================================
   */

  const currentDate = useMemo(() => {

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }
    ).format(new Date());

  }, []);


  /*
   * =======================================================
   * ACTIVE DEPARTMENT COUNT
   * =======================================================
   */

  const activeDepartmentCount =
    useMemo(() => {

      return departments.filter(
        (department) =>
          department?.isActive !== false
      ).length;

    }, [departments]);


  /*
   * =======================================================
   * DEPARTMENT STATUS
   * =======================================================
   */

  const departmentStatus = (
    department
  ) => {

    return department?.isActive !== false
      ? "Active"
      : "Inactive";
  };


  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="admin-dashboard-page">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <DashboardSidebar />


      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="admin-dashboard-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <DashboardHeader />


        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="admin-dashboard-content">

          {/* BACKGROUND */}

          <div className="admin-dashboard-bg-orb admin-orb-one" />

          <div className="admin-dashboard-bg-orb admin-orb-two" />

          <div className="admin-dashboard-bg-grid" />


          <motion.div
            className="admin-dashboard-inner"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >

            {/* =================================================
                INTRO
            ================================================= */}

            <motion.section
              className="admin-dashboard-intro"
              variants={itemVariants}
            >

              <div>

                <span className="admin-dashboard-eyebrow">

                  <i className="bx bx-pulse" />

                  ADMINISTRATION

                </span>


                <h2>
                  Hospital Overview
                </h2>


                <p>
                  Monitor patients, doctors,
                  departments and hospital
                  resources from one place.
                </p>

              </div>


              <div className="admin-dashboard-date">

                <span>

                  <i className="bx bx-calendar" />

                  Today

                </span>


                <strong>
                  {currentDate}
                </strong>

              </div>

            </motion.section>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <motion.div
                className="admin-dashboard-error"
                variants={itemVariants}
              >

                <div>

                  <i className="bx bx-error-circle" />


                  <div>

                    <strong>
                      Unable to load dashboard
                    </strong>


                    <span>
                      {error}
                    </span>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={loadDashboard}
                  disabled={loading}
                >

                  {loading
                    ? "Retrying..."
                    : "Retry"}

                </button>

              </motion.div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="admin-stat-grid">


              {/* TOTAL PATIENTS */}

              <AdminStatCard
                title="Total Patients"
                value={
                  loading
                    ? "—"
                    : formatNumber(
                        statistics.totalPatients
                      )
                }
                icon="bx-group"
                description="Active registered patients"
                className="stat-patients"
              />


              {/* TOTAL DOCTORS */}

              <AdminStatCard
                title="Total Doctors"
                value={
                  loading
                    ? "—"
                    : formatNumber(
                        statistics.totalDoctors
                      )
                }
                icon="bx-user-plus"
                description="Active medical staff"
                className="stat-doctors"
              />


              {/* TOTAL DEPARTMENTS */}

              <AdminStatCard
                title="Total Departments"
                value={
                  loading
                    ? "—"
                    : formatNumber(
                        statistics.totalDepartments ??
                        departments.length
                      )
                }
                icon="bx-buildings"
                description="Hospital departments"
                className="stat-appointments"
              />


              {/* ACTIVE DEPARTMENTS */}

              <AdminStatCard
                title="Active Departments"
                value={
                  loading
                    ? "—"
                    : formatNumber(
                        statistics.activeDepartments ??
                        activeDepartmentCount
                      )
                }
                icon="bx-check-shield"
                description="Currently operational"
                className="stat-revenue"
              />

            </section>


            {/* =================================================
                MAIN DASHBOARD GRID
            ================================================= */}

            <section className="admin-dashboard-grid">


              {/* =================================================
                  HOSPITAL SNAPSHOT
              ================================================= */}

              <motion.article
                className="admin-dashboard-card admin-analytics-card"
                variants={itemVariants}
              >

                <div className="admin-card-header">

                  <div>

                    <span className="admin-card-eyebrow">
                      OVERVIEW
                    </span>


                    <h3>
                      Hospital Snapshot
                    </h3>

                  </div>


                  <div className="admin-card-header-icon">

                    <i className="bx bx-clinic" />

                  </div>

                </div>


                <div className="admin-hospital-snapshot">


                  {/* PATIENTS */}

                  <div className="admin-snapshot-item">

                    <div className="admin-snapshot-icon patients">

                      <i className="bx bx-group" />

                    </div>


                    <div className="admin-snapshot-info">

                      <span>
                        Registered Patients
                      </span>

                      <strong>
                        {loading
                          ? "—"
                          : formatNumber(
                              statistics.totalPatients
                            )}
                      </strong>

                    </div>

                  </div>


                  {/* DOCTORS */}

                  <div className="admin-snapshot-item">

                    <div className="admin-snapshot-icon doctors">

                      <i className="bx bx-user-plus" />

                    </div>


                    <div className="admin-snapshot-info">

                      <span>
                        Medical Staff
                      </span>

                      <strong>
                        {loading
                          ? "—"
                          : formatNumber(
                              statistics.totalDoctors
                            )}
                      </strong>

                    </div>

                  </div>


                  {/* DEPARTMENTS */}

                  <div className="admin-snapshot-item">

                    <div className="admin-snapshot-icon departments">

                      <i className="bx bx-buildings" />

                    </div>


                    <div className="admin-snapshot-info">

                      <span>
                        Departments
                      </span>

                      <strong>
                        {loading
                          ? "—"
                          : formatNumber(
                              statistics.totalDepartments ??
                              departments.length
                            )}
                      </strong>

                    </div>

                  </div>


                  {/* ACTIVE DEPARTMENTS */}

                  <div className="admin-snapshot-item">

                    <div className="admin-snapshot-icon active">

                      <i className="bx bx-check-circle" />

                    </div>


                    <div className="admin-snapshot-info">

                      <span>
                        Active Departments
                      </span>

                      <strong>
                        {loading
                          ? "—"
                          : formatNumber(
                              statistics.activeDepartments ??
                              activeDepartmentCount
                            )}
                      </strong>

                    </div>

                  </div>


                </div>


                <div className="admin-snapshot-footer">

                  <i className="bx bx-shield-check" />

                  <span>
                    Data is loaded directly from
                    the hospital database.
                  </span>

                </div>

              </motion.article>


              {/* =================================================
                  DEPARTMENT OVERVIEW
              ================================================= */}

              <motion.article
                className="admin-dashboard-card admin-department-card"
                variants={itemVariants}
              >

                <div className="admin-card-header">

                  <div>

                    <span className="admin-card-eyebrow">
                      HOSPITAL
                    </span>


                    <h3>
                      Department Overview
                    </h3>

                  </div>


                  <div className="admin-card-header-icon">

                    <i className="bx bx-buildings" />

                  </div>

                </div>


                <div className="admin-department-list">

                  {loading ? (

                    <EmptyState
                      icon="bx-loader-alt"
                      title="Loading departments"
                      description="Fetching department data from the server."
                    />

                  ) : departments.length > 0 ? (

                    departments
                      .slice(0, 6)
                      .map(
                        (
                          department,
                          index
                        ) => (

                          <motion.div
                            className="admin-department-item"
                            key={
                              department.id ||
                              department._id ||
                              index
                            }
                            initial={{
                              opacity: 0,
                              x: 15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay:
                                0.15 +
                                index * 0.06,
                            }}
                          >

                            <div className="admin-department-icon">

                              <i className="bx bx-plus-medical" />

                            </div>


                            <div className="admin-department-info">

                              <strong>
                                {department.name ||
                                  "Department"}
                              </strong>


                              <span>
                                {departmentStatus(
                                  department
                                )}
                              </span>

                            </div>


                            <span
                              className={`admin-department-status ${
                                department?.isActive !== false
                                  ? "active"
                                  : "inactive"
                              }`}
                            >

                              {department?.isActive !== false
                                ? "Active"
                                : "Inactive"}

                            </span>

                          </motion.div>

                        )
                      )

                  ) : (

                    <EmptyState
                      icon="bx-buildings"
                      title="No departments yet"
                      description="No departments were returned by the server."
                    />

                  )}

                </div>

              </motion.article>

            </section>


            {/* =================================================
                LOWER GRID
            ================================================= */}

            <section className="admin-dashboard-grid admin-lower-grid">


              {/* =================================================
                  MEDICAL STAFF
              ================================================= */}

              <motion.article
                className="admin-dashboard-card admin-appointments-card"
                variants={itemVariants}
              >

                <div className="admin-card-header">

                  <div>

                    <span className="admin-card-eyebrow">
                      MEDICAL TEAM
                    </span>


                    <h3>
                      Doctor Overview
                    </h3>

                  </div>


                  <div className="admin-card-header-icon">

                    <i className="bx bx-group" />

                  </div>

                </div>


                <div className="admin-doctor-overview">

                  {loading ? (

                    <EmptyState
                      icon="bx-loader-alt"
                      title="Loading doctors"
                      description="Fetching medical staff from the server."
                    />

                  ) : doctors.length > 0 ? (

                    doctors.map(
                      (
                        doctor,
                        index
                      ) => (

                        <motion.div
                          className="admin-doctor-item"
                          key={
                            doctor.id ||
                            doctor._id ||
                            index
                          }
                          initial={{
                            opacity: 0,
                            x: 15,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay:
                              0.15 +
                              index * 0.06,
                          }}
                        >

                          <div className="admin-doctor-avatar">

                            {(
                              doctor?.user?.name ||
                              doctor?.name ||
                              "D"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>


                          <div className="admin-doctor-info">

                            <strong>
                              {doctor?.user?.name ||
                                doctor?.name ||
                                "Doctor"}
                            </strong>


                            <span>
                              {doctor?.specialization ||
                                doctor?.department?.name ||
                                "Medical Staff"}
                            </span>

                          </div>


                          <span
                            className={`admin-doctor-status ${
                              doctor?.user?.isActive === false
                                ? "inactive"
                                : "active"
                            }`}
                          >

                            {doctor?.user?.isActive === false
                              ? "Inactive"
                              : "Active"}

                          </span>

                        </motion.div>

                      )
                    )

                  ) : (

                    <EmptyState
                      icon="bx-user-md"
                      title="Doctor information"
                      description="Doctor records are available from the admin API."
                    />

                  )}

                </div>

              </motion.article>


              {/* =================================================
                  RECENT PATIENTS
              ================================================= */}

              <motion.article
                className="admin-dashboard-card admin-patients-card"
                variants={itemVariants}
              >

                <div className="admin-card-header">

                  <div>

                    <span className="admin-card-eyebrow">
                      PATIENTS
                    </span>


                    <h3>
                      Recent Patients
                    </h3>

                  </div>


                  <div className="admin-card-header-icon">

                    <i className="bx bx-user" />

                  </div>

                </div>


                <div className="admin-recent-patients">

                  {loading ? (

                    <EmptyState
                      icon="bx-loader-alt"
                      title="Loading patients"
                      description="Fetching patient data from the server."
                    />

                  ) : recentPatients.length > 0 ? (

                    recentPatients
                      .slice(0, 5)
                      .map(
                        (
                          patient,
                          index
                        ) => (

                          <motion.div
                            className="admin-recent-patient"
                            key={
                              patient.id ||
                              patient._id ||
                              index
                            }
                            initial={{
                              opacity: 0,
                              x: 15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay:
                                0.15 +
                                index * 0.06,
                            }}
                          >

                            <div className="admin-mini-avatar">

                              {(
                                patient.name ||
                                "P"
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>


                            <div className="admin-recent-patient-info">

                              <strong>
                                {patient.name ||
                                  "Patient"}
                              </strong>


                              <span>
                                {patient.email ||
                                  patient.phone ||
                                  "Registered patient"}
                              </span>

                            </div>


                            <div className="admin-patient-active-dot" />

                          </motion.div>

                        )
                      )

                  ) : (

                    <EmptyState
                      icon="bx-user"
                      title="No patients yet"
                      description="No patient records were returned by the server."
                    />

                  )}

                </div>

              </motion.article>

            </section>


            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <motion.section
              className="admin-quick-actions-section"
              variants={itemVariants}
            >

              <div className="admin-section-heading">

                <div>

                  <span>
                    PRODUCTIVITY
                  </span>


                  <h3>
                    Quick Actions
                  </h3>

                </div>

              </div>


              <div className="admin-quick-actions">


                {/* ADD PATIENT */}

                <motion.div
                  whileHover={{
                    y: -5,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                >

                  <Link
                    to="/admin/patients"
                    className="admin-quick-action"
                  >

                    <span className="admin-quick-action-icon">

                      <i className="bx bx-user-plus" />

                    </span>


                    <span>

                      <strong>
                        View Patient
                      </strong>

                      <small>
                        View patient information
                      </small>

                    </span>


                    <i className="bx bx-right-arrow-alt" />

                  </Link>

                </motion.div>


                {/* ADD DOCTOR */}

                <motion.div
                  whileHover={{
                    y: -5,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                >

                  <Link
                    to="/admin/doctors"
                    className="admin-quick-action"
                  >

                    <span className="admin-quick-action-icon">

                      <i className="bx bx-user-plus" />

                    </span>


                    <span>

                      <strong>
                        Add Doctor
                      </strong>

                      <small>
                        Register medical staff
                      </small>

                    </span>


                    <i className="bx bx-right-arrow-alt" />

                  </Link>

                </motion.div>


                {/* ADD DEPARTMENT */}

                <motion.div
                  whileHover={{
                    y: -5,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                >

                  <Link
                    to="/admin/departments"
                    className="admin-quick-action"
                  >

                    <span className="admin-quick-action-icon">

                      <i className="bx bx-buildings" />

                    </span>


                    <span>

                      <strong>
                        Add Department
                      </strong>

                      <small>
                        Manage hospital departments
                      </small>

                    </span>


                    <i className="bx bx-right-arrow-alt" />

                  </Link>

                </motion.div>


                {/* REFRESH */}

                <motion.button
                  type="button"
                  className="admin-quick-action"
                  onClick={loadDashboard}
                  disabled={loading}
                  whileHover={{
                    y: -5,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                >

                  <span className="admin-quick-action-icon">

                    <i className="bx bx-refresh" />

                  </span>


                  <span>

                    <strong>
                      Refresh Dashboard
                    </strong>

                    <small>
                      Fetch latest hospital data
                    </small>

                  </span>


                  <i className="bx bx-right-arrow-alt" />

                </motion.button>


              </div>

            </motion.section>

          </motion.div>

        </main>

      </div>

    </div>
  );
};


export default AdminDashboard;