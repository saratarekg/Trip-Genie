const Nationality = require('../models/nationality');

const getAllNationalities = async (req, res) => {
    try {
        const nationalities = await Nationality.find().sort({ name: 1 });
        res.status(200).json(nationalities);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllNationalities
}