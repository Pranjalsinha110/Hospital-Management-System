import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

import "./DashboardLayout.css";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      {/* Dashboard Sidebar */}
      <DashboardSidebar />

      {/* Dashboard Main Area */}
      <div className="dashboard-main">
        {/* Top Header */}
        <DashboardHeader />

        {/* Page Content */}
        <motion.main
          className="dashboard-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout; 