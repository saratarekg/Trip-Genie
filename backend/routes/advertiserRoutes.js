const express = require('express');
const activityController = require('../controllers/activityController');
const advertiserController = require('../controllers/advertiserController');

const router = express.Router();

router.post('/activity', activityController.createActivity);
router.get('/activity', activityController.getAllActivities);
router.get('/activity/:id', activityController.getActivityById);
router.put('/activity/:id', activityController.updateActivity);
router.delete('/activity/:id', activityController.deleteActivity);
router.get('/my-activities', activityController.getActivitiesByAdvertiser);

router.get('/', advertiserController.getAdvertiser);
router.put('/', advertiserController.updateAdvertiser);


module.exports = router;
