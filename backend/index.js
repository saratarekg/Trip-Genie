require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const guestRoutes = require("./routes/guestRoutes");
const touristRoutes = require("./routes/touristRoutes");
const adminRoutes = require("./routes/adminRoutes");
const tourismGovernorRoutes = require("./routes/tourismGovernorRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const tourGuideRoutes = require("./routes/tourGuideRoutes");
const advertiserRoutes = require("./routes/advertiserRoutes");
const apiRoutes = require("./routes/apiRoutes");

//const productRoutes = require("./routes/productRoutes");
const cookieParser = require("cookie-parser");
const { requireAuth } = require("./middlewares/authMiddleware");
const { getAllLanguages } = require("./controllers/itineraryController");
const cron = require("node-cron");
const currencyRateController = require("./controllers/currencyRateController");
const Grid = require("gridfs-stream");

const PORT = process.env.PORT;

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

mongoose
  .connect(process.env.URI)
  .then((connection) => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const db = connection.connection.db; // access the raw MongoDB driver from the connection
    const gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });
    app.locals.gfs = gfs;
  })
  .catch((err) => console.log(err));

// Check and update the exchange rates when the server starts
const checkAndUpdateRatesOnStart = async () => {
  try {
    console.log("Checking exchange rates on server start...");
    await currencyRateController.updateRatesAgainstUSD();
  } catch (error) {
    console.error("Error updating rates on server start:", error);
  }
};

// Run this function on server startup
checkAndUpdateRatesOnStart();

// Schedule the task to run once every day at midnight (server time)
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily job to update currency rates...");
  await currencyRateController.updateRatesAgainstUSD();
});

app.get("/", (req, res) => res.send("Currency API is running!"));

app.use("/auth", authRoutes);
app.use("/guest", guestRoutes);
app.use("/api", apiRoutes);
app.use("/admin", requireAuth("admin"), adminRoutes);
app.use(
  "/tourism-governor",
  requireAuth("tourism-governor"),
  tourismGovernorRoutes
);
app.use("/tourist", requireAuth("tourist"), touristRoutes);
app.use("/seller", requireAuth("seller"), sellerRoutes);
app.use("/tour-guide", requireAuth("tour-guide"), tourGuideRoutes);
app.use("/advertiser", requireAuth("advertiser"), advertiserRoutes);


// get currency rates from the database currencyrates model with id 6726a0e0206edfcc2ef30c16
app.get("/rates", currencyRateController.getExchangeRate);