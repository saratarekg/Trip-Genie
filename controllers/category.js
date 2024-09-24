const category = require('../models/category');

const createCategory = (req, res) => {
    const cat = new cat(req.body);

    cat.save()
        .then((result) => {
            res.status(201).json({ cat: result });
        })
        .catch((err) => {
            res.status(400).json({message: err.message})
            console.log(err);
        });
}


const getCategory = async (req, res) => {
    try {
        const cat = await category.findById(req.params.id);
        if (!cat) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(cat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateCategory = async (req, res) => {
    try {
        const cat = await category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!cat) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(cat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



const deleteCategory= async (req, res) => {
    try {
        const cat = await category.findByIdAndDelete(req.params.id);
        if (!cat) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(201).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports={createCategory,getCategory,updateCategory,deleteCategory};

