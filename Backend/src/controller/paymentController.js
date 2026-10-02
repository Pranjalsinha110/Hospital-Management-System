const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const {sendAppointmentConfirmationNotifications} = require("../services/notificationService");
const {
    createRazorpayOrder,
    fetchRazorpayOrder,
    fetchRazorpayPayment,
    verifyPaymentSignature
} = require("../services/razorpayService");


// =========================================================
// CREATE PAYMENT ORDER
// =========================================================

const createPaymentOrder = async (req, res) => {

    try {

        // =====================================================
        // AUTHENTICATION
        // =====================================================

        const userId = req.user.userId;

        if (req.user.role !== "patient") {

            return res.status(403).json({
                success: false,
                message: "Only patients can make appointment payments",
                data: null
            });
        }


        // =====================================================
        // REQUEST BODY
        // =====================================================

        const { appointmentId } = req.body;

        if (!appointmentId) {

            return res.status(400).json({
                success: false,
                message: "Appointment ID is required",
                data: null
            });
        }


        // =====================================================
        // VALIDATE APPOINTMENT ID
        // =====================================================

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID",
                data: null
            });
        }


        // =====================================================
        // FIND PATIENT
        // =====================================================

        const patient = await Patient.findOne({
            user: userId
        });

        if (!patient) {

            return res.status(404).json({
                success: false,
                message: "Patient profile not found",
                data: null
            });
        }


        // =====================================================
        // FIND APPOINTMENT
        // =====================================================

        const appointment = await Appointment.findById(
            appointmentId
        );

        if (!appointment) {

            return res.status(404).json({
                success: false,
                message: "Appointment not found",
                data: null
            });
        }


        // =====================================================
        // OWNERSHIP CHECK
        // =====================================================

        if (
            appointment.patient.toString() !==
            patient._id.toString()
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to pay for this appointment",
                data: null
            });
        }


        // =====================================================
        // APPOINTMENT STATUS
        // =====================================================

        if (appointment.status !== "Pending") {

            return res.status(409).json({
                success: false,
                message:
                    "Payment can only be made for a pending appointment",
                data: null
            });
        }


        // =====================================================
        // PAYMENT STATUS
        // =====================================================

        if (appointment.paymentStatus === "Paid") {

            return res.status(409).json({
                success: false,
                message: "Payment has already been completed",
                data: null
            });
        }


        // =====================================================
        // EXPIRY CHECK
        // =====================================================

        if (
            appointment.expiresAt &&
            appointment.expiresAt <= new Date()
        ) {

            appointment.status = "Cancelled";

            await appointment.save();

            return res.status(410).json({
                success: false,
                message:
                    "Appointment payment window has expired",
                data: null
            });
        }


        // =====================================================
        // FIND DOCTOR
        // =====================================================

        const doctor = await Doctor.findById(
            appointment.doctor
        );

        if (!doctor) {

            return res.status(404).json({
                success: false,
                message: "Doctor not found",
                data: null
            });
        }


        // =====================================================
        // GET CONSULTATION FEE
        // =====================================================

        const amountInRupees =
            Number(doctor.consultationFee);

        if (
            !Number.isFinite(amountInRupees) ||
            amountInRupees <= 0
        ) {

            return res.status(500).json({
                success: false,
                message:
                    "Doctor consultation fee is invalid",
                data: null
            });
        }


        // =====================================================
        // RUPEES → PAISE
        // =====================================================

        const amountInPaise =
            Math.round(amountInRupees * 100);


        // =====================================================
        // CHECK EXISTING PAYMENT
        // =====================================================

        const existingPayment =
            await Payment.findOne({
                appointment: appointment._id
            });


        // =====================================================
        // EXISTING PAYMENT
        // =====================================================

        if (existingPayment) {

            // -------------------------------------------------
            // ALREADY PAID
            // -------------------------------------------------

            if (existingPayment.status === "Paid") {

                return res.status(409).json({
                    success: false,
                    message:
                        "Payment has already been completed",
                    data: null
                });
            }


            // -------------------------------------------------
            // EXISTING CREATED / PENDING PAYMENT
            // -------------------------------------------------

            if (
                existingPayment.status === "Created" ||
                existingPayment.status === "Pending"
            ) {

                try {

                    const razorpayOrder =
                        await fetchRazorpayOrder(
                            existingPayment.razorpayOrderId
                        );


                    // -----------------------------------------
                    // VERIFY AMOUNT
                    // -----------------------------------------

                    if (
                        Number(razorpayOrder.amount) !==
                        amountInPaise
                    ) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "Existing payment order amount does not match the appointment fee",
                            data: null
                        });
                    }


                    // -----------------------------------------
                    // VERIFY CURRENCY
                    // -----------------------------------------

                    if (
                        razorpayOrder.currency !==
                        existingPayment.currency
                    ) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "Existing payment order currency does not match",
                            data: null
                        });
                    }


                    // -----------------------------------------
                    // RETURN EXISTING ORDER
                    // -----------------------------------------

                    return res.status(200).json({

                        success: true,

                        message:
                            "Existing payment order retrieved successfully",

                        data: {

                            payment: {

                                id:
                                    existingPayment._id,

                                razorpayOrderId:
                                    existingPayment.razorpayOrderId,

                                amount:
                                    existingPayment.amount,

                                currency:
                                    existingPayment.currency,

                                appointmentId:
                                    appointment._id,

                                expiresAt:
                                    appointment.expiresAt
                            }
                        }
                    });

                } catch (error) {

                    /*
                     * Razorpay order may no longer be available.
                     *
                     * We do not trust the old order blindly.
                     * A new order can be created below.
                     */
                }
            }
        }


        // =====================================================
        // CREATE UNIQUE RECEIPT
        // =====================================================

        const receipt =
            `appointment_${appointment._id}_${Date.now()}`;


        // =====================================================
        // CREATE RAZORPAY ORDER
        // =====================================================

        const razorpayOrder =
            await createRazorpayOrder({

                amount: amountInPaise,

                currency: "INR",

                receipt

            });


        // =====================================================
        // CREATE PAYMENT RECORD
        // =====================================================

        let payment;

        try {

            payment = await Payment.create({

                appointment:
                    appointment._id,

                patient:
                    patient._id,

                razorpayOrderId:
                    razorpayOrder.id,

                amount:
                    amountInPaise,

                currency:
                    "INR",

                status:
                    "Created"

            });

        } catch (error) {

            // -------------------------------------------------
            // DUPLICATE PAYMENT RACE CONDITION
            // -------------------------------------------------

            if (error.code === 11000) {

                const duplicatePayment =
                    await Payment.findOne({
                        appointment:
                            appointment._id
                    });


                if (duplicatePayment) {

                    // -----------------------------------------
                    // IF ANOTHER REQUEST ALREADY PAID
                    // -----------------------------------------

                    if (
                        duplicatePayment.status ===
                        "Paid"
                    ) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "Payment has already been completed",
                            data: null
                        });
                    }


                    // -----------------------------------------
                    // VERIFY DUPLICATE ORDER
                    // -----------------------------------------

                    try {

                        const duplicateOrder =
                            await fetchRazorpayOrder(
                                duplicatePayment.razorpayOrderId
                            );


                        if (
                            Number(duplicateOrder.amount) !==
                            amountInPaise
                        ) {

                            return res.status(409).json({
                                success: false,
                                message:
                                    "Existing payment order amount mismatch",
                                data: null
                            });
                        }


                        return res.status(200).json({

                            success: true,

                            message:
                                "Existing payment order retrieved successfully",

                            data: {

                                payment: {

                                    id:
                                        duplicatePayment._id,

                                    razorpayOrderId:
                                        duplicatePayment.razorpayOrderId,

                                    amount:
                                        duplicatePayment.amount,

                                    currency:
                                        duplicatePayment.currency,

                                    appointmentId:
                                        appointment._id,

                                    expiresAt:
                                        appointment.expiresAt
                                }
                            }
                        });

                    } catch (razorpayError) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "A payment is already being processed for this appointment",
                            data: null
                        });
                    }
                }
            }

            throw error;
        }


        // =====================================================
        // SUCCESS RESPONSE
        // =====================================================

        return res.status(201).json({

            success: true,

            message:
                "Payment order created successfully",

            data: {

                payment: {

                    id:
                        payment._id,

                    razorpayOrderId:
                        payment.razorpayOrderId,

                    amount:
                        payment.amount,

                    currency:
                        payment.currency,

                    appointmentId:
                        appointment._id,

                    expiresAt:
                        appointment.expiresAt
                }
            }
        });

    } catch (error) {

        console.error(
            "Create Payment Order Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create payment order",
            data: null
        });
    }
};



