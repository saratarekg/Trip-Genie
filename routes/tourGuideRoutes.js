const express = require('express');
const router = express.Router();
const {
    updateTourGuide,
    getTourGuideProfile
} = require('../controllers/tourGuideController'); // Import the controller functions

// Route for getting a single tour guide by ID
router.get('/myProfile', getTourGuideProfile);

// Route for updating a tour guide by ID
router.put('/:id', updateTourGuide);

module.exports = router;
