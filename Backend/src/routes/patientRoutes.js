const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    getDoctorPatients,
} = require("../controller/patientController");

const router = express.Router();

// Create Patient Profile
router.post("/", createPatient);

// Get All Patients
router.get("/", getAllPatients);

// Get logged-in doctor's patients
// IMPORTANT: Keep this route before /:id
router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware("doctor"),
    getDoctorPatients
);

// Update Logged-in Patient Profile
router.put(
    "/me",
    authMiddleware,
    updatePatient
);

// Get Patient By ID
// Keep dynamic route at the end
router.get("/:id", getPatientById);

module.exports = router;