// routes/reservationRoutes.js
const express = require("express");
const router = express.Router();

const {
  getReservations,
  updateReservation,
} = require("../controllers/reservationController");

const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

// GET all reservations
router.get("/", apiKeyMiddleware, getReservations);

// UPDATE reservation
router.put("/:id", apiKeyMiddleware, updateReservation);

module.exports = router;
