// routes/rideRoutes.js
const express = require("express");
const router = express.Router();

const { getRides, updateRide } = require("../controllers/rideController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

// GET all rides
router.get("/", apiKeyMiddleware, getRides);

// UPDATE ride
router.put("/:id", apiKeyMiddleware, updateRide);

module.exports = router;
