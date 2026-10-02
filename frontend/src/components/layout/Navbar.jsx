import React, { useState } from "react";
import {
    Link,
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar as BsNavbar, Container } from "react-bootstrap";

import { useAuth } from "../../context/Authcontext";

import "./Navbar.css";

const navItems = [
    {
        label: "Home",
        path: "/",
        icon: "bx-home-alt-2",
    },
    {
        label: "About",
        path: "/about",
        icon: "bx-info-circle",
    },
    {
        label: "Doctors",
        path: "/doctors",
        icon: "bx-user-pin",
    },
    {
        label: "Departments",
        path: "/departments",
        icon: "bx-buildings",
    },
    {
        label: "Contact",
        path: "/contact",
        icon: "bx-phone",
    },
];

const Navbar = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth();

    const closeMobileMenu = () => {
        setShowMobileMenu(false);
    };

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };

    /*
     * Role based dashboard path
     */
    const getDashboardPath = () => {
        switch (user?.role) {
            case "admin":
                return "/admin";

            case "doctor":
                return "/doctor";

            case "patient":
                return "/patient";

            default:
                return "/";
        }
    };

    /*
     * User display name
     */
    const getUserName = () => {
        return (
            user?.name ||
            user?.fullName ||
            user?.username ||
            user?.email?.split("@")[0] ||
            "User"
        );
    };

    /*
     * Logout handler
     *
     * AuthContext logout:
     * - token remove
     * - user remove
     * - auth state reset
     *
     * Then redirect to login page.
     */
    const handleLogout = () => {
        logout();
        closeMobileMenu();
        navigate("/login", { replace: true });
    };

    return (
        <>
            <BsNavbar
                expand="lg"
                className="hospital-navbar"
            >
                <Container className="hospital-navbar-container">

                    {/* ==================== BRAND ==================== */}

                    <Link
                        to="/"
                        className="hospital-brand"
                        onClick={closeMobileMenu}
                        aria-label="MediCare Hospital home"
                    >
                        <motion.div
                            className="brand-logo"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <i className="bx bx-plus-medical" />
                        </motion.div>

                        <div className="brand-content">
                            <span className="brand-name">
                                Hospital<span> Management</span>
                            </span>

                            <span className="brand-tagline">
                                Healthcare Excellence
                            </span>
                        </div>
                    </Link>

                    {/* ==================== MOBILE TOGGLE ==================== */}

                    <button
                        type="button"
                        className="navbar-menu-toggle"
                        aria-label={
                            showMobileMenu
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                        aria-expanded={showMobileMenu}
                        onClick={() =>
                            setShowMobileMenu(
                                (previous) => !previous
                            )
                        }
                    >
                        <span
                            className={
                                showMobileMenu
                                    ? "menu-line active"
                                    : "menu-line"
                            }
                        />

                        <span
                            className={
                                showMobileMenu
                                    ? "menu-line active"
                                    : "menu-line"
                            }
                        />

                        <span
                            className={
                                showMobileMenu
                                    ? "menu-line active"
                                    : "menu-line"
                            }
                        />
                    </button>

                    {/* ==================== DESKTOP NAVIGATION ==================== */}

                    <div className="desktop-navbar-content">

                        <nav
                            className="main-navigation"
                            aria-label="Main navigation"
                        >
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/"}
                                    className={() =>
                                        isActive(item.path)
                                            ? "nav-link-item active"
                                            : "nav-link-item"
                                    }
                                >
                                    <i
                                        className={`bx ${item.icon}`}
                                    />

                                    <span>
                                        {item.label}
                                    </span>

                                    {isActive(item.path) && (
                                        <motion.span
                                            className="nav-active-indicator"
                                            layoutId="navbar-active-indicator"
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 35,
                                            }}
                                        />
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        {/* ==================== DESKTOP ACTIONS ==================== */}

                        <div className="navbar-actions">

                            {isAuthenticated ? (
                                <>
                                    {/* USER NAME */}

                                    <Link
                                        to={getDashboardPath()}
                                        className="navbar-user-btn"
                                        title="Open Dashboard"
                                    >
                                        <span className="navbar-user-avatar">
                                            <i className="bx bx-user" />
                                        </span>

                                        <span className="navbar-user-name">
                                            {getUserName()}
                                        </span>
                                    </Link>

                                    {/* LOGOUT */}

                                    <button
                                        type="button"
                                        className="navbar-logout-btn"
                                        onClick={handleLogout}
                                        title="Logout"
                                    >
                                        <i className="bx bx-log-out-circle" />

                                        <span>
                                            Logout
                                        </span>
                                    </button>
                                </>
                            ) : (
                                /* LOGIN */

                                <Link
                                    to="/login"
                                    className="navbar-login-btn"
                                >
                                    <i className="bx bx-log-in-circle" />

                                    <span>
                                        Login
                                    </span>
                                </Link>
                            )}

                            {/* BOOK APPOINTMENT */}

                            <Link
                                to="/patient/appointments/book"
                                className="navbar-appointment-btn"
                            >
                                <span className="appointment-icon">
                                    <i className="bx bx-calendar-plus" />
                                </span>

                                <span>
                                    Book Appointment
                                </span>

                                <i className="bx bx-right-arrow-alt appointment-arrow" />
                            </Link>

                        </div>
                    </div>
                </Container>
            </BsNavbar>

            {/* ==================== MOBILE MENU ==================== */}

            <AnimatePresence>
                {showMobileMenu && (
                    <>
                        {/* BACKDROP */}

                        <motion.div
                            className="mobile-menu-backdrop"
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.2,
                            }}
                            onClick={closeMobileMenu}
                            aria-hidden="true"
                        />

                        {/* MOBILE NAVIGATION */}

                        <motion.aside
                            className="mobile-navigation"
                            initial={{
                                opacity: 0,
                                x: "100%",
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            exit={{
                                opacity: 0,
                                x: "100%",
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            aria-label="Mobile navigation"
                        >

                            {/* MOBILE HEADER */}

                            <div className="mobile-navigation-header">

                                <div className="mobile-brand">

                                    <div className="mobile-brand-logo">
                                        <i className="bx bx-plus-medical" />
                                    </div>

                                    <div>
                                        <div className="mobile-brand-name">
                                            Medi<span>Care</span>
                                        </div>

                                        <div className="mobile-brand-tagline">
                                            Healthcare Excellence
                                        </div>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="mobile-close-btn"
                                    onClick={closeMobileMenu}
                                    aria-label="Close navigation menu"
                                >
                                    <i className="bx bx-x" />
                                </button>

                            </div>

                            {/* MOBILE NAVIGATION LINKS */}

                            <nav
                                className="mobile-nav-links"
                                aria-label="Mobile main navigation"
                            >
                                {navItems.map(
                                    (item, index) => {
                                        const active =
                                            isActive(item.path);

                                        return (
                                            <motion.div
                                                key={item.path}
                                                initial={{
                                                    opacity: 0,
                                                    x: 20,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    x: 0,
                                                }}
                                                transition={{
                                                    delay:
                                                        0.05 +
                                                        index * 0.04,
                                                    duration: 0.25,
                                                }}
                                            >
                                                <NavLink
                                                    to={item.path}
                                                    end={
                                                        item.path ===
                                                        "/"
                                                    }
                                                    onClick={
                                                        closeMobileMenu
                                                    }
                                                    className={
                                                        active
                                                            ? "mobile-nav-link active"
                                                            : "mobile-nav-link"
                                                    }
                                                >
                                                    <span className="mobile-nav-icon">
                                                        <i
                                                            className={`bx ${item.icon}`}
                                                        />
                                                    </span>

                                                    <span className="mobile-nav-label">
                                                        {item.label}
                                                    </span>

                                                    <i className="bx bx-chevron-right mobile-nav-arrow" />
                                                </NavLink>
                                            </motion.div>
                                        );
                                    }
                                )}
                            </nav>

                            {/* ==================== MOBILE CTA AREA ==================== */}

                            <div className="mobile-navigation-footer">

                                {/* HELP CARD */}

                                <div className="mobile-help-card">

                                    <div className="mobile-help-icon">
                                        <i className="bx bx-heart" />
                                    </div>

                                    <div>
                                        <span className="mobile-help-title">
                                            Need medical help?
                                        </span>

                                        <span className="mobile-help-text">
                                            Our team is here for you.
                                        </span>
                                    </div>

                                </div>

                                {/* AUTH ACTIONS */}

                                {isAuthenticated ? (
                                    <>
                                        {/* USER / DASHBOARD */}

                                        <Link
                                            to={getDashboardPath()}
                                            className="mobile-login-btn"
                                            onClick={
                                                closeMobileMenu
                                            }
                                        >
                                            <i className="bx bx-user-circle" />

                                            <span>
                                                {getUserName()}
                                            </span>
                                        </Link>

                                        {/* LOGOUT */}

                                        <button
                                            type="button"
                                            className="mobile-login-btn"
                                            onClick={
                                                handleLogout
                                            }
                                        >
                                            <i className="bx bx-log-out-circle" />

                                            <span>
                                                Logout
                                            </span>
                                        </button>
                                    </>
                                ) : (
                                    /* LOGIN */

                                    <Link
                                        to="/login"
                                        className="mobile-login-btn"
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >
                                        <i className="bx bx-log-in-circle" />

                                        <span>
                                            Login
                                        </span>
                                    </Link>
                                )}

                                {/* BOOK APPOINTMENT */}

                                <Link
                                    to="/patient/appointments/book"
                                    className="mobile-appointment-btn"
                                    onClick={
                                        closeMobileMenu
                                    }
                                >
                                    <i className="bx bx-calendar-plus" />

                                    <span>
                                        Book Appointment
                                    </span>
                                </Link>

                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;