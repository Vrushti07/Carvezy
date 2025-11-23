const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

// Routes
const vehicleRoutes = require("./routes/vehicleRoutes");
app.use("/api/vehicles", vehicleRoutes);


const rideRoutes = require("./routes/rideRoutes");
app.use("/api/rides", rideRoutes);

const reservationRoutes = require("./routes/reservationRoutes");
app.use("/api/reservations", reservationRoutes);

const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

const sharedCabRoutes = require("./routes/sharedCabRoutes");
app.use("/api/sharedcabs", sharedCabRoutes);

const offerRoutes = require("./routes/offerRoutes");
app.use("/api/offers", offerRoutes);

const sosRoutes = require("./routes/sosRoutes");
app.use("/api/sos", sosRoutes);

app.use("/api/location-pings", require("./routes/locationPingRoutes"));

app.use("/api/payments", require("./routes/paymentRoutes"));

app.use("/api/community", require("./routes/communityRoutes"));

// Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));