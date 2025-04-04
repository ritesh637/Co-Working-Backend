const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/UserModel");
const Otp = require("../models/OtpModel");

const registerUser = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      role: role || "user", 
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "👤 User does not exist!" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact support!" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      userId: user._id,
      username: user.username,
      role: user.role, 
      message:
        user.role === "admin"
          ? "✅ Admin login successful!"
          : "✅ User login successful!",
    });
  } catch (error) {
    res.status(500).json({ message: "⚠️ Server error. Please try again." });
  }
};

const otpGenerate = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User does not exist!" });
    }
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ user: user._id });

    await Otp.create({ user: user._id, otp: generatedOtp });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

   
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${generatedOtp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Error sending email. Try again." });
      }
      res.json({ message: "OTP sent to your email!" });
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ message: "Server error. Try again." });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User does not exist!" });
    }

    const otpEntry = await Otp.findOne({ user: user._id, otp }).sort({
      createdAt: -1,
    });
    if (!otpEntry) {
      return res.json({ message: "Invalid or expired OTP!" });
    }
    if (!otpEntry) {
      return res.json({ message: "Invalid or expired OTP!" });
    }

    res.json({ message: "OTP verified successfully!" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error. Try again." });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "👤 User does not exist!" });
    }
    const otpEntry = await Otp.findOne({ user: user._id, otp });
    if (!otpEntry) {
      return res.json({ message: "⚠️ Invalid or expired OTP!" });
    }
    module.exports = {
      registerUser,
      loginUser,
      otpGenerate,
      verifyOtp,
      resetPassword,
    };
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();
    await Otp.deleteMany({ user: user._id });

    res.json({ message: "Password reset successfully!", color: "green" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error. Try again." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  otpGenerate,
  resetPassword,
  verifyOtp,
};
