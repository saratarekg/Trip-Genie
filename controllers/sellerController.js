const Seller = require('../models/seller');

// Create
const sellerSignup = (req, res) => {
    const { username, email, password } = req.body;
    const seller = new Seller({ username, email, password });

    seller.save()
        .then((result) => {
            res.status(201).json({ seller: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ message: err.message });
        });
};

// Read
const getSeller = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }
        res.status(200).json(seller);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Error fetching seller profile' });
    }
};

// Update
const updateSeller = async (req, res) => {
    try {
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

const adminDeleteSellerAccount = async (req, res) => {
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


const adminGetAllSellers = async (req, res) => {
    try {
        const seller = await Seller.find();
        res.status(200).json(seller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const adminGetSellerByID = async (req, res) => {
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

module.exports = { sellerSignup, adminDeleteSellerAccount, adminGetAllSellers, adminGetSellerByID, getSeller, updateSeller };
