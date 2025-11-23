// routes/sharedCabRoutes.js
const express = require("express");
const router = express.Router();

const {
  getSharedCabs,
  updateSharedCab
} = require("../controllers/sharedCabController");

const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

// GET all shared cabs
router.get("/", apiKeyMiddleware, getSharedCabs);

// UPDATE shared cab
router.put("/:id", apiKeyMiddleware, updateSharedCab);

module.exports = router;