// =========================================================
// VERIFY PAYMENT
// =========================================================

const verifyPayment = async (req, res) => {

    const session =
        await mongoose.startSession();

    try {

        // =====================================================
        // AUTHENTICATION
        // =====================================================

        const userId =
            req.user.userId;

        if (req.user.role !== "patient") {

            return res.status(403).json({
                success: false,
                message:
                    "Only patients can verify appointment payments",
                data: null
            });
        }


        // =====================================================
        // REQUEST BODY
        // =====================================================

        const {
            appointmentId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;


        if (
            !appointmentId ||
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Appointment ID, Razorpay order ID, payment ID and signature are required",
                data: null
            });
        }


        // =====================================================
        // VALIDATE APPOINTMENT ID
        // =====================================================

        if (
            !mongoose.Types.ObjectId.isValid(
                appointmentId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid appointment ID",
                data: null
            });
        }


        // =====================================================
        // FIND PATIENT
        // =====================================================

        const patient =
            await Patient.findOne({
                user: userId
            });

        if (!patient) {

            return res.status(404).json({
                success: false,
                message:
                    "Patient profile not found",
                data: null
            });
        }


        // =====================================================
        // FIND APPOINTMENT
        // =====================================================

        const appointment =
            await Appointment.findById(
                appointmentId
            );

        if (!appointment) {

            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found",
                data: null
            });
        }


        // =====================================================
        // OWNERSHIP
        // =====================================================

        if (
            appointment.patient.toString() !==
            patient._id.toString()
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to verify this payment",
                data: null
            });
        }


        // =====================================================
        // IDEMPOTENT SUCCESS
        // =====================================================

        if (
            appointment.status === "Confirmed" &&
            appointment.paymentStatus === "Paid"
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "Payment has already been verified",

                data: {

                    appointmentId:
                        appointment._id,

                    status:
                        appointment.status,

                    paymentStatus:
                        appointment.paymentStatus
                }
            });
        }


        // =====================================================
        // FIND PAYMENT
        // =====================================================

        const payment =
            await Payment.findOne({
                appointment:
                    appointment._id
            });

        if (!payment) {

            return res.status(404).json({
                success: false,
                message:
                    "Payment record not found",
                data: null
            });
        }


        // =====================================================
        // PAYMENT ALREADY PAID
        // =====================================================

        if (payment.status === "Paid") {

            return res.status(200).json({

                success: true,

                message:
                    "Payment has already been processed",

                data: {

                    appointmentId:
                        appointment._id,

                    status:
                        appointment.status,

                    paymentStatus:
                        appointment.paymentStatus
                }
            });
        }


        // =====================================================
        // VERIFY ORDER ID
        // =====================================================
        //
        // IMPORTANT:
        // DB order ID is authoritative.
        //
        // Razorpay recommends retrieving the order_id
        // from your server instead of trusting the value
        // returned by the client.
        //
        // =====================================================

        if (
            payment.razorpayOrderId !==
            razorpayOrderId
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Razorpay order does not belong to this appointment",
                data: null
            });
        }


        const serverOrderId =
            payment.razorpayOrderId;


        // =====================================================
        // VERIFY SIGNATURE
        // =====================================================

        const isSignatureValid =
            verifyPaymentSignature({

                razorpayOrderId:
                    serverOrderId,

                razorpayPaymentId,

                razorpaySignature

            });


        if (!isSignatureValid) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid Razorpay payment signature",
                data: null
            });
        }


        // =====================================================
        // FETCH RAZORPAY ORDER
        // =====================================================

        const razorpayOrder =
            await fetchRazorpayOrder(
                serverOrderId
            );


        // =====================================================
        // VERIFY ORDER STATUS
        // =====================================================

        if (
            razorpayOrder.status !==
            "paid"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Razorpay order has not been paid",
                data: null
            });
        }


        // =====================================================
        // VERIFY ORDER AMOUNT
        // =====================================================

        if (
            Number(razorpayOrder.amount) !==
            Number(payment.amount)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Payment amount does not match the appointment fee",
                data: null
            });
        }


        // =====================================================
        // VERIFY ORDER CURRENCY
        // =====================================================

        if (
            razorpayOrder.currency !==
            payment.currency
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Payment currency mismatch",
                data: null
            });
        }


        // =====================================================
        // FETCH RAZORPAY PAYMENT
        // =====================================================

        const razorpayPayment =
            await fetchRazorpayPayment(
                razorpayPaymentId
            );


        // =====================================================
        // VERIFY PAYMENT BELONGS TO ORDER
        // =====================================================

        if (
            razorpayPayment.order_id !==
            serverOrderId
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Payment does not belong to the Razorpay order",
                data: null
            });
        }


        // =====================================================
        // VERIFY PAYMENT AMOUNT
        // =====================================================

        if (
            Number(razorpayPayment.amount) !==
            Number(payment.amount)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Payment amount verification failed",
                data: null
            });
        }


        // =====================================================
        // VERIFY PAYMENT CURRENCY
        // =====================================================

        if (
            razorpayPayment.currency !==
            payment.currency
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Payment currency verification failed",
                data: null
            });
        }


        // =====================================================
        // VERIFY CAPTURE STATUS
        // =====================================================

        if (
            razorpayPayment.status !==
            "captured"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Payment has not been successfully captured",
                data: null
            });
        }


        // =====================================================
        // START DATABASE TRANSACTION
        // =====================================================

        session.startTransaction();


        // =====================================================
        // RE-FETCH PAYMENT INSIDE TRANSACTION
        // =====================================================

        const paymentRecord =
            await Payment.findById(
                payment._id
            ).session(session);


        if (!paymentRecord) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message:
                    "Payment record not found",
                data: null
            });
        }


        // =====================================================
        // CONCURRENT VERIFICATION CHECK
        // =====================================================

        if (
            paymentRecord.status ===
            "Paid"
        ) {

            await session.commitTransaction();

            return res.status(200).json({

                success: true,

                message:
                    "Payment has already been processed",

                data: {

                    appointmentId:
                        appointment._id,

                    status:
                        "Confirmed",

                    paymentStatus:
                        "Paid"
                }
            });
        }


        // =====================================================
        // RE-FETCH APPOINTMENT INSIDE TRANSACTION
        // =====================================================

        const appointmentRecord =
            await Appointment.findById(
                appointment._id
            ).session(session);


        if (!appointmentRecord) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found",
                data: null
            });
        }


        // =====================================================
        // RE-CHECK OWNERSHIP
        // =====================================================

        if (
            appointmentRecord.patient.toString() !==
            patient._id.toString()
        ) {

            await session.abortTransaction();

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to verify this payment",
                data: null
            });
        }


        // =====================================================
        // RE-CHECK EXPIRY
        // =====================================================

        if (
            appointmentRecord.expiresAt &&
            appointmentRecord.expiresAt <= new Date()
        ) {

            appointmentRecord.status =
                "Cancelled";

            await appointmentRecord.save({
                session
            });

            await session.commitTransaction();

            return res.status(410).json({
                success: false,
                message:
                    "Appointment payment window has expired",
                data: null
            });
        }


        // =====================================================
        // RE-CHECK APPOINTMENT STATUS
        // =====================================================

        if (
            appointmentRecord.status !==
            "Pending"
        ) {

            await session.abortTransaction();

            return res.status(409).json({
                success: false,
                message:
                    "Appointment is no longer available for payment",
                data: null
            });
        }


        // =====================================================
        // RE-CHECK PAYMENT STATUS
        // =====================================================

        if (
            appointmentRecord.paymentStatus !==
            "Pending"
        ) {

            await session.abortTransaction();

            return res.status(409).json({
                success: false,
                message:
                    "Appointment payment is no longer pending",
                data: null
            });
        }


        // =====================================================
        // UPDATE PAYMENT RECORD
        // =====================================================

        paymentRecord.razorpayPaymentId =
            razorpayPaymentId;

        paymentRecord.razorpaySignature =
            razorpaySignature;

        paymentRecord.status =
            "Paid";

        paymentRecord.paidAt =
            new Date();

        paymentRecord.failureReason =
            null;


        await paymentRecord.save({
            session
        });


        // =====================================================
        // UPDATE APPOINTMENT
        // =====================================================

        appointmentRecord.paymentStatus =
            "Paid";

        appointmentRecord.status =
            "Confirmed";

        appointmentRecord.expiresAt =
            null;


        await appointmentRecord.save({
            session
        });


        // =====================================================
        // COMMIT TRANSACTION
        // =====================================================

        await session.commitTransaction();


