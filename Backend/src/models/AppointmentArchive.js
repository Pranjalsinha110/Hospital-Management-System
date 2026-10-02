
const mongoose = require("mongoose");

const appointmentArchiveSchema = new mongoose.Schema(
    {

        originalAppointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        appointmentDate: {
            type: Date,
            required: true
        },

        appointmentTime: {
            type: String,
            required: true
        },

        reason: {
            type: String,
            default: ""
        },

        consultationType: {
            type: String,
            required: true
        },


        status: {
            type: String,
            required: true
        },

        paymentStatus: {
            type: String,
            required: true
        },

        archivedAt: {
            type: Date,
            default: Date.now
        }
    },

    {
        timestamps: true
    }
);


// =========================================================
// INDEX
// =========================================================
//
// One original appointment can have only one archive record.
//
// =========================================================

appointmentArchiveSchema.index(
    {
        originalAppointmentId: 1
    },
    {
        unique: true,
        name: "unique_original_appointment_archive"
    }
);


const AppointmentArchive = mongoose.model(
    "AppointmentArchive",
    appointmentArchiveSchema
);

module.exports = AppointmentArchive;

