import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import doctorService from "../../services/doctorService";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";
import "./AdminDoctors.css";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  specialization: "",
  qualification: "",
  experience: "",
  consultationFee: "",
  licenseNumber: "",
  department: "",
  bio: "",
  profileImage: "",
  availableDays: [],
  availableTime: {
    start: "",
    end: "",
  },
  isAvailable: true,
};

const getDoctorId = (doctor) => {
  return doctor?._id || doctor?.id || doctor?.doctor?.id || "";
};

const getDoctorName = (doctor) => {
  return doctor?.user?.name || doctor?.name || "Unknown Doctor";
};

const getDoctorEmail = (doctor) => {
  return doctor?.user?.email || doctor?.email || "";
};

const getDoctorPhone = (doctor) => {
  return doctor?.user?.phone || doctor?.phone || "";
};

const getDepartmentName = (doctor) => {
  if (typeof doctor?.department === "string") {
    return doctor.department;
  }

  return doctor?.department?.name || "Not assigned";
};

const normalizeDoctor = (doctor) => {
  return {
    ...doctor,
    id: getDoctorId(doctor),
    name: getDoctorName(doctor),
    email: getDoctorEmail(doctor),
    phone: getDoctorPhone(doctor),
    departmentName: getDepartmentName(doctor),
    isActive:
      typeof doctor?.user?.isActive === "boolean"
        ? doctor.user.isActive
        : typeof doctor?.isActive === "boolean"
        ? doctor.isActive
        : true,
    isAvailable:
      typeof doctor?.isAvailable === "boolean"
        ? doctor.isAvailable
        : false,
  };
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "DR";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  return error?.message || fallback;
};

const extractDoctors = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.doctors)) {
    return response.data.doctors;
  }

  if (Array.isArray(response?.doctors)) {
    return response.doctors;
  }

  return [];
};

const extractDoctorFromResponse = (response) => {
  return (
    response?.data?.doctor ||
    response?.data ||
    response?.doctor ||
    null
  );
};

