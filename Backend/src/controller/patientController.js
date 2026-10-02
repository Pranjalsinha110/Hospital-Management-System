const mongoose = require("mongoose");

const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// =========================================================
// COMMON RESPONSE HELPERS
// =========================================================

const successResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null
    });
};

// =========================================================
// CREATE PATIENT PROFILE
// =========================================================

const createPatient = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const {
            user,
            dateOfBirth,
            gender,
            bloodGroup,
            medicalHistory,
            allergies,
            existingConditions,
            emergencyContact
        } = req.body;

        if (!user) {
            await session.abortTransaction();
            return errorResponse(res, 400, "User ID is required");
        }

        if (!mongoose.Types.ObjectId.isValid(user)) {
            await session.abortTransaction();
            return errorResponse(res, 400, "Invalid user ID");
        }

        const userData = await User.findById(user).session(session);

        if (!userData) {
            await session.abortTransaction();
            return errorResponse(res, 404, "User not found");
        }

        if (userData.role !== "patient") {
            await session.abortTransaction();
            return errorResponse(res, 400, "User must have patient role");
        }

        const existingPatient = await Patient.findOne({
            user
        }).session(session);

        if (existingPatient) {
            await session.abortTransaction();
            return errorResponse(
                res,
                409,
                "Patient profile already exists"
            );
        }

        const patient = new Patient({
            user,
            dateOfBirth,
            gender,
            bloodGroup,
            medicalHistory,
            allergies,
            existingConditions,
            emergencyContact
        });

        await patient.save({ session });
        await session.commitTransaction();

        return successResponse(
            res,
            201,
            "Patient profile created successfully",
            {
                patient: {
                    id: patient._id,
                    user: patient.user,
                    dateOfBirth: patient.dateOfBirth,
                    gender: patient.gender,
                    bloodGroup: patient.bloodGroup,
                    medicalHistory: patient.medicalHistory,
                    allergies: patient.allergies,
                    existingConditions: patient.existingConditions,
                    emergencyContact: patient.emergencyContact
                }
            }
        );
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Create Patient Error:", error);

        if (error.code === 11000) {
            return errorResponse(
                res,
                409,
                "Patient profile already exists"
            );
        }

        if (error.name === "ValidationError") {
            return errorResponse(
                res,
                400,
                "Invalid patient profile data"
            );
        }

        return errorResponse(
            res,
            500,
            "Failed to create patient profile"
        );
    } finally {
        await session.endSession();
    }
};

// =========================================================
// GET ALL PATIENTS
// =========================================================

const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find()
            .populate("user", "name email phone role isActive")
            .sort({ createdAt: -1 });

        return successResponse(
            res,
            200,
            "Patients fetched successfully",
            patients
        );
    } catch (error) {
        console.error("Get All Patients Error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch patients"
        );
    }
};

// =========================================================
// GET PATIENT BY ID
// =========================================================

const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID before querying MongoDB
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(
                res,
                400,
                "Invalid patient ID"
            );
        }

        const patient = await Patient.findById(id)
            .populate("user", "name email phone role isActive");

        if (!patient) {
            return errorResponse(
                res,
                404,
                "Patient not found"
            );
        }

        return successResponse(
            res,
            200,
            "Patient fetched successfully",
            patient
        );
    } catch (error) {
        console.error("Get Patient By ID Error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch patient"
        );
    }
};

// =========================================================
// GET MY PATIENT PROFILE
// =========================================================

const getMyPatientProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return errorResponse(
                res,
                401,
                "Invalid authenticated user"
            );
        }

        const patient = await Patient.findOne({
            user: userId
        }).populate("user", "name email phone role isActive");

        if (!patient) {
            return errorResponse(
                res,
                404,
                "Patient profile not found"
            );
        }

        return successResponse(
            res,
            200,
            "Patient profile fetched successfully",
            patient
        );
    } catch (error) {
        console.error("Get My Patient Profile Error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch patient profile"
        );
    }
};

// =========================================================
// UPDATE MY PATIENT PROFILE
// =========================================================

