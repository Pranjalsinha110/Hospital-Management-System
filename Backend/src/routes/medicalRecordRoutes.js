const express = require("express");

const {
    createMedicalRecord,
    getMedicalRecordById,
    getMyMedicalRecords,
    getDoctorMedicalRecords,
    updateMedicalRecord
} = require("../controller/medicalRecordController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// =========================================================
// PATIENT
// =========================================================

// Get logged-in patient's complete medical history
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("patient"),
    getMyMedicalRecords
);


// =========================================================
// DOCTOR
// =========================================================

// Create medical record
router.post(
    "/",
    authMiddleware,
    roleMiddleware("doctor"),
    createMedicalRecord
);

// Get logged-in doctor's medical records
router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware("doctor"),
    getDoctorMedicalRecords
);

// Update medical record
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("doctor"),
    updateMedicalRecord
);


// =========================================================
// SHARED
// =========================================================

// Get a specific medical record
router.get(
    "/:id",
    authMiddleware,
    getMedicalRecordById
);


module.exports = router;