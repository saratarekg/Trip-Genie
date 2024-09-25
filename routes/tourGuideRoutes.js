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
router.delete('/deleteTGAccount/:id', deleteTourGuideAccount);

router.get('/getAllTourGuides', getAllTourGuides);

// Route for getting a single tour guide by ID
router.get('/getTourGuideByID/:id', getTourGuideByID);

// Route for updating a tour guide by ID
router.patch('/updateTourGuide/:id', updateTourGuide);

module.exports = router;

