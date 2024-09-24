const Company = require('../models/company');


// Update
const updateCompany = async (req, res) => {
    try {
        const company1 = await Company.findById(req.params.id);
        if(!company1.accepted){
            return res.status(400).json({ error: 'Company is not accepted yet, Can not update profile' });
        }
        
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });



        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json({ message: 'Company profile updated', company });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Error updating company profile' });
    }
};

const deleteCompanyAccount = async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.status(201).json({ message: 'Company deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const getAllCompanies = async (req, res) => {
    try {
        const company = await Company.find();
        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCompanyByID = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { deleteCompanyAccount, getAllCompanies, getCompanyByID, updateCompany };
