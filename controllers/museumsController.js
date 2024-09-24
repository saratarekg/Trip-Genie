const Museum = require('../models/museums');

const createMuseum = (req, res) => {
    const museum = new Museum(req.body);

    museum.save()
        .then((result) => {
            res.status(201).json({ museum: result });
        })
        .catch((err) => {
            res.status(400).json({message: err.message})
            console.log(err);
        });
}

const getMuseum = async (req, res) => {
    try {
        const museum = await Museum.findById(req.params.id);
        res.status(200).json(museum);
    } catch (error) {
         res.status(404).json({ message: 'Museum not found' });
        
    }
};

const getAllMuseums = async (req, res) => {
    try {
        const museum = await Museum.find();
        res.status(200).json(museum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const updateMuseum = async (req, res) => {
    try {
        const museum= await Museum.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json(museum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



const deleteMuseum= async (req, res) => {
    try {
        const museum = await Museum.findByIdAndDelete(req.params.id);
        res.status(201).json({ message: 'Museum deleted' });
    } catch (error) {
         res.status(404).json({ message: 'Museum not found' });
    }
};


module.exports = { createMuseum,getMuseum,getAllMuseums,updateMuseum, deleteMuseum };