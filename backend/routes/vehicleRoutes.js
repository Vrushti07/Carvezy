// routes/vehicleRoutes.js
const express = require("express");
const router = express.Router();

const { getVehicles, updateVehicle } = require("../controllers/vehicleController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

// GET all vehicles
router.get("/", apiKeyMiddleware, getVehicles);

// UPDATE vehicle
router.put("/:id", apiKeyMiddleware, updateVehicle);

module.exports = router;
