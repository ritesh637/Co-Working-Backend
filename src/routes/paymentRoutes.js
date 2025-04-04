const express = require("express");
const { createOrder, verifyPayment,getUserBookings,getAllUsersBookings } = require("../controllers/paymentContoller");
const {authMiddleware,adminMiddleware}= require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/create-order",authMiddleware, createOrder);
router.post("/verify-payment",authMiddleware, verifyPayment);
router.get("/my-bookings",authMiddleware,getUserBookings);
router.get("/my-all-users-bookings",authMiddleware, adminMiddleware,getAllUsersBookings)

module.exports = router;