import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";

import {
  getAllPayments,
  getUnpaidPayments,
  deleteUnpaidPayment,
} from "../../services/paymentService";

import "./AdminPayments.css";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_PAYMENTS = [];

const TABS = [
  {
    id: "all",
    label: "All Payments",
    icon: "bx-wallet",
  },
  {
    id: "unpaid",
    label: "Unpaid Payments",
    icon: "bx-time-five",
  },
];

const STATUS_OPTIONS = [
  "All",
  "Created",
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
];

/* =========================================================
   ANIMATIONS
========================================================= */

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: 15,
    transition: {
      duration: 0.2,
    },
  },
};

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "₹0.00";
  }

  // Backend stores payment amount in paise.
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
};

const getPaymentId = (payment) =>
  payment?._id || payment?.id || "";

const getPatientName = (payment) =>
  payment?.patient?.user?.name ||
  payment?.patient?.name ||
  payment?.patientName ||
  "Unknown Patient";

const getPatientEmail = (payment) =>
  payment?.patient?.user?.email ||
  payment?.patient?.email ||
  payment?.patientEmail ||
  "";

const getDoctorName = (payment) =>
  payment?.appointment?.doctor?.user?.name ||
  payment?.appointment?.doctor?.name ||
  payment?.doctor?.user?.name ||
  payment?.doctor?.name ||
  "Not available";

const getDepartmentName = (payment) =>
  payment?.appointment?.doctor?.department?.name ||
  payment?.appointment?.department?.name ||
  payment?.department?.name ||
  "—";

const getAppointmentDate = (payment) =>
  payment?.appointment?.appointmentDate ||
  payment?.appointment?.date ||
  payment?.appointmentDate ||
  null;

const getStatusClass = (status) => {
  const normalized = String(status || "")
    .toLowerCase()
    .trim();

  if (normalized === "paid") return "paid";
  if (normalized === "created") return "created";
  if (normalized === "pending") return "pending";
  if (normalized === "failed") return "failed";
  if (normalized === "refunded") return "refunded";

  return "unknown";
};

const getInitials = (name) => {
  const words = String(name || "P")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "P";
};

const getErrorMessage = (error) =>
  error?.message ||
  error?.response?.data?.message ||
  "Something went wrong. Please try again.";

const normalizePaymentsResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.payments)) {
    return response.data.payments;
  }

  if (Array.isArray(response?.payments)) {
    return response.payments;
  }

  return EMPTY_PAYMENTS;
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  icon = "bx-inbox",
  title = "No payments found",
  description = "There are no payment records to display.",
}) => (
  <div className="admin-payment-empty">
    <div className="admin-payment-empty-icon">
      <i className={`bx ${icon}`} />
    </div>

    <strong>{title}</strong>

    <span>{description}</span>
  </div>
);

/* =========================================================
   STAT CARD
========================================================= */

const PaymentStatCard = ({
  title,
  value,
  description,
  icon,
  variant,
  loading,
}) => (
  <motion.article
    className={`admin-payment-stat-card ${variant || ""}`}
    variants={itemVariants}
    whileHover={{
      y: -5,
      transition: {
        duration: 0.2,
      },
    }}
  >
    <div className="admin-payment-stat-glow" />

    <div className="admin-payment-stat-top">
      <span className="admin-payment-stat-icon">
        <i className={`bx ${icon}`} />
      </span>

      <span className="admin-payment-stat-indicator">
        <i className="bx bx-trending-up" />
      </span>
    </div>

    <div className="admin-payment-stat-content">
      <span className="admin-payment-stat-title">
        {title}
      </span>

      <strong className="admin-payment-stat-value">
        {loading ? "—" : value}
      </strong>

      <span className="admin-payment-stat-description">
        {description}
      </span>
    </div>

    <div className="admin-payment-stat-shine" />
  </motion.article>
);

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => (
  <span
    className={`admin-payment-status ${getStatusClass(status)}`}
  >
    <span className="admin-payment-status-dot" />
    {status || "Unknown"}
  </span>
);

/* =========================================================
   CONFIRM DELETE MODAL
========================================================= */

