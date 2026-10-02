const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        // APPOINTMENT

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: [true, "Appointment is required"],
            unique: true
        },
        // PATIENT

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: [true, "Patient is required"]
        },
        // RAZORPAY ORDER

        razorpayOrderId: {
            type: String,
            required: [true, "Razorpay order ID is required"],
            unique: true,
            trim: true
        },
        // RAZORPAY PAYMENT

        razorpayPaymentId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            default: null
        },
        // PAYMENT AMOUNT

        amount: {
            type: Number,
            required: [true, "Payment amount is required"],
            min: [1, "Payment amount must be greater than zero"]
        },
        // CURRENCY
       
        currency: {
            type: String,
            required: true,
            default: "INR",
            uppercase: true,
            enum: ["INR"]
        },
        // PAYMENT STATUS
        

        status: {
            type: String,
            enum: [
                "Created",
                "Pending",
                "Paid",
                "Failed",
                "Refunded"
            ],
            default: "Created",
            required: true,
            index: true
        },
        // RAZORPAY SIGNATURE
        

        razorpaySignature: {
            type: String,
            trim: true,
            default: null
        },
        // PAYMENT FAILURE INFORMATION
       

        failureReason: {
            type: String,
            trim: true,
            default: null
        },
        // PAYMENT TIMESTAMP
        

        paidAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
);

// PAYMENT LOOKUP INDEX
paymentSchema.index(
    {
        patient: 1,
        createdAt: -1
    },
    {
        name: "patient_payment_history_index"
    }
);
// STATUS LOOKUP INDEX
paymentSchema.index(
    {
        status: 1,
        createdAt: -1
    },
    {
        name: "payment_status_index"
    }
);


const Payment = mongoose.model(
    "Payment",
    paymentSchema
);

module.exports = Payment;