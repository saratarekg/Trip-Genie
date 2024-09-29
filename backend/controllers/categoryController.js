const Category = require('../models/category');

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



const deleteCategory= async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
      
        res.status(201).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(404).json({ message: 'Category not found' });
    }
};

module.exports={createCategory,getCategory, getAllCategories, updateCategory,deleteCategory};

