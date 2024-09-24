const jwt = require('jsonwebtoken');
const Tourist = require('../models/tourist');
const Advertiser = require('../models/advertiser');
const Seller = require('../models/seller');
const TourGuide = require('../models/tourGuide');

const requireAuth = (allowedRole) => {
    return (req, res, next) => {
        const token = req.cookies.jwt;

        if (token) {
            jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
                if (err) {
                    res.status(401).json({ message: 'Please enter correct email and password' });  
                } else {
                    if (allowedRole == decodedToken.role) {
                        next();
                    } else {
                        return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
                    }
                }
            });
        }
        else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    }
}

const checkTourist = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await Tourist.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    }
    else {
        res.locals.user = null;
        next();
    }
}

const checkTourGuide = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await TourGuide.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    }
    else {
        res.locals.user = null;
        next();
    }
}

const checkSeller = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await Seller.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    }
    else {
        res.locals.user = null;
        next();
    }
}

const checkAdvertiser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await Advertiser.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    }
    else {
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth , checkTourist, checkTourGuide, checkSeller, checkAdvertiser };