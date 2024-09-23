const Seller = require('../models/seller');

const sellerSignup = (req, res) => {
    const {username, email, password} = req.body;
    const seller = new Seller({username, email, password});
    
    seller.save()
        .then((result) => {
            res.status(201).json({ seller: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ message: err.message });
        });
}

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

const AdminGetAllSellers = async (req, res) => {
    try {
        const seller = await Seller.find();
        res.status(200).json(seller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const AdminGetSellerByID = async (req, res) => {
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

module.exports = {sellerSignup, adminDeleteSellerAccount, AdminGetAllSellers, AdminGetSellerByID};