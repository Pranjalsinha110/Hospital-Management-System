import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../context/Authcontext";

import "./DashboardSidebar.css";

const DashboardSidebar = () => {
  const { user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  /*
   * ---------------------------------------------------------
   * USER ROLE
   * ---------------------------------------------------------
   */

  const role = user?.role || "patient";

  /*
   * ---------------------------------------------------------
   * ROLE CONFIGURATION
   * ---------------------------------------------------------
   *
   * Sidebar modules are based on the actual application
   * roles and currently planned backend modules.
   */

  const menuConfig = useMemo(
    () => ({
      patient: {
        label: "Patient",
        basePath: "/patient",

        main: [
          {
            label: "Overview",
            path: "/patient",
            icon: "bx-home-alt-2",
            end: true,
          },
          {
            label: "My Appointments",
            path: "/patient/appointments",
            icon: "bx-calendar-heart",
          },
          {
            label: "Find Doctors",
            path: "/patient/find-doctor",
            icon: "bx-user-plus",
          },
          {
            label: "Departments",
            path: "/patient/departments",
            icon: "bx-buildings",
          },
          {
            label: "Medical Records",
            path: "/patient/medical-records",
            icon: "bx-file",
          },
          // {
          //   label: "Payments",
          //   path: "/patient/payments",
          //   icon: "bx-wallet",
          // },
          // {
          //   label: "AI Assistant",
          //   path: "/patient/ai",
          //   icon: "bx-bot",
          //   highlight: true,
          // },
        ],

        account: [
          {
            label: "My Profile",
            path: "/patient/profile",
            icon: "bx-user-circle",
          },
        ],
      },

      doctor: {
        label: "Doctor",
        basePath: "/doctor",

        main: [
          {
            label: "Overview",
            path: "/doctor",
            icon: "bx-home-alt-2",
            end: true,
          },
          {
            label: "Appointments",
            path: "/doctor/appointments",
            icon: "bx-calendar-heart",
          },
          {
            label: "My Patients",
            path: "/doctor/patients",
            icon: "bx-group",
          },
          {
            label: "Medical Records",
            path: "/doctor/medical-records",
            icon: "bx-file",
          },
        ],

        account: [
          // {
          //   label: "My Profile",
          //   path: "/doctor/profile",
          //   icon: "bx-user-circle",
          // },
        ],
      },

      admin: {
        label: "Administrator",
        basePath: "/admin",

        main: [
          {
            label: "Overview",
            path: "/admin",
            icon: "bx-home-alt-2",
            end: true,
          },
          {
            label: "Patients",
            path: "/admin/patients",
            icon: "bx-group",
          },
          {
            label: "Doctors",
            path: "/admin/doctors",
            icon: "bx-user-plus",
          },
          {
            label: "Departments",
            path: "/admin/departments",
            icon: "bx-buildings",
          },
          {
            label: "Appointments",
            path: "/admin/appointments",
            icon: "bx-calendar-heart",
          },
          {
            label: "Payments",
            path: "/admin/payments",
            icon: "bx-wallet",
          },
          // {
          //   label: "Medical Records",
          //   path: "/admin/medical-records",
          //   icon: "bx-file",
          // },
          {
            label: "Reports & Statistics",
            path: "/admin/reports",
            icon: "bx-bar-chart-alt-2",
          },
        ],

        account: [
          // {
          //   label: "My Profile",
          //   path: "/admin/profile",
          //   icon: "bx-user-circle",
          // },
        ],
      },
    }),
    []
  );

  const currentConfig =
    menuConfig[role] || menuConfig.patient;

  /*
   * ---------------------------------------------------------
   * USER NAME
   * ---------------------------------------------------------
   */

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  /*
   * ---------------------------------------------------------
   * USER INITIAL
   * ---------------------------------------------------------
   */

  const userInitial =
    userName?.trim()?.charAt(0)?.toUpperCase() || "U";

  /*
   * ---------------------------------------------------------
   * ROLE LABEL
   * ---------------------------------------------------------
   */

  const roleLabel =
    role === "patient"
      ? "Patient"
      : role === "doctor"
        ? "Doctor"
        : role === "admin"
          ? "Administrator"
          : "User";

  /*
   * ---------------------------------------------------------
   * MOBILE SIDEBAR
   * ---------------------------------------------------------
   *
   * DashboardHeader sends:
   *
   * dashboard-sidebar-toggle
   *
   * This listener allows the header's mobile menu button
   * to open / close this sidebar.
   */

  useEffect(() => {
    const handleSidebarToggle = () => {
      setIsMobileOpen((previous) => !previous);
    };

    window.addEventListener(
      "dashboard-sidebar-toggle",
      handleSidebarToggle
    );

    return () => {
      window.removeEventListener(
        "dashboard-sidebar-toggle",
        handleSidebarToggle
      );
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * CLOSE SIDEBAR ON ROUTE CHANGE
   * ---------------------------------------------------------
   */

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  /*
   * ---------------------------------------------------------
   * CLOSE MOBILE SIDEBAR
   * ---------------------------------------------------------
   */

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

  const handleLogout = () => {
    logout();

    closeMobileSidebar();

    navigate("/login", {
      replace: true,
    });
  };

  /*
   * ---------------------------------------------------------
   * NAVIGATION HANDLER
   * ---------------------------------------------------------
   */

  const handleNavigation = () => {
    closeMobileSidebar();
  };

  /*
   * ---------------------------------------------------------
   * KEYBOARD ACCESSIBILITY
   * ---------------------------------------------------------
   */

  const handleOverlayKeyDown = (event) => {
    if (event.key === "Escape") {
      closeMobileSidebar();
    }
  };

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
          ===================================================== */}

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="dashboard-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileSidebar}
            onKeyDown={handleOverlayKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Close dashboard menu"
          />
        )}
      </AnimatePresence>

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`dashboard-sidebar ${
          isMobileOpen
            ? "dashboard-sidebar-open"
            : ""
        }`}
        aria-label={`${currentConfig.label} dashboard navigation`}
      >
        {/* ===================================================
            BRAND
            =================================================== */}

        <div className="dashboard-sidebar-brand">
          <NavLink
            to={currentConfig.basePath}
            className="dashboard-brand-link"
            onClick={handleNavigation}
          >
            <div className="dashboard-brand-icon">
              <i className="bx bx-plus-medical" />
            </div>

            <div className="dashboard-brand-text">
              <span className="dashboard-brand-name">
                Hospital Management
              </span>

              <span className="dashboard-brand-subtitle">
                Health Management
              </span>
            </div>
          </NavLink>

          {/* Mobile close */}
          <button
            type="button"
            className="dashboard-sidebar-close"
            aria-label="Close dashboard menu"
            onClick={closeMobileSidebar}
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* ===================================================
            USER PROFILE MINI CARD
            =================================================== */}

        <div className="dashboard-sidebar-user">
          <div className="dashboard-sidebar-avatar">
            <span>{userInitial}</span>

            <span className="dashboard-online-dot" />
          </div>

          <div className="dashboard-sidebar-user-info">
            <span className="dashboard-sidebar-user-name">
              {userName}
            </span>

            <span className="dashboard-sidebar-user-role">
              {roleLabel}
            </span>
          </div>

          <NavLink
            to={`${currentConfig.basePath}/profile`}
            className="dashboard-sidebar-user-arrow"
            aria-label="Open profile"
            onClick={handleNavigation}
          >
            <i className="bx bx-chevron-right" />
          </NavLink>
        </div>

        {/* ===================================================
            NAVIGATION
            =================================================== */}

        <div className="dashboard-sidebar-scroll">
          {/* =================================================
              MAIN MENU
              ================================================= */}

          <div className="dashboard-sidebar-section">
            <div className="dashboard-sidebar-section-title">
              <span>MAIN MENU</span>
            </div>

            <nav
              className="dashboard-sidebar-nav"
              aria-label="Main dashboard navigation"
            >
              {currentConfig.main.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `dashboard-sidebar-link ${
                      isActive ? "active" : ""
                    } ${
                      item.highlight ? "highlight" : ""
                    }`
                  }
                  onClick={handleNavigation}
                >
                  <span className="dashboard-sidebar-link-icon">
                    <i className={`bx ${item.icon}`} />
                  </span>

                  <span className="dashboard-sidebar-link-label">
                    {item.label}
                  </span>

                  {item.highlight && (
                    <span className="dashboard-sidebar-ai-badge">
                      AI
                    </span>
                  )}

                  <span className="dashboard-sidebar-link-arrow">
                    <i className="bx bx-chevron-right" />
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* =================================================
              ACCOUNT
              ================================================= */}

          <div className="dashboard-sidebar-section">
            <div className="dashboard-sidebar-section-title">
              <span>ACCOUNT</span>
            </div>

            <nav
              className="dashboard-sidebar-nav"
              aria-label="Account navigation"
            >
              {currentConfig.account.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `dashboard-sidebar-link ${
                      isActive ? "active" : ""
                    }`
                  }
                  onClick={handleNavigation}
                >
                  <span className="dashboard-sidebar-link-icon">
                    <i className={`bx ${item.icon}`} />
                  </span>

                  <span className="dashboard-sidebar-link-label">
                    {item.label}
                  </span>

                  <span className="dashboard-sidebar-link-arrow">
                    <i className="bx bx-chevron-right" />
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* =================================================
              PATIENT SUPPORT CARD
              ================================================= */}

          {role === "patient" && (
            <motion.div
              className="dashboard-sidebar-support"
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
                delay: 0.15,
              }}
            >
              <div className="dashboard-sidebar-support-icon">
                <i className="bx bx-heart" />
              </div>

              <div className="dashboard-sidebar-support-content">
                <strong>Need Assistance?</strong>

                <span>
                  Your health journey is our priority.
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* ===================================================
            SIDEBAR FOOTER
            =================================================== */}

        <div className="dashboard-sidebar-footer">
          <button
            type="button"
            className="dashboard-sidebar-logout"
            onClick={handleLogout}
          >
            <span className="dashboard-sidebar-logout-icon">
              <i className="bx bx-log-out" />
            </span>

            <span className="dashboard-sidebar-logout-label">
              Logout
            </span>
          </button>

          <div className="dashboard-sidebar-footer-status">
            <span className="dashboard-status-indicator" />

            <span>Secure session</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;