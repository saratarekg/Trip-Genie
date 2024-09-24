const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  hotline: {
    type: String,
  },
  logoUrl: {
    type: String,
  },
  accepted: {
    type: Boolean,
    default: false 
}
  // You can add more fields as needed (e.g., industry, location, etc.)
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;