const DeleteConfirmation = ({
  payment,
  deleting,
  onCancel,
  onConfirm,
}) => (
  <motion.div
    className="admin-payment-modal-backdrop"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onMouseDown={(event) => {
      if (event.target === event.currentTarget && !deleting) {
        onCancel();
      }
    }}
  >
    <motion.div
      className="admin-payment-modal"
      initial={{
        opacity: 0,
        scale: 0.92,
        y: 20,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        y: 12,
      }}
      transition={{
        duration: 0.25,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-delete-title"
    >
      <div className="admin-payment-modal-icon">
        <i className="bx bx-trash" />
      </div>

      <h3 id="payment-delete-title">
        Delete unpaid payment?
      </h3>

      <p>
        Are you sure you want to delete the unpaid payment
        for <strong>{getPatientName(payment)}</strong>?
        This action cannot be undone.
      </p>

      <div className="admin-payment-modal-details">
        <span>Payment amount</span>
        <strong>
          {formatCurrency(payment?.amount)}
        </strong>
      </div>

      <div className="admin-payment-modal-actions">
        <button
          type="button"
          className="admin-payment-modal-cancel"
          onClick={onCancel}
          disabled={deleting}
        >
          Cancel
        </button>

        <button
          type="button"
          className="admin-payment-modal-delete"
          onClick={onConfirm}
          disabled={deleting}
        >
          {deleting ? (
            <>
              <i className="bx bx-loader-alt bx-spin" />
              Deleting...
            </>
          ) : (
            <>
              <i className="bx bx-trash" />
              Delete Payment
            </>
          )}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* =========================================================
   PAYMENT ROW
========================================================= */

const PaymentRow = ({
  payment,
  onDelete,
  deletingId,
  index,
}) => {
  const paymentId = getPaymentId(payment);
  const status = payment?.status || "Unknown";
  const isUnpaid = ["Created", "Pending"].includes(status);
  const isDeleting = deletingId === paymentId;

  return (
    <motion.tr
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{
        delay: Math.min(index * 0.025, 0.2),
      }}
      layout
    >
      <td>
        <div className="admin-payment-patient-cell">
          <div className="admin-payment-avatar">
            {getInitials(getPatientName(payment))}
          </div>

          <div className="admin-payment-patient-info">
            <strong>{getPatientName(payment)}</strong>
            <span>
              {getPatientEmail(payment) || "Email unavailable"}
            </span>
          </div>
        </div>
      </td>

      <td>
        <div className="admin-payment-doctor-cell">
          <strong>{getDoctorName(payment)}</strong>
          <span>{getDepartmentName(payment)}</span>
        </div>
      </td>

      <td>
        <div className="admin-payment-amount">
          {formatCurrency(payment?.amount)}
        </div>
      </td>

      <td>
        <StatusBadge status={status} />
      </td>

      <td>
        <div className="admin-payment-date">
          {formatDate(
            payment?.createdAt ||
            payment?.created_at ||
            payment?.date
          )}
        </div>
      </td>

      <td>
        <div className="admin-payment-id">
          {paymentId
            ? `#${paymentId.slice(-8).toUpperCase()}`
            : "—"}
        </div>
      </td>

      <td>
        <div className="admin-payment-actions">
          {isUnpaid ? (
            <button
              type="button"
              className="admin-payment-delete-button"
              onClick={() => onDelete(payment)}
              disabled={Boolean(deletingId)}
              aria-label={`Delete payment for ${getPatientName(payment)}`}
              title="Delete unpaid payment"
            >
              {isDeleting ? (
                <i className="bx bx-loader-alt bx-spin" />
              ) : (
                <i className="bx bx-trash" />
              )}
            </button>
          ) : (
            <span className="admin-payment-no-action">
              <i className="bx bx-lock-alt" />
            </span>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

/* =========================================================
   MAIN ADMIN PAYMENTS
========================================================= */

const AdminPayments = () => {
  const [payments, setPayments] = useState(EMPTY_PAYMENTS);
  const [unpaidPayments, setUnpaidPayments] = useState(EMPTY_PAYMENTS);

  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  /* =======================================================
     LOAD ALL PAYMENTS
  ======================================================= */

  const loadPayments = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");
    setNotice("");

    try {
      const [allResponse, unpaidResponse] = await Promise.all([
        getAllPayments(),
        getUnpaidPayments(),
      ]);

      setPayments(normalizePaymentsResponse(allResponse));
      setUnpaidPayments(normalizePaymentsResponse(unpaidResponse));
    } catch (err) {
      console.error("Admin Payments Error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPayments(true);
  }, [loadPayments]);

  /* =======================================================
     PAYMENT COUNTS
  ======================================================= */

  const stats = useMemo(() => {
    const paid = payments.filter(
      (payment) => payment?.status === "Paid"
    );

    const unpaid = payments.filter(
      (payment) =>
        ["Created", "Pending"].includes(payment?.status)
    );

    const totalAmount = paid.reduce(
      (total, payment) => total + (Number(payment?.amount) || 0),
      0
    );

    const unpaidAmount = unpaid.reduce(
      (total, payment) => total + (Number(payment?.amount) || 0),
      0
    );

    return {
      total: payments.length,
      paid: paid.length,
      unpaid: unpaid.length,
      totalAmount,
      unpaidAmount,
    };
  }, [payments]);

  /* =======================================================
     FILTER PAYMENTS
  ======================================================= */

  const visiblePayments = useMemo(() => {
    const source =
      activeTab === "unpaid"
        ? unpaidPayments
        : payments;

    const search = searchTerm.trim().toLowerCase();

    return source.filter((payment) => {
      const status = payment?.status || "Unknown";

      if (
        statusFilter !== "All" &&
        status !== statusFilter
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchableValues = [
        getPatientName(payment),
        getPatientEmail(payment),
        getDoctorName(payment),
        getDepartmentName(payment),
        getPaymentId(payment),
        payment?.razorpayOrderId,
        payment?.razorpayPaymentId,
        payment?.appointment?._id,
        payment?.appointment?.id,
      ];

      return searchableValues.some((value) =>
        String(value || "").toLowerCase().includes(search)
      );
    });
  }, [
    activeTab,
    payments,
    unpaidPayments,
    searchTerm,
    statusFilter,
  ]);

  /* =======================================================
     DELETE PAYMENT
  ======================================================= */

  const handleDelete = async () => {
    const paymentId = getPaymentId(selectedPayment);

    if (!paymentId || deletingId) {
      return;
    }

    setDeletingId(paymentId);
    setError("");
    setNotice("");

    try {
      await deleteUnpaidPayment(paymentId);

      setPayments((previous) =>
        previous.filter(
          (payment) => getPaymentId(payment) !== paymentId
        )
      );

      setUnpaidPayments((previous) =>
        previous.filter(
          (payment) => getPaymentId(payment) !== paymentId
        )
      );

      setSelectedPayment(null);

      setNotice("Unpaid payment deleted successfully.");
    } catch (err) {
      console.error("Delete Payment Error:", err);
      setError(getErrorMessage(err));
    } finally {
      setDeletingId("");
    }
  };

  /* =======================================================
     TAB CHANGE
  ======================================================= */

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStatusFilter("All");
    setSearchTerm("");
    setError("");
    setNotice("");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="admin-payments-page">
      <DashboardSidebar />

      <div className="admin-payments-main">
        <DashboardHeader />

        <main className="admin-payments-content">
          <div className="admin-payments-bg-orb admin-payments-orb-one" />
          <div className="admin-payments-bg-orb admin-payments-orb-two" />
          <div className="admin-payments-bg-grid" />

          <motion.div
            className="admin-payments-inner"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* PAGE INTRO */}

            <motion.section
              className="admin-payments-intro"
              variants={itemVariants}
            >
              <div className="admin-payments-heading">
                <span className="admin-payments-eyebrow">
                  <i className="bx bx-wallet" />
                  FINANCIAL MANAGEMENT
                </span>

                <h1>Payments</h1>

                <p>
                  Monitor payment transactions, review unpaid
                  orders and manage payment records.
                </p>
              </div>

              <motion.button
                type="button"
                className="admin-payments-refresh"
                onClick={() => loadPayments(false)}
                disabled={loading || refreshing}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <i
                  className={`bx bx-refresh ${
                    refreshing ? "bx-spin" : ""
                  }`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </motion.button>
            </motion.section>

            {/* ERROR */}

            <AnimatePresence>
              {error && (
                <motion.div
                  className="admin-payments-alert error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <i className="bx bx-error-circle" />

                  <span>{error}</span>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    aria-label="Dismiss error"
                  >
                    <i className="bx bx-x" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SUCCESS NOTICE */}

            <AnimatePresence>
              {notice && (
                <motion.div
                  className="admin-payments-alert success"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <i className="bx bx-check-circle" />

                  <span>{notice}</span>

                  <button
                    type="button"
                    onClick={() => setNotice("")}
                    aria-label="Dismiss message"
                  >
                    <i className="bx bx-x" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STATS */}

            <section className="admin-payment-stat-grid">
              <PaymentStatCard
                title="Total Payments"
                value={stats.total.toLocaleString("en-IN")}
                description="All payment records"
                icon="bx-wallet"
                variant="total"
                loading={loading}
              />

              <PaymentStatCard
                title="Successful Payments"
                value={stats.paid.toLocaleString("en-IN")}
                description="Payments marked as paid"
                icon="bx-check-circle"
                variant="paid"
                loading={loading}
              />

              <PaymentStatCard
                title="Unpaid Payments"
                value={stats.unpaid.toLocaleString("en-IN")}
                description="Created and pending orders"
                icon="bx-time-five"
                variant="unpaid"
                loading={loading}
              />

              <PaymentStatCard
                title="Collected Revenue"
                value={formatCurrency(stats.totalAmount)}
                description="Successful payments only"
                icon="bx-trending-up"
                variant="revenue"
                loading={loading}
              />
            </section>

            {/* PAYMENT MANAGEMENT */}

            <motion.section
              className="admin-payment-panel"
              variants={itemVariants}
            >
              <div className="admin-payment-panel-header">
                <div>
                  <span className="admin-payment-panel-eyebrow">
                    TRANSACTION CENTER
                  </span>

                  <h2>Payment Records</h2>

                  <p>
                    View transactions and manage unpaid payment
                    records.
                  </p>
                </div>

                <div className="admin-payment-panel-icon">
                  <i className="bx bx-transfer-alt" />
                </div>
              </div>

              {/* TABS */}

              <div className="admin-payment-tabs">
                {TABS.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    className={`admin-payment-tab ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <i className={`bx ${tab.icon}`} />
                    <span>{tab.label}</span>

                    {tab.id === "unpaid" && (
                      <span className="admin-payment-tab-count">
                        {unpaidPayments.length}
                      </span>
                    )}

                    {activeTab === tab.id && (
                      <motion.span
                        className="admin-payment-tab-indicator"
                        layoutId="admin-payment-tab-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* TOOLBAR */}

              <div className="admin-payment-toolbar">
                <div className="admin-payment-search">
                  <i className="bx bx-search" />

                  <input
                    type="search"
                    placeholder="Search patient, doctor, payment ID..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    aria-label="Search payments"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                    >
                      <i className="bx bx-x" />
                    </button>
                  )}
                </div>

                <label className="admin-payment-filter">
                  <i className="bx bx-filter-alt" />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    aria-label="Filter by payment status"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status === "All"
                          ? "All statuses"
                          : status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* TABLE SUMMARY */}

              <div className="admin-payment-table-summary">
                <span>
                  Showing{" "}
                  <strong>{visiblePayments.length}</strong>{" "}
                  of{" "}
                  <strong>
                    {activeTab === "unpaid"
                      ? unpaidPayments.length
                      : payments.length}
                  </strong>{" "}
                  payments
                </span>

                {activeTab === "unpaid" && (
                  <span className="admin-payment-unpaid-hint">
                    <i className="bx bx-info-circle" />
                    Only Created and Pending records can be deleted.
                  </span>
                )}
              </div>

              {/* TABLE */}

              <div className="admin-payment-table-wrap">
                <table className="admin-payment-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor / Department</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Payment ID</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7">
                          <div className="admin-payment-loading">
                            <i className="bx bx-loader-alt bx-spin" />
                            <span>Loading payment records...</span>
                          </div>
                        </td>
                      </tr>
                    ) : visiblePayments.length > 0 ? (
                      <AnimatePresence mode="popLayout">
                        {visiblePayments.map((payment, index) => (
                          <PaymentRow
                            key={
                              getPaymentId(payment) ||
                              `${payment?.razorpayOrderId || "payment"}-${index}`
                            }
                            payment={payment}
                            index={index}
                            onDelete={setSelectedPayment}
                            deletingId={deletingId}
                          />
                        ))}
                      </AnimatePresence>
                    ) : (
                      <tr>
                        <td colSpan="7">
                          <EmptyState
                            icon={
                              searchTerm
                                ? "bx-search-alt"
                                : activeTab === "unpaid"
                                  ? "bx-check-shield"
                                  : "bx-wallet"
                            }
                            title={
                              searchTerm
                                ? "No matching payments"
                                : activeTab === "unpaid"
                                  ? "No unpaid payments"
                                  : "No payment records"
                            }
                            description={
                              searchTerm
                                ? "Try another search term or change the status filter."
                                : activeTab === "unpaid"
                                  ? "There are currently no Created or Pending payments."
                                  : "Payment records will appear here when available."
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}

              <div className="admin-payment-panel-footer">
                <div className="admin-payment-footer-status">
                  <span className="admin-payment-footer-dot" />
                  <span>Payment data from hospital server</span>
                </div>

                <span>
                  {activeTab === "unpaid"
                    ? `${unpaidPayments.length} unpaid`
                    : `${payments.length} total records`}
                </span>
              </div>
            </motion.section>

            {/* SECURITY NOTE */}

            <motion.div
              className="admin-payment-security-note"
              variants={itemVariants}
            >
              <span className="admin-payment-security-icon">
                <i className="bx bx-shield-check" />
              </span>

              <div>
                <strong>Payment security</strong>
                <p>
                  Paid payments are protected from deletion in
                  this interface. Only unpaid records show the
                  delete action.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* DELETE MODAL */}

      <AnimatePresence>
        {selectedPayment && (
          <DeleteConfirmation
            payment={selectedPayment}
            deleting={Boolean(deletingId)}
            onCancel={() => {
              if (!deletingId) {
                setSelectedPayment(null);
              }
            }}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPayments;