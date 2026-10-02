import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext";
import AnimateBackground from "../../components/common/AnimateBackground/AnimateBackground";
import "./Auth.css";

const Auth = () => {
  const navigate = useNavigate();

  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    let updatedValue = value;

    /*
     * Phone number:
     * Allow only numbers and maximum 10 digits.
     */
    if (name === "phone") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((previous) => ({
      ...previous,
      [name]: updatedValue,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (errors.submit || errors.success) {
      setErrors((previous) => ({
        ...previous,
        submit: "",
        success: "",
      }));
    }
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    const newErrors = {};

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // ============================
    // NAME
    // ============================

    if (!isLogin && !name) {
      newErrors.name = "Please enter your full name.";
    } else if (!isLogin && name.length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters.";
    }

    // ============================
    // PHONE
    // ============================

    if (!isLogin) {
      if (!phone) {
        newErrors.phone =
          "Please enter your phone number.";
      } else if (!/^[6-9]\d{9}$/.test(phone)) {
        newErrors.phone =
          "Please enter a valid 10-digit mobile number.";
      }
    }

    // ============================
    // EMAIL
    // ============================

    if (!email) {
      newErrors.email =
        "Please enter your email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    // ============================
    // PASSWORD
    // ============================

    if (!password) {
      newErrors.password =
        "Please enter your password.";
    } else if (password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    }

    // ============================
    // CONFIRM PASSWORD
    // ============================

    if (!isLogin) {
      if (!confirmPassword) {
        newErrors.confirmPassword =
          "Please confirm your password.";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword =
          "Passwords do not match.";
      }
    }

    return newErrors;
  };

  // ==========================================
  // ROLE BASED REDIRECT
  // ==========================================

  const redirectByRole = (role) => {
    switch (role) {
      case "patient":
        navigate("/patient", { replace: true });
        break;

      case "doctor":
        navigate("/doctor", { replace: true });
        break;

      case "admin":
        navigate("/admin", { replace: true });
        break;

      default:
        throw new Error(
          "Invalid user role received from server."
        );
    }
  };

  // ==========================================
  // LOGIN / REGISTER SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // ========================================
      // LOGIN
      // ========================================

      if (isLogin) {
        const result = await login({
          email: formData.email.trim(),
          password: formData.password,
        });

        const loggedInUser = result?.user;

        if (!loggedInUser?.role) {
          throw new Error(
            "Login successful, but user role was not received."
          );
        }

        redirectByRole(loggedInUser.role);

        return;
      }

      // ========================================
      // REGISTER
      // ========================================

      const result = await register({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // ========================================
      // IF REGISTER AUTO LOGS USER IN
      // ========================================

      if (result?.token && result?.user?.role) {
        redirectByRole(result.user.role);
        return;
      }

      // ========================================
      // IF REGISTER ONLY CREATES ACCOUNT
      // ========================================

      const registeredEmail = formData.email.trim();

      setIsLogin(true);

      setFormData({
        name: "",
        phone: "",
        email: registeredEmail,
        password: "",
        confirmPassword: "",
      });

      setErrors({
        success:
          "Account created successfully. Please sign in.",
      });
    } catch (error) {
      setErrors({
        submit:
          error?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // SWITCH LOGIN / REGISTER
  // ==========================================

  const switchMode = () => {
    if (isSubmitting) {
      return;
    }

    setIsLogin((previous) => !previous);

    setFormData({
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setErrors({});

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <main className="auth-page">
      <AnimateBackground/>
      {/* Background */}

      <div className="auth-page-glow auth-page-glow-one" />
      <div className="auth-page-glow auth-page-glow-two" />
      <div className="auth-page-grid" />

      <div className="container">
        <div className="auth-layout">

          {/* =========================================
              LEFT BRAND / INFORMATION PANEL
          ========================================== */}

          <motion.section
            className="auth-showcase"
            initial={{
              opacity: 0,
              x: -35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.65,
              ease: "easeOut",
            }}
          >
            <div className="showcase-badge">
              <span className="showcase-badge-dot" />
              Trusted Digital Healthcare
            </div>

            <h1 className="showcase-title">
              Healthcare that
              <span> feels simpler.</span>
            </h1>

            <p className="showcase-description">
              Manage appointments, connect with doctors,
              access medical records and stay connected
              with your healthcare journey — all in one
              secure platform.
            </p>

            <div className="showcase-features">

              {/* Feature 1 */}

              <div className="showcase-feature">
                <div className="showcase-feature-icon">
                  <i className="bx bx-calendar-check" />
                </div>

                <div>
                  <h3>Easy Appointments</h3>

                  <p>
                    Book and manage appointments
                    effortlessly.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}

              <div className="showcase-feature">
                <div className="showcase-feature-icon">
                  <i className="bx bx-shield-quarter" />
                </div>

                <div>
                  <h3>Secure & Private</h3>

                  <p>
                    Your healthcare information stays
                    protected.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}

              <div className="showcase-feature">
                <div className="showcase-feature-icon">
                  <i className="bx bx-message-rounded-dots" />
                </div>

                <div>
                  <h3>Smart Assistance</h3>

                  <p>
                    Get healthcare guidance whenever
                    you need it.
                  </p>
                </div>
              </div>

            </div>

            {/* =========================================
                ORBIT DESIGN
            ========================================== */}

            <div className="showcase-orbit">

              <div className="orbit-ring orbit-ring-one" />

              <div className="orbit-ring orbit-ring-two" />

              <div className="orbit-core">
                <i className="bx bx-plus-medical" />
              </div>

              <div className="orbit-float-card orbit-card-one">
                <i className="bx bx-heart" />

                <span>Care</span>
              </div>

              <div className="orbit-float-card orbit-card-two">
                <i className="bx bx-pulse" />

                <span>Health</span>
              </div>

            </div>
          </motion.section>

          {/* =========================================
              AUTH PANEL
          ========================================== */}

          <motion.section
            className="auth-card-wrapper"
            initial={{
              opacity: 0,
              x: 35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.65,
              delay: 0.08,
              ease: "easeOut",
            }}
          >
            <div className="auth-card">

              {/* =====================================
                  HEADER
              ====================================== */}

              <div className="auth-card-header">

                <Link
                  to="/"
                  className="auth-logo"
                >
                  <span className="auth-logo-icon">
                    <i className="bx bx-plus-medical" />
                  </span>

                  <span className="auth-logo-text">
                    Hospital<span> Management</span>
                  </span>
                </Link>

                <div className="auth-header-text">

                  <AnimatePresence mode="wait">

                    <motion.div
                      key={
                        isLogin
                          ? "login-title"
                          : "register-title"
                      }
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <h2>
                        {isLogin
                          ? "Welcome back"
                          : "Create your account"}
                      </h2>

                      <p>
                        {isLogin
                          ? "Sign in to continue your healthcare journey."
                          : "Join us and manage your healthcare with ease."}
                      </p>
                    </motion.div>

                  </AnimatePresence>

                </div>
              </div>

              {/* =====================================
                  FORM
              ====================================== */}

              <AnimatePresence mode="wait">

                <motion.form
                  key={
                    isLogin
                      ? "login-form"
                      : "register-form"
                  }
                  className="auth-form"
                  onSubmit={handleSubmit}
                  initial={{
                    opacity: 0,
                    x: isLogin ? -15 : 15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: isLogin ? 15 : -15,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >

                  {/* =================================
                      FULL NAME
                  ================================== */}

                  {!isLogin && (
                    <div className="auth-field">

                      <label htmlFor="name">
                        Full Name
                      </label>

                      <div
                        className={`auth-input-wrapper ${
                          errors.name
                            ? "has-error"
                            : ""
                        }`}
                      >
                        <i className="bx bx-user auth-input-icon" />

                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleChange}
                          autoComplete="name"
                        />
                      </div>

                      {errors.name && (
                        <span className="auth-error">
                          <i className="bx bx-error-circle" />

                          {errors.name}
                        </span>
                      )}

                    </div>
                  )}

                  {/* =================================
                      PHONE NUMBER
                  ================================== */}

                  {!isLogin && (
                    <div className="auth-field">

                      <label htmlFor="phone">
                        Phone Number
                      </label>

                      <div
                        className={`auth-input-wrapper ${
                          errors.phone
                            ? "has-error"
                            : ""
                        }`}
                      >
                        <i className="bx bx-phone auth-input-icon" />

                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          placeholder="Enter 10-digit mobile number"
                          value={formData.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                          maxLength={10}
                        />
                      </div>

                      {errors.phone && (
                        <span className="auth-error">
                          <i className="bx bx-error-circle" />

                          {errors.phone}
                        </span>
                      )}

                    </div>
                  )}

                  {/* =================================
                      EMAIL
                  ================================== */}

                  <div className="auth-field">

                    <label htmlFor="email">
                      Email Address
                    </label>

                    <div
                      className={`auth-input-wrapper ${
                        errors.email
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <i className="bx bx-envelope auth-input-icon" />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                      />
                    </div>

                    {errors.email && (
                      <span className="auth-error">
                        <i className="bx bx-error-circle" />

                        {errors.email}
                      </span>
                    )}

                  </div>

                  {/* =================================
                      PASSWORD
                  ================================== */}

                  <div className="auth-field">

                    <div className="auth-label-row">

                      <label htmlFor="password">
                        Password
                      </label>

                      {isLogin && (
                        <button
                          type="button"
                          className="forgot-password"
                          onClick={() => {
                            // Forgot password flow can be connected later.
                          }}
                        >
                          Forgot password?
                        </button>
                      )}

                    </div>

                    <div
                      className={`auth-input-wrapper ${
                        errors.password
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <i className="bx bx-lock-alt auth-input-icon" />

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete={
                          isLogin
                            ? "current-password"
                            : "new-password"
                        }
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        <i
                          className={
                            showPassword
                              ? "bx bx-hide"
                              : "bx bx-show"
                          }
                        />
                      </button>

                    </div>

                    {errors.password && (
                      <span className="auth-error">
                        <i className="bx bx-error-circle" />

                        {errors.password}
                      </span>
                    )}

                  </div>

                  {/* =================================
                      CONFIRM PASSWORD
                  ================================== */}

                  {!isLogin && (
                    <div className="auth-field">

                      <label htmlFor="confirmPassword">
                        Confirm Password
                      </label>

                      <div
                        className={`auth-input-wrapper ${
                          errors.confirmPassword
                            ? "has-error"
                            : ""
                        }`}
                      >
                        <i className="bx bx-lock auth-input-icon" />

                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="Confirm your password"
                          value={
                            formData.confirmPassword
                          }
                          onChange={handleChange}
                          autoComplete="new-password"
                        />

                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() =>
                            setShowConfirmPassword(
                              (previous) => !previous
                            )
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          <i
                            className={
                              showConfirmPassword
                                ? "bx bx-hide"
                                : "bx bx-show"
                            }
                          />
                        </button>

                      </div>

                      {errors.confirmPassword && (
                        <span className="auth-error">
                          <i className="bx bx-error-circle" />

                          {errors.confirmPassword}
                        </span>
                      )}

                    </div>
                  )}

                  {/* =================================
                      TERMS
                  ================================== */}

                  {!isLogin && (
                    <label className="auth-checkbox">

                      <input
                        type="checkbox"
                        required
                      />

                      <span className="auth-checkbox-box">
                        <i className="bx bx-check" />
                      </span>

                      <span className="auth-checkbox-text">
                        I agree to the{" "}

                        <button
                          type="button"
                          onClick={(event) =>
                            event.preventDefault()
                          }
                        >
                          Terms & Conditions
                        </button>{" "}

                        and Privacy Policy.
                      </span>

                    </label>
                  )}

                  {/* =================================
                      ERROR MESSAGE
                  ================================== */}

                  {errors.submit && (
                    <div className="auth-alert auth-alert-error">

                      <i className="bx bx-error-circle" />

                      <span>
                        {errors.submit}
                      </span>

                    </div>
                  )}

                  {/* =================================
                      SUCCESS MESSAGE
                  ================================== */}

                  {errors.success && (
                    <div className="auth-alert auth-alert-success">

                      <i className="bx bx-check-circle" />

                      <span>
                        {errors.success}
                      </span>

                    </div>
                  )}

                  {/* =================================
                      SUBMIT BUTTON
                  ================================== */}

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="auth-spinner" />

                        {isLogin
                          ? "Signing in..."
                          : "Creating account..."}
                      </>
                    ) : (
                      <>
                        <span>
                          {isLogin
                            ? "Sign In"
                            : "Create Account"}
                        </span>

                        <i className="bx bx-right-arrow-alt" />
                      </>
                    )}
                  </button>

                </motion.form>

              </AnimatePresence>

              {/* =====================================
                  SWITCH LOGIN / REGISTER
              ====================================== */}

              <div className="auth-switch">

                <span>
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </span>

                <button
                  type="button"
                  onClick={switchMode}
                  disabled={isSubmitting}
                >
                  {isLogin
                    ? "Create account"
                    : "Sign in"}
                </button>

              </div>

              {/* =====================================
                  SECURITY
              ====================================== */}

              <div className="auth-security">

                <i className="bx bx-shield-quarter" />

                <span>
                  Your information is protected with
                  secure authentication.
                </span>

              </div>

            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
};

export default Auth;