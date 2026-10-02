import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";

import { getAllPatients } from "../../services/patientService";
import doctorService from "../../services/doctorService";
import { getAllDepartments } from "../../services/departmentService";
import { getAllAppointments } from "../../services/appointmentService";
import { getAllPayments } from "../../services/paymentService";

import "./AdminReports.css";

const getArray = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;

  return [];
};

const getDate = (item) => {
  const value =
    item?.createdAt ||
    item?.created_at ||
    item?.date ||
    item?.appointmentDate ||
    item?.appointment_date ||
    item?.paymentDate ||
    item?.payment_date ||
    item?.registeredAt ||
    item?.registrationDate;

  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getStatus = (item) =>
  String(
    item?.status ||
      item?.paymentStatus ||
      item?.appointmentStatus ||
      "unknown"
  )
    .toLowerCase()
    .trim();

const getAmount = (item) =>
  Number(
    item?.amount ??
      item?.totalAmount ??
      item?.paymentAmount ??
      item?.price ??
      item?.total ??
      0
  ) || 0;

const getId = (item) =>
  item?._id || item?.id || item?.appointmentId || item?.paymentId || "—";

const getName = (item) =>
  item?.name ||
  item?.fullName ||
  item?.patientName ||
  item?.doctorName ||
  item?.departmentName ||
  item?.email ||
  "—";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const isPaid = (item) =>
  ["paid", "completed", "success", "successful", "captured"].includes(
    getStatus(item)
  );

const isCompleted = (item) =>
  ["completed", "complete", "done", "confirmed"].includes(getStatus(item));

const isCancelled = (item) =>
  ["cancelled", "canceled", "rejected"].includes(getStatus(item));

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getRange = (type, customStart, customEnd) => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start = startOfDay(now);

  if (type === "7days") {
    start.setDate(start.getDate() - 6);
  } else if (type === "30days") {
    start.setDate(start.getDate() - 29);
  } else if (type === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (type === "year") {
    start = new Date(now.getFullYear(), 0, 1);
  } else if (type === "custom") {
    start = customStart
      ? new Date(`${customStart}T00:00:00`)
      : start;
    return {
      start,
      end: customEnd ? new Date(`${customEnd}T23:59:59`) : end,
    };
  }

  return { start, end };
};

const isInRange = (item, range, type) => {
  if (type === "all") return true;

  const date = getDate(item);
  if (!date) return false;

  return date >= range.start && date <= range.end;
};

const getMonthLabel = (date) =>
  date.toLocaleDateString("en-IN", { month: "short" });

const downloadCSV = (filename, rows) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escape = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const content = [
    headers.map(escape).join(","),
    ...rows.map((row) =>
      headers.map((header) => escape(row[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

const buildMonthlyRevenue = (payments) => {
  const months = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - i);

    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: getMonthLabel(date),
      revenue: 0,
    });
  }

  const map = new Map(months.map((item) => [item.key, item]));

  payments.forEach((payment) => {
    if (!isPaid(payment)) return;

    const date = getDate(payment);
    if (!date) return;

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = map.get(key);

    if (month) month.revenue += getAmount(payment);
  });

  return months;
};

const buildPatientTrend = (patients, type) => {
  const days = type === "7days" ? 7 : 30;
  const result = [];
  const today = startOfDay(new Date());

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const key = date.toISOString().slice(0, 10);

    const count = patients.filter((patient) => {
      const patientDate = getDate(patient);
      return patientDate && patientDate.toISOString().slice(0, 10) === key;
    }).length;

    result.push({
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      count,
    });
  }

  return result;
};

function StatCard({ title, value, icon, color, delay, description }) {
  return (
    <motion.div
      className={`reports-stat-card ${color}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -5 }}
    >
      <div className="reports-stat-top">
        <span className="reports-stat-icon">{icon}</span>
        <span className="reports-stat-symbol">↗</span>
      </div>

      <p>{title}</p>
      <h2>{value}</h2>
      <span className="reports-stat-description">{description}</span>
      <span className="reports-stat-glow" />
    </motion.div>
  );
}

function BarChart({ data, valueKey, labelKey, color = "purple", currency = false }) {
  const max = Math.max(1, ...data.map((item) => Number(item[valueKey]) || 0));

  return (
    <div className="reports-bar-chart">
      {data.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const height = Math.max(3, (value / max) * 100);

        return (
          <div className="reports-bar-column" key={`${item[labelKey]}-${index}`}>
            <div className="reports-bar-value">
              {currency ? formatCurrency(value) : value}
            </div>
            <div className="reports-bar-track">
              <motion.div
                className={`reports-bar-fill ${color}`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.7, delay: index * 0.025 }}
              />
            </div>
            <span className="reports-bar-label">{item[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBar({ label, value, total, color }) {
  const percent = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="reports-status-row">
      <div className="reports-status-label">
        <span className={`reports-status-dot ${color}`} />
        <span>{label}</span>
        <strong>{formatNumber(value)}</strong>
      </div>
      <div className="reports-status-track">
        <motion.div
          className={`reports-status-fill ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7 }}
        />
      </div>
      <small>{percent}%</small>
    </div>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");

  return (
    <span className={`reports-status-pill ${normalized}`}>
      <span />
      {status || "Unknown"}
    </span>
  );
}

export default function AdminReports() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [rangeType, setRangeType] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [reportType, setReportType] = useState("appointments");
  const [search, setSearch] = useState("");

  const fetchReports = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    const results = await Promise.allSettled([
      getAllPatients(),
      doctorService.getAllDoctors(),
      getAllDepartments(),
      getAllAppointments(),
      getAllPayments(),
    ]);

    const setters = [
      setPatients,
      setDoctors,
      setDepartments,
      setAppointments,
      setPayments,
    ];

    const keys = [
      ["patients"],
      ["doctors"],
      ["departments"],
      ["appointments"],
      ["payments"],
    ];

    let failed = false;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        setters[index](getArray(result.value, keys[index]));
      } else {
        failed = true;
        console.error("Reports API error:", result.reason);
      }
    });

    if (failed) {
      setError(
        "Kuch data load nahi ho paya. API connection check karke refresh karein."
      );
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const range = useMemo(
    () => getRange(rangeType, customStart, customEnd),
    [rangeType, customStart, customEnd]
  );

  const filteredPatients = useMemo(
    () => patients.filter((item) => isInRange(item, range, rangeType)),
    [patients, range, rangeType]
  );

  const filteredAppointments = useMemo(
    () => appointments.filter((item) => isInRange(item, range, rangeType)),
    [appointments, range, rangeType]
  );

  const filteredPayments = useMemo(
    () => payments.filter((item) => isInRange(item, range, rangeType)),
    [payments, range, rangeType]
  );

  const paidPayments = filteredPayments.filter(isPaid);
  const unpaidPayments = filteredPayments.filter((item) => !isPaid(item));

  const revenue = paidPayments.reduce(
    (sum, payment) => sum + getAmount(payment),
    0
  );

  const completed = filteredAppointments.filter(isCompleted).length;
  const cancelled = filteredAppointments.filter(isCancelled).length;
  const pending = Math.max(
    0,
    filteredAppointments.length - completed - cancelled
  );

  const monthlyRevenue = useMemo(
    () => buildMonthlyRevenue(payments),
    [payments]
  );

  const patientTrend = useMemo(
    () => buildPatientTrend(filteredPatients, rangeType),
    [filteredPatients, rangeType]
  );

  const appointmentStatuses = [
    { label: "Completed", value: completed, color: "green" },
    { label: "Pending", value: pending, color: "orange" },
    { label: "Cancelled", value: cancelled, color: "red" },
  ];

  const paymentStatuses = [
    { label: "Paid", value: paidPayments.length, color: "green" },
    { label: "Unpaid / Pending", value: unpaidPayments.length, color: "orange" },
  ];

  const departmentStats = useMemo(
    () =>
      departments.map((department) => {
        const name = department?.name || department?.departmentName || "Unknown";

        const count = filteredAppointments.filter((appointment) => {
          const departmentName =
            appointment?.department?.name ||
            appointment?.departmentName ||
            appointment?.department;

          return (
            String(
              typeof departmentName === "object"
                ? departmentName?.name
                : departmentName
            ).toLowerCase() === String(name).toLowerCase()
          );
        }).length;

        return { label: name, count };
      }),
    [departments, filteredAppointments]
  );

  const reportRows = useMemo(() => {
    let source = [];

    if (reportType === "patients") source = filteredPatients;
    if (reportType === "doctors") source = doctors;
    if (reportType === "departments") source = departments;
    if (reportType === "appointments") source = filteredAppointments;
    if (reportType === "payments") source = filteredPayments;

    const rows = source.map((item) => ({
      id: getId(item),
      name: getName(item),
      patient:
        item?.patient?.name ||
        item?.patientName ||
        item?.patient?.fullName ||
        "—",
      doctor:
        item?.doctor?.name ||
        item?.doctorName ||
        item?.doctor?.fullName ||
        "—",
      department:
        item?.department?.name ||
        item?.departmentName ||
        (typeof item?.department === "string" ? item.department : "—"),
      date: getDate(item)?.toLocaleDateString("en-IN") || "—",
      status:
        item?.status ||
        item?.paymentStatus ||
        item?.appointmentStatus ||
        "Unknown",
      amount: getAmount(item),
    }));

    const query = search.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(query)
    );
  }, [
    reportType,
    filteredPatients,
    doctors,
    departments,
    filteredAppointments,
    filteredPayments,
    search,
  ]);

  const exportReport = () => {
    downloadCSV(
      `hospital-${reportType}-report.csv`,
      reportRows.map((row) => ({
        ...row,
        amount: row.amount ? row.amount : "",
      }))
    );
  };

  return (
    <div className="admin-reports-page">
      <DashboardSidebar />

      <div className="admin-reports-main">
        <DashboardHeader />

        <main className="admin-reports-content">
          <div className="reports-bg-orb reports-orb-one" />
          <div className="reports-bg-orb reports-orb-two" />

          <div className="admin-reports-inner">
            <motion.header
              className="reports-heading"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <span className="reports-eyebrow">Hospital Analytics</span>
                <h1>Reports &amp; Statistics</h1>
                <p>Hospital ke data ka complete overview aur analysis.</p>
              </div>

              <div className="reports-heading-actions">
                <button
                  className="reports-refresh-btn"
                  onClick={() => fetchReports(true)}
                  disabled={refreshing}
                >
                  <span className={refreshing ? "reports-spinning" : ""}>↻</span>
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>

                <button
                  className="reports-export-btn"
                  onClick={exportReport}
                  disabled={!reportRows.length}
                >
                  ⇩ Export CSV
                </button>
              </div>
            </motion.header>

            {error && (
              <div className="reports-error">
                <span>⚠</span>
                {error}
              </div>
            )}

            <section className="reports-filter-panel">
              <div className="reports-filter-title">
                <span>☷</span>
                <strong>Filter Reports</strong>
              </div>

              <div className="reports-filter-controls">
                <select
                  value={rangeType}
                  onChange={(event) => setRangeType(event.target.value)}
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>

                {rangeType === "custom" && (
                  <>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(event) => setCustomStart(event.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      min={customStart || undefined}
                      value={customEnd}
                      onChange={(event) => setCustomEnd(event.target.value)}
                    />
                  </>
                )}
              </div>
            </section>

            <section className="reports-stats-grid">
              <StatCard
                title="Total Patients"
                value={loading ? "—" : formatNumber(filteredPatients.length)}
                description="Selected date range"
                icon="♙"
                color="purple"
                delay={0.05}
              />
              <StatCard
                title="Total Doctors"
                value={loading ? "—" : formatNumber(doctors.length)}
                description="All registered doctors"
                icon="⚕"
                color="blue"
                delay={0.1}
              />
              <StatCard
                title="Departments"
                value={loading ? "—" : formatNumber(departments.length)}
                description="All departments"
                icon="▦"
                color="cyan"
                delay={0.15}
              />
              <StatCard
                title="Appointments"
                value={loading ? "—" : formatNumber(filteredAppointments.length)}
                description="Selected date range"
                icon="▣"
                color="orange"
                delay={0.2}
              />
              <StatCard
                title="Collected Revenue"
                value={loading ? "—" : formatCurrency(revenue)}
                description={`${paidPayments.length} paid payments`}
                icon="₹"
                color="green"
                delay={0.25}
              />
            </section>

            <section className="reports-chart-grid">
              <motion.article
                className="reports-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="reports-panel-header">
                  <div>
                    <span className="reports-kicker">Financial Overview</span>
                    <h2>Monthly Revenue</h2>
                    <p>Last 12 months · Paid payments</p>
                  </div>
                  <span className="reports-panel-icon green">₹</span>
                </div>

                <BarChart
                  data={monthlyRevenue}
                  valueKey="revenue"
                  labelKey="label"
                  color="green"
                  currency
                />
              </motion.article>

              <motion.article
                className="reports-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="reports-panel-header">
                  <div>
                    <span className="reports-kicker">Patient Activity</span>
                    <h2>Patient Registrations</h2>
                    <p>Selected date range</p>
                  </div>
                  <span className="reports-panel-icon purple">♙</span>
                </div>

                <BarChart
                  data={patientTrend}
                  valueKey="count"
                  labelKey="label"
                  color="purple"
                />
              </motion.article>

              <motion.article
                className="reports-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="reports-panel-header">
                  <div>
                    <span className="reports-kicker">Appointment Overview</span>
                    <h2>Appointment Status</h2>
                    <p>{formatNumber(filteredAppointments.length)} total</p>
                  </div>
                  <span className="reports-panel-icon blue">▣</span>
                </div>

                <div className="reports-status-chart">
                  {appointmentStatuses.map((item) => (
                    <StatusBar
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      total={filteredAppointments.length}
                      color={item.color}
                    />
                  ))}
                </div>
              </motion.article>

              <motion.article
                className="reports-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="reports-panel-header">
                  <div>
                    <span className="reports-kicker">Payment Overview</span>
                    <h2>Payment Status</h2>
                    <p>{formatNumber(filteredPayments.length)} total payments</p>
                  </div>
                  <span className="reports-panel-icon cyan">₹</span>
                </div>

                <div className="reports-status-chart">
                  {paymentStatuses.map((item) => (
                    <StatusBar
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      total={filteredPayments.length}
                      color={item.color}
                    />
                  ))}
                </div>
              </motion.article>

              <motion.article
                className="reports-panel reports-department-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="reports-panel-header">
                  <div>
                    <span className="reports-kicker">Department Activity</span>
                    <h2>Appointments by Department</h2>
                    <p>Based on available appointment department fields</p>
                  </div>
                  <span className="reports-panel-icon orange">▦</span>
                </div>

                {departmentStats.length ? (
                  <div className="reports-department-list">
                    {departmentStats.map((item, index) => {
                      const max = Math.max(
                        1,
                        ...departmentStats.map((entry) => entry.count)
                      );

                      return (
                        <div className="reports-department-row" key={item.label}>
                          <div className="reports-department-name">
                            <span>{item.label}</span>
                            <strong>{item.count}</strong>
                          </div>
                          <div className="reports-department-track">
                            <motion.div
                              className={`reports-department-fill color-${index % 5}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.count / max) * 100}%` }}
                              transition={{ duration: 0.65, delay: index * 0.04 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="reports-no-chart">No departments available</div>
                )}
              </motion.article>
            </section>

            <motion.section
              className="reports-panel reports-table-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="reports-table-header">
                <div>
                  <span className="reports-kicker">Detailed Analytics</span>
                  <h2>
                    {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                  </h2>
                  <p>{formatNumber(reportRows.length)} records found</p>
                </div>

                <div className="reports-table-tools">
                  <select
                    value={reportType}
                    onChange={(event) => {
                      setReportType(event.target.value);
                      setSearch("");
                    }}
                  >
                    <option value="appointments">Appointments</option>
                    <option value="patients">Patients</option>
                    <option value="doctors">Doctors</option>
                    <option value="departments">Departments</option>
                    <option value="payments">Payments</option>
                  </select>

                  <label className="reports-search">
                    <span>⌕</span>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search records..."
                    />
                  </label>
                </div>
              </div>

              <div className="reports-table-scroll">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      {reportType === "appointments" && (
                        <>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Department</th>
                        </>
                      )}
                      {reportType === "patients" && <th>Patient Name</th>}
                      {reportType === "doctors" && <th>Doctor Name</th>}
                      {reportType === "departments" && <th>Department Name</th>}
                      {reportType === "payments" && (
                        <>
                          <th>Patient</th>
                          <th>Amount</th>
                        </>
                      )}
                      {reportType !== "doctors" && reportType !== "departments" && (
                        <th>Date</th>
                      )}
                      {reportType !== "departments" && <th>Status</th>}
                      {reportType === "appointments" && <th>Amount</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="reports-empty-cell">
                          Loading report data...
                        </td>
                      </tr>
                    ) : reportRows.length ? (
                      <AnimatePresence>
                        {reportRows.map((row, index) => (
                          <motion.tr
                            key={`${row.id}-${index}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: Math.min(index * 0.01, 0.2) }}
                          >
                            <td className="reports-id">{String(row.id).slice(-12)}</td>

                            {reportType === "appointments" && (
                              <>
                                <td>{row.patient}</td>
                                <td>{row.doctor}</td>
                                <td>{row.department}</td>
                              </>
                            )}
                            {reportType === "patients" && <td>{row.name}</td>}
                            {reportType === "doctors" && <td>{row.name}</td>}
                            {reportType === "departments" && <td>{row.name}</td>}
                            {reportType === "payments" && (
                              <>
                                <td>{row.patient}</td>
                                <td className="reports-amount">
                                  {formatCurrency(row.amount)}
                                </td>
                              </>
                            )}
                            {reportType !== "doctors" &&
                              reportType !== "departments" && <td>{row.date}</td>}
                            {reportType !== "departments" && (
                              <td>
                                <StatusPill status={row.status} />
                              </td>
                            )}
                            {reportType === "appointments" && (
                              <td className="reports-amount">
                                {row.amount ? formatCurrency(row.amount) : "—"}
                              </td>
                            )}
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <tr>
                        <td colSpan={7} className="reports-empty-cell">
                          <div className="reports-empty-icon">▤</div>
                          <strong>No records found</strong>
                          <span>Selected filter ke liye data available nahi hai.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="reports-table-footer">
                <span>
                  Showing <strong>{formatNumber(reportRows.length)}</strong> records
                </span>
                {/* <button onClick={exportReport} disabled={!reportRows.length}>
                  ⇩ Download CSV
                </button> */}
              </div>
            </motion.section>

            <footer className="reports-footer">
              <span>● Data from existing hospital APIs</span>
              <span>Hospital Reports &amp; Analytics</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}