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

module.exports = {sellerSignup};