const AdminDoctor = () => {
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [editingDoctor, setEditingDoctor] = useState(null);

  const [statusTarget, setStatusTarget] = useState(null);
  const [statusNextValue, setStatusNextValue] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await doctorService.getAllDoctors();

      const fetchedDoctors = extractDoctors(response);

      setDoctors(fetchedDoctors.map(normalizeDoctor));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to load doctors. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 6000);

    return () => clearTimeout(timer);
  }, [error]);

  const departments = useMemo(() => {
    const uniqueDepartments = new Set();

    doctors.forEach((doctor) => {
      const department = doctor.departmentName;

      if (department && department !== "Not assigned") {
        uniqueDepartments.add(department);
      }
    });

    return Array.from(uniqueDepartments).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [doctors]);

  const stats = useMemo(() => {
    const total = doctors.length;

    const active = doctors.filter(
      (doctor) => doctor.isActive
    ).length;

    const inactive = doctors.filter(
      (doctor) => !doctor.isActive
    ).length;

    const available = doctors.filter(
      (doctor) => doctor.isAvailable && doctor.isActive
    ).length;

    return {
      total,
      active,
      inactive,
      available,
    };
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const searchableText = [
        doctor.name,
        doctor.email,
        doctor.phone,
        doctor.specialization,
        doctor.qualification,
        doctor.licenseNumber,
        doctor.departmentName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesDepartment =
        departmentFilter === "all" ||
        doctor.departmentName === departmentFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && doctor.isActive) ||
        (statusFilter === "inactive" && !doctor.isActive);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" &&
          doctor.isAvailable) ||
        (availabilityFilter === "unavailable" &&
          !doctor.isAvailable);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesAvailability
      );
    });
  }, [
    doctors,
    search,
    departmentFilter,
    statusFilter,
    availabilityFilter,
  ]);

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
    setEditingDoctor(null);
    setShowPassword(false);
  };

  const openAddModal = () => {
    setError("");
    setFormErrors({});
    setEditingDoctor(null);
    setForm(emptyForm);
    setShowPassword(false);
    setShowFormModal(true);
  };

  const openEditModal = (doctor) => {
    setError("");
    setFormErrors({});
    setEditingDoctor(doctor);
    setShowPassword(false);

    setForm({
      name: doctor?.user?.name || doctor?.name || "",
      email: doctor?.user?.email || doctor?.email || "",
      password: "",
      phone: doctor?.user?.phone || doctor?.phone || "",
      specialization: doctor?.specialization || "",
      qualification: doctor?.qualification || "",
      experience:
        doctor?.experience !== undefined &&
        doctor?.experience !== null
          ? String(doctor.experience)
          : "",
      consultationFee:
        doctor?.consultationFee !== undefined &&
        doctor?.consultationFee !== null
          ? String(doctor.consultationFee)
          : "",
      licenseNumber: doctor?.licenseNumber || "",
      department: getDepartmentName(doctor) === "Not assigned"
        ? ""
        : getDepartmentName(doctor),
      bio: doctor?.bio || "",
      profileImage: doctor?.profileImage || "",
      availableDays: Array.isArray(doctor?.availableDays)
        ? doctor.availableDays
        : [],
      availableTime: {
        start: doctor?.availableTime?.start || "",
        end: doctor?.availableTime?.end || "",
      },
      isAvailable:
        typeof doctor?.isAvailable === "boolean"
          ? doctor.isAvailable
          : true,
    });

    setShowFormModal(true);
  };

  const openViewModal = async (doctor) => {
    setError("");

    setSelectedDoctor(doctor);
    setShowViewModal(true);

    const doctorId = getDoctorId(doctor);

    if (!doctorId) return;

    try {
      const response = await doctorService.getDoctorById(doctorId);

      const freshDoctor = extractDoctorFromResponse(response);

      if (freshDoctor) {
        const normalized = normalizeDoctor(freshDoctor);

        setSelectedDoctor(normalized);

        setDoctors((previous) =>
          previous.map((item) =>
            getDoctorId(item) === doctorId
              ? normalized
              : item
          )
        );
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to fetch the latest doctor details."
        )
      );
    }
  };

  const closeFormModal = () => {
    if (submitting) return;

    setShowFormModal(false);
    resetForm();
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedDoctor(null);
  };

  const closeStatusModal = () => {
    if (statusUpdating) return;

    setShowStatusModal(false);
    setStatusTarget(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleTimeChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      availableTime: {
        ...previous.availableTime,
        [name]: value,
      },
    }));
  };

  const toggleDay = (day) => {
    setForm((previous) => {
      const exists = previous.availableDays.includes(day);

      return {
        ...previous,
        availableDays: exists
          ? previous.availableDays.filter(
              (item) => item !== day
            )
          : [...previous.availableDays, day],
      };
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Doctor name is required.";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (!editingDoctor && !form.password.trim()) {
      errors.password = "Password is required.";
    }

    if (!form.specialization.trim()) {
      errors.specialization =
        "Specialization is required.";
    }

    if (!form.qualification.trim()) {
      errors.qualification =
        "Qualification is required.";
    }

    if (
      form.experience === "" ||
      Number.isNaN(Number(form.experience))
    ) {
      errors.experience = "Experience is required.";
    } else if (
      Number(form.experience) < 0 ||
      Number(form.experience) > 70
    ) {
      errors.experience =
        "Experience must be between 0 and 70 years.";
    }

    if (
      form.consultationFee === "" ||
      Number.isNaN(Number(form.consultationFee))
    ) {
      errors.consultationFee =
        "Consultation fee is required.";
    } else if (Number(form.consultationFee) < 0) {
      errors.consultationFee =
        "Consultation fee cannot be negative.";
    }

    if (!form.licenseNumber.trim()) {
      errors.licenseNumber =
        "Medical license number is required.";
    }

    if (!form.department.trim()) {
      errors.department = "Department is required.";
    }

    if (
      form.availableTime.start &&
      form.availableTime.end &&
      form.availableTime.start >= form.availableTime.end
    ) {
      errors.availableTime =
        "End time must be after start time.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      specialization: form.specialization.trim(),
      qualification: form.qualification.trim(),
      experience: Number(form.experience),
      consultationFee: Number(form.consultationFee),
      licenseNumber: form.licenseNumber.trim(),
      department: form.department.trim(),
      bio: form.bio.trim(),
      profileImage: form.profileImage.trim(),
      availableDays: form.availableDays,
      availableTime: {
        start: form.availableTime.start || null,
        end: form.availableTime.end || null,
      },
      isAvailable: Boolean(form.isAvailable),
    };

    if (!editingDoctor) {
      payload.password = form.password;
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const payload = buildPayload();

      if (editingDoctor) {
        const doctorId = getDoctorId(editingDoctor);

        if (!doctorId) {
          throw new Error("Doctor ID is missing.");
        }

        const response =
          await doctorService.updateDoctor(
            doctorId,
            payload
          );

        const updatedDoctor =
          extractDoctorFromResponse(response);

        if (updatedDoctor) {
          const normalizedDoctor =
            normalizeDoctor(updatedDoctor);

          setDoctors((previous) =>
            previous.map((doctor) =>
              getDoctorId(doctor) === doctorId
                ? normalizedDoctor
                : doctor
            )
          );
        } else {
          await loadDoctors();
        }

        setSuccessMessage(
          "Doctor profile updated successfully."
        );
      } else {
        const response =
          await doctorService.createDoctor(payload);

        const createdDoctor =
          extractDoctorFromResponse(response);

        if (createdDoctor) {
          const normalizedDoctor =
            normalizeDoctor(createdDoctor);

          setDoctors((previous) => [
            normalizedDoctor,
            ...previous,
          ]);
        } else {
          await loadDoctors();
        }

        setSuccessMessage(
          "Doctor created successfully."
        );
      }

      setShowFormModal(false);
      resetForm();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingDoctor
            ? "Failed to update doctor."
            : "Failed to create doctor."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusConfirmation = (doctor) => {
    const doctorId = getDoctorId(doctor);

    if (!doctorId) {
      setError("Doctor ID is missing.");
      return;
    }

    setStatusTarget(doctor);
    setStatusNextValue(!doctor.isActive);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;

    const doctorId = getDoctorId(statusTarget);

    if (!doctorId) {
      setError("Doctor ID is missing.");
      return;
    }

    try {
      setStatusUpdating(true);
      setError("");
      setSuccessMessage("");

      const response =
        await doctorService.updateDoctorStatus(
          doctorId,
          statusNextValue
        );

      const responseUser = response?.data?.user;
      const responseDoctor = response?.data?.doctor;

      setDoctors((previous) =>
        previous.map((doctor) => {
          if (getDoctorId(doctor) !== doctorId) {
            return doctor;
          }

          return {
            ...doctor,
            user: responseUser
              ? {
                  ...doctor.user,
                  ...responseUser,
                }
              : doctor.user,
            isActive:
              typeof responseUser?.isActive ===
              "boolean"
                ? responseUser.isActive
                : statusNextValue,
            isAvailable:
              typeof responseDoctor?.isAvailable ===
              "boolean"
                ? responseDoctor.isAvailable
                : doctor.isAvailable,
          };
        })
      );

      if (
        selectedDoctor &&
        getDoctorId(selectedDoctor) === doctorId
      ) {
        setSelectedDoctor((previous) => ({
          ...previous,
          user: responseUser
            ? {
                ...previous.user,
                ...responseUser,
              }
            : previous.user,
          isActive:
            typeof responseUser?.isActive === "boolean"
              ? responseUser.isActive
              : statusNextValue,
          isAvailable:
            typeof responseDoctor?.isAvailable ===
            "boolean"
              ? responseDoctor.isAvailable
              : previous.isAvailable,
        }));
      }

      setSuccessMessage(
        statusNextValue
          ? "Doctor activated successfully."
          : "Doctor deactivated successfully."
      );

      setShowStatusModal(false);
      setStatusTarget(null);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to update doctor status."
        )
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("all");
    setStatusFilter("all");
    setAvailabilityFilter("all");
  };

  const hasActiveFilters =
    search.trim() ||
    departmentFilter !== "all" ||
    statusFilter !== "all" ||
    availabilityFilter !== "all";

  const getAvatarContent = (doctor) => {
    if (doctor.profileImage) {
      return (
        <img
          src={doctor.profileImage}
          alt={doctor.name}
          className="admin-doctor-avatar-image"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      );
    }

    return (
      <span className="admin-doctor-avatar-text">
        {getInitials(doctor.name)}
      </span>
    );
  };

  return (
    
    <div className="admin-doctor-page">
      
    <DashboardSidebar />
    <div className="admin-doctor-header">
      <DashboardHeader/>
    </div>
    
      <div className="admin-doctor-background">
        <span className="doctor-orb doctor-orb-one" />
        <span className="doctor-orb doctor-orb-two" />
        <span className="doctor-grid-glow" />
      </div>
    
      <div className="admin-doctor-container">
       
        {/* HEADER */}
        <motion.div
          className="admin-doctor-header"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
           
          <div className="admin-doctor-heading">
            <motion.div
              className="admin-doctor-heading-icon"
              initial={{ scale: 0.7, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.55,
                type: "spring",
              }}
            >
              <span>⚕</span>
            </motion.div>
 
            <div>
              
              <div className="admin-doctor-eyebrow">
                ADMINISTRATION
              </div>

              <h1>Doctor Management</h1>

              <p>
                Manage doctor profiles, availability and
                account status from one place.
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            className="admin-doctor-add-btn"
            onClick={openAddModal}
            whileHover={{
              y: -3,
              scale: 1.02,
            }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="admin-doctor-add-icon">
              +
            </span>

            <span>Add Doctor</span>
          </motion.button>
        </motion.div>

        {/* ALERTS */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              className="admin-doctor-alert success"
              initial={{
                opacity: 0,
                y: -12,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -12,
                height: 0,
              }}
            >
              <span className="alert-icon">✓</span>
              <span>{successMessage}</span>

              <button
                type="button"
                onClick={() => setSuccessMessage("")}
              >
                ×
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="admin-doctor-alert error"
              initial={{
                opacity: 0,
                y: -12,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -12,
                height: 0,
              }}
            >
              <span className="alert-icon">!</span>
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS */}
        <div className="admin-doctor-stats">
          {[
            {
              label: "Total Doctors",
              value: stats.total,
              icon: "👨‍⚕️",
              className: "total",
            },
            {
              label: "Active Doctors",
              value: stats.active,
              icon: "✓",
              className: "active",
            },
            {
              label: "Inactive Doctors",
              value: stats.inactive,
              icon: "⏸",
              className: "inactive",
            },
            {
              label: "Available Doctors",
              value: stats.available,
              icon: "●",
              className: "available",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`admin-doctor-stat-card ${stat.className}`}
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.08 * index,
                duration: 0.45,
              }}
              whileHover={{
                y: -5,
              }}
            >
              <div className="admin-doctor-stat-icon">
                {stat.icon}
              </div>

              <div className="admin-doctor-stat-content">
                <span>{stat.label}</span>

                <strong>{stat.value}</strong>
              </div>

              <div className="admin-doctor-stat-shine" />
            </motion.div>
          ))}
        </div>

        {/* FILTER PANEL */}
        <motion.div
          className="admin-doctor-filter-card"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
            duration: 0.5,
          }}
        >
          <div className="admin-doctor-filter-top">
            <div>
              <h2>Doctor Directory</h2>

              <p>
                {filteredDoctors.length} doctor
                {filteredDoctors.length !== 1 ? "s" : ""}{" "}
                found
              </p>
            </div>

            {hasActiveFilters && (
              <motion.button
                type="button"
                className="admin-doctor-clear-btn"
                onClick={clearFilters}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Clear filters
              </motion.button>
            )}
          </div>

          <div className="admin-doctor-filters">
            <div className="admin-doctor-search">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, email, specialization, license..."
              />

              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="admin-doctor-select-wrap">
              <select
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(event.target.value)
                }
              >
                <option value="all">
                  All Departments
                </option>

                {departments.map((department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-doctor-select-wrap">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">
                  All Account Status
                </option>

                <option value="active">Active</option>
                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="admin-doctor-select-wrap">
              <select
                value={availabilityFilter}
                onChange={(event) =>
                  setAvailabilityFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Availability
                </option>

                <option value="available">
                  Available
                </option>

                <option value="unavailable">
                  Unavailable
                </option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* DOCTOR LIST */}
        <section className="admin-doctor-list-section">
          {loading ? (
            <div className="admin-doctor-loading-grid">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <motion.div
                    className="admin-doctor-skeleton-card"
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: index * 0.06,
                    }}
                  >
                    <div className="skeleton-avatar" />

                    <div className="skeleton-lines">
                      <span />
                      <span />
                      <span />
                    </div>

                    <div className="skeleton-footer">
                      <span />
                      <span />
                    </div>
                  </motion.div>
                )
              )}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <motion.div
              className="admin-doctor-empty"
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <div className="empty-icon">👨‍⚕️</div>

              <h3>No doctors found</h3>

              <p>
                {hasActiveFilters
                  ? "Try changing your search or filters."
                  : "No doctors have been added yet."}
              </p>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openAddModal}
                >
                  Add First Doctor
                </button>
              )}
            </motion.div>
          ) : (
            <div className="admin-doctor-grid">
              <AnimatePresence mode="popLayout">
                {filteredDoctors.map(
                  (doctor, index) => (
                    <motion.article
                      key={getDoctorId(doctor)}
                      className={`admin-doctor-card ${
                        !doctor.isActive
                          ? "doctor-card-inactive"
                          : ""
                      }`}
                      layout
                      initial={{
                        opacity: 0,
                        y: 25,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.94,
                      }}
                      transition={{
                        delay: Math.min(
                          index * 0.045,
                          0.3
                        ),
                        duration: 0.4,
                      }}
                      whileHover={{
                        y: -7,
                      }}
                    >
                      <div className="doctor-card-top">
                        <div className="admin-doctor-avatar">
                          {getAvatarContent(doctor)}

                          <span
                            className={`doctor-online-dot ${
                              doctor.isAvailable &&
                              doctor.isActive
                                ? "online"
                                : "offline"
                            }`}
                          />
                        </div>

                        <div className="doctor-card-identity">
                          <h3>{doctor.name}</h3>

                          <p>
                            {doctor.specialization ||
                              "Specialization not added"}
                          </p>

                          <span>
                            {doctor.email ||
                              "No email"}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="doctor-card-menu"
                          onClick={() =>
                            openViewModal(doctor)
                          }
                          aria-label="View doctor"
                        >
                          ⋮
                        </button>
                      </div>

                      <div className="doctor-card-badges">
                        <span
                          className={`doctor-status-badge ${
                            doctor.isActive
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          <i />
                          {doctor.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                        <span
                          className={`doctor-status-badge ${
                            doctor.isAvailable &&
                            doctor.isActive
                              ? "availability-active"
                              : "availability-inactive"
                          }`}
                        >
                          <i />

                          {doctor.isAvailable &&
                          doctor.isActive
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>

                      <div className="doctor-card-details">
                        <div className="doctor-detail-item">
                          <span>Department</span>
                          <strong>
                            {doctor.departmentName}
                          </strong>
                        </div>

                        <div className="doctor-detail-item">
                          <span>Experience</span>
                          <strong>
                            {doctor.experience ?? 0}{" "}
                            yrs
                          </strong>
                        </div>

                        <div className="doctor-detail-item">
                          <span>Consultation</span>
                          <strong>
                            ₹
                            {Number(
                              doctor.consultationFee || 0
                            ).toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div className="doctor-detail-item">
                          <span>License</span>
                          <strong>
                            {doctor.licenseNumber ||
                              "—"}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-card-footer">
                        <motion.button
                          type="button"
                          className="doctor-action-btn view"
                          onClick={() =>
                            openViewModal(doctor)
                          }
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          View
                        </motion.button>

                        <motion.button
                          type="button"
                          className="doctor-action-btn edit"
                          onClick={() =>
                            openEditModal(doctor)
                          }
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Edit
                        </motion.button>

                        <motion.button
                          type="button"
                          className={`doctor-action-btn ${
                            doctor.isActive
                              ? "deactivate"
                              : "activate"
                          }`}
                          onClick={() =>
                            openStatusConfirmation(
                              doctor
                            )
                          }
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {doctor.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </motion.button>
                      </div>
                    </motion.article>
                  )
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            className="admin-doctor-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                closeFormModal();
              }
            }}
          >
            <motion.div
              className="admin-doctor-modal admin-doctor-form-modal"
              initial={{
                opacity: 0,
                y: 35,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 25,
                scale: 0.96,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <div className="admin-doctor-modal-header">
                <div>
                  <span className="modal-eyebrow">
                    {editingDoctor
                      ? "UPDATE PROFILE"
                      : "NEW DOCTOR"}
                  </span>

                  <h2>
                    {editingDoctor
                      ? "Edit Doctor"
                      : "Add New Doctor"}
                  </h2>

                  <p>
                    {editingDoctor
                      ? "Update doctor information and availability."
                      : "Create a new doctor account and professional profile."}
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={closeFormModal}
                  disabled={submitting}
                >
                  ×
                </button>
              </div>

              <form
                className="admin-doctor-form"
                onSubmit={handleSubmit}
              >
                <div className="form-section">
                  <div className="form-section-title">
                    <span>01</span>
                    <div>
                      <h3>Account Information</h3>
                      <p>
                        Basic account details of the
                        doctor.
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div
                      className={`form-field ${
                        formErrors.name
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <label>
                        Full Name <b>*</b>
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        placeholder="Dr. Rahul Sharma"
                      />

                      {formErrors.name && (
                        <small>
                          {formErrors.name}
                        </small>
                      )}
                    </div>

                    <div
                      className={`form-field ${
                        formErrors.email
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <label>
                        Email Address <b>*</b>
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="doctor@hospital.com"
                      />

                      {formErrors.email && (
                        <small>
                          {formErrors.email}
                        </small>
                      )}
                    </div>

                    <div className="form-field">
                      <label>Phone Number</label>

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    {!editingDoctor && (
                      <div
                        className={`form-field ${
                          formErrors.password
                            ? "has-error"
                            : ""
                        }`}
                      >
                        <label>
                          Password <b>*</b>
                        </label>

                        <div className="password-input-wrap">
                          <input
                            type={
                              showPassword
                                ? "text"
                                : "password"
                            }
                            name="password"
                            value={form.password}
                            onChange={handleInputChange}
                            placeholder="Create secure password"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(
                                (previous) =>
                                  !previous
                              )
                            }
                          >
                            {showPassword
                              ? "Hide"
                              : "Show"}
                          </button>
                        </div>

                        {formErrors.password && (
                          <small>
                            {formErrors.password}
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <span>02</span>
                    <div>
                      <h3>Professional Information</h3>
                      <p>
                        Doctor's medical and professional
                        details.
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div
                      className={`form-field ${
                        formErrors.specialization
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <label>
                        Specialization <b>*</b>
                      </label>

                      <input
                        type="text"
                        name="specialization"
                        value={form.specialization}
                        onChange={handleInputChange}
                        placeholder="Cardiologist"
                      />

                      {formErrors.specialization && (
                        <small>
                          {formErrors.specialization}
                        </small>
                      )}
                    </div>

                    <div
                      className={`form-field ${
                        formErrors.qualification
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <label>
                        Qualification <b>*</b>
                      </label>

                      <input
                        type="text"
                        name="qualification"
                        value={form.qualification}
                        onChange={handleInputChange}
                        placeholder="MBBS, MD Cardiology"
                      />

                      {formErrors.qualification && (
                        <small>
                          {formErrors.qualification}
                        </small>
                      )}
                    </div>

                    <div
                      className={`form-field ${
                        formErrors.experience
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <label>
                        Experience (Years) <b>*</b>
                      </label>

                      <input
                        type="number"
                        name="experience"
                        min="0"
                        max="70"
                        value={form.experience}
                        onChange={handleInputChange}
                        placeholder="10"
                      />

                      {formErrors.experience && (
                        <small>
                          {formErrors.experience}
                        </small>
                      )}
                    </div>

                    <div
                      className={`form-field ${
                        formErrors.consultationFee
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <label>
                        Consultation Fee <b>*</b>
                      </label>

                      <div className="currency-input">
                        <span>₹</span>

                        <input
                          type="number"
                          name="consultationFee"
                          min="0"
                          value={
                            form.consultationFee
                          }
                          onChange={handleInputChange}
                          placeholder="800"
                        />
                      </div>

                      {formErrors.consultationFee && (
                        <small>
                          {
                            formErrors.consultationFee
                          }
                        </small>
                      )}
                    </div>

                    <div
                      className={`form-field ${
                        formErrors.licenseNumber
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <label>
                        Medical License Number{" "}
                        <b>*</b>
                      </label>

                      <input
                        type="text"
                        name="licenseNumber"
                        value={form.licenseNumber}
                        onChange={handleInputChange}
                        placeholder="MED-IND-12345"
                      />

                      {formErrors.licenseNumber && (
                        <small>
                          {formErrors.licenseNumber}
                        </small>
                      )}
                    </div>

                    <div
                      className={`form-field ${
                        formErrors.department
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <label>
                        Department <b>*</b>
                      </label>

                      <input
                        type="text"
                        name="department"
                        value={form.department}
                        onChange={handleInputChange}
                        placeholder="Cardiology"
                      />

                      {formErrors.department && (
                        <small>
                          {formErrors.department}
                        </small>
                      )}

                      <em>
                        Enter the active department name
                        exactly as stored in the backend.
                      </em>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <span>03</span>
                    <div>
                      <h3>Profile Details</h3>
                      <p>
                        Public-facing profile information.
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field full-width">
                      <label>Profile Image URL</label>

                      <input
                        type="url"
                        name="profileImage"
                        value={form.profileImage}
                        onChange={handleInputChange}
                        placeholder="https://example.com/doctor.jpg"
                      />
                    </div>

                    <div className="form-field full-width">
                      <label>Doctor Bio</label>

                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleInputChange}
                        rows="5"
                        maxLength="1000"
                        placeholder="Write a short professional biography..."
                      />

                      <div className="textarea-counter">
                        {form.bio.length}/1000
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <span>04</span>
                    <div>
                      <h3>Availability</h3>
                      <p>
                        Configure consultation days and
                        hours.
                      </p>
                    </div>
                  </div>

                  <div className="availability-form-block">
                    <label className="availability-label">
                      Available Days
                    </label>

                    <div className="days-selector">
                      {DAYS.map((day) => {
                        const selected =
                          form.availableDays.includes(
                            day
                          );

                        return (
                          <button
                            type="button"
                            key={day}
                            className={`day-chip ${
                              selected
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              toggleDay(day)
                            }
                          >
                            <span>
                              {selected ? "✓" : "+"}
                            </span>
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>

                    <div className="time-fields">
                      <div className="form-field">
                        <label>Start Time</label>

                        <input
                          type="time"
                          name="start"
                          value={
                            form.availableTime.start
                          }
                          onChange={handleTimeChange}
                        />
                      </div>

                      <div className="time-arrow">
                        →
                      </div>

                      <div className="form-field">
                        <label>End Time</label>

                        <input
                          type="time"
                          name="end"
                          value={
                            form.availableTime.end
                          }
                          onChange={handleTimeChange}
                        />
                      </div>
                    </div>

                    {formErrors.availableTime && (
                      <div className="availability-error">
                        {formErrors.availableTime}
                      </div>
                    )}

                    <label className="availability-toggle">
                      <input
                        type="checkbox"
                        checked={form.isAvailable}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            isAvailable:
                              event.target.checked,
                          }))
                        }
                      />

                      <span className="toggle-track">
                        <span />
                      </span>

                      <div>
                        <strong>
                          Available for appointments
                        </strong>

                        <small>
                          Patients can see this doctor
                          when availability is enabled.
                        </small>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="admin-doctor-form-actions">
                  <button
                    type="button"
                    className="form-cancel-btn"
                    onClick={closeFormModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    className="form-submit-btn"
                    disabled={submitting}
                    whileHover={{
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  >
                    {submitting ? (
                      <>
                        <span className="button-spinner" />
                        {editingDoctor
                          ? "Updating..."
                          : "Creating..."}
                      </>
                    ) : (
                      <>
                        <span>
                          {editingDoctor ? "✓" : "+"}
                        </span>

                        {editingDoctor
                          ? "Update Doctor"
                          : "Create Doctor"}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================
          VIEW MODAL
      ================================================== */}
      <AnimatePresence>
        {showViewModal && selectedDoctor && (
          <motion.div
            className="admin-doctor-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                closeViewModal();
              }
            }}
          >
            <motion.div
              className="admin-doctor-modal admin-doctor-view-modal"
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 25,
                scale: 0.96,
              }}
            >
              <div className="admin-doctor-modal-header">
                <div>
                  <span className="modal-eyebrow">
                    DOCTOR PROFILE
                  </span>

                  <h2>Doctor Details</h2>
                </div>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={closeViewModal}
                >
                  ×
                </button>
              </div>

              <div className="doctor-profile-hero">
                <div className="doctor-profile-avatar">
                  {selectedDoctor.profileImage ? (
                    <img
                      src={
                        selectedDoctor.profileImage
                      }
                      alt={selectedDoctor.name}
                    />
                  ) : (
                    <span>
                      {getInitials(
                        selectedDoctor.name
                      )}
                    </span>
                  )}
                </div>

                <div className="doctor-profile-main">
                  <h3>
                    {selectedDoctor.name}
                  </h3>

                  <p>
                    {selectedDoctor.specialization ||
                      "Specialization not added"}
                  </p>

                  <span>
                    {selectedDoctor.qualification ||
                      "Qualification not added"}
                  </span>

                  <div className="doctor-profile-statuses">
                    <span
                      className={`doctor-status-badge ${
                        selectedDoctor.isActive
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      <i />
                      {selectedDoctor.isActive
                        ? "Active Account"
                        : "Inactive Account"}
                    </span>

                    <span
                      className={`doctor-status-badge ${
                        selectedDoctor.isAvailable &&
                        selectedDoctor.isActive
                          ? "availability-active"
                          : "availability-inactive"
                      }`}
                    >
                      <i />

                      {selectedDoctor.isAvailable &&
                      selectedDoctor.isActive
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="doctor-profile-grid">
                <div className="doctor-profile-info-card">
                  <span>Email</span>
                  <strong>
                    {selectedDoctor.email || "—"}
                  </strong>
                </div>

                <div className="doctor-profile-info-card">
                  <span>Phone</span>
                  <strong>
                    {selectedDoctor.phone || "—"}
                  </strong>
                </div>

                <div className="doctor-profile-info-card">
                  <span>Department</span>
                  <strong>
                    {selectedDoctor.departmentName}
                  </strong>
                </div>

                <div className="doctor-profile-info-card">
                  <span>Experience</span>
                  <strong>
                    {selectedDoctor.experience ?? 0}{" "}
                    years
                  </strong>
                </div>

                <div className="doctor-profile-info-card">
                  <span>Consultation Fee</span>
                  <strong>
                    ₹
                    {Number(
                      selectedDoctor.consultationFee ||
                        0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="doctor-profile-info-card">
                  <span>License Number</span>
                  <strong>
                    {selectedDoctor.licenseNumber ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div className="doctor-profile-section">
                <div className="profile-section-heading">
                  <h4>About Doctor</h4>
                </div>

                <p className="doctor-bio">
                  {selectedDoctor.bio ||
                    "No biography has been added for this doctor."}
                </p>
              </div>

              <div className="doctor-profile-section">
                <div className="profile-section-heading">
                  <h4>Consultation Schedule</h4>
                </div>

                <div className="schedule-info">
                  <div>
                    <span>Days</span>

                    <div className="schedule-days">
                      {selectedDoctor.availableDays
                        ?.length ? (
                        selectedDoctor.availableDays.map(
                          (day) => (
                            <span key={day}>
                              {day.slice(0, 3)}
                            </span>
                          )
                        )
                      ) : (
                        <em>
                          No days configured
                        </em>
                      )}
                    </div>
                  </div>

                  <div>
                    <span>Time</span>

                    <strong>
                      {selectedDoctor.availableTime
                        ?.start &&
                      selectedDoctor.availableTime
                        ?.end
                        ? `${selectedDoctor.availableTime.start} - ${selectedDoctor.availableTime.end}`
                        : "Not configured"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="doctor-view-actions">
                <button
                  type="button"
                  className="doctor-action-btn edit"
                  onClick={() => {
                    closeViewModal();
                    openEditModal(
                      selectedDoctor
                    );
                  }}
                >
                  Edit Doctor
                </button>

                <button
                  type="button"
                  className={`doctor-action-btn ${
                    selectedDoctor.isActive
                      ? "deactivate"
                      : "activate"
                  }`}
                  onClick={() =>
                    openStatusConfirmation(
                      selectedDoctor
                    )
                  }
                >
                  {selectedDoctor.isActive
                    ? "Deactivate Doctor"
                    : "Activate Doctor"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================
          ACTIVATE / DEACTIVATE CONFIRMATION
      ================================================== */}
      <AnimatePresence>
        {showStatusModal && statusTarget && (
          <motion.div
            className="admin-doctor-confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="admin-doctor-confirm-modal"
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
            >
              <div
                className={`confirm-icon ${
                  statusNextValue
                    ? "activate"
                    : "deactivate"
                }`}
              >
                {statusNextValue ? "✓" : "!"}
              </div>

              <span className="modal-eyebrow">
                ACCOUNT STATUS
              </span>

              <h2>
                {statusNextValue
                  ? "Activate Doctor?"
                  : "Deactivate Doctor?"}
              </h2>

              <p>
                Are you sure you want to{" "}
                <strong>
                  {statusNextValue
                    ? "activate"
                    : "deactivate"}
                </strong>{" "}
                <b>
                  {getDoctorName(statusTarget)}
                </b>
                ?
              </p>

              {!statusNextValue && (
                <div className="confirm-warning">
                  <span>⚠</span>

                  <div>
                    <strong>
                      Important
                    </strong>

                    <p>
                      Deactivating the doctor will also
                      make the doctor unavailable for
                      appointments.
                    </p>
                  </div>
                </div>
              )}

              <div className="confirm-actions">
                <button
                  type="button"
                  className="confirm-cancel"
                  onClick={closeStatusModal}
                  disabled={statusUpdating}
                >
                  Cancel
                </button>

                <motion.button
                  type="button"
                  className={`confirm-submit ${
                    statusNextValue
                      ? "activate"
                      : "deactivate"
                  }`}
                  onClick={handleStatusChange}
                  disabled={statusUpdating}
                  whileTap={{ scale: 0.97 }}
                >
                  {statusUpdating ? (
                    <>
                      <span className="button-spinner" />
                      Updating...
                    </>
                  ) : statusNextValue ? (
                    "Yes, Activate"
                  ) : (
                    "Yes, Deactivate"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDoctor;