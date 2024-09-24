const express = require('express');
const router = express.Router();
const {
    deleteTourGuideAccount,
    getAllTourGuides,
    getTourGuideByID,
    updateTourGuide
} = require('../controllers/tourGuideController'); // Import the controller functions

// Route for signing up a new tour guide
// router.post('/signup', tourGuideSignup);

// Route for deleting a tour guide by ID
router.delete('/:id', deleteTourGuideAccount);

// Route for getting all tour guides
router.get('/', getAllTourGuides);

// Route for getting a single tour guide by ID
router.get('/:id', getTourGuideByID);

// Route for updating a tour guide by ID
router.patch('/:id', updateTourGuide);

module.exports = router;
