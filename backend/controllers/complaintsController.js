const Complaint = require("../models/complaints");

const addComplaint = async (req, res) => {
  const { title, body } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Please provide a title" });
  }
  if (!body) {
    return res.status(400).json({ message: "Please provide a body" });
  }

  const complaint = new Complaint({ title, body, tourist: res.locals.user_id });

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
    let { status, asc } = req.query;
    asc = parseInt(asc);
    let complaints = [];
    if (status) {
      // Fetch all complaints with the specified status
      complaints = Complaint.find({ status }).populate("tourist");
    } else {
      complaints = Complaint.find().populate("tourist");
    }
    if (asc) {
      complaints = await complaints.sort({ createdAt: asc });
    } else {
      complaints = await complaints.sort({ createdAt: -1 });
    }
    return res.status(200).json(complaints);

    // Fetch all complaints from the database and populate the 'tourist' field
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const markComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params; // Extract the complaint ID from the request parameters
    const { status } = req.body; // Get the status from the request body

    // Validate the status
    if (status !== "pending" && status !== "resolved") {
      return res
        .status(400)
        .json({ error: 'Invalid status. Must be "pending" or "resolved".' });
    }

    // Update the complaint status
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { status }, // Update with the new status
      { new: true } // Return the updated document
    );

    // Check if the complaint was found
    if (!updatedComplaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Fetch the full complaint details with populated fields
    const complaintDetails = await Complaint.findById(id).populate({
      path: "tourist",
      populate: {
        path: "nationality", // Populate nationality within tourist
        select: "name", // Optionally select only the 'name' field from the Nationality schema
      },
    });

    // Return the detailed complaint with tourist and nationality populated
    res.status(200).json(complaintDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getComplaintDetails = async (req, res) => {
  try {
    const { id } = req.params; // Extract the complaint ID from the request parameters

    // Find the complaint by ID and populate the 'tourist' field along with 'nationality' within the tourist
    const complaint = await Complaint.findById(id).populate({
      path: "tourist",
      populate: {
        path: "nationality", // Populate nationality within tourist
        select: "name", // Optionally select only the 'name' field from the Nationality schema
      },
    });

    // Check if the complaint was found
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Return the complaint details
    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const replyToComplaint = async (req, res) => {
  try {
    const { id } = req.params; // Extract the complaint ID from the request parameters
    const { content } = req.body; // Get the reply content from the request body
    const adminId = res.locals.user_id; // Assume the logged-in admin's ID is stored here

    if (!content) {
      return res
        .status(400)
        .json({ message: "Please provide a reply content" });
    }

    // Find the complaint by ID
    const complaint = await Complaint.findById(id);

    // Check if the complaint exists
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Add the reply to the replies array
    complaint.replies.push({
      admin: adminId,
      content,
    });

    // Save the updated complaint
    await complaint.save();

    // Populate the complaint details, including tourist and nationality
    const updatedComplaint = await Complaint.findById(id).populate({
      path: "tourist",
      populate: {
        path: "nationality", // Populate nationality within tourist
        select: "name", // Optionally select only the 'name' field from the Nationality schema
      },
    });

    return res.status(200).json(updatedComplaint); // Return the updated complaint with populated details
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addComplaint,
  getAllComplaints,
  markComplaintStatus,
  getComplaintDetails,
  replyToComplaint,
};
