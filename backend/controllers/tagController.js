const Tag = require('../models/tag');

const addTag = (req, res) => {
    const tag = new Tag(req.body);

    tag.save()
        .then((result) => {
            res.status(201).json({ Tag: result });
        })
        .catch((err) => {
            res.status(400).json({message: err.message})
            console.log(err);
        });
}
const deleteTag= async (req, res) => {
    try {
        const tag = await Tag.findByIdAndDelete(req.params.id);
      
        res.status(200).json({ message: 'tag deleted' });
    } catch (error) {
        res.status(404).json({ message: 'tag not found' });
    }
};
const updateTag = async (req, res) => {
    try {
        const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
       
        res.status(200).json(tag);
    } catch (error) {
        res.status(404).json({ message: 'tag not found'});
    }
};
const getTag= async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        res.status(200).json(tag);
    } catch (error) {
         res.status(404).json({ message: 'tag not found' });
        
    }
};
const getAlltags = async (req, res) => {
    try {
        const tag = await Tag.find();
        res.status(200).json(tag);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



module.exports = {addTag,deleteTag,updateTag,getTag,getAlltags};