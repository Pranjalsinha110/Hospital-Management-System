const express = require("express");
const {createDoctor, getAllDoctors,updateDoctor,getDoctorById,updateDoctorStatus, getAvailableDoctors} = require("../controller/doctorController")
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router = express.Router();

//create doctor
router.post("/",authMiddleware,
                 roleMiddleware("admin"),
                createDoctor
            )

//get all doctor
router.get("/", authMiddleware,
                roleMiddleware("admin"),
                getAllDoctors

)

// get available doctor
router.get(
    "/available",
    getAvailableDoctors
);

//update doctor
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateDoctor
);

//get doctor by id
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getDoctorById
);


// Activate / Deactivate doctor
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateDoctorStatus
);


module.exports = router;