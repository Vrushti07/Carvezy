const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  "name": "SOS",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User triggering SOS"
    },
    "ride_id": {
      "type": "string",
      "description": "Active ride during SOS"
    },
    "location": {
      "type": "object",
      "properties": {
        "lat": {
          "type": "number"
        },
        "lon": {
          "type": "number"
        },
        "accuracy": {
          "type": "number"
        },
        "address": {
          "type": "string"
        }
      }
    },
    "sos_type": {
      "type": "string",
      "enum": [
        "emergency",
        "safety_concern",
        "accident",
        "harassment",
        "other"
      ],
      "default": "emergency"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "description": {
      "type": "string",
      "description": "User-provided details"
    },
    "contacts_notified": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Emergency contacts alerted"
    },
    "resolved_status": {
      "type": "string",
      "enum": [
        "active",
        "resolved",
        "escalated",
        "false_alarm"
      ],
      "default": "active"
    },
    "resolved_at": {
      "type": "string",
      "format": "date-time"
    },
    "resolution_notes": {
      "type": "string"
    },
    "recent_location_pings": {
      "type": "array",
      "description": "Last N location updates before SOS",
      "items": {
        "type": "object",
        "properties": {
          "lat": {
            "type": "number"
          },
          "lon": {
            "type": "number"
          },
          "timestamp": {
            "type": "string"
          }
        }
      }
    }
  },
  "required": [
    "user_id",
    "location"
  ]
})

module.exports = mongoose.model("sos", sosSchema);