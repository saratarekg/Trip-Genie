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


const deleteAdminAccount = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(201).json({ message: 'Admin deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const admin = await Admin.find();
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAdminByID = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {addAdmin,getAdminByID,getAllAdmins,deleteAdminAccount};