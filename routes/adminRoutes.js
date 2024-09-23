const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/add-admin', adminController.addAdmin);

module.exports = router;