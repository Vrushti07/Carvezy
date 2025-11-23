const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  "name": "Community",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Community name (e.g., Stanford University, Google SF)"
    },
    "type": {
      "type": "string",
      "enum": [
        "college",
        "workplace",
        "locality",
        "other"
      ],
      "default": "other"
    },
    "verified": {
      "type": "boolean",
      "default": false,
      "description": "Official community verification"
    },
    "member_count": {
      "type": "integer",
      "default": 0
    },
    "location": {
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
    "description": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "type"
  ]
})

module.exports = mongoose.model("community", communitySchema);