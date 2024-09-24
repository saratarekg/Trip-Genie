const Museum1 = require('../models/museums');

const createMuseum = (req, res) => {
    const museum = new museum(req.body);

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
        const museum = await Museum1.findById(req.params.id);
        if (!museum) {
            return res.status(404).json({ message: 'Museum not found' });
        }
        res.status(200).json(museum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateDescription = async (req, res) => {
    try {
        const description = await Museum1.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!description) {
            return res.status(404).json({ message: 'Museum not found' });
        }
        res.status(200).json(description);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const updatePicture = async (req, res) => {
    try {
        const picture = await Museum1.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!picture) {
            return res.status(404).json({ message: 'Museum not found' });
        }
        res.status(200).json(picture);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateLocation = async (req, res) => {
    try {
        const location = await Museum1.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!location) {
            return res.status(404).json({ message: 'Museum not found' });
        }
        res.status(200).json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const updateHours = async (req, res) => {
    try {
        const hours = await Museum1.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!hours) {
            return res.status(404).json({ message: 'Museum not found' });
        }
        res.status(200).json(hours);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updatePrice = async (req, res) => {
    try {
        const price = await Museum1.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!price) {
            return res.status(404).json({ message: 'Museum not found' });
        }
        res.status(200).json(price);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



const deleteMuseum= async (req, res) => {
    try {
        const museum = await Museum1.findByIdAndDelete(req.params.id);
        if (!museum) {
            return res.status(404).json({ message: 'Museum not found' });
        }
        res.status(201).json({ message: 'Museum deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { createMuseum,getMuseum,updateDescription,updatePicture, updateLocation, updateHours,
updatePrice, deleteMuseum };