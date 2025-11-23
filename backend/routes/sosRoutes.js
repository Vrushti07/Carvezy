// routes/sosRoutes.js
const express = require("express");
const router = express.Router();

const { getSOS, updateSOS } = require("../controllers/sosController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

// GET all SOS alerts
router.get("/", apiKeyMiddleware, getSOS);

// UPDATE SOS entry
router.put("/:id", apiKeyMiddleware, updateSOS);

module.exports = router;
