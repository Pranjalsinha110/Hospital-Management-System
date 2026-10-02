import apiFetch from "./api";

// ==========================================
// PATIENT: GET MY MEDICAL RECORDS
// ==========================================
export const getMyMedicalRecords = async () => {
  return apiFetch("/medical-records/my", {
    method: "GET",
  });
};

// ==========================================
// DOCTOR: GET ALL MY MEDICAL RECORDS
// ==========================================
export const getDoctorMedicalRecords = async () => {
  return apiFetch("/medical-records/doctor", {
    method: "GET",
  });
};

// ==========================================
// GET MEDICAL RECORD BY ID
// ==========================================
export const getMedicalRecordById = async (recordId) => {
  if (!recordId) {
    throw new Error("Medical Record ID is required");
  }

  return apiFetch(`/medical-records/${recordId}`, {
    method: "GET",
  });
};

// ==========================================
// DOCTOR: CREATE MEDICAL RECORD
// ==========================================
export const createMedicalRecord = async (recordData) => {
  if (!recordData?.appointmentId) {
    throw new Error("Appointment ID is required");
  }

  return apiFetch("/medical-records", {
    method: "POST",
    body: JSON.stringify({
      appointmentId: recordData.appointmentId,
      symptoms: recordData.symptoms ?? "",
      diagnosis: recordData.diagnosis ?? "",
      doctorNotes: recordData.doctorNotes ?? "",
      treatment: recordData.treatment ?? "",
      followUpDate: recordData.followUpDate ?? null,
    }),
  });
};

// ==========================================
// DOCTOR: UPDATE MEDICAL RECORD
// ==========================================
export const updateMedicalRecord = async (recordId, recordData) => {
  if (!recordId) {
    throw new Error("Medical Record ID is required");
  }

  return apiFetch(`/medical-records/${recordId}`, {
    method: "PUT",
    body: JSON.stringify({
      symptoms: recordData.symptoms ?? "",
      diagnosis: recordData.diagnosis ?? "",
      doctorNotes: recordData.doctorNotes ?? "",
      treatment: recordData.treatment ?? "",
      followUpDate: recordData.followUpDate ?? null,
    }),
  });
};

// ==========================================
// DEFAULT EXPORT
// ==========================================
const medicalRecordService = {
  getMyMedicalRecords,
  getDoctorMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
};

export default medicalRecordService;