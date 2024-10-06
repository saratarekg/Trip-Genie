const Tag = require("../models/tag");
const Activity = require("../models/activity");

const addTag = async (req, res) => {
  const { type } = req.body;
  if (!type) {
    return res.status(400).json({ message: "Please provide a type" });
  }
  if (await Tag.findOne({ type })) {
    return res.status(400).json({ message: "Tag already exists" });
  }
  const tag = new Tag(type);

  tag
    .save()
    .then((result) => {
      res.status(201).json({ Tag: result });
    })
    .catch((err) => {
      res.status(400).json({ message: err.message });
      console.log(err);
    });
};
const deleteTag = async (req, res) => {
  try {
    // Delete the tag
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Remove the deleted tag from the 'tags' array in Activity model
    await Activity.updateMany(
      { tags: req.params.id }, // Find activities with this tag
      { $pull: { tags: req.params.id } } // Remove the tag from the array
    );

    res
      .status(200)
      .json({ message: "Tag deleted and removed from activities" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ message: "Please provide a type" });
    }
    if (await Tag.findOne({ type })) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    const tag = await Tag.findByIdAndUpdate(req.params.id, type, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(tag);
  } catch (error) {
    res.status(404).json({ message: "tag not found" });
  }
};
const getTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    res.status(200).json(tag);
  } catch (error) {
    res.status(404).json({ message: "tag not found" });
  }
};

const getTagbyType = async (req, res) => {
    try {
        const tags = await Tag.findOne({ type: req.query.type });
        if (tags.length === 0) {
            return res.status(404).json({ message: 'No tags found with that name' });
        }
        console.log(tags);
        res.status(200).json(tags);
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAlltags = async (req, res) => {
  try {
    const tag = await Tag.find();
    res.status(200).json(tag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllTypes = async (req, res) => {
  try {
    const tag = await Tag.find();
    const types = tag.map((tag) => tag.type);
    res.status(200).json(types);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  addTag,
  deleteTag,
  updateTag,
  getTag,
  getAlltags,
  getAllTypes,
  getTagbyType,
};
