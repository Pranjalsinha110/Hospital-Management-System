import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  createPaymentOrder,
  verifyPayment,
} from "../../services/paymentService";
import "./Payment.css";

const Payment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentOpening, setPaymentOpening] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    let isMounted = true;

    const preparePayment = async () => {
      try {
        setLoading(true);
        setError("");
        setInfo("");

        if (!appointmentId) {
          throw new Error("Appointment ID is missing.");
        }

        const response = await createPaymentOrder(appointmentId);

        if (!response?.success || !response?.data?.payment) {
          throw new Error(
            response?.message || "Unable to prepare payment."
          );
        }

        if (isMounted) {
          setPayment(response.data.payment);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.message ||
              "Payment order could not be created. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    preparePayment();

    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  const handlePayment = () => {
    if (!payment) {
      setError("Payment details are unavailable.");
      return;
    }

    if (!window.Razorpay) {
      setError(
        "Razorpay checkout is not loaded. Please refresh the page and try again."
      );
      return;
    }

    const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
    console.log("Razorpay Key:", razorpayKey);

    if (!razorpayKey) {
      setError("Razorpay key is missing from frontend environment settings.");
      return;
    }

    setPaymentOpening(true);
    setError("");
    setInfo("");

    const options = {
      key: razorpayKey,

      amount: Number(payment.amount),

      currency: payment.currency || "INR",

      name: "Hospital Management System",

      description: "Doctor Appointment Consultation Fee",

      order_id: payment.razorpayOrderId,

      handler: async (razorpayResponse) => {
        try {
          setInfo("Payment received. Verifying payment securely...");
          setError("");

          const verificationResponse = await verifyPayment({
            appointmentId,

            razorpayOrderId: razorpayResponse.razorpay_order_id,

            razorpayPaymentId: razorpayResponse.razorpay_payment_id,

            razorpaySignature: razorpayResponse.razorpay_signature,
          });

          if (!verificationResponse?.success) {
            throw new Error(
              verificationResponse?.message ||
                "Payment verification failed."
            );
          }

          navigate("/patient/appointments", {
            replace: true,
            state: {
              paymentSuccess: true,
              message:
                "Payment successful. Your appointment is now confirmed.",
            },
          });
        } catch (err) {
          setPaymentOpening(false);
          setInfo("");
          setError(
            err?.message ||
              "Payment verification failed. Please contact support if money was deducted."
          );
        }
      },

      prefill: {
        name: "",
        email: "",
        contact: "",
      },

      notes: {
        appointmentId,
      },

      theme: {
        color: "#2563eb",
      },

      modal: {
        ondismiss: () => {
          setPaymentOpening(false);
          setInfo("");
        },
      },
    };

    const razorpayCheckout = new window.Razorpay(options);

    razorpayCheckout.on("payment.failed", (response) => {
      setPaymentOpening(false);
      setInfo("");

      setError(
        response?.error?.description ||
          "Payment failed. Please try again."
      );
    });

    razorpayCheckout.open();
  };

  const handleBack = () => {
    if (!paymentOpening) {
      navigate("/patient/appointments");
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <motion.div
          className="payment-card payment-loading-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="payment-loading-icon">
            <i className="bx bx-loader-circle bx-spin"></i>
          </div>

          <h2>Preparing Your Payment</h2>

          <p>
            Please wait while we securely prepare your appointment payment.
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="payment-page">
        <motion.div
          className="payment-card payment-error-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="payment-error-icon">
            <i className="bx bx-error-circle"></i>
          </div>

          <h2>Payment Preparation Failed</h2>

          <p>{error}</p>

          <div className="payment-actions">
            <button
              type="button"
              className="payment-primary-btn"
              onClick={() => window.location.reload()}
            >
              <i className="bx bx-refresh"></i>
              Try Again
            </button>

            <button
              type="button"
              className="payment-secondary-btn"
              onClick={() => navigate("/patient/appointments")}
            >
              Back to Appointments
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <motion.div
        className="payment-wrapper"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="payment-header">
          <div className="payment-brand-icon">
            <i className="bx bx-shield-quarter"></i>
          </div>

          <div>
            <p className="payment-eyebrow">Secure Checkout</p>
            <h1>Complete Your Payment</h1>
            <p className="payment-subtitle">
              Confirm your doctor appointment with a secure online payment.
            </p>
          </div>
        </div>

        <div className="payment-layout">
          <section className="payment-card payment-main-card">
            <div className="payment-card-top">
              <div>
                <p className="payment-section-label">Payment Summary</p>
                <h2>Appointment Payment</h2>
              </div>

              <span className="payment-pending-badge">
                <i className="bx bx-time-five"></i>
                Pending
              </span>
            </div>

            {error && (
              <div className="payment-alert payment-alert-error">
                <i className="bx bx-error-circle"></i>
                <span>{error}</span>
              </div>
            )}

            {info && (
              <div className="payment-alert payment-alert-info">
                <i className="bx bx-loader-circle bx-spin"></i>
                <span>{info}</span>
              </div>
            )}

            <div className="payment-amount-box">
              <span>Total Amount</span>

              <strong>
                ₹{(Number(payment?.amount || 0) / 100).toFixed(2)}
              </strong>

              <small>Inclusive of consultation fee</small>
            </div>

            <div className="payment-details">
              <div className="payment-detail-row">
                <span>
                  <i className="bx bx-receipt"></i>
                  Appointment ID
                </span>

                <strong title={appointmentId}>
                  {appointmentId}
                </strong>
              </div>

              <div className="payment-detail-row">
                <span>
                  <i className="bx bx-wallet"></i>
                  Currency
                </span>

                <strong>{payment?.currency || "INR"}</strong>
              </div>

              <div className="payment-detail-row">
                <span>
                  <i className="bx bx-check-shield"></i>
                  Payment Provider
                </span>

                <strong>Razorpay</strong>
              </div>
            </div>

            <button
              type="button"
              className="payment-primary-btn payment-pay-btn"
              onClick={handlePayment}
              disabled={paymentOpening || !payment}
            >
              {paymentOpening ? (
                <>
                  <i className="bx bx-loader-circle bx-spin"></i>
                  Processing...
                </>
              ) : (
                <>
                  Pay ₹{(Number(payment?.amount || 0) / 100).toFixed(2)}
                  <i className="bx bx-right-arrow-alt"></i>
                </>
              )}
            </button>

            <button
              type="button"
              className="payment-secondary-btn payment-back-btn"
              onClick={handleBack}
              disabled={paymentOpening}
            >
              <i className="bx bx-arrow-back"></i>
              Back to Appointments
            </button>

            <p className="payment-security-note">
              <i className="bx bx-lock-alt"></i>
              Your payment is securely processed by Razorpay.
            </p>
          </section>

          <aside className="payment-card payment-info-card">
            <div className="payment-info-icon">
              <i className="bx bx-shield-check"></i>
            </div>

            <h2>Safe & Secure Payment</h2>

            <p>
              Complete your payment to confirm your appointment with the
              selected doctor.
            </p>

            <ul>
              <li>
                <i className="bx bx-check-circle"></i>
                Secure Razorpay checkout
              </li>

              <li>
                <i className="bx bx-check-circle"></i>
                Payment verification by hospital server
              </li>

              <li>
                <i className="bx bx-check-circle"></i>
                Appointment confirmation after successful payment
              </li>

              <li>
                <i className="bx bx-check-circle"></i>
                Email notifications after confirmation
              </li>
            </ul>

            <div className="payment-info-footer">
              <i className="bx bx-info-circle"></i>
              <span>
                Do not refresh or close the page while payment verification is
                in progress.
              </span>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
};

export default Payment;