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
const nodemailer = require("nodemailer");
const promoCode = require("./models/promoCode");
const JobStatus = require("./models/JobStatus");
const purchaseController = require("./controllers/purchaseController");

const Tourist = require("./models/tourist");

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

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

const checkBirthdays = async () => {
  try {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    let lastRunDate = new Date();
    console.log("Checking birthdays on server start...");

    // Fetch the last run date from JobStatus
    let jobStatus = await JobStatus.findOne({ jobName: "BirthdayJob" });
    if (jobStatus) {
      lastRunDate = jobStatus.lastRun || new Date(today - 86400000); // Default to 1 day before
      // If the last run date is not today, check for birthdays
      if (
        lastRunDate.getDate() !== todayDay ||
        lastRunDate.getMonth() !== todayMonth
      ) {
        console.log("Checking for birthdays...");
        await sendBirthdayCards();
        jobStatus.lastRun = today;
        await jobStatus.save();
      }
    } else {
      jobStatus = new JobStatus({ jobName: "BirthdayJob" });
      await jobStatus.save();
    }
  } catch (error) {
    console.error("Error checking birthdays:", error);
  }
};

// Run this function on server startup
checkAndUpdateRatesOnStart();
checkBirthdays();

const sendBirthdayCards = async () => {
  const today = new Date(); // Get today's date
  const todayMonth = today.getMonth(); // Get the month (0-11)
  const todayDay = today.getDate(); // Get the day (1-31)

  try {
    // Fetch all tourists from the database
    const tourists = await Tourist.find();

    // Filter tourists whose DOB matches today's month and day
    const birthdayTourists = tourists.filter((tourist) => {
      const dob = new Date(tourist.dateOfBirth); // Convert DOB to Date object
      return dob.getMonth() === todayMonth && dob.getDate() === todayDay;
    });

    // Send birthday emails to the filtered tourists
    birthdayTourists.forEach((tourist) => {
      sendBirthdayEmail(tourist);
    });
  } catch (error) {
    console.error("Error sending birthday cards:", error);
  }
};

// Schedule the task to run once every day at midnight (server time)
cron.schedule("0 0 * * *", async () => {
  console.log(
    "Running daily job to update currency rates and send birthday cards..."
  );
  await currencyRateController.updateRatesAgainstUSD();
  await sendBirthdayCards();
  await purchaseController.updatePurchaseStatus();
  JobStatus.findOneAndUpdate(
    { jobName: "BirthdayJob" },
    { lastRun: new Date() },
    { upsert: true }
  );
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

//stripe payment
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, currency } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: currency,
          product_data: {
            name: item.product.name,
          },
          unit_amount: Math.round(item.totalPrice * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `http://localhost:3000/checkout2?success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/checkout2`,
    });

    console.log("Checkout session created:", session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

const sendBirthdayEmail = async (tourist) => {
  let code = "";
  if (tourist.fname) {
    code = `${tourist.fname.toUpperCase()}${tourist.dateOfBirth.getFullYear()}`;
  } else {
    code = `${tourist.username.toUpperCase()}${tourist.dateOfBirth.getFullYear()}`;
  }
  const mailOptions = {
    to: tourist.email,
    subject: "Happy Birthday!",
    html: `<h1>Happy Birthday, ${tourist.fname}! 🎉🎂🎈</h1>
      <p>Wishing you a day filled with happiness and a year filled with joy.</p>
      <p>Here is your gift promo code which you could use on anything upon payment</p>
      <h3>Code: <strong>${code}</strong></h3>
      <h3>Discount: <strong>50%</strong></h3>
      <h3>Usage Limit: <strong>1</strong></h3>
      <h3>Valid Until: <strong>${new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toDateString()}</strong></h3>
      <p>May all wishes come true!\n</p>
      <p>Best wishes,</p>
      <p>Trip Genie team</p>`,
  };

  const promo = new promoCode({
    code: code,
    percentOff: 50,
    usage_limit: 1,
    dateRange: {
      start: new Date(),
      end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  });

  await promo.save();

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending birthday email:", error);
    }
  });
};
