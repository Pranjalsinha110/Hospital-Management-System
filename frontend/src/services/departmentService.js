import apiFetch from "./api";

// =====================================================
// GET ALL DEPARTMENTS
// =====================================================

export const getAllDepartments = async () => {
    return apiFetch("/departments", {
        method: "GET",
    });
};


// =====================================================
// GET DEPARTMENT BY ID
// =====================================================

export const getDepartmentById = async (departmentId) => {
    if (!departmentId) {
        throw new Error("Department ID is required");
    }

    return apiFetch(`/departments/${departmentId}`, {
        method: "GET",
    });
};


// =====================================================
// CREATE DEPARTMENT
// =====================================================

export const createDepartment = async (departmentData) => {
    if (!departmentData?.name?.trim()) {
        throw new Error("Department name is required");
    }

    return apiFetch("/departments", {
        method: "POST",
        body: JSON.stringify({
            name: departmentData.name.trim(),
            description: departmentData.description?.trim() || "",
        }),
    });
};


// =====================================================
// UPDATE DEPARTMENT
// =====================================================

export const updateDepartment = async (departmentId, departmentData) => {
    if (!departmentId) {
        throw new Error("Department ID is required");
    }

    return apiFetch(`/departments/${departmentId}`, {
        method: "PUT",
        body: JSON.stringify({
            name: departmentData.name?.trim(),
            description: departmentData.description?.trim() || "",
        }),
    });
};


// =====================================================
// UPDATE DEPARTMENT STATUS
// =====================================================

export const updateDepartmentStatus = async (departmentId, isActive) => {
    if (!departmentId) {
        throw new Error("Department ID is required");
    }

    if (typeof isActive !== "boolean") {
        throw new Error("isActive must be a boolean value");
    }

    return apiFetch(`/departments/${departmentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
            isActive,
        }),
    });
};