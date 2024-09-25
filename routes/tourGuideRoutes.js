const express = require('express');
const router = express.Router();
const {
    updateTourGuideProfile,
    getTourGuideProfile
} = require('../controllers/tourGuideController'); // Import the controller functions

// Route for getting a single tour guide by ID
router.get('/myProfile', getTourGuideProfile);

// Route for updating a tour guide by ID
router.put('/updateMyProfile', updateTourGuideProfile);

module.exports = router;

