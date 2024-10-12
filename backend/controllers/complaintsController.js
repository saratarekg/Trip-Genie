const Complaint = require('../models/complaints');

const addComplaint = async (req, res) => {
    const { title, body } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Please provide a title" });
    }
    if (!body) {
        return res.status(400).json({ message: "Please provide a body" });
      }
     
    
    const complaint = new Complaint({ title, body,tourist: res.locals.user_id, });
  
    complaint
      .save()
      .then((result) => {
        res.status(201).json({ Complaint: result });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
        console.log(err);
      });
  };

 

  const getAllComplaints = async (req, res) => {
    try {
      // Fetch all complaints from the database and populate the 'tourist' field
      const complaints = await Complaint.find().populate('tourist');
      
      // Return all complaints with populated tourist data
      res.status(200).json(complaints);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  










module.exports = {
    addComplaint,
    getAllComplaints,




}


