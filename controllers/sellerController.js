const Seller = require('../models/seller');


// Update
const updateSeller = async (req, res) => {
    try {
        const seller1 = await Seller.findById(req.params.id);
        if(!seller1.accepted){
            return res.status(400).json({ error: 'Seller is not accepted yet, Can not update profile' });
        }
        
        const seller = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true });



        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }
        res.status(200).json({ message: 'Seller profile updated', seller });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Error updating seller profile' });
    }
};

const deleteSellerAccount = async (req, res) => {
    try {
        const seller = await Seller.findByIdAndDelete(req.params.id);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        res.status(201).json({ message: 'Seller deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const getAllSellers = async (req, res) => {
    try {
        const seller = await Seller.find();
        res.status(200).json(seller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSellerByID = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        res.status(200).json(seller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSeller = async (req, res) => {
    try {
        const seller = await Seller.findById(res.locals.user_id);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        res.status(200).json(seller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { deleteSellerAccount, getAllSellers, getSellerByID, updateSeller, getSeller };
