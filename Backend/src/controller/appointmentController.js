const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");
const User = require("../models/User");


// =========================================================
// CONSTANTS
// =========================================================

const IST_OFFSET = "+05:30";

const VALID_CONSULTATION_TYPES = [
    "In-Person",
    "Online"
];

const ACTIVE_APPOINTMENT_STATUSES = [
    "Pending",
    "Confirmed",
    "Completed"
];


// =========================================================
// HELPER - CREATE IST DATE
// =========================================================

const createISTDate = (dateString, timeString = "00:00") => {

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!dateRegex.test(dateString)) {
        return null;
    }

    if (!timeRegex.test(timeString)) {
        return null;
    }

    const date = new Date(
        `${dateString}T${timeString}:00${IST_OFFSET}`
    );

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};


// =========================================================
// HELPER - GET IST WEEKDAY
// =========================================================

const getISTDayName = (date) => {

    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long"
    }).format(date);
};


// =========================================================
// HELPER - GET CURRENT IST DATE STRING
// =========================================================

const getCurrentISTDateString = () => {

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
};


// =========================================================
// HELPER - GET CURRENT IST TIME
// =========================================================

const getCurrentISTTime = () => {

    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(new Date());
};


// =========================================================
// CREATE APPOINTMENT
// =========================================================

const createAppointment = async (req, res) => {

    try {

        // =====================================================
        // AUTHENTICATION
        // =====================================================

        const userId = req.user.userId;

        if (req.user.role !== "patient") {

            return res.status(403).json({
                success: false,
                message: "Only patients can book appointments",
                data: null
            });
        }


        // =====================================================
        // REQUEST BODY
        // =====================================================

        const {
            doctor,
            department,
            appointmentDate,
            appointmentTime,
            reason,
            consultationType
        } = req.body;


        // =====================================================
        // REQUIRED VALIDATION
        // =====================================================

        if (
            !doctor ||
            !department ||
            !appointmentDate ||
            !appointmentTime
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Doctor, department, appointment date and appointment time are required",
                data: null
            });
        }


        // =====================================================
        // VALIDATE OBJECT IDS
        // =====================================================

        if (
            !doctor.match(/^[0-9a-fA-F]{24}$/) ||
            !department.match(/^[0-9a-fA-F]{24}$/)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid doctor or department ID",
                data: null
            });
        }


        // =====================================================
        // FIND USER
        // =====================================================

        const user = await User.findById(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User account not found",
                data: null
            });
        }


        // =====================================================
        // USER ACTIVE CHECK
        // =====================================================

        if (!user.isActive) {

            return res.status(403).json({
                success: false,
                message: "Your account is deactivated",
                data: null
            });
        }


        // =====================================================
        // FIND PATIENT PROFILE
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
        // FIND DOCTOR
        // =====================================================

        const doctorData = await Doctor.findById(doctor);

        if (!doctorData) {

            return res.status(404).json({
                success: false,
                message: "Doctor not found",
                data: null
            });
        }


        // =====================================================
        // DOCTOR USER ACCOUNT
        // =====================================================

        const doctorUser = await User.findById(
            doctorData.user
        );

        if (!doctorUser) {

            return res.status(404).json({
                success: false,
                message: "Doctor user account not found",
                data: null
            });
        }


        // =====================================================
        // DOCTOR ACCOUNT ACTIVE
        // =====================================================

        if (!doctorUser.isActive) {

            return res.status(400).json({
                success: false,
                message: "Doctor account is inactive",
                data: null
            });
        }


        // =====================================================
        // DOCTOR AVAILABLE
        // =====================================================

        if (!doctorData.isAvailable) {

            return res.status(400).json({
                success: false,
                message: "Doctor is currently unavailable",
                data: null
            });
        }


        // =====================================================
        // FIND DEPARTMENT
        // =====================================================

        const departmentData =
            await Department.findById(department);

        if (!departmentData) {

            return res.status(404).json({
                success: false,
                message: "Department not found",
                data: null
            });
        }


        // =====================================================
        // DEPARTMENT ACTIVE
        // =====================================================

        if (!departmentData.isActive) {

            return res.status(400).json({
                success: false,
                message: "Department is inactive",
                data: null
            });
        }


        // =====================================================
        // DOCTOR-DEPARTMENT MATCH
        // =====================================================

        if (
            !doctorData.department ||
            doctorData.department.toString() !==
            departmentData._id.toString()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Selected doctor does not belong to the selected department",
                data: null
            });
        }


        // =====================================================
        // DATE FORMAT VALIDATION
        // =====================================================

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(appointmentDate)) {

            return res.status(400).json({
                success: false,
                message:
                    "Appointment date must be in YYYY-MM-DD format",
                data: null
            });
        }


        // =====================================================
        // TIME FORMAT VALIDATION
        // =====================================================

        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!timeRegex.test(appointmentTime)) {

            return res.status(400).json({
                success: false,
                message:
                    "Appointment time must be in HH:mm format",
                data: null
            });
        }


        // =====================================================
        // CREATE IST APPOINTMENT DATE
        // =====================================================

        const selectedDateTime = createISTDate(
            appointmentDate,
            appointmentTime
        );

        if (!selectedDateTime) {

            return res.status(400).json({
                success: false,
                message: "Invalid appointment date or time",
                data: null
            });
        }


        // =====================================================
        // PREVENT PAST APPOINTMENT
        // =====================================================

        if (selectedDateTime <= new Date()) {

            return res.status(400).json({
                success: false,
                message:
                    "Appointment date and time must be in the future",
                data: null
            });
        }


        // =====================================================
        // DOCTOR AVAILABLE DAY CHECK
        // =====================================================

        const appointmentDay =
            getISTDayName(selectedDateTime);

        if (
            !doctorData.availableDays ||
            !doctorData.availableDays.includes(appointmentDay)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    `Doctor is not available on ${appointmentDay}`,
                data: null
            });
        }


        // =====================================================
        // DOCTOR AVAILABLE TIME CHECK
        // =====================================================

        if (
            doctorData.availableTime &&
            doctorData.availableTime.start &&
            doctorData.availableTime.end
        ) {

            const startTime =
                doctorData.availableTime.start;

            const endTime =
                doctorData.availableTime.end;


            if (
                appointmentTime < startTime ||
                appointmentTime > endTime
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Doctor is available between ${startTime} and ${endTime}`,
                    data: null
                });
            }
        }


        // =====================================================
        // CONSULTATION TYPE
        // =====================================================

        const selectedConsultationType =
            consultationType || "In-Person";

        if (
            !VALID_CONSULTATION_TYPES.includes(
                selectedConsultationType
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Consultation type must be either In-Person or Online",
                data: null
            });
        }


        // =====================================================
        // CHECK EXISTING APPOINTMENT
        // =====================================================

        const existingAppointment =
            await Appointment.findOne({
                doctor: doctorData._id,
                appointmentDate: selectedDateTime,
                appointmentTime,
                status: {
                    $in: ACTIVE_APPOINTMENT_STATUSES
                }
            });

        if (existingAppointment) {

            return res.status(409).json({
                success: false,
                message:
                    "This appointment slot is already booked",
                data: null
            });
        }


        // =====================================================
        // CREATE PAYMENT-PENDING APPOINTMENT
        // =====================================================

        const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000
        );


        const appointment = await Appointment.create({

            patient: patient._id,

            doctor: doctorData._id,

            department: departmentData._id,

            appointmentDate: selectedDateTime,

            appointmentTime,

            reason: reason ? reason.trim() : "",

            consultationType:
                selectedConsultationType,

            status: "Pending",

            paymentStatus: "Pending",

            expiresAt
        });


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(201).json({

            success: true,

            message:
                "Appointment slot reserved. Please complete payment within 15 minutes.",

            data: {

                appointment: {

                    id: appointment._id,

                    doctor: appointment.doctor,

                    department: appointment.department,

                    appointmentDate:
                        appointment.appointmentDate,

                    appointmentTime:
                        appointment.appointmentTime,

                    consultationType:
                        appointment.consultationType,

                    status:
                        appointment.status,

                    paymentStatus:
                        appointment.paymentStatus,

                    paymentExpiresAt:
                        appointment.expiresAt
                }
            }
        });

    } catch (error) {

        // =====================================================
        // DUPLICATE SLOT
        // =====================================================

        if (error.code === 11000) {

            return res.status(409).json({
                success: false,
                message:
                    "This appointment slot has already been booked",
                data: null
            });
        }


        console.error(
            "Create Appointment Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create appointment",
            data: null
        });
    }
};


// =========================================================
// GET MY APPOINTMENTS - PATIENT
// =========================================================

const getMyAppointments = async (req, res) => {

    try {

        const userId = req.user.userId;


        // =====================================================
        // ROLE CHECK
        // =====================================================

        if (req.user.role !== "patient") {

            return res.status(403).json({
                success: false,
                message:
                    "Only patients can access their appointments",
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
                message:
                    "Patient profile not found",
                data: null
            });
        }


        // =====================================================
        // FETCH APPOINTMENTS
        // =====================================================

        const appointments =
            await Appointment.find({
                patient: patient._id
            })
                .populate(
                    "doctor",
                    "specialization qualification experience consultationFee licenseNumber department"
                )
                .populate(
                    "department",
                    "name description"
                )
                .sort({
                    appointmentDate: 1,
                    appointmentTime: 1
                });


        return res.status(200).json({

            success: true,

            message:
                "Your appointments fetched successfully",

            data: appointments
        });

    } catch (error) {

        console.error(
            "Get My Appointments Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch appointments",
            data: null
        });
    }
};


// =========================================================
// GET DOCTOR'S APPOINTMENTS
// =========================================================

const getDoctorAppointments = async (req, res) => {

    try {

        const userId = req.user.userId;


        // =====================================================
        // ROLE CHECK
        // =====================================================

        if (req.user.role !== "doctor") {

            return res.status(403).json({
                success: false,
                message:
                    "Only doctors can access their appointments",
                data: null
            });
        }


        // =====================================================
        // FIND DOCTOR PROFILE
        // =====================================================

        const doctor = await Doctor.findOne({
            user: userId
        });

        if (!doctor) {

            return res.status(404).json({
                success: false,
                message:
                    "Doctor profile not found",
                data: null
            });
        }


        // =====================================================
        // FETCH DOCTOR APPOINTMENTS
        // =====================================================

        const appointments =
            await Appointment.find({
                doctor: doctor._id
            })
                .populate(
                    "patient",
                    "dateOfBirth gender bloodGroup medicalHistory allergies existingConditions emergencyContact"
                )
                .populate(
                    "department",
                    "name description"
                )
                .sort({
                    appointmentDate: 1,
                    appointmentTime: 1
                });


        return res.status(200).json({

            success: true,

            message:
                "Doctor appointments fetched successfully",

            data: appointments
        });

    } catch (error) {

        console.error(
            "Get Doctor Appointments Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch doctor appointments",
            data: null
        });
    }
};


// =========================================================
// GET APPOINTMENT BY ID
// ADMIN ONLY
// =========================================================

const getAppointmentById = async (req, res) => {

    try {

        const { id } = req.params;


        // =====================================================
        // VALIDATE ID
        // =====================================================

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {

            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID",
                data: null
            });
        }


        // =====================================================
        // ONLY ADMIN
        // =====================================================

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message:
                    "Only admins can access appointment details by ID",
                data: null
            });
        }


        // =====================================================
        // FIND APPOINTMENT
        // =====================================================

        const appointment =
            await Appointment.findById(id)
                .populate(
                    {
                        path: "patient",
                        populate: {
                            path: "user",
                            select: "name email phone"
                        }
                    }
                )
                .populate(
                    {
                        path: "doctor",
                        populate: {
                            path: "user",
                            select: "name email phone"
                        }
                    }
                )
                .populate(
                    "department",
                    "name description"
                );


        if (!appointment) {

            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found",
                data: null
            });
        }


        return res.status(200).json({

            success: true,

            message:
                "Appointment fetched successfully",

            data: appointment
        });

    } catch (error) {

        console.error(
            "Get Appointment By ID Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch appointment",
            data: null
        });
    }
};


// =========================================================
// CANCEL APPOINTMENT
// PATIENT + ADMIN
// =========================================================

const cancelAppointment = async (req, res) => {

    try {

        const userId = req.user.userId;
        const userRole = req.user.role;
        const { id } = req.params;


        // =====================================================
        // ROLE CHECK
        // =====================================================

        if (
            userRole !== "patient" &&
            userRole !== "admin"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Only patients or admins can cancel appointments",
                data: null
            });
        }


        // =====================================================
        // VALIDATE APPOINTMENT ID
        // =====================================================

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {

            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID",
                data: null
            });
        }


        // =====================================================
        // FIND APPOINTMENT
        // =====================================================

        const appointment =
            await Appointment.findById(id);


        if (!appointment) {

            return res.status(404).json({
                success: false,
                message: "Appointment not found",
                data: null
            });
        }


        // =====================================================
        // PATIENT OWNERSHIP CHECK
        // =====================================================

        if (userRole === "patient") {

            const patient =
                await Patient.findOne({
                    user: userId
                });


            if (!patient) {

                return res.status(404).json({
                    success: false,
                    message: "Patient profile not found",
                    data: null
                });
            }


            if (
                appointment.patient.toString() !==
                patient._id.toString()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You can only cancel your own appointment",
                    data: null
                });
            }
        }


        // =====================================================
        // CHECK APPOINTMENT STATUS
        // =====================================================

        if (appointment.status === "Completed") {

            return res.status(400).json({
                success: false,
                message:
                    "Completed appointment cannot be cancelled",
                data: null
            });
        }


        if (appointment.status === "Cancelled") {

            return res.status(400).json({
                success: false,
                message:
                    "Appointment is already cancelled",
                data: null
            });
        }


        if (appointment.status === "Rejected") {

            return res.status(400).json({
                success: false,
                message:
                    "Rejected appointment cannot be cancelled",
                data: null
            });
        }


        // =====================================================
        // CANCEL APPOINTMENT
        // =====================================================

        appointment.status = "Cancelled";

        await appointment.save();


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            message:
                "Appointment cancelled successfully",

            data: {
                appointment: {
                    id: appointment._id,
                    status: appointment.status,
                    paymentStatus:
                        appointment.paymentStatus
                }
            }
        });


    } catch (error) {

        // =====================================================
        // ERROR
        // =====================================================

        console.error(
            "Cancel Appointment Error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to cancel appointment",
            data: null
        });
    }
};

const getAllAppointments = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admins can access all appointments",
                data: null
            });
        }

        const appointments = await Appointment.find()
            .populate({
                path: "patient",
                populate: {
                    path: "user",
                    select: "name email phone"
                }
            })
            .populate({
                path: "doctor",
                populate: {
                    path: "user",
                    select: "name email phone"
                }
            })
            .populate("department", "name description")
            .sort({
                appointmentDate: -1,
                appointmentTime: -1
            });

        return res.status(200).json({
            success: true,
            message: "All appointments fetched successfully",
            data: appointments
        });

    } catch (error) {
        console.error("Get All Appointments Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointments",
            data: null
        });
    }
};









// =========================================================
// EXPORT
// =========================================================

module.exports = {

    createAppointment,

    getMyAppointments,

    getDoctorAppointments,

    getAppointmentById,
    
    getAllAppointments,

    cancelAppointment



};