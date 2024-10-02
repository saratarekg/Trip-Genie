const Nationality = require('../models/nationality');

const getAllNationalities = async (req, res) => {
    try {
        const nationalities = await Nationality.find();
        res.status(200).json(nationalities);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllNationalities
}