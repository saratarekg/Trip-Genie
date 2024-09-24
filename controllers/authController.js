const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const TourismGovernor = require('../models/tourismGovernor');
const Tourist = require('../models/tourist');
const Seller = require('../models/seller');
const Advertiser = require('../models/advertiser');



const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: process.env.EXPIRES_IN
    });
}

const touristSignup = (req, res) => {
    const tourist = new Tourist(req.body);

    tourist.save()
        .then((result) => {
            res.status(201).json({ tourist: result });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
            console.log(err);
        });
}

const touristLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const tourist = await Tourist.login(email, password);
        const token = createToken(tourist._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: process.env.MAX_AGE*1000});
        res.status(200).json({ tourist: tourist._id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { touristSignup, touristLogin };