// =====================================================
// SEND APPOINTMENT NOTIFICATIONS
// =====================================================
//
// IMPORTANT:
// Payment transaction has already been committed above.
// Notification failure must NEVER rollback or fail the
// successful payment verification.
//
// The notification service uses Promise.allSettled(),
// so patient/doctor email failures are handled independently.
// =====================================================

try {

    const notificationAppointment =
        await Appointment.findById(
            appointmentRecord._id
        )
            .populate({
                path: "patient",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate({
                path: "doctor",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate({
                path: "department",
                select: "name"
            });


    // -----------------------------------------------------
    // APPOINTMENT DATA CHECK
    // -----------------------------------------------------

    if (!notificationAppointment) {

        console.error(
            "Appointment notification skipped: appointment not found after payment confirmation"
        );

    } else {

        // -------------------------------------------------
        // SEND PATIENT + DOCTOR NOTIFICATIONS
        // -------------------------------------------------

        const notificationResult =
            await sendAppointmentConfirmationNotifications(
                notificationAppointment
            );


        // -------------------------------------------------
        // HANDLE INDIVIDUAL NOTIFICATION FAILURES
        // -------------------------------------------------

        if (!notificationResult.allSuccessful) {

            if (
                !notificationResult.patient.success
            ) {

                console.error(
                    "Patient appointment notification failed:",
                    notificationResult.patient.error
                );
            }


            if (
                !notificationResult.doctor.success
            ) {

                console.error(
                    "Doctor appointment notification failed:",
                    notificationResult.doctor.error
                );
            }
        }
    }

} catch (notificationError) {

    // -----------------------------------------------------
    // NOTIFICATION FAILURE MUST NOT AFFECT PAYMENT SUCCESS
    // -----------------------------------------------------

    console.error(
        "Appointment notification service error:",
        notificationError.message
    );
}
        // =====================================================
        // SUCCESS RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            message:
                "Payment verified and appointment confirmed successfully",

            data: {

                appointment: {

                    id:
                        appointmentRecord._id,

                    status:
                        appointmentRecord.status,

                    paymentStatus:
                        appointmentRecord.paymentStatus
                },

                payment: {

                    id:
                        paymentRecord._id,

                    razorpayOrderId:
                        paymentRecord.razorpayOrderId,

                    razorpayPaymentId:
                        paymentRecord.razorpayPaymentId,

                    amount:
                        paymentRecord.amount,

                    currency:
                        paymentRecord.currency,

                    status:
                        paymentRecord.status,

                    paidAt:
                        paymentRecord.paidAt
                }
            }
        });

    } catch (error) {

        // =====================================================
        // ABORT TRANSACTION
        // =====================================================

        if (
            session.inTransaction()
        ) {
            await session.abortTransaction();
        }


        console.error(
            "Verify Payment Error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to verify payment",

            data: null
        });

    } finally {

        await session.endSession();
    }
};





