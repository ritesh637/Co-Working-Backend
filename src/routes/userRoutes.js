const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const {
  registerUser,
  loginUser,
  otpGenerate,
  resetPassword,
  verifyOtp
} = require("../controllers/userController");

// Register a new user
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

// Generate OTP
router.post("/generateotp", otpGenerate);

//Verffy otp
router.post('/verifyotp',verifyOtp);

// Reset Password
router.post("/forgotpassword", resetPassword);


module.exports = router;
