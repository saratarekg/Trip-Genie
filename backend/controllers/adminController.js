const Admin = require("../models/admin");
const TourismGovernor = require("../models/tourismGovernor");
const Tourist = require("../models/tourist");
const Seller = require("../models/seller");
const Advertiser = require("../models/advertiser");
const TourGuide = require("../models/tourGuide");
const Grid = require("gridfs-stream");
const express = require("express");
const mongoose = require("mongoose");
const ItineraryBooking = require("../models/itineraryBooking");
const ActivityBooking = require("../models/activityBooking");
const Purchase = require("../models/purchase");
const ProductSales = require("../models/productSales");
const Itinerary = require("../models/itinerary");
const Activity = require("../models/activity");
const PromoCode = require("../models/promoCode");

const addAdmin = async (req, res) => {
  try {
    // console.log(req.body);
    if (await usernameExists(req.body.username)) {
      throw new Error("Username already exists");
    }
    const admin = new Admin(req.body);

    admin
      .save()
      .then((result) => {
        res.status(201).json({ admin: result });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
        console.log(err);
      });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAdminAccount = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(201).json({ message: "Admin deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admin = await Admin.find().sort({ createdAt: -1 });
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsersByRoles = async (req, res) => {
  const { role } = req.query; // Extract the role from the query parameters

  try {
    // Fetch all users for each category
    const admin = await Admin.find();
    const tourist = await Tourist.find();
    const governor = await TourismGovernor.find();
    const seller = await Seller.find();
    const tourGuide = await TourGuide.find();
    const advertiser = await Advertiser.find();

    // Combine all users into one array
    const allUsers = [
      ...admin.map((user) => ({ ...user.toObject(), role: "admin" })),
      ...tourist.map((user) => ({ ...user.toObject(), role: "tourist" })),
      ...governor.map((user) => ({ ...user.toObject(), role: "governor" })),
      ...seller.map((user) => ({ ...user.toObject(), role: "seller" })),
      ...tourGuide.map((user) => ({ ...user.toObject(), role: "tourGuide" })),
      ...advertiser.map((user) => ({ ...user.toObject(), role: "advertiser" })),
    ];

    // Filter users by role if specified
    const filteredUsers = role
      ? allUsers.filter((user) => user.role === role)
      : allUsers;

    // Return the filtered array as a response
    res.status(200).json({
      users: filteredUsers,
    });
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users for each category
    const admin = await Admin.find();
    const tourist = await Tourist.find();
    const governor = await TourismGovernor.find();
    const seller = await Seller.find();
    const tourGuide = await TourGuide.find();
    const advertiser = await Advertiser.find();

    // Combine all users into one array
    const allUsers = [
      ...admin,
      ...tourist,
      ...governor,
      ...seller,
      ...tourGuide,
      ...advertiser,
    ];

    // Return the combined array as a response
    res.status(200).json({
      allUsers,
    });
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({ error: error.message });
  }
};

const getAdminByID = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const admin = await Admin.findById(res.locals.user_id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const { oldPassword, newPassword } = req.body;
    const isMatch = await admin.comparePassword(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password cannot be the same" });
    }
    admin.password = newPassword;
    await admin.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Gather all validation error messages
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json({ message: "Validation error", errors: validationErrors });
    }
    res.status(400).json({ error: error.message });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const gfs = req.app.locals.gfs;

    if (!gfs) {
      return res.status(500).send("GridFS is not initialized");
    }

    const files = await gfs.find().toArray();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFile = async (req, res) => {
  try {
    const gfs = req.app.locals.gfs;

    if (!gfs) {
      return res.status(500).send("GridFS is not initialized");
    }

    const filename = req.params.filename;
    const files = await gfs.find({ filename }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ err: "No file exists" });
    }

    res.set("Content-Type", files[0].contentType);
    const readstream = gfs.openDownloadStreamByName(filename);
    readstream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const gfs = req.app.locals.gfs;

    if (!gfs) {
      return res.status(500).send("GridFS is not initialized");
    }

    const filename = req.params.filename;
    const files = await gfs.find({ filename }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ err: "No file exists" });
    }

    await gfs.delete(files[0]._id);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(res.locals.user_id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const usernameExists = async (username) => {
  if (
    (await Tourist.findOne({ username })) ||
    (await TourGuide.findOne({ username })) ||
    (await Advertiser.findOne({ username })) ||
    (await Seller.findOne({ username })) ||
    (await Admin.findOne({ username })) ||
    (await TourismGovernor.findOne({ username }))
  ) {
    return true;
  } else {
    return false;
  }
};

const getUsersReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    let tourist, tourGuide, advertiser, seller, governor, admin;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      tourist = await Tourist.countDocuments({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });
      tourGuide = await TourGuide.countDocuments({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });
      advertiser = await Advertiser.countDocuments({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });
      seller = await Seller.countDocuments({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });
      governor = await TourismGovernor.countDocuments({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });
      admin = await Admin.countDocuments({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });
    } else {
      tourist = await Tourist.countDocuments();
      tourGuide = await TourGuide.countDocuments();
      advertiser = await Advertiser.countDocuments();
      seller = await Seller.countDocuments();
      governor = await TourismGovernor.countDocuments();
      admin = await Admin.countDocuments();
    }

    const total = tourist + tourGuide + advertiser + seller + governor + admin;

    res.status(200).json({
      tourist,
      tourGuide,
      advertiser,
      seller,
      governor,
      admin,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addPromoCode = async (req, res) => {
  try {
    const promoCode = new PromoCode(req.body);
    await promoCode.save();
    res.status(201).json({ promoCode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// getPromoCodes
const getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    res.status(200).json({ promoCodes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//getPromoCode

const getPromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.status(200).json(promoCode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//deletePromoCode
const deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.status(201).json({ message: "Promo code deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//updatePromoCode

const updatePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.status(201).json({ promoCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { product, day, month, year } = req.query;
    let query = {};
    if (product) {
      query.product = product;
    }
    if (month && year) {
      query.month = month;
      query.year = year;
      if (day) {
        query.day = day;
      }
    }
    const productSales = await ProductSales.find(query).populate("product");
    const adminProductsSales = productSales.filter(
      (sale) =>
        sale.product.seller === null || sale.product.seller === undefined
    );
    const totalAdminSalesRevenue = adminProductsSales.reduce(
      (total, sale) => total + sale.revenue,
      0
    );

    const sellerProductsSales = productSales
      .filter(
        (sale) =>
          sale.product.seller !== null || sale.product.seller !== undefined
      )
      .map((sale) => {
        return { ...sale, appRevenue: sale.revenue * 0.1 };
      });
    const totalSellerSalesRevenue = sellerProductsSales.reduce(
      (total, sale) => total + sale.revenue,
      0
    );

    res.status(200).json({
      adminProductsSales,
      sellerProductsSales,
      totalAdminSalesRevenue,
      totalSellerSalesRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
};

const getItinerariesReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const itineraries = await Itinerary.find(); // Fetch all itineraries

    const query = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const itineraryBookings = await ItineraryBooking.find(query).populate(
      "itinerary"
    );
    const itinerariesSales = itineraries.map((itinerary) => {
      const totalRevenue = itineraryBookings.reduce((total, booking) => {
        return booking.itinerary._id.equals(itinerary._id)
          ? total + booking.paymentAmount
          : total;
      }, 0);
      const appRevenue = totalRevenue * 0.1; // 10% of total revenue
      return { itinerary, totalRevenue, appRevenue };
    });
    const totalItinerariesRevenue = itinerariesSales.reduce(
      (total, sale) => total + sale.totalRevenue,
      0
    );
    const totalItinerariesAppRevenue = itinerariesSales.reduce(
      (total, sale) => total + sale.appRevenue,
      0
    );
    res.status(200).json({
      itinerariesSales,
      totalItinerariesRevenue,
      totalItinerariesAppRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
};

const getActivitiesReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.timing = { $gte: startDate, $lt: endDate };
    }

    const activities = await Activity.find(query).populate("activity"); // Fetch all activities
    const activityBookings = await ActivityBooking.find().populate("activity");

    const activitiesSales = activities.map((activity) => {
      const totalRevenue = activityBookings.reduce((total, booking) => {
        return booking.activity._id.equals(activity._id)
          ? total + booking.paymentAmount
          : total;
      }, 0);
      const appRevenue = totalRevenue * 0.1; // 10% of total revenue
      return { activity, totalRevenue, appRevenue };
    });

    const totalActivitiesRevenue = activitiesSales.reduce(
      (total, sale) => total + sale.totalRevenue,
      0
    );
    const totalActivitiesAppRevenue = activitiesSales.reduce(
      (total, sale) => total + sale.appRevenue,
      0
    );

    res.status(200).json({
      activitiesSales,
      totalActivitiesRevenue,
      totalActivitiesAppRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
};

const getAdminNotifications = async (req, res) => {
  try {
    // Get seller ID from res.locals
    const AdminId = res.locals.user_id;

    if (!AdminId) {
      return res.status(400).json({ message: "Admin Id is required" });
    }

    // Find the seller and get their notifications
    const admin = await Admin.findById(AdminId, "notifications");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Return the notifications
    return res.status(200).json({ notifications: admin.notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const markNotificationsAsSeen = async (req, res) => {
  try {
    // Find the seller by their ID and update the notifications in one operation
    const result = await Admin.updateOne(
      { _id: res.locals.user_id }, // Find seller by user ID
      {
        $set: {
          'notifications.$[elem].seen': true, // Set 'seen' to true for all unseen notifications
        }
      },
      {
        arrayFilters: [{ 'elem.seen': false }], // Only update notifications where seen is false
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No unseen notifications found' });
    }

    res.json({ message: 'All notifications marked as seen' });
  } catch (error) {
    console.error("Error marking notifications as seen:", error.message);
    res.status(500).json({ message: 'Error marking notifications as seen' });
  }
};

const hasUnseenNotifications = async (req, res) => {
  try {
    // Find the seller by their ID
    const admin = await Admin.findById(res.locals.user_id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if there are any unseen notifications
    const hasUnseen = seller.notifications.some(notification => !notification.seen);

    res.json({ hasUnseen });
  } catch (error) {
    console.error("Error checking unseen notifications:", error.message);
    res.status(500).json({ message: 'Error checking unseen notifications' });
  }
};
module.exports = {
  addAdmin,
  hasUnseenNotifications,
  getAdminByID,
  markNotificationsAsSeen,
  getAllAdmins,
  deleteAdminAccount,
  getAllUsers,
  getUsersByRoles,
  changePassword,
  getAllFiles,
  getFile,
  deleteFile,
  getAdminProfile,
  getUsersReport,
  getSalesReport,
  getItinerariesReport,
  getActivitiesReport,
  addPromoCode,
  getPromoCodes,
  getPromoCode,
  deletePromoCode,
  updatePromoCode,
  getAdminNotifications
};
