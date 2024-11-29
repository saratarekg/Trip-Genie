const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendBirthdayEmail = async (tourist, code) => {
  const mailOptions = {
    to: tourist.email,
    subject: "Happy Birthday from Trip Genie!",
    html: `<h1>Happy Birthday, ${
      tourist.fname ? tourist.fname : tourist.username
    }! 🎉🎂🎈</h1>
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

const sendActivityBookingConfirmationEmail = async (
  email,
  booking,
  activity
) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Booking Confirmation",
    html: `<h1>Booking Confirmation</h1>
        <p>Thank you for booking with us. Here are your booking details:</p>
        <p><strong>Booking ID: ${booking._id}</p>
        <p><strong>Activity: ${activity.name}</p>
        <p><strong>Location: ${activity.location.address}</p>
        <p><strong>Date: ${new Date(activity.timing).toLocaleDateString(
          "en-US"
        )}</p>
        <p><strong>Payment Type: ${booking.paymentType}</p>
        <p><strong>Payment Amount: ${booking.paymentAmount}</p>
        <p><strong>Number of Tickets: ${booking.numberOfTickets}</p>
        <p>Enjoy your experience!</p>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(
        "Error sending activity booking confirmation email:",
        error
      );
    }
  });
};

const sendItineraryBookingConfirmationEmail = async (
  email,
  booking,
  itinerary
) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Booking Confirmation",
    html: `<h1>Booking Confirmation</h1>
            <p>Thank you for booking with us. Here are your booking details:</p>
            <p><strong>Booking ID: ${booking._id}</p>
            <p><strong>Itinerary: ${itinerary.title}</p>
            <p><strong>Date: ${new Date(booking.date).toLocaleDateString(
              "en-US"
            )}</p>
            <p><strong>Payment Type: ${booking.paymentType}</p>
            <p><strong>Payment Amount: ${booking.paymentAmount}</p>
            <p><strong>Number of Tickets: ${booking.numberOfTickets}</p>
            <p>Enjoy your trip!</p>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(
        "Error sending itinerary booking confirmation email:",
        error
      );
    }
  });
};

const sendPurchaseConfirmationEmail = async (
  email,
  purchase,
  productsDetails
) => {
  // Send an email to the tourist with order details
  const mailOptions = {
    to: email,
    subject: "Purchase Confirmation",
    html: `<h1>Thank you for your purchase!</h1>
        <p>Your order has been placed successfully. Here are the details:</p>
        <p><strong>Order ID:</strong> ${purchase._id}</p>
        <p><strong>Delivery Date:</strong> ${new Date(
          purchase.deliveryDate
        ).toLocaleDateString("en-US")}</p>
        <p><strong>Delivery Time:</strong> ${purchase.deliveryTime}</p>
        <p><strong>Delivery Address:</strong> ${purchase.shippingAddress}</p>
        <p><strong>Delivery Type:</strong> ${purchase.deliveryType}</p>
        <p><strong>Payment Method:</strong> ${purchase.paymentMethod}</p>
        <p><strong>Total Price:</strong> $${purchase.totalPrice}</p>
        <p><strong>Products:</strong></p>
        <ul>
          ${productsDetails
            .map(
              (item) =>
                `<li>${item.quantity} x ${item.product.name} - $${item.product.price}</li>`
            )
            .join("")}
        </ul>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending purchase confirmation email:", error);
    }
  });
};

const sendOutOfStockEmail = async (email, name, product) => {
  const mailOptions = {
    to: email,
    subject: "Product Out of Stock Notification",
    html: `<h1>Product Out of Stock</h1>
            <p>Dear ${name},</p>
            <p>We wanted to inform you that your product is currently out of stock:</p>
            <p><strong>Product Name:</strong> ${product.name}</p>
            <p>Please update the stock availability this product.</p>
            <p>Thank you for your attention.</p>
            <p>Best regards,<br>Trip Genie</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending out of stock email:", error);
    }
  });
};

const sendItineraryFlaggedEmail = async (itinerary) => {
  const mailOptions = {
    to: itinerary.tourGuide.email,
    subject: "Itinerary Flagged as Inappropriate",
    html: `<h1>Itinerary Flagged as Inappropriate</h1>
            <p>Dear ${itinerary.tourGuide.name},</p>
            <p>We wanted to inform you that your itinerary has been flagged as inappropriate:</p>
            <p><strong>Itinerary Title:</strong> ${itinerary.title}</p>
            <p>Please review the itinerary and make the necessary changes.</p>
            <p>Thank you for your attention.</p>
            <p>Best regards,<br>Trip Genie</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending itinerary flagged email:", error);
    }
  });
};

const sendActivityFlaggedEmail = async (activity) => {
  const mailOptions = {
    to: activity.advertiser.email,
    subject: "Activity Flagged as Inappropriate",
    html: `<h1>Activity Flagged as Inappropriate</h1>
            <p>Dear ${activity.advertiser.name},</p>
            <p>We wanted to inform you that your activity has been flagged as inappropriate:</p>
            <p><strong>Activity Name:</strong> ${activity.name}</p>
            <p>Please review the activity and make the necessary changes.</p>
            <p>Thank you for your attention.</p>
            <p>Best regards,<br>Trip Genie</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending activity flagged email:", error);
    }
  });
};

module.exports = {
  sendBirthdayEmail,
  sendItineraryReminder,
  sendActivityReminder,
  sendActivityBookingConfirmationEmail,
  sendItineraryBookingConfirmationEmail,
  sendPurchaseConfirmationEmail,
  sendOutOfStockEmail,
  sendItineraryFlaggedEmail,
  sendActivityFlaggedEmail,
};
