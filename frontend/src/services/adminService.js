import api from "./api";


/*
 * =========================================================
 * ADMIN SERVICE
 * =========================================================
 *
 * Uses only the existing backend APIs.
 *
 * Existing APIs:
 *
 *   GET /api/doctors
 *   GET /api/patients
 *   GET /api/departments
 *
 * No new backend endpoint is required.
 *
 * Not available from current backend:
 *
 *   - Admin-wide appointments
 *   - Appointment analytics
 *   - Revenue aggregation
 *
 * Therefore this service does NOT create fake/mock
 * appointment or revenue data.
 * =========================================================
 */


/*
 * =========================================================
 * GET DOCTORS
 * =========================================================
 */

const getDoctors = async () => {

  const response = await api("/doctors", {
    method: "GET",
  });

  return Array.isArray(response?.data)
    ? response.data
    : [];
};


/*
 * =========================================================
 * GET PATIENTS
 * =========================================================
 */

const getPatients = async () => {

  const response = await api("/patients", {
    method: "GET",
  });

  return Array.isArray(response?.data)
    ? response.data
    : [];
};


/*
 * =========================================================
 * GET DEPARTMENTS
 * =========================================================
 */

const getDepartments = async () => {

  const response = await api("/departments", {
    method: "GET",
  });

  return Array.isArray(response?.data)
    ? response.data
    : [];
};


/*
 * =========================================================
 * GET ADMIN DASHBOARD DATA
 * =========================================================
 */

export const getAdminDashboard = async () => {

  /*
   * Fetch all three existing APIs together.
   */

  const [
    doctorsResponse,
    patientsResponse,
    departmentsResponse,
  ] = await Promise.allSettled([
    getDoctors(),
    getPatients(),
    getDepartments(),
  ]);


  /*
   * =======================================================
   * DOCTORS ERROR
   * =======================================================
   */

  if (
    doctorsResponse.status === "rejected"
  ) {

    throw new Error(
      doctorsResponse.reason?.message ||
        "Unable to load doctors."
    );

  }


  /*
   * =======================================================
   * PATIENTS ERROR
   * =======================================================
   */

  if (
    patientsResponse.status === "rejected"
  ) {

    throw new Error(
      patientsResponse.reason?.message ||
        "Unable to load patients."
    );

  }


  /*
   * =======================================================
   * DEPARTMENTS ERROR
   * =======================================================
   */

  if (
    departmentsResponse.status === "rejected"
  ) {

    throw new Error(
      departmentsResponse.reason?.message ||
        "Unable to load departments."
    );

  }


  /*
   * =======================================================
   * RAW DATA
   * =======================================================
   */

  const doctors =
    doctorsResponse.value || [];

  const patients =
    patientsResponse.value || [];

  const departments =
    departmentsResponse.value || [];


  /*
   * =======================================================
   * ACTIVE DOCTORS
   * =======================================================
   *
   * Backend response structure:
   *
   * doctor.user.isActive
   *
   * A doctor is considered active unless
   * user.isActive === false.
   * =======================================================
   */

  const activeDoctors =
    doctors.filter(
      (doctor) =>
        doctor?.user?.isActive !== false
    );


  /*
   * =======================================================
   * ACTIVE PATIENTS
   * =======================================================
   *
   * Backend response structure:
   *
   * patient.user.isActive
   * =======================================================
   */

  const activePatients =
    patients.filter(
      (patient) =>
        patient?.user?.isActive !== false
    );


  /*
   * =======================================================
   * ACTIVE DEPARTMENTS
   * =======================================================
   */

  const activeDepartments =
    departments.filter(
      (department) =>
        department?.isActive !== false
    );


  /*
   * =======================================================
   * RECENT PATIENTS
   * =======================================================
   *
   * Sort real patients by createdAt.
   *
   * Latest 6 patients are returned.
   * =======================================================
   */

  const recentPatients =
    [...patients]
      .sort(
        (a, b) =>
          new Date(
            b?.createdAt || 0
          ) -
          new Date(
            a?.createdAt || 0
          )
      )
      .slice(0, 6)
      .map((patient) => ({
        id:
          patient?._id ||
          patient?.id,

        name:
          patient?.user?.name ||
          patient?.name ||
          "Patient",

        email:
          patient?.user?.email ||
          patient?.email ||
          "",

        phone:
          patient?.user?.phone ||
          patient?.phone ||
          "",

        isActive:
          patient?.user?.isActive !== false,

        createdAt:
          patient?.createdAt || null,
      }));


  /*
   * =======================================================
   * DOCTOR OVERVIEW
   * =======================================================
   *
   * Keep the original doctor objects because the
   * AdminDashboard.jsx already reads:
   *
   * doctor.user.name
   * doctor.user.isActive
   * doctor.specialization
   * doctor.department.name
   *
   * =======================================================
   */

  const doctorOverview =
    [...doctors]
      .sort(
        (a, b) =>
          new Date(
            b?.createdAt || 0
          ) -
          new Date(
            a?.createdAt || 0
          )
      );


  /*
   * =======================================================
   * DEPARTMENT DATA
   * =======================================================
   */

  const departmentData =
    departments.map(
      (department) => ({
        id:
          department?._id ||
          department?.id,

        name:
          department?.name ||
          "Department",

        description:
          department?.description ||
          "",

        isActive:
          department?.isActive !== false,

        /*
         * Current department API does not
         * provide patient count.
         */
        patients: null,
      })
    );


  /*
   * =======================================================
   * FINAL DASHBOARD OBJECT
   * =======================================================
   */

  return {

    /*
     * -----------------------------------------------------
     * STATISTICS
     * -----------------------------------------------------
     */

    statistics: {

      totalPatients:
        activePatients.length,

      totalDoctors:
        activeDoctors.length,

      totalDepartments:
        departments.length,

      activeDepartments:
        activeDepartments.length,
    },


    /*
     * -----------------------------------------------------
     * ANALYTICS
     * -----------------------------------------------------
     *
     * Current AdminDashboard uses analytics.doctors.
     *
     * Appointment analytics are intentionally empty because
     * current backend does not expose an admin-wide endpoint.
     * -----------------------------------------------------
     */

    analytics: {

      patients: [],

      doctors:
        doctorOverview,

      departments: [],

      appointments: [],
    },


    /*
     * -----------------------------------------------------
     * RECENT PATIENTS
     * -----------------------------------------------------
     */

    recentPatients,


    /*
     * -----------------------------------------------------
     * DEPARTMENTS
     * -----------------------------------------------------
     */

    departments:
      departmentData,


    /*
     * -----------------------------------------------------
     * APPOINTMENTS
     * -----------------------------------------------------
     *
     * Current backend does not provide an admin-wide
     * appointments list.
     *
     * Do NOT create fake data here.
     * -----------------------------------------------------
     */

    appointments: [],
  };
};


/*
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */

export default {
  getAdminDashboard,
};