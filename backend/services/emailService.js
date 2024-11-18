const nodemailer = require("nodemailer");
const promoCode = require("../models/promoCode");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
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
    subject: "Happy Birthday from Trip Genie!",
    html: `<h1>Happy Birthday, ${tourist.fname}! 🎉🎂🎈</h1>
        <p>Your wish is our command! Wishing you a magical day filled with happiness and a year filled with joy.</p>
        <p>As a special gift, here is your magical promo code which you can use on any booking or product:</p>
        <h3>Code: <strong>${code}</strong></h3>
        <h3>Discount: <strong>50%</strong></h3>
        <h3>Usage Limit: <strong>1</strong></h3>
        <h3>Valid Until: <strong>${new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ).toDateString()}</strong></h3>
        <p>May all your wishes come true!</p>
        <p>Best wishes,</p>
        <p>The Trip Genie Team</p>`,
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

const sendItineraryReminder = async (itinerary) => {
  const mailOptions = {
    to: itinerary.user.email,
    subject: "Your Upcoming Trip Awaits!",
    html: `<h3>Hi ${itinerary.user.fname},</h3>
            <h2>Your magical journey to ${itinerary.itinerary.title} is just around the corner!</h2>
            <p>Remember to pack all your essentials and have your travel documents ready.</p>
            <p>We hope you have an enchanting trip!\n</p>
            <p>Best wishes,</p>
            <h3>Trip Genie</h3>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending itinerary reminder:", error);
    } else {
      itinerary.isReminderSent = true;
      itinerary.save();
    }
  });
};

const sendActivityReminder = async (activity) => {
  const mailOptions = {
    to: activity.user.email,
    subject: "Your Upcoming Adventure Awaits!",
    html: `<h3>Hi ${activity.user.fname},</h3>
                <h2>Your thrilling adventure to ${activity.activity.name} is just around the corner!</h2>
                <p>Remember to wear comfortable clothing and bring your camera to capture the memories.</p>
                <p>We hope you have an exhilarating experience!\n</p>
                <p>Best wishes,</p>
                <h3>Trip Genie</h3>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending activity reminder:", error);
    } else {
      activity.isReminderSent = true;
      activity.save();
    }
  });
};

module.exports = {
  sendBirthdayEmail,
  sendItineraryReminder,
  sendActivityReminder,
};
