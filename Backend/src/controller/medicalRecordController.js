const mongoose = require("mongoose");

const MedicalRecord = require("../models/MedicalRecord");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const User = require("../models/User");


// =========================================================
// CONSTANTS
// =========================================================

const ALLOWED_CREATE_FIELDS = new Set([
    "appointmentId",
    "symptoms",
    "diagnosis",
    "doctorNotes",
    "treatment",
    "followUpDate"
]);

const ALLOWED_UPDATE_FIELDS = new Set([
    "symptoms",
    "diagnosis",
    "doctorNotes",
    "treatment",
    "followUpDate"
]);

const FIELD_LIMITS = {
    symptoms: 2000,
    diagnosis: 2000,
    doctorNotes: 5000,
    treatment: 5000
};


// =========================================================
// COMMON RESPONSE HELPERS
// =========================================================

const successResponse = (
    res,
    statusCode,
    message,
    data = null
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};


const errorResponse = (
    res,
    statusCode,
    message
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null
    });
};


// =========================================================
// VALIDATION HELPERS
// =========================================================

const hasUnknownFields = (body, allowedFields) => {
    return Object.keys(body || {}).some(
        field => !allowedFields.has(field)
    );
};


const validateStringField = (
    value,
    fieldName,
    maxLength
) => {
    if (typeof value !== "string") {
        return `${fieldName} must be a string`;
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length > maxLength) {
        return `${fieldName} cannot exceed ${maxLength} characters`;
    }

    return null;
};


const parseFollowUpDate = (value) => {
    // null / empty string means remove follow-up date
    if (value === null || value === "") {
        return {
            valid: true,
            date: null
        };
    }

    if (
        typeof value !== "string" &&
        !(value instanceof Date)
    ) {
        return {
            valid: false,
            date: null
        };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return {
            valid: false,
            date: null
        };
    }

    return {
        valid: true,
        date
    };
};


// =========================================================
// DOCTOR AUTHORIZATION HELPER
// =========================================================

const getActiveDoctor = async (userId) => {
    const user = await User.findById(userId)
        .select("_id role isActive");

    if (!user) {
        return {
            error: {
                status: 404,
                message: "User not found"
            }
        };
    }

    if (user.role !== "doctor") {
        return {
            error: {
                status: 403,
                message: "Only doctors can perform this action"
            }
        };
    }

    if (!user.isActive) {
        return {
            error: {
                status: 403,
                message: "Doctor account is inactive"
            }
        };
    }

    const doctor = await Doctor.findOne({
        user: userId
    }).select("_id user");

    if (!doctor) {
        return {
            error: {
                status: 404,
                message: "Doctor profile not found"
            }
        };
    }

    return {
        user,
        doctor
    };
};


// =========================================================
// PATIENT AUTHORIZATION HELPER
// =========================================================

const getActivePatient = async (userId) => {
    const user = await User.findById(userId)
        .select("_id role isActive");

    if (!user) {
        return {
            error: {
                status: 404,
                message: "User not found"
            }
        };
    }

    if (user.role !== "patient") {
        return {
            error: {
                status: 403,
                message: "Only patients can access their medical history"
            }
        };
    }

    if (!user.isActive) {
        return {
            error: {
                status: 403,
                message: "Patient account is inactive"
            }
        };
    }

    const patient = await Patient.findOne({
        user: userId
    }).select("_id user");

    if (!patient) {
        return {
            error: {
                status: 404,
                message: "Patient profile not found"
            }
        };
    }

    return {
        user,
        patient
    };
};


// =========================================================
// MEDICAL RECORD POPULATION
// =========================================================

const medicalRecordPopulate = (query) => {
    return query
        .populate({
            path: "patient",
            select: "user dateOfBirth gender bloodGroup",
            populate: {
                path: "user",
                select: "name email phone"
            }
        })
        .populate({
            path: "doctor",
            select:
                "user specialization qualification department profileImage",
            populate: {
                path: "user",
                select: "name email phone"
            }
        })
        .populate({
            path: "appointment",
            select:
                "patient doctor department appointmentDate appointmentTime reason consultationType status paymentStatus"
        });
};


// =========================================================
// CREATE MEDICAL RECORD
// DOCTOR ONLY
// =========================================================

