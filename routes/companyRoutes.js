const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.get('/', companyController.getAllCompanies);

// Get a company profile by ID
router.get('/:id', companyController.getCompanyByID);

// Update company profile
router.put('/:id', companyController.updateCompany);

module.exports = router;


