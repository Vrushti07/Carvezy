const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  "name": "LocationPing",
  "type": "object",
  "properties": {
    "trip_id": {
      "type": "string",
      "description": "Ride or SharedCab ID"
    },
    "user_id": {
      "type": "string",
      "description": "User being tracked"
    },
    "lat": {
      "type": "number"
    },
    "lon": {
      "type": "number"
    },
    "accuracy": {
      "type": "number",
      "description": "GPS accuracy in meters"
    },
    "speed": {
      "type": "number",
      "description": "Speed in km/h"
    },
    "heading": {
      "type": "number",
      "description": "Direction in degrees"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "synced": {
      "type": "boolean",
      "default": false,
      "description": "Whether sent to server"
    }
  },
  "required": [
    "trip_id",
    "user_id",
    "lat",
    "lon"
  ]
})

module.exports = mongoose.model("locationping", locationpingSchema);