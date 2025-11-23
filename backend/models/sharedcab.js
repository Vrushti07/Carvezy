const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  "name": "SharedCab",
  "type": "object",
  "properties": {
    "host_booking_id": {
      "type": "string",
      "description": "Original cab booking by host"
    },
    "host_user_id": {
      "type": "string"
    },
    "cab_service": {
      "type": "string",
      "description": "e.g., Uber, Ola, Local Taxi"
    },
    "driver_contact": {
      "type": "string",
      "description": "Cab driver phone"
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
    "start_time": {
      "type": "string",
      "format": "date-time"
    },
    "total_cab_fare": {
      "type": "number",
      "description": "Full fare paid for cab"
    },
    "seats_offered": {
      "type": "integer",
      "description": "Empty seats to share"
    },
    "seats_filled": {
      "type": "integer",
      "default": 0
    },
    "total_distance_km": {
      "type": "number"
    },
    "per_rider_share": {
      "type": "array",
      "description": "Calculated shares per rider",
      "items": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string"
          },
          "distance_km": {
            "type": "number"
          },
          "fare_share": {
            "type": "number"
          }
        }
      }
    },
    "status": {
      "type": "string",
      "enum": [
        "open",
        "full",
        "ongoing",
        "completed",
        "cancelled"
      ],
      "default": "open"
    },
    "gender_preference": {
      "type": "string",
      "enum": [
        "Female Only",
        "Female Preferred",
        "Anyone"
      ],
      "default": "Anyone"
    },
    "visibility": {
      "type": "string",
      "enum": [
        "public",
        "community_only"
      ],
      "default": "public"
    }
  },
  "required": [
    "host_user_id",
    "pickup_point",
    "drop_point",
    "start_time",
    "total_cab_fare",
    "seats_offered"
  ]
})

module.exports = mongoose.model("sharedcab", sharedcabSchema);