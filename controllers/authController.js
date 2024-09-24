const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const TourismGovernor = require('../models/tourismGovernor');
const Tourist = require('../models/tourist');
const Seller = require('../models/seller');
const Advertiser = require('../models/advertiser');
const TourGuide = require('../models/tourGuide');



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
        res.status(200).json({ message: 'Login succesful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const advertiserSignup = (req, res) => {
    const advertiser = new Advertiser(req.body);

    advertiser.save()
        .then((result) => {
            res.status(201).json({ advertiser: result });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
            console.log(err);
        });
}

const advertiserLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const advertiser = await Advertiser.login(email, password);
        const token = createToken(advertiser._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: process.env.MAX_AGE*1000});
        res.status(200).json({ message: 'Login succesful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const tourGuideSignup = (req, res) => {
    const tourGuide = new TourGuide(req.body);

    tourGuide.save()
        .then((result) => {
            res.status(201).json({ tourGuide: result });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
            console.log(err);
        });
}

const tourGuideLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const tourGuide = await TourGuide.login(email, password);
        const token = createToken(tourGuide._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: process.env.MAX_AGE*1000});
        res.status(200).json({ message: 'Login succesful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const sellerSignup = (req, res) => {
    const seller = new TourGuide(req.body);

    seller.save()
        .then((result) => {
            res.status(201).json({ Seller: result });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
            console.log(err);
        });
}

const sellerLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const seller = await Seller.login(email, password);
        const token = createToken(seller._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: process.env.MAX_AGE*1000});
        res.status(200).json({ message: 'Login succesful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.login(email, password);
        const token = createToken(admin._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: process.env.MAX_AGE*1000});
        res.status(200).json({ message: 'Login succesful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const tourismGovernorLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const tourismGovernor = await TourismGovernor.login(email, password);
        const token = createToken(tourismGovernor._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: process.env.MAX_AGE*1000});
        res.status(200).json({ message: 'Login succesful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.json({ message: 'Logout successful' });
}

module.exports = { touristSignup, touristLogin , advertiserSignup, advertiserLogin, tourGuideSignup, tourGuideLogin, sellerSignup, sellerLogin, adminLogin, tourismGovernorLogin, logout };