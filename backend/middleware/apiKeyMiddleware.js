// middleware/apiKeyMiddleware.js
require("dotenv").config();

module.exports = function (req, res, next) {
    const clientApiKey = req.headers["api_key"];

    if (!clientApiKey) {
        return res.status(401).json({ message: "API key missing" });
    }

    if (clientApiKey !== process.env.BASE44_API_KEY) {
        return res.status(403).json({ message: "Invalid API key" });
    }

    next();
};
