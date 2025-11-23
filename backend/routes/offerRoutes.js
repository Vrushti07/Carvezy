// routes/offerRoutes.js
const express = require("express");
const router = express.Router();

const {
  getOffers,
  updateOffer
} = require("../controllers/offerController");

const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

// GET all offers
router.get("/", apiKeyMiddleware, getOffers);

// UPDATE an offer
router.put("/:id", apiKeyMiddleware, updateOffer);

module.exports = router;
