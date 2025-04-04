const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/PaymentModel");

const User = require('../models/UserModel');
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


exports.createOrder = async (req, res) => {
  const { userId, cartItems, totalAmount } = req.body;

  try {
    
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Math.random()}`,
      payment_capture: 1, 
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      userId,
      cartItems,
      totalAmount,
      paymentStatus: 'Pending',
      razorpayOrderId: order.id, 
    });

    await payment.save();

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
};


exports.verifyPayment = async (req, res) => {
  const paymentResponse = req.body;

  try {
    const payment = await Payment.findOne({ razorpayOrderId: paymentResponse.razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    payment.paymentStatus = 'Completed';
    await payment.save();

    res.status(200).json({ success: true, message: 'Payment verified successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    
    const userId = req.user.id; 

    // Verify if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bookings = await Payment.find({ userId: userId }).sort({ createdAt: -1 }); 
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAllUsersBookings = async (req, res) => {
  try {
    const bookings = await Payment.find()
      .populate('userId', 'name email') 
      .exec();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};