const Comment = require("../models/comment"); // Adjust the path based on your directory structure
const Activity = require("../models/activity"); // Adjust the path based on your directory structure

// Get all comments
const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate("activityID"); // Populate activityID for more details
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comments for a specific activity
const getCommentsForActivity = async (req, res) => {
  const { activityId } = req.params; // Get the activity ID from the URL

  try {
    const comments = await Comment.find({ activityID: activityId }).populate("activityID");
    if (!comments.length) {
      return res.status(200).json([]);
    }
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a comment by comment ID
const getCommentById = async (req, res) => {
  const { commentId } = req.params; // Get the comment ID from the URL

  try {
    const comment = await Comment.findById(commentId).populate("activityID");
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new comment
const addComment = async (req, res) => {
  const { username, rating, content, activityID } = req.body;

  // Create a new comment instance
  const newComment = new Comment({
    username,
    rating,
    content,
    activityID,
  });

  try {
    const savedComment = await newComment.save();
    res.status(201).json({ message: "Comment added successfully", comment: savedComment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  const { commentId } = req.params; // Get the comment ID from the URL

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllComments,
  getCommentsForActivity,
  getCommentById,
  addComment,
  deleteComment,
};