const createMedicalRecord = async (req, res) => {
    try {
        const userId = req.user.userId;

        // -----------------------------------------------------
        // ROLE CHECK
        // -----------------------------------------------------

        if (req.user.role !== "doctor") {
            return errorResponse(
                res,
                403,
                "Only doctors can create medical records"
            );
        }


        // -----------------------------------------------------
        // BODY CHECK
        // -----------------------------------------------------

        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return errorResponse(
                res,
                400,
                "Invalid request body"
            );
        }


        // -----------------------------------------------------
        // UNKNOWN FIELD CHECK
        // -----------------------------------------------------

        if (
            hasUnknownFields(
                req.body,
                ALLOWED_CREATE_FIELDS
            )
        ) {
            return errorResponse(
                res,
                400,
                "Request contains unsupported fields"
            );
        }


        const {
            appointmentId,
            symptoms,
            diagnosis,
            doctorNotes,
            treatment,
            followUpDate
        } = req.body;


        // -----------------------------------------------------
        // APPOINTMENT ID
        // -----------------------------------------------------

        if (!appointmentId) {
            return errorResponse(
                res,
                400,
                "Appointment ID is required"
            );
        }

        if (
            typeof appointmentId !== "string" ||
            !mongoose.Types.ObjectId.isValid(appointmentId)
        ) {
            return errorResponse(
                res,
                400,
                "Invalid appointment ID"
            );
        }


        // -----------------------------------------------------
        // DOCTOR AUTHORIZATION
        // -----------------------------------------------------

        const doctorResult =
            await getActiveDoctor(userId);

        if (doctorResult.error) {
            return errorResponse(
                res,
                doctorResult.error.status,
                doctorResult.error.message
            );
        }

        const doctor = doctorResult.doctor;


        // -----------------------------------------------------
        // FIND APPOINTMENT
        // -----------------------------------------------------

        const appointment =
            await Appointment.findById(
                appointmentId
            ).select(
                "patient doctor department appointmentDate appointmentTime status paymentStatus"
            );

        if (!appointment) {
            return errorResponse(
                res,
                404,
                "Appointment not found"
            );
        }


        // -----------------------------------------------------
        // DOCTOR OWNERSHIP
        // -----------------------------------------------------

        if (
            !appointment.doctor ||
            appointment.doctor.toString() !==
                doctor._id.toString()
        ) {
            return errorResponse(
                res,
                403,
                "You are not authorized to create a medical record for this appointment"
            );
        }


        // -----------------------------------------------------
        // APPOINTMENT PATIENT VALIDATION
        // -----------------------------------------------------

        if (!appointment.patient) {
            return errorResponse(
                res,
                409,
                "Appointment is not linked to a valid patient"
            );
        }


        // -----------------------------------------------------
        // APPOINTMENT STATUS
        // -----------------------------------------------------

        if (appointment.status === "Cancelled") {
            return errorResponse(
                res,
                409,
                "Medical record cannot be created for a cancelled appointment"
            );
        }

        if (appointment.status === "Rejected") {
            return errorResponse(
                res,
                409,
                "Medical record cannot be created for a rejected appointment"
            );
        }

        if (appointment.status === "Pending") {
            return errorResponse(
                res,
                409,
                "Medical record can only be created after the appointment is confirmed"
            );
        }


        // -----------------------------------------------------
        // PAYMENT STATUS
        // -----------------------------------------------------

        if (appointment.paymentStatus !== "Paid") {
            return errorResponse(
                res,
                409,
                "Medical record cannot be created before appointment payment is completed"
            );
        }


        // -----------------------------------------------------
        // VERIFY PATIENT EXISTS
        // -----------------------------------------------------

        const patientExists =
            await Patient.exists({
                _id: appointment.patient
            });

        if (!patientExists) {
            return errorResponse(
                res,
                409,
                "Appointment patient profile no longer exists"
            );
        }


        // -----------------------------------------------------
        // DUPLICATE PRE-CHECK
        // -----------------------------------------------------

        const existingRecord =
            await MedicalRecord.findOne({
                appointment: appointment._id
            }).select("_id");

        if (existingRecord) {
            return errorResponse(
                res,
                409,
                "Medical record already exists for this appointment"
            );
        }


        // -----------------------------------------------------
        // STRING VALIDATION
        // -----------------------------------------------------

        const stringFields = [
            {
                value: symptoms,
                name: "Symptoms",
                max: FIELD_LIMITS.symptoms
            },
            {
                value: diagnosis,
                name: "Diagnosis",
                max: FIELD_LIMITS.diagnosis
            },
            {
                value: doctorNotes,
                name: "Doctor notes",
                max: FIELD_LIMITS.doctorNotes
            },
            {
                value: treatment,
                name: "Treatment",
                max: FIELD_LIMITS.treatment
            }
        ];

        for (const field of stringFields) {
            if (field.value !== undefined) {
                const validationError =
                    validateStringField(
                        field.value,
                        field.name,
                        field.max
                    );

                if (validationError) {
                    return errorResponse(
                        res,
                        400,
                        validationError
                    );
                }
            }
        }


        // -----------------------------------------------------
        // FOLLOW-UP DATE
        // -----------------------------------------------------

        let parsedFollowUpDate = null;

        if (followUpDate !== undefined) {
            const parsed =
                parseFollowUpDate(
                    followUpDate
                );

            if (!parsed.valid) {
                return errorResponse(
                    res,
                    400,
                    "Invalid follow-up date"
                );
            }

            parsedFollowUpDate = parsed.date;
        }


        // -----------------------------------------------------
        // CREATE MEDICAL RECORD
        // -----------------------------------------------------
        //
        // IMPORTANT:
        // patient + doctor come from appointment.
        // Frontend cannot control these values.
        //
        // Do NOT update appointment status here.
        // Do NOT update payment status here.
        //
        // This keeps Medical Record independent from
        // Appointment and Payment state transitions.
        //
        // -----------------------------------------------------

        const medicalRecord =
            await MedicalRecord.create({
                appointment:
                    appointment._id,

                patient:
                    appointment.patient,

                doctor:
                    appointment.doctor,

                symptoms:
                    symptoms !== undefined
                        ? symptoms.trim()
                        : "",

                diagnosis:
                    diagnosis !== undefined
                        ? diagnosis.trim()
                        : "",

                doctorNotes:
                    doctorNotes !== undefined
                        ? doctorNotes.trim()
                        : "",

                treatment:
                    treatment !== undefined
                        ? treatment.trim()
                        : "",

                followUpDate:
                    parsedFollowUpDate
            });


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return successResponse(
            res,
            201,
            "Medical record created successfully",
            {
                medicalRecord
            }
        );

    } catch (error) {

        console.error(
            "Create Medical Record Error:",
            error.message
        );


        // -----------------------------------------------------
        // DUPLICATE KEY
        // -----------------------------------------------------

        if (error.code === 11000) {
            return errorResponse(
                res,
                409,
                "Medical record already exists for this appointment"
            );
        }


        // -----------------------------------------------------
        // MONGOOSE VALIDATION
        // -----------------------------------------------------

        if (error.name === "ValidationError") {
            return errorResponse(
                res,
                400,
                "Invalid medical record data"
            );
        }


        return errorResponse(
            res,
            500,
            "Failed to create medical record"
        );
    }
};


