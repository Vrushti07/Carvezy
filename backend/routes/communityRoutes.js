const express = require("express");
const router = express.Router();

const {
  getCommunities,
  updateCommunity
} = require("../controllers/communityController");

const base44Auth = require("../middleware/base44Auth");

router.get("/", base44Auth, getCommunities);
router.put("/:id", base44Auth, updateCommunity);

module.exports = router;