const updatePatient = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const userId = req.user.userId;

        if (req.user.role !== "patient") {
            await session.abortTransaction();
            return errorResponse(
                res,
                403,
                "Only patients can update their own profile"
            );
        }

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            await session.abortTransaction();
            return errorResponse(
                res,
                401,
                "Invalid authenticated user"
            );
        }

        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            await session.abortTransaction();
            return errorResponse(res, 400, "Invalid request body");
        }

        const allowedFields = [
            "dateOfBirth",
            "gender",
            "bloodGroup",
            "medicalHistory",
            "allergies",
            "existingConditions",
            "emergencyContact"
        ];

        const unknownFields = Object.keys(req.body).filter(
            field => !allowedFields.includes(field)
        );

        if (unknownFields.length > 0) {
            await session.abortTransaction();
            return errorResponse(
                res,
                400,
                "Request contains unsupported fields"
            );
        }

        const patient = await Patient.findOne({
            user: userId
        }).session(session);

        if (!patient) {
            await session.abortTransaction();
            return errorResponse(
                res,
                404,
                "Patient profile not found"
            );
        }

        const {
            dateOfBirth,
            gender,
            bloodGroup,
            medicalHistory,
            allergies,
            existingConditions,
            emergencyContact
        } = req.body;

        if (dateOfBirth !== undefined) {
            patient.dateOfBirth = dateOfBirth;
        }

        if (gender !== undefined) {
            patient.gender = gender;
        }

        if (bloodGroup !== undefined) {
            patient.bloodGroup = bloodGroup;
        }

        if (medicalHistory !== undefined) {
            patient.medicalHistory = medicalHistory;
        }

        if (allergies !== undefined) {
            patient.allergies = allergies;
        }

        if (existingConditions !== undefined) {
            patient.existingConditions = existingConditions;
        }

        if (emergencyContact !== undefined) {
            if (
                !emergencyContact ||
                typeof emergencyContact !== "object" ||
                Array.isArray(emergencyContact)
            ) {
                await session.abortTransaction();
                return errorResponse(
                    res,
                    400,
                    "Invalid emergency contact"
                );
            }

            if (emergencyContact.name !== undefined) {
                patient.emergencyContact.name =
                    emergencyContact.name;
            }

            if (emergencyContact.phone !== undefined) {
                patient.emergencyContact.phone =
                    emergencyContact.phone;
            }

            if (emergencyContact.relation !== undefined) {
                patient.emergencyContact.relation =
                    emergencyContact.relation;
            }
        }

        await patient.save({ session });
        await session.commitTransaction();

        return successResponse(
            res,
            200,
            "Patient profile updated successfully",
            patient
        );
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Update Patient Error:", error);

        if (error.name === "ValidationError") {
            return errorResponse(
                res,
                400,
                "Invalid patient profile data"
            );
        }

        return errorResponse(
            res,
            500,
            "Failed to update patient profile"
        );
    } finally {
        await session.endSession();
    }
};

// =========================================================
// GET DOCTOR'S OWN PATIENTS
// DOCTOR ONLY
// =========================================================

const getDoctorPatients = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Authentication and role validation
        if (req.user.role !== "doctor") {
            return errorResponse(
                res,
                403,
                "Only doctors can access their patients"
            );
        }

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return errorResponse(
                res,
                401,
                "Invalid authenticated user"
            );
        }

        // Verify doctor account
        const user = await User.findById(userId)
            .select("_id role isActive");

        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        if (!user.isActive) {
            return errorResponse(
                res,
                403,
                "Doctor account is inactive"
            );
        }

        // Find the doctor's profile
        const doctor = await Doctor.findOne({
            user: userId
        }).select("_id user");

        if (!doctor) {
            return errorResponse(
                res,
                404,
                "Doctor profile not found"
            );
        }

        // Find patients linked to this doctor's appointments
        const appointments = await Appointment.find({
            doctor: doctor._id,
            patient: { $ne: null }
        }).select("patient");

        // Extract unique, valid patient IDs
        const patientIds = [
            ...new Set(
                appointments
                    .map(appointment => appointment.patient)
                    .filter(patientId =>
                        patientId &&
                        mongoose.Types.ObjectId.isValid(patientId)
                    )
                    .map(patientId => patientId.toString())
            )
        ];

        // No appointments means no patients
        if (patientIds.length === 0) {
            return successResponse(
                res,
                200,
                "Doctor's patients fetched successfully",
                []
            );
        }

        // Fetch only patients connected to this doctor
        const patients = await Patient.find({
            _id: { $in: patientIds }
        })
            .populate("user", "name email phone role isActive")
            .sort({ createdAt: -1 });

        return successResponse(
            res,
            200,
            "Doctor's patients fetched successfully",
            patients
        );
    } catch (error) {
        console.error("Get Doctor Patients Error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch doctor's patients"
        );
    }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    getMyPatientProfile,
    updatePatient,
    getDoctorPatients
};