// =========================================================
// GET MEDICAL RECORD BY ID
// PATIENT / DOCTOR / ADMIN
// =========================================================

const getMedicalRecordById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const { id } = req.params;


        // -----------------------------------------------------
        // ID VALIDATION
        // -----------------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(
                res,
                400,
                "Invalid medical record ID"
            );
        }


        // -----------------------------------------------------
        // FIND RECORD
        // -----------------------------------------------------

        const medicalRecord =
            await medicalRecordPopulate(
                MedicalRecord.findById(id)
            );


        if (!medicalRecord) {
            return errorResponse(
                res,
                404,
                "Medical record not found"
            );
        }


        // -----------------------------------------------------
        // ADMIN
        // -----------------------------------------------------

        if (role === "admin") {

            const adminUser =
                await User.findById(userId)
                    .select("_id isActive role");

            if (!adminUser) {
                return errorResponse(
                    res,
                    404,
                    "User not found"
                );
            }

            if (adminUser.role !== "admin") {
                return errorResponse(
                    res,
                    403,
                    "You don't have permission to access this medical record"
                );
            }

            if (!adminUser.isActive) {
                return errorResponse(
                    res,
                    403,
                    "Admin account is inactive"
                );
            }

            return successResponse(
                res,
                200,
                "Medical record fetched successfully",
                {
                    medicalRecord
                }
            );
        }


        // -----------------------------------------------------
        // PATIENT
        // -----------------------------------------------------

        if (role === "patient") {

            const patientResult =
                await getActivePatient(userId);

            if (patientResult.error) {
                return errorResponse(
                    res,
                    patientResult.error.status,
                    patientResult.error.message
                );
            }

            const patient =
                patientResult.patient;


            if (
                !medicalRecord.patient ||
                medicalRecord.patient._id.toString() !==
                    patient._id.toString()
            ) {
                return errorResponse(
                    res,
                    403,
                    "You are not authorized to view this medical record"
                );
            }


            return successResponse(
                res,
                200,
                "Medical record fetched successfully",
                {
                    medicalRecord
                }
            );
        }


        // -----------------------------------------------------
        // DOCTOR
        // -----------------------------------------------------

        if (role === "doctor") {

            const doctorResult =
                await getActiveDoctor(userId);

            if (doctorResult.error) {
                return errorResponse(
                    res,
                    doctorResult.error.status,
                    doctorResult.error.message
                );
            }

            const doctor =
                doctorResult.doctor;


            if (
                !medicalRecord.doctor ||
                medicalRecord.doctor._id.toString() !==
                    doctor._id.toString()
            ) {
                return errorResponse(
                    res,
                    403,
                    "You are not authorized to view this medical record"
                );
            }


            return successResponse(
                res,
                200,
                "Medical record fetched successfully",
                {
                    medicalRecord
                }
            );
        }


        // -----------------------------------------------------
        // UNKNOWN ROLE
        // -----------------------------------------------------

        return errorResponse(
            res,
            403,
            "You don't have permission to access this medical record"
        );

    } catch (error) {

        console.error(
            "Get Medical Record Error:",
            error.message
        );

        return errorResponse(
            res,
            500,
            "Failed to fetch medical record"
        );
    }
};


