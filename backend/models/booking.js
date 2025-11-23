const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  "name": "Booking",
  "type": "object",
  "properties": {
    "ride_id": {
      "type": "string",
      "description": "Associated ride"
    },
    "user_id": {
      "type": "string",
      "description": "Rider who booked"
    },
    "reservation_id": {
      "type": "string",
      "description": "Original reservation ID"
    },
    "seats_booked": {
      "type": "integer",
      "default": 1
    },
    "fare_amount": {
      "type": "number",
      "description": "Agreed fare"
    },
    "fare_share_calculated": {
      "type": "number",
      "description": "For shared cabs, distance-based share"
    },
    "paid_status": {
      "type": "string",
      "enum": [
        "pending",
        "paid",
        "refunded",
        "partial_refund"
      ],
      "default": "pending"
    },
    "pickup_point": {
      "type": "object",
      "properties": {
        "address": {
          "type": "string"
        },
        "lat": {
          "type": "number"
        },
        "lon": {
          "type": "number"
        }
      }
    },
    "drop_point": {
      "type": "object",
      "properties": {
        "address": {
          "type": "string"
        },
        "lat": {
          "type": "number"
        },
        "lon": {
          "type": "number"
        }
      }
    },
    "distance_traveled_km": {
      "type": "number",
      "description": "For fare calculation in shared cabs"
    },
    "cancellation_reason": {
      "type": "string"
    },
    "cancelled_at": {
      "type": "string",
      "format": "date-time"
    },
    "refund_amount": {
      "type": "number"
    },
    "rider_rating": {
      "type": "number",
      "description": "Driver's rating of rider"
    },
    "driver_rating": {
      "type": "number",
      "description": "Rider's rating of driver"
    }
  },
  "required": [
    "ride_id",
    "user_id",
    "fare_amount"
  ]
})

module.exports = mongoose.model("booking", bookingSchema);