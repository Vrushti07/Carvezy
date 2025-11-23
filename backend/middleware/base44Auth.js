module.exports = (req, res, next) => {
  if (!process.env.BASE44_API_KEY) {
    return res.status(500).json({ message: "Base44 API Key not configured" });
  }
  next();
};
