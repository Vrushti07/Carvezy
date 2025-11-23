// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();

const {
  getBookings,
  updateBooking
} = require("../controllers/bookingController");

const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

// GET all bookings
router.get("/", apiKeyMiddleware, getBookings);

// UPDATE a booking
router.put("/:id", apiKeyMiddleware, updateBooking);

module.exports = router;
