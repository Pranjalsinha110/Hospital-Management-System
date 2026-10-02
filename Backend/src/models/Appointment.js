const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        // =====================================================
        // PATIENT
        // =====================================================

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: [true, "Patient is required"]
        },


        // =====================================================
        // DOCTOR
        // =====================================================

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: [true, "Doctor is required"]
        },


        // =====================================================
        // DEPARTMENT
        // =====================================================

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: [true, "Department is required"]
        },


        // =====================================================
        // APPOINTMENT DATE
        // =====================================================

        appointmentDate: {
            type: Date,
            required: [true, "Appointment date is required"]
        },


        // =====================================================
        // APPOINTMENT TIME
        // =====================================================

        appointmentTime: {
            type: String,
            required: [true, "Appointment time is required"],
            trim: true,
            match: [
                /^([01]\d|2[0-3]):([0-5]\d)$/,
                "Appointment time must be in HH:mm format"
            ]
        },


        // =====================================================
        // REASON
        // =====================================================

        reason: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500
        },


        // =====================================================
        // CONSULTATION TYPE
        // =====================================================

        consultationType: {
            type: String,
            enum: {
                values: ["In-Person", "Online"],
                message:
                    "Consultation type must be either In-Person or Online"
            },
            default: "In-Person"
        },


        // =====================================================
        // APPOINTMENT STATUS
        // =====================================================

        status: {
            type: String,
            enum: {
                values: [
                    "Pending",
                    "Confirmed",
                    "Completed",
                    "Cancelled",
                    "Rejected"
                ],
                message: "Invalid appointment status"
            },
            default: "Pending"
        },


        // =====================================================
        // PAYMENT STATUS
        // =====================================================

        paymentStatus: {
            type: String,
            enum: {
                values: [
                    "Pending",
                    "Paid",
                    "Failed",
                    "Refunded"
                ],
                message: "Invalid payment status"
            },
            default: "Pending"
        },


        // =====================================================
        // PAYMENT / SLOT HOLD EXPIRY
        // =====================================================

        expiresAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
);


// =========================================================
// UNIQUE ACTIVE APPOINTMENT SLOT
// =========================================================
//
// Same doctor cannot have two active appointments
// for the same date and time.
//
// Cancelled / Rejected appointments do NOT block the slot.
//
// =========================================================

appointmentSchema.index(
    {
        doctor: 1,
        appointmentDate: 1,
        appointmentTime: 1
    },
    {
        unique: true,

        partialFilterExpression: {
            status: {
                $in: [
                    "Pending",
                    "Confirmed",
                    "Completed"
                ]
            }
        },

        name: "unique_active_doctor_appointment_slot"
    }
);


// =========================================================
// PATIENT APPOINTMENT LIST INDEX
// =========================================================

appointmentSchema.index(
    {
        patient: 1,
        appointmentDate: 1,
        appointmentTime: 1
    },
    {
        name: "patient_appointments_index"
    }
);


// =========================================================
// DEPARTMENT APPOINTMENT INDEX
// =========================================================

appointmentSchema.index(
    {
        department: 1,
        appointmentDate: 1
    },
    {
        name: "department_appointments_index"
    }
);


// =========================================================
// STATUS + PAYMENT INDEX
// =========================================================

appointmentSchema.index(
    {
        status: 1,
        paymentStatus: 1
    },
    {
        name: "appointment_status_payment_index"
    }
);


// =========================================================
// EXPIRY INDEX
// =========================================================
//
// IMPORTANT:
// This is NOT a TTL index.
// We do not want MongoDB to automatically delete
// hospital appointment records.
//
// A background job will later mark expired
// Pending appointments as Cancelled.
//
// =========================================================
appointmentSchema.index(
    {
        expiresAt: 1
    },
    {
        name: "appointment_expiry_index"
    }
);


const Appointment = mongoose.model(
    "Appointment",
    appointmentSchema
);

module.exports = Appointment;