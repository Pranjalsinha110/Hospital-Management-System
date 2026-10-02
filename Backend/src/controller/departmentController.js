const Department = require("../models/Department");



const createDepartment = async (req, res) => {
    try {
        const {
            name,
            description
        } = req.body;

        // Required field validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Department name is required",
                data: null
            });
        }

        // Check duplicate department
        const existingDepartment = await Department.findOne({
            name: name.trim()
        });

        if (existingDepartment) {
            return res.status(409).json({
                success: false,
                message: "Department already exists",
                data: null
            });
        }

        // Create department
        const department = await Department.create({
            name: name.trim(),
            description: description?.trim() || ""
        });

        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department
        });

    } catch (error) {
        console.error(
            "Create Department Error:",
            error.message
        );

        // Duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Department already exists",
                data: null
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create department",
            data: null
        });
    }
};


// =====================================================
// GET ALL DEPARTMENTS
// =====================================================

const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Departments fetched successfully",
            data: departments
        });

    } catch (error) {
        console.error(
            "Get All Departments Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch departments",
            data: null
        });
    }
};


// =====================================================
// GET DEPARTMENT BY ID
// =====================================================

const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Department fetched successfully",
            data: department
        });

    } catch (error) {
        console.error(
            "Get Department By ID Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch department",
            data: null
        });
    }
};


// =====================================================
// UPDATE DEPARTMENT
// =====================================================

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            description
        } = req.body;

        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
                data: null
            });
        }

        // Update department name
        if (name !== undefined) {

            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Department name cannot be empty",
                    data: null
                });
            }

            // Check duplicate name
            const existingDepartment = await Department.findOne({
                name: name.trim(),
                _id: { $ne: id }
            });

            if (existingDepartment) {
                return res.status(409).json({
                    success: false,
                    message: "Department with this name already exists",
                    data: null
                });
            }

            department.name = name.trim();
        }

        // Update description
        if (description !== undefined) {
            department.description = description.trim();
        }

        await department.save();

        return res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: department
        });

    } catch (error) {
        console.error(
            "Update Department Error:",
            error.message
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Department already exists",
                data: null
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update department",
            data: null
        });
    }
};


// =====================================================
// UPDATE DEPARTMENT STATUS
// =====================================================

const updateDepartmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Validate status
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean value",
                data: null
            });
        }

        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
                data: null
            });
        }

        // Update status
        department.isActive = isActive;

        await department.save();

        return res.status(200).json({
            success: true,
            message: isActive
                ? "Department activated successfully"
                : "Department deactivated successfully",
            data: department
        });

    } catch (error) {
        console.error(
            "Update Department Status Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update department status",
            data: null
        });
    }
};


module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    updateDepartmentStatus
};