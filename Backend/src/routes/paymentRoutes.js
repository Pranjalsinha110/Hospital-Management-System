const express = require("express");

const {
    createPaymentOrder,
    verifyPayment,
    getAllPayments,
    getUnpaidPayments,
    deleteUnpaidPayment
} = require("../controller/paymentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


router.post(
    "/create-order",
    authMiddleware,
    createPaymentOrder
);


router.post(
    "/verify",
    authMiddleware,
    verifyPayment
);
//for admin to get all payments
router.get("/", 
        authMiddleware,
        roleMiddleware("admin"),
         getAllPayments);

router.get(
    "/unpaid",
    authMiddleware,
    roleMiddleware("admin"),
    getUnpaidPayments
);

router.delete(
    "/:paymentId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteUnpaidPayment
);
module.exports = router;