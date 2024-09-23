const Tourist = require('../models/tourist');

const touristSignup = (req, res) => {
    const tourist = new Tourist(req.body);

    tourist.save()
        .then((result) => {
            res.status(201).json({ tourist: result });
        })
        .catch((err) => {
            console.log(err);
        });
}

module.exports = {touristSignup};