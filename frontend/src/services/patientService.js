import apiFetch from "./api";

// =========================================================
// CREATE PATIENT PROFILE
// =========================================================
export const createPatient = async (patientData) => {
    return await apiFetch("/patients", {
        method: "POST",
        body: JSON.stringify(patientData),
    });
};

// =========================================================
// GET ALL PATIENTS (ADMIN)
// =========================================================
export const getAllPatients = async () => {
    return await apiFetch("/patients", {
        method: "GET",
    });
};

// =========================================================
// GET PATIENT BY ID
// =========================================================
export const getPatientById = async (patientId) => {
    if (!patientId) {
        throw new Error("Patient ID is required");
    }

    return await apiFetch(`/patients/${patientId}`, {
        method: "GET",
    });
};

// =========================================================
// GET LOGGED-IN DOCTOR'S PATIENTS
// =========================================================
export const getDoctorPatients = async () => {
    return await apiFetch("/patients/doctor", {
        method: "GET",
    });
};

// =========================================================
// UPDATE MY PATIENT PROFILE
// =========================================================
export const updateMyPatient = async (patientData) => {
    return await apiFetch("/patients/me", {
        method: "PUT",
        body: JSON.stringify(patientData),
    });
};

// =========================================================
// PATIENT SERVICE
// =========================================================
const patientService = {
    createPatient,
    getAllPatients,
    getPatientById,
    getDoctorPatients,
    updateMyPatient,
};

export default patientService;