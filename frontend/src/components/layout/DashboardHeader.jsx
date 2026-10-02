import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../context/Authcontext";

import "./DashboardHeader.css";

const DashboardHeader = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  /*
   * -------------------------------------------------------
   * USER INFORMATION
   * -------------------------------------------------------
   */

  const userName = useMemo(() => {
    return (
      user?.name ||
      user?.fullName ||
      user?.username ||
      user?.email?.split("@")[0] ||
      "User"
    );
  }, [user]);

  const userEmail = user?.email || "";

  const userRole = useMemo(() => {
    const role = user?.role || "user";

    return role.charAt(0).toUpperCase() + role.slice(1);
  }, [user]);

  const userInitial = useMemo(() => {
    return userName?.trim()?.charAt(0)?.toUpperCase() || "U";
  }, [userName]);

  /*
   * -------------------------------------------------------
   * ROLE BASED PROFILE ROUTE
   * -------------------------------------------------------
   */

  const profilePath = useMemo(() => {
    switch (user?.role) {
      case "patient":
        return "/patient/profile";

      case "doctor":
        return "/doctor/profile";

      case "admin":
        return "/admin/profile";

      default:
        return "/";
    }
  }, [user?.role]);

  /*
   * -------------------------------------------------------
   * ROLE LABEL
   * -------------------------------------------------------
   */

  const roleLabel = useMemo(() => {
    switch (user?.role) {
      case "patient":
        return "Patient";

      case "doctor":
        return "Doctor";

      case "admin":
        return "Administrator";

      default:
        return userRole;
    }
  }, [user?.role, userRole]);

  /*
   * -------------------------------------------------------
   * MOBILE SIDEBAR TOGGLE
   * -------------------------------------------------------
   *
   * DashboardSidebar can listen for this custom event.
   * This keeps DashboardHeader independent from sidebar state.
   */

  const handleMobileMenu = () => {
    window.dispatchEvent(new Event("dashboard-sidebar-toggle"));
  };

  /*
   * -------------------------------------------------------
   * LOGOUT
   * -------------------------------------------------------
   */

  const handleLogout = () => {
    setProfileOpen(false);
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  /*
   * -------------------------------------------------------
   * SEARCH
   * -------------------------------------------------------
   *
   * Search is intentionally UI-only for now.
   * We do NOT invent a backend search endpoint.
   */

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = formData.get("search")?.trim();

    if (!query) {
      return;
    }

    /*
     * Backend search API is not currently defined in the
     * supplied architecture, so we don't make a fake API call.
     *
     * This can later be connected to a real backend endpoint
     * without changing the header structure.
     */

    setSearchOpen(false);
  };

  /*
   * -------------------------------------------------------
   * CLOSE PROFILE MENU WHEN NAVIGATING
   * -------------------------------------------------------
   */

  const handleProfileNavigation = () => {
    setProfileOpen(false);
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">

        {/* =================================================
            LEFT SECTION
        ================================================== */}

        <div className="dashboard-header-left">

          {/* Mobile Menu Button */}
          <motion.button
            type="button"
            className="dashboard-mobile-menu-btn"
            onClick={handleMobileMenu}
            aria-label="Open dashboard menu"
            whileTap={{ scale: 0.94 }}
          >
            <i className="bx bx-menu"></i>
          </motion.button>

          {/* Page Context */}
          <div className="dashboard-header-context">
            <div className="dashboard-header-eyebrow">
              <span className="dashboard-header-status-dot"></span>
              Secure Healthcare Portal
            </div>

            <h1 className="dashboard-header-title">
              Welcome back,{" "}
              <span>{userName.split(" ")[0]}</span>
            </h1>

            <p className="dashboard-header-subtitle">
              Manage your healthcare journey from one secure place.
            </p>
          </div>
        </div>

        {/* =================================================
            RIGHT SECTION
        ================================================== */}

        <div className="dashboard-header-right">

          {/* Search */}
          <div className="dashboard-header-search-wrapper">

            <motion.button
              type="button"
              className="dashboard-header-icon-btn dashboard-search-toggle"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="bx bx-search"></i>
            </motion.button>

            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  className="dashboard-search-box"
                  onSubmit={handleSearchSubmit}
                  initial={{
                    opacity: 0,
                    y: -8,
                    scale: 0.97,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                    scale: 0.97,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <i className="bx bx-search"></i>

                  <input
                    type="search"
                    name="search"
                    placeholder="Search..."
                    autoComplete="off"
                    aria-label="Search dashboard"
                  />

                  <button type="submit" aria-label="Submit search">
                    <i className="bx bx-right-arrow-alt"></i>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <motion.button
            type="button"
            className="dashboard-header-icon-btn dashboard-notification-btn"
            aria-label="Notifications"
            title="Notifications"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bx bx-bell"></i>
          </motion.button>

          {/* Divider */}
          <span className="dashboard-header-divider"></span>

          {/* =================================================
              USER PROFILE
          ================================================== */}

          <div className="dashboard-header-profile-wrapper">

            <motion.button
              type="button"
              className="dashboard-header-profile"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Avatar */}
              <span className="dashboard-header-avatar">
                {userInitial}

                <span className="dashboard-header-online-dot"></span>
              </span>

              {/* User Details */}
              <span className="dashboard-header-user-info">
                <strong>{userName}</strong>
                <small>{roleLabel}</small>
              </span>

              {/* Arrow */}
              <i
                className={`bx ${
                  profileOpen
                    ? "bx-chevron-up"
                    : "bx-chevron-down"
                } dashboard-header-profile-arrow`}
              ></i>
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className="dashboard-profile-dropdown"
                  initial={{
                    opacity: 0,
                    y: -8,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                    scale: 0.96,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                >

                  {/* Dropdown User */}
                  <div className="dashboard-profile-dropdown-user">

                    <div className="dashboard-profile-dropdown-avatar">
                      {userInitial}
                    </div>

                    <div className="dashboard-profile-dropdown-details">
                      <strong>{userName}</strong>

                      <span>
                        {userEmail || roleLabel}
                      </span>

                      <small>
                        <i className="bx bx-shield-quarter"></i>
                        {roleLabel}
                      </small>
                    </div>

                  </div>

                  <div className="dashboard-profile-dropdown-divider"></div>

                  {/* Profile */}
                  {/* <Link
                    to={profilePath}
                    className="dashboard-profile-dropdown-item"
                    onClick={handleProfileNavigation}
                  >
                    <span className="dashboard-dropdown-item-icon">
                      <i className="bx bx-user"></i>
                    </span>

                    <span>
                      <strong>My Profile</strong>
                      <small>View and manage your profile</small>
                    </span>

                    <i className="bx bx-chevron-right"></i>
                  </Link> */}

                  {/* Security */}
                  <div className="dashboard-profile-dropdown-item dashboard-dropdown-static">
                    <span className="dashboard-dropdown-item-icon">
                      <i className="bx bx-lock-alt"></i>
                    </span>

                    <span>
                      <strong>Secure Session</strong>
                      <small>Your session is protected</small>
                    </span>

                    <span className="dashboard-secure-badge">
                      <i className="bx bx-check"></i>
                    </span>
                  </div>

                  <div className="dashboard-profile-dropdown-divider"></div>

                  {/* Logout */}
                  <button
                    type="button"
                    className="dashboard-profile-logout"
                    onClick={handleLogout}
                  >
                    <span>
                      <i className="bx bx-log-out"></i>
                    </span>

                    <strong>Logout</strong>
                  </button>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;