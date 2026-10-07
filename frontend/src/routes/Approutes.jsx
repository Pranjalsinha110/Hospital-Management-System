import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Auth from "../pages/public/Auth";
import Doctors from "../pages/public/Doctors";
import Department from "../pages/public/Department";
import Contact from "../pages/public/Contact";
import PrivacyPolicy from "../pages/public/PrivacyPolicy";
import TermsConditions from "../pages/public/TermsConditions"



import DashboardLayout from "../components/layout/DashboardLayout";
import PatientDashboard from "../pages/patients/PatientDashboard";
import PatientAppointments from "../pages/patients/PatientAppointments";
import BookAppointment from "../pages/patients/BookAppointment";
import Payment from "../pages/patients/Payment";
import FindDoctor from "../pages/patients/FindDoctor";
import Departments from "../pages/patients/Departments";
import MedicalRecords from "../pages/patients/MedicalRecords"
import PatientProfile from "../pages/patients/PatientProfile";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminPatients from "../pages/admin/AdminPatients";
import AdminDoctor from "../pages/admin/AdminDoctors";
import AdminDepartment from "../pages/admin/AdminDepartments";
import AdminAppointments from "../pages/admin/AdminAppointments";
import AdminPayments from "../pages/admin/AdminPayments";
import AdminReports from "../pages/admin/AdminReports";

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorPatients from "../pages/doctor/DoctorPatients";
import DoctorMedicalRecords from "../pages/doctor/DoctorMedicalRecords";

import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/departments" element={<Department />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsConditions />} />



      {/* Protected patient routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/patient" element={<DashboardLayout />}>
          <Route index element={<PatientDashboard />} />

          <Route path="appointments" element={<PatientAppointments />}/>

          <Route path="appointments/book" element={<BookAppointment />}/>
          <Route path="payment/:appointmentId" element={<Payment />}/>
          <Route path="find-doctor" element={<FindDoctor />}/>
          <Route path="departments" element={<Departments />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="profile" element={<PatientProfile />} />

        </Route>
      </Route>
       {/* =========================
            ADMIN ROUTES
        ========================== */}

        <Route path="/admin">
          <Route index element={<AdminDashboard />} />
          <Route path="patients" element={<AdminPatients/>} />
          <Route path="doctors" element={<AdminDoctor/>} />
          <Route path="departments" element={<AdminDepartment/>} />
          <Route path="appointments" element={<AdminAppointments/>} />
          <Route path="payments" element={<AdminPayments/>} />
          <Route path="reports" element={<AdminReports/>} />
        </Route>

  <Route element={<ProtectedRoute />}>
  <Route path="/doctor" element={<DashboardLayout />}>
    <Route index element={<DoctorDashboard />} />
    <Route path="appointments" element={<DoctorAppointments />} />
    <Route path="patients" element={<DoctorPatients />} />
    <Route path="medical-records" element={<DoctorMedicalRecords />} />
  </Route>
</Route>
    </Routes>
  );
};

export default AppRoutes;