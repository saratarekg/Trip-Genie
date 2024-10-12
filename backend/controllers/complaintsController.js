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
  










const markComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;  // Extract the complaint ID from the request parameters
        const { status } = req.body;  // Get the status from the request body

        // Validate the status
        if (status !== 'pending' && status !== 'resolved') {
            return res.status(400).json({ error: 'Invalid status. Must be "pending" or "resolved".' });
        }

        // Update the complaint status
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            id,
            { status },  // Update with the new status
            { new: true } // Return the updated document
        );

        // Check if the complaint was found
        if (!updatedComplaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Return the updated complaint
        res.status(200).json(updatedComplaint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}










module.exports = {
    addComplaint,
    getAllComplaints,
    markComplaintStatus
}