// =========================================================
// GET LOGGED-IN PATIENT MEDICAL RECORDS
// PATIENT ONLY
// =========================================================

const getMyMedicalRecords = async (req, res) => {
    try {
        const userId = req.user.userId;


        // -----------------------------------------------------
        // PATIENT AUTHORIZATION
        // -----------------------------------------------------

        if (req.user.role !== "patient") {
            return errorResponse(
                res,
                403,
                "Only patients can access their medical history"
            );
        }


        const patientResult =
            await getActivePatient(userId);

        if (patientResult.error) {
            return errorResponse(
                res,
                patientResult.error.status,
                patientResult.error.message
            );
        }

        const patient =
            patientResult.patient;


        // -----------------------------------------------------
        // FETCH PATIENT RECORDS
        // -----------------------------------------------------

        const medicalRecords =
            await medicalRecordPopulate(
                MedicalRecord.find({
                    patient: patient._id
                })
            )
                .sort({
                    createdAt: -1
                });


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return successResponse(
            res,
            200,
            "Medical history fetched successfully",
            {
                count: medicalRecords.length,
                medicalRecords
            }
        );

    } catch (error) {

        console.error(
            "Get My Medical Records Error:",
            error.message
        );

        return errorResponse(
            res,
            500,
            "Failed to fetch medical history"
        );
    }
};


// =========================================================
// GET DOCTOR'S MEDICAL RECORDS
// DOCTOR ONLY
// =========================================================

const getDoctorMedicalRecords = async (req, res) => {
    try {
        const userId = req.user.userId;


        // -----------------------------------------------------
        // DOCTOR AUTHORIZATION
        // -----------------------------------------------------

        if (req.user.role !== "doctor") {
            return errorResponse(
                res,
                403,
                "Only doctors can access doctor medical records"
            );
        }


        const doctorResult =
            await getActiveDoctor(userId);

        if (doctorResult.error) {
            return errorResponse(
                res,
                doctorResult.error.status,
                doctorResult.error.message
            );
        }

        const doctor =
            doctorResult.doctor;


        // -----------------------------------------------------
        // FETCH DOCTOR RECORDS
        // -----------------------------------------------------

        const medicalRecords =
            await medicalRecordPopulate(
                MedicalRecord.find({
                    doctor: doctor._id
                })
            )
                .sort({
                    createdAt: -1
                });


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return successResponse(
            res,
            200,
            "Doctor medical records fetched successfully",
            {
                count: medicalRecords.length,
                medicalRecords
            }
        );

    } catch (error) {

        console.error(
            "Get Doctor Medical Records Error:",
            error.message
        );

        return errorResponse(
            res,
            500,
            "Failed to fetch doctor medical records"
        );
    }
};


// =========================================================
// UPDATE MEDICAL RECORD
// DOCTOR ONLY
// =========================================================

