const axios = require("axios");

const BASE_URL = "https://app.base44.com/api/apps/6921fca855cc4b1485bc934c/entities/LocationPing";
const API_KEY = process.env.BASE44_API_KEY;

// GET ALL LOCATION PINGS
exports.getLocationPings = async (req, res) => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        api_key: API_KEY,
        "Content-Type": "application/json"
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching location pings:", error.message);
    res.status(500).json({ message: "Failed to fetch location pings" });
  }
};

// UPDATE LOCATION PING
exports.updateLocationPing = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.put(`${BASE_URL}/${id}`, req.body, {
      headers: {
        api_key: API_KEY,
        "Content-Type": "application/json"
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error updating location ping:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to update location ping" });
  }
};
