import apiFetch from "./api";

// ======================================================
// PATIENT
// Get available doctors by department
// ======================================================
export const getAvailableDoctors = async (departmentName) => {
  if (!departmentName) {
    throw new Error("Department name is required");
  }

  return apiFetch(
    `/doctors/available?department=${encodeURIComponent(departmentName)}`,
    {
      method: "GET",
    }
  );
};

// ======================================================
// ADMIN
// Get all doctors
// ======================================================
export const getAllDoctors = async () => {
  return apiFetch("/doctors", {
    method: "GET",
  });
};

// ======================================================
// ADMIN
// Get doctor by ID
// ======================================================
export const getDoctorById = async (doctorId) => {
  if (!doctorId) {
    throw new Error("Doctor ID is required");
  }

  return apiFetch(`/doctors/${doctorId}`, {
    method: "GET",
  });
};

// ======================================================
// ADMIN
// Create doctor
// ======================================================
export const createDoctor = async (doctorData) => {
  return apiFetch("/doctors", {
    method: "POST",
    body: JSON.stringify(doctorData),
  });
};

// ======================================================
// ADMIN
// Update doctor
// ======================================================
export const updateDoctor = async (doctorId, doctorData) => {
  if (!doctorId) {
    throw new Error("Doctor ID is required");
  }

  return apiFetch(`/doctors/${doctorId}`, {
    method: "PUT",
    body: JSON.stringify(doctorData),
  });
};

// ======================================================
// ADMIN
// Activate / Deactivate doctor
// ======================================================
export const updateDoctorStatus = async (doctorId, isActive) => {
  if (!doctorId) {
    throw new Error("Doctor ID is required");
  }

  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be a boolean");
  }

  return apiFetch(`/doctors/${doctorId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      isActive,
    }),
  });
};

// ======================================================
// Default service object
// ======================================================
const doctorService = {
  getAvailableDoctors,
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  updateDoctorStatus,
};

export default doctorService;