const updateMedicalRecord = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;


        // -----------------------------------------------------
        // ROLE CHECK
        // -----------------------------------------------------

        if (req.user.role !== "doctor") {
            return errorResponse(
                res,
                403,
                "Only doctors can update medical records"
            );
        }


        // -----------------------------------------------------
        // ID VALIDATION
        // -----------------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(
                res,
                400,
                "Invalid medical record ID"
            );
        }


        // -----------------------------------------------------
        // BODY CHECK
        // -----------------------------------------------------

        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return errorResponse(
                res,
                400,
                "Invalid request body"
            );
        }


        // -----------------------------------------------------
        // UNKNOWN FIELD CHECK
        // -----------------------------------------------------

        if (
            hasUnknownFields(
                req.body,
                ALLOWED_UPDATE_FIELDS
            )
        ) {
            return errorResponse(
                res,
                400,
                "Request contains unsupported fields"
            );
        }


        // -----------------------------------------------------
        // CHECK EMPTY UPDATE
        // -----------------------------------------------------

        if (
            Object.keys(req.body).length === 0
        ) {
            return errorResponse(
                res,
                400,
                "At least one medical record field is required"
            );
        }


        // -----------------------------------------------------
        // DOCTOR AUTHORIZATION
        // -----------------------------------------------------

        const doctorResult =
            await getActiveDoctor(userId);

        if (doctorResult.error) {
            return errorResponse(
                res,
                doctorResult.error.status,
                doctorResult.error.message
            );
        }

        const doctor =
            doctorResult.doctor;


        // -----------------------------------------------------
        // FIND RECORD
        // -----------------------------------------------------

        const medicalRecord =
            await MedicalRecord.findById(id);


        if (!medicalRecord) {
            return errorResponse(
                res,
                404,
                "Medical record not found"
            );
        }


        // -----------------------------------------------------
        // DOCTOR OWNERSHIP
        // -----------------------------------------------------

        if (
            !medicalRecord.doctor ||
            medicalRecord.doctor.toString() !==
                doctor._id.toString()
        ) {
            return errorResponse(
                res,
                403,
                "You are not authorized to update this medical record"
            );
        }


        // -----------------------------------------------------
        // IMPORTANT:
        // NEVER allow these relationship fields to change.
        //
        // appointment
        // patient
        // doctor
        //
        // Because unknown-field validation already rejects them.
        // -----------------------------------------------------


        // -----------------------------------------------------
        // REQUEST FIELDS
        // -----------------------------------------------------

        const {
            symptoms,
            diagnosis,
            doctorNotes,
            treatment,
            followUpDate
        } = req.body;


        // -----------------------------------------------------
        // STRING VALIDATION
        // -----------------------------------------------------

        const stringFields = [
            {
                value: symptoms,
                name: "Symptoms",
                max: FIELD_LIMITS.symptoms
            },
            {
                value: diagnosis,
                name: "Diagnosis",
                max: FIELD_LIMITS.diagnosis
            },
            {
                value: doctorNotes,
                name: "Doctor notes",
                max: FIELD_LIMITS.doctorNotes
            },
            {
                value: treatment,
                name: "Treatment",
                max: FIELD_LIMITS.treatment
            }
        ];


        for (const field of stringFields) {

            if (field.value !== undefined) {

                const validationError =
                    validateStringField(
                        field.value,
                        field.name,
                        field.max
                    );

                if (validationError) {
                    return errorResponse(
                        res,
                        400,
                        validationError
                    );
                }
            }
        }


        // -----------------------------------------------------
        // UPDATE ALLOWED FIELDS ONLY
        // -----------------------------------------------------

        if (symptoms !== undefined) {
            medicalRecord.symptoms =
                symptoms.trim();
        }


        if (diagnosis !== undefined) {
            medicalRecord.diagnosis =
                diagnosis.trim();
        }


        if (doctorNotes !== undefined) {
            medicalRecord.doctorNotes =
                doctorNotes.trim();
        }


        if (treatment !== undefined) {
            medicalRecord.treatment =
                treatment.trim();
        }


        // -----------------------------------------------------
        // FOLLOW-UP DATE
        // -----------------------------------------------------

        if (followUpDate !== undefined) {

            const parsed =
                parseFollowUpDate(
                    followUpDate
                );

            if (!parsed.valid) {
                return errorResponse(
                    res,
                    400,
                    "Invalid follow-up date"
                );
            }

            medicalRecord.followUpDate =
                parsed.date;
        }


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        await medicalRecord.save();


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return successResponse(
            res,
            200,
            "Medical record updated successfully",
            {
                medicalRecord
            }
        );

    } catch (error) {

        console.error(
            "Update Medical Record Error:",
            error.message
        );


        // -----------------------------------------------------
        // MONGOOSE VALIDATION
        // -----------------------------------------------------

        if (error.name === "ValidationError") {
            return errorResponse(
                res,
                400,
                "Invalid medical record data"
            );
        }


        return errorResponse(
            res,
            500,
            "Failed to update medical record"
        );
    }
};




module.exports = {
    createMedicalRecord,
    getMedicalRecordById,
    getMyMedicalRecords,
    getDoctorMedicalRecords,
    updateMedicalRecord
};