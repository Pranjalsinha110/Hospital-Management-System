const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
    {
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            unique: true,
            immutable: true
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
            immutable: true,
            index: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
            immutable: true,
            index: true
        },

        symptoms: {
            type: String,
            trim: true,
            default: "",
            maxlength: 2000
        },

        diagnosis: {
            type: String,
            trim: true,
            default: "",
            maxlength: 2000
        },

        doctorNotes: {
            type: String,
            trim: true,
            default: "",
            maxlength: 5000
        },

        treatment: {
            type: String,
            trim: true,
            default: "",
            maxlength: 5000
        },

        followUpDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "MedicalRecord",
    medicalRecordSchema
);