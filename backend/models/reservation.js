const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  "name": "Reservation",
  "type": "object",
  "properties": {
    "ride_id": {
      "type": "string",
      "description": "Associated ride"
    },
    "user_id": {
      "type": "string",
      "description": "User holding reservation"
    },
    "seats_reserved": {
      "type": "integer",
      "default": 1
    },
    "reserved_at": {
      "type": "string",
      "format": "date-time"
    },
    "expires_at": {
      "type": "string",
      "format": "date-time",
      "description": "90-second expiry window"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "confirmed",
        "expired",
        "cancelled"
      ],
      "default": "pending"
    },
    "reservation_token": {
      "type": "string",
      "description": "Unique token for this reservation"
    }
  },
  "required": [
    "ride_id",
    "user_id",
    "expires_at"
  ]
})

module.exports = mongoose.model("reservation", reservationSchema);