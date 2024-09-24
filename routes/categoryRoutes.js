const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/create',categoryController.createCategory);
router.get('/:id', categoryController.getCategory);
router.get('/', categoryController.getAllCategories);
router.delete('/:id', categoryController.deleteCategory);
router.put('/:id', categoryController.updateCategory);



module.exports = router;