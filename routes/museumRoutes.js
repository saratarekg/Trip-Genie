const express = require('express');
const router = express.Router();
const museumController = require('../controllers/museumsController');

router.post('/create', museumController.createMuseum);
router.get('/:id', museumController.getMuseum);
router.get('/', museumController.getAllMuseums);
router.delete('/:id', museumController.deleteMuseum);
router.put('/:id', museumController.updateMuseum);



module.exports = router;