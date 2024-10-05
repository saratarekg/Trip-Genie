const Category = require('../models/category');
const Activity = require('../models/activity');


const createCategory = (req, res) => {
    const category = new Category(req.body);

    category.save()
        .then((result) => {
            res.status(201).json({ category: result });
        })
        .catch((err) => {
            res.status(400).json({message: err.message})
            console.log(err);
        });
}


const getCategory = async (req, res) => {
    try {
      
        const category = await Category.findById(req.params.id);
        if(!category){
            res.status(404).json({ message: 'Category not found'});
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(404).json({ message: 'Category not found' });
    }
};


// get categories by name 

const getCategoriesByName = async (req, res) => {
    try {
        const categories = await Category.findOne({ name: req.query.name });
        if (categories.length === 0) {
            return res.status(404).json({ message: 'No categories found with that name' });
        }
        res.status(200).json(categories);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const category = await Category.find();
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
       
        res.status(200).json(category);
    } catch (error) {
        res.status(404).json({ message: 'Category not found'});
    }
};



const deleteCategory = async (req, res) => {
    try {
        // Delete the category
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Remove the deleted category from the 'categories' array in Activity model
        await Activity.updateMany(
            { category: req.params.id }, // Find activities with this category
            { $pull: { categories: req.params.id } } // Remove the category from the array
        );

        res.status(201).json({ message: 'Category deleted and removed from activities' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports={createCategory,getCategory, getAllCategories, updateCategory,deleteCategory, getCategoriesByName};

