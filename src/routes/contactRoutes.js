const express = require("express");
const router = express.Router();
const { createContact, getContacts } = require("../controllers/contactContoller");


// Route to create a new contact form submission
router.post("/submit", createContact);

// Route to get all contact form submissions
router.get("/all", getContacts);

module.exports = router;
