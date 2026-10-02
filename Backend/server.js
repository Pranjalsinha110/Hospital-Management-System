const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes")
const departmentRoutes = require("./src/routes/departmentRoutes");
const patientRoutes = require("./src/routes/patientRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const { startAppointmentCleanupJob} = require("./src/job/appointmentCleanupJob");
const medicalRecordRoutes = require("./src/routes/medicalRecordRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const app = express();

const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: "*  ",
    credentials: true,
  })
);


// Middleware
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hospital Management System is Running Successfully"
    });
});
startAppointmentCleanupJob();  

// Database connection
connectDB();


// Start server
app.listen(PORT, () => {
    console.log("Server is running successfully");
});