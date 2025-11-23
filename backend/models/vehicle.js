const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
  "name": "Vehicle",
  "type": "object",
  "properties": {
    "owner_user_id": {
      "type": "string",
      "description": "User ID of vehicle owner"
    },
    "plate_number": {
      "type": "string",
      "description": "Vehicle registration plate"
    },
    "model": {
      "type": "string",
      "description": "Vehicle make and model"
    },
    "color": {
      "type": "string"
    },
    "seat_capacity": {
      "type": "integer",
      "description": "Total seats available"
    },
    "vehicle_type": {
      "type": "string",
      "enum": [
        "Car",
        "SUV",
        "Van",
        "Bike"
      ],
      "default": "Car"
    },
    "vehicle_photo_url": {
      "type": "string"
    },
    "verified": {
      "type": "boolean",
      "default": false,
      "description": "Vehicle documents verified"
    }
  },
  "required": [
    "owner_user_id",
    "plate_number",
    "model",
    "seat_capacity"
  ]
})

module.exports = mongoose.model("vehicle", vehicleSchema);