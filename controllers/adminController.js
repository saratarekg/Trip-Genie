const Admin = require('../models/admin');

const addAdmin = (req, res) => {
    const admin = new Admin(req.body);

    admin.save()
        .then((result) => {
            res.status(201).json({ admin: result });
        })
        .catch((err) => {
            res.status(400).json({message: err.message})
            console.log(err);
        });
}

module.exports = {addAdmin};