const express = require("express");
const router = express.Router();

const {
  getPayments,
  updatePayment
} = require("../controllers/paymentController");

const base44Auth = require("../middleware/base44Auth");

router.get("/", base44Auth, getPayments);
router.put("/:id", base44Auth, updatePayment);

module.exports = router;
