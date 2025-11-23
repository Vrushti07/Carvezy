const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  "name": "Payment",
  "type": "object",
  "properties": {
    "booking_id": {
      "type": "string",
      "description": "Associated booking"
    },
    "payer_id": {
      "type": "string",
      "description": "User making payment"
    },
    "recipient_id": {
      "type": "string",
      "description": "Driver receiving payment"
    },
    "amount": {
      "type": "number",
      "description": "Total payment amount"
    },
    "platform_fee": {
      "type": "number",
      "description": "Carvezy commission"
    },
    "driver_payout": {
      "type": "number",
      "description": "Amount to driver"
    },
    "payment_method": {
      "type": "string",
      "enum": [
        "wallet",
        "card",
        "upi",
        "cash"
      ],
      "default": "wallet"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "completed",
        "failed",
        "refunded",
        "partial_refund"
      ],
      "default": "pending"
    },
    "transaction_id": {
      "type": "string",
      "description": "External payment gateway reference"
    },
    "refund_history": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "amount": {
            "type": "number"
          },
          "reason": {
            "type": "string"
          },
          "timestamp": {
            "type": "string"
          }
        }
      }
    },
    "dispute_id": {
      "type": "string",
      "description": "If payment disputed"
    }
  },
  "required": [
    "booking_id",
    "payer_id",
    "amount"
  ]
})

module.exports = mongoose.model("payment", paymentSchema);