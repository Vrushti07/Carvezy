const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  "name": "Ride",
  "type": "object",
  "properties": {
    "host_driver_id": {
      "type": "string",
      "description": "User ID of driver"
    },
    "vehicle_id": {
      "type": "string",
      "description": "Associated vehicle ID"
    },
    "start_point": {
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
    "destination": {
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
    "waypoints": {
      "type": "array",
      "description": "Optional stops along route",
      "items": {
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
      }
    },
    "start_time": {
      "type": "string",
      "format": "date-time",
      "description": "Scheduled departure time"
    },
    "seat_capacity": {
      "type": "integer",
      "description": "Total seats offered"
    },
    "seats_available": {
      "type": "integer",
      "description": "Remaining seats"
    },
    "base_price": {
      "type": "number",
      "description": "Price per seat"
    },
    "ride_type": {
      "type": "string",
      "enum": [
        "carpool",
        "shared_cab"
      ],
      "default": "carpool"
    },
    "gender_preference": {
      "type": "string",
      "enum": [
        "Female Only",
        "Female Preferred",
        "Anyone"
      ],
      "default": "Anyone",
      "description": "Gender-based ride access"
    },
    "visibility": {
      "type": "string",
      "enum": [
        "public",
        "community_only",
        "invite_only"
      ],
      "default": "public"
    },
    "status": {
      "type": "string",
      "enum": [
        "scheduled",
        "ongoing",
        "completed",
        "cancelled"
      ],
      "default": "scheduled"
    },
    "estimated_distance_km": {
      "type": "number"
    },
    "estimated_duration_mins": {
      "type": "number"
    },
    "route_polyline": {
      "type": "string",
      "description": "Encoded route path"
    },
    "driver_notes": {
      "type": "string",
      "description": "Additional info from driver"
    },
    "community_only_enabled": {
      "type": "boolean",
      "default": false
    },
    "discoverable": {
      "type": "boolean",
      "default": true,
      "description": "Show in search results"
    }
  },
  "required": [
    "host_driver_id",
    "start_point",
    "destination",
    "start_time",
    "seat_capacity",
    "base_price"
  ]
})

module.exports = mongoose.model("ride", rideSchema);