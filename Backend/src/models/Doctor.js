const mongoose  = require("mongoose");
const doctorSchema = new mongoose.Schema(
    {
        user :{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : [true , "User reference is required"],
            unique : true
        },
         specialization: {
            type: String,
            required: [true, "Specialization is required"],
            trim: true,
            maxlength: [100, "Specialization cannot exceed 100 characters"]
        },

        qualification: {
            type: String,
            required: [true, "Qualification is required"],
            trim: true,
            maxlength: [200, "Qualification cannot exceed 200 characters"]
        },

        experience: {
            type: Number,
            required: [true, "Experience is required"],
            min: [0, "Experience cannot be negative"],
            max: [70, "Experience cannot exceed 70 years"]
        },

        consultationFee: {
            type: Number,
            required: [true, "Consultation fee is required"],
            min: [0, "Consultation fee cannot be negative"]
        },

        licenseNumber: {
            type: String,
            required: [true, "Medical license number is required"],
            trim: true,
            unique: true
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: [true, "Department is required"]
        },

        bio: {
            type: String,
            trim: true,
            maxlength: [1000, "Bio cannot exceed 1000 characters"]
        },

        profileImage: {
            type: String,
            default: null
        },

        availableDays: {
            type: [String],
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            default: []
        },

        availableTime: {
            start: {
                type: String,
                default: null
            },

            end: {
                type: String,
                default: null
            }
        },

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)
const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports= Doctor