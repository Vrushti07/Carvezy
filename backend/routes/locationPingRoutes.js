const express = require("express");
const router = express.Router();

const { 
  getLocationPings,
  updateLocationPing 
} = require("../controllers/locationPingController");

const base44Auth = require("../middleware/base44Auth");

router.get("/", base44Auth, getLocationPings);
router.put("/:id", base44Auth, updateLocationPing);

module.exports = router;
