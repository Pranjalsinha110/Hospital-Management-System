import apiFetch from "./api";

// Patient: Create Razorpay payment order
export const createPaymentOrder = async (appointmentId) => {
  return apiFetch("/payments/create-order", {
    method: "POST",
    body: JSON.stringify({
      appointmentId,
    }),
  });
};

// Patient: Verify Razorpay payment
export const verifyPayment = async (paymentData) => {
  return apiFetch("/payments/verify", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
};

// Admin: Get all payments
export const getAllPayments = async () => {
  return apiFetch("/payments", {
    method: "GET",
  });
};

// Admin: Get all unpaid payments
export const getUnpaidPayments = async () => {
  return apiFetch("/payments/unpaid", {
    method: "GET",
  });
};

// Admin: Delete an unpaid payment
export const deleteUnpaidPayment = async (paymentId) => {
  return apiFetch(`/payments/${paymentId}`, {
    method: "DELETE",
  });
};