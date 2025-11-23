const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  "name": "Offer",
  "type": "object",
  "properties": {
    "ride_id": {
      "type": "string",
      "description": "Ride being negotiated"
    },
    "proposer_id": {
      "type": "string",
      "description": "User making the offer"
    },
    "original_price": {
      "type": "number",
      "description": "Driver's base price"
    },
    "offered_amount": {
      "type": "number",
      "description": "Rider's counter-offer"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "accepted",
        "rejected",
        "expired",
        "withdrawn"
      ],
      "default": "pending"
    },
    "expires_at": {
      "type": "string",
      "format": "date-time",
      "description": "Offer valid until"
    },
    "driver_response": {
      "type": "string",
      "description": "Optional message from driver"
    },
    "responded_at": {
      "type": "string",
      "format": "date-time"
    },
    "seat_locked": {
      "type": "boolean",
      "default": true,
      "description": "Temporarily reserves seat during negotiation"
    }
  },
  "required": [
    "ride_id",
    "proposer_id",
    "original_price",
    "offered_amount",
    "expires_at"
  ]
})

module.exports = mongoose.model("offer", offerSchema);