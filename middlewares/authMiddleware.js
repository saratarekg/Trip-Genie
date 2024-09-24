const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
            if (err) {
                res.status(401).json({ message: 'Please enter correct email and password' });  
            } else {
                next();
            }
        });
    }
    else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = { requireAuth };