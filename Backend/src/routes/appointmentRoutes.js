const express = require("express");

const {
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAppointmentById,
    getAllAppointments,
    cancelAppointment
} = require("../controller/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =========================================================
// PATIENT
// =========================================================

// Create appointment
router.post(
    "/",
    authMiddleware,
    createAppointment 
);


// Get logged-in patient's appointments
router.get(
    "/my",
    authMiddleware,
    getMyAppointments
);

router.patch(
    "/:id/cancel",
    authMiddleware,
    cancelAppointment
);
// =========================================================
// DOCTOR
// =========================================================

// Get logged-in doctor's appointments
router.get(
    "/doctor",
    authMiddleware,
    getDoctorAppointments
);


// =========================================================
// ADMIN
// =========================================================

// Get specific appointment by ID
router.get(
    "/:id",
    authMiddleware,
    getAppointmentById
);

router.get(
    "/",
    authMiddleware,
    getAllAppointments
);

module.exports = router;