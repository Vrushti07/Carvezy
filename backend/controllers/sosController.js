// controllers/sosController.js
const fetch = require("node-fetch");

const BASE_URL =
  "https://app.base44.com/api/apps/6921fca855cc4b1485bc934c/entities/SOS";

// Fetch all SOS records
exports.getSOS = async (req, res) => {
  try {
    const response = await fetch(BASE_URL, {
      headers: {
        api_key: process.env.BASE44_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch SOS alerts" });
  }
};

// Update SOS entry
exports.updateSOS = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        api_key: process.env.BASE44_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update SOS record" });
  }
};
