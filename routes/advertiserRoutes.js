const express = require('express');
const activityController = require('../controllers/activityController');
const advertiserController = require('../controllers/advertiserController');

const router = express.Router();

router.post('/activity', activityController.createActivity);
router.get('/allActivities', activityController.getAllActivities);
router.get('/activity/:id', activityController.getActivityById);
router.put('/activity/:id', activityController.updateActivity);
router.delete('/activity/:id', activityController.deleteActivity);


router.delete('/:id',advertiserController.deleteAdvertiserAccount);
router.get('/',advertiserController.getAllAdvertisers);
router.get('/:id',advertiserController.getAdvertiserByID);
//router.get('',advertiserController.getActivitiesByAdvertisor);

module.exports = router;
