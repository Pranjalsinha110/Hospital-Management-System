const express = require("express");

const {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    updateDepartmentStatus
} = require("../controller/departmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// GET ALL DEPARTMENTS
// Patient / Doctor / Admin


router.get(
    "/",
    authMiddleware,
    getAllDepartments
);



// GET DEPARTMENT BY ID
// Patient / Doctor / Admin


router.get(
    "/:id",
    authMiddleware,
    getDepartmentById
);



// CREATE DEPARTMENT
// Admin Only


router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createDepartment
);



// UPDATE DEPARTMENT
// Admin Only


router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateDepartment
);



// UPDATE DEPARTMENT STATUS
// Admin Only


router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateDepartmentStatus
);


module.exports = router;