const Transportation = require("../models/transportation");
const PromoCode = require("../models/promoCode");

// Get all transportations
const getAllTransportations = async (req, res) => {
  try {
    const transportations = await Transportation.find({ isStandAlone: true });
    res.status(200).json(transportations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTransportationsNew = async (req, res) => {
  try {
    const today = new Date();
    const transportations = await Transportation.find({
      isStandAlone: true,
      remainingSeats: { $gt: 0 },
      timeDeparture: { $gte: today }
    });
    res.status(200).json(transportations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get transportation by ID
const getTransportationById = async (req, res) => {
  try {
    const transportation = await Transportation.findById(req.params.id);
    if (!transportation) {
      return res.status(404).json({ message: "Transportation not found" });
    }
    res.status(200).json(transportation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new transportation
const createTransportation = async (req, res) => {
  const {
    from,
    to,
    vehicleType,
    ticketCost,
    timeDeparture,
    estimatedDuration,
    remainingSeats,
    isStandAlone,
  } = req.body;

  const newTransportation = new Transportation({
    from,
    to,
    vehicleType,
    ticketCost,
    timeDeparture,
    estimatedDuration,
    remainingSeats,
    isStandAlone,
  });

  try {
    const savedTransportation = await newTransportation.save();
    res.status(201).json(savedTransportation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update transportation
const updateTransportation = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedTransportation = await Transportation.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    if (!updatedTransportation) {
      return res.status(404).json({ message: "Transportation not found" });
    }
    res.status(200).json(updatedTransportation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete transportation
const deleteTransportation = async (req, res) => {
  try {
    const deletedTransportation = await Transportation.findByIdAndDelete(
      req.params.id
    );
    if (!deletedTransportation) {
      return res.status(404).json({ message: "Transportation not found" });
    }
    res.status(200).json({ message: "Transportation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTransportations,
  getTransportationById,
  createTransportation,
  updateTransportation,
  deleteTransportation,
  getAllTransportationsNew
};