// @desc    Get all payments (Admin only)
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
    try {
        // Admin authorization
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only."
            });
        }

        const payments = await Payment.find()
            .populate({
                path: "patient",
                select: "user",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate({
                path: "appointment",
                populate: [
                    {
                        path: "doctor",
                        populate: {
                            path: "user",
                            select: "name email"
                        }
                    },
                    {
                        path: "department",
                        select: "name"
                    }
                ]
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Payments fetched successfully",
            data: payments
        });

    } catch (error) {
        console.error("Get all payments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message
        });
    }
};


// =========================================================
// GET UNPAID PAYMENTS (ADMIN)
// =========================================================

const getUnpaidPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            status: { $in: ["Created", "Pending"] }
        })
            .populate({
                path: "patient",
                select: "user",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate({
                path: "appointment",
                populate: [
                    {
                        path: "doctor",
                        populate: {
                            path: "user",
                            select: "name email"
                        }
                    },
                    {
                        path: "department",
                        select: "name"
                    }
                ]
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Unpaid payments fetched successfully",
            data: payments
        });

    } catch (error) {
        console.error("Get unpaid payments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch unpaid payments",
            data: null
        });
    }
};


// =========================================================
// DELETE UNPAID PAYMENT (ADMIN)
// =========================================================

const deleteUnpaidPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(paymentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID",
                data: null
            });
        }

        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
                data: null
            });
        }

        // Only unpaid payments can be deleted
        if (!["Created", "Pending"].includes(payment.status)) {
            return res.status(409).json({
                success: false,
                message: "Only unpaid payments can be deleted",
                data: null
            });
        }

        // Check Razorpay order before deleting
        let razorpayOrder;

        try {
            razorpayOrder = await fetchRazorpayOrder(
                payment.razorpayOrderId
            );
        } catch (error) {
            return res.status(502).json({
                success: false,
                message: "Unable to verify Razorpay order. Payment was not deleted.",
                data: null
            });
        }

        // Do not delete if Razorpay order is already paid
        if (razorpayOrder.status === "paid") {
            return res.status(409).json({
                success: false,
                message: "This payment is already paid on Razorpay. Please verify it before proceeding.",
                data: null
            });
        }

        // Confirm appointment is still unpaid
        const appointment = await Appointment.findById(
            payment.appointment
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Related appointment not found",
                data: null
            });
        }

        if (appointment.paymentStatus === "Paid") {
            return res.status(409).json({
                success: false,
                message: "Appointment is already paid. Payment cannot be deleted.",
                data: null
            });
        }

        // Delete only the unpaid payment record
        await Payment.deleteOne({
            _id: payment._id,
            status: { $in: ["Created", "Pending"] }
        });

        return res.status(200).json({
            success: true,
            message: "Unpaid payment deleted successfully",
            data: {
                paymentId: payment._id,
                appointmentId: appointment._id
            }
        });

    } catch (error) {
        console.error("Delete unpaid payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete unpaid payment",
            data: null
        });
    }
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getAllPayments,
     getUnpaidPayments,
    deleteUnpaidPayment
};