import apiFetch from "./api";

// =====================================================
// CREATE APPOINTMENT - PATIENT
// POST /appointments
// =====================================================

export const createAppointment = async (appointmentData) => {
  return apiFetch("/appointments", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  });
};

// =====================================================
// GET MY APPOINTMENTS - PATIENT
// GET /appointments/my
// =====================================================

export const getMyAppointments = async () => {
  return apiFetch("/appointments/my", {
    method: "GET",
  });
};

// =====================================================
// GET DOCTOR APPOINTMENTS
// GET /appointments/doctor
// =====================================================

export const getDoctorAppointments = async () => {
  return apiFetch("/appointments/doctor", {
    method: "GET",
  });
};

// =====================================================
// GET ALL APPOINTMENTS - ADMIN
// GET /appointments
// =====================================================

export const getAllAppointments = async () => {
  return apiFetch("/appointments", {
    method: "GET",
  });
};

// =====================================================
// GET APPOINTMENT BY ID - ADMIN
// GET /appointments/:id
// =====================================================

export const getAppointmentById = async (appointmentId) => {
  if (!appointmentId) {
    throw new Error("Appointment ID is required");
  }

  return apiFetch(`/appointments/${appointmentId}`, {
    method: "GET",
  });
};

// =====================================================
// CANCEL APPOINTMENT - PATIENT / ADMIN
// PATCH /appointments/:id/cancel
// =====================================================

export const cancelAppointment = async (appointmentId) => {
  if (!appointmentId) {
    throw new Error("Appointment ID is required");
  }

  return apiFetch(`/appointments/${appointmentId}/cancel`, {
    method: "PATCH",
  });
};