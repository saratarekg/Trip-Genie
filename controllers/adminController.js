const Admin = require('../models/admin');
const TourismGovernor = require('../models/tourismGovernor');

const addAdmin = async (req, res) => {
    try{
        if(await usernameExists(req.body.username)){
            throw new Error('Username already exists');
        }
        const admin = new Admin(req.body);

        admin.save()
            .then((result) => {
                res.status(201).json({ admin: result });
            })
            .catch((err) => {
                res.status(400).json({message: err.message})
                console.log(err);
            });
    }catch(err){
        res.status(400).json({message: err.message});
    }
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

const usernameExists = async (username) => {
    if(await Admin.findOne({username})){
        return true;
    }
    else if(await TourismGovernor.findOne({username})){
        return true;
    }
    else{
        return false;
    }
}


module.exports = {addAdmin,getAdminByID,getAllAdmins,deleteAdminAccount};