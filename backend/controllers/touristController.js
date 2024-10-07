const Tourist = require('../models/tourist');
const activity = require('../models/activity');




const deleteTouristAccount = async (req, res) => {
    try {
        const tourist = await Tourist.findByIdAndDelete(req.params.id);
        if (!tourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }
        res.status(201).json({ message: 'Tourist deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllTourists = async (req, res) => {
    try {
        const tourist = await Tourist.find();
        res.status(200).json(tourist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTouristByID = async (req, res) => {
    try {
        const tourist = await Tourist.findById(req.params.id);
        if (!tourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }
        res.status(200).json(tourist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTourist = async (req, res) => {
    try {
        const tourist = await Tourist.findById(res.locals.user_id);
        if (!tourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }
        res.status(200).json(tourist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTourist = async (req, res) => {
    try {
        const tourist1 = await Tourist.findById(res.locals.user_id);

        const {username, email, nationality, mobile, jobOrStudent} = req.body; // Data to update

        if(username!==tourist1.username && await Tourist.findOne({username})){
            return res.status(400).json({message:"Username already exists"});
           }
           if(email!==tourist1.email && await Tourist.findOne({email}) ){
             return res.status(400).json({message:"Email already exists"});
            }
        // console.log(email, nationality, mobile, jobOrStudent);
        const tourist = await Tourist.findByIdAndUpdate(res.locals.user_id,{username, email, nationality, mobile, jobOrStudent}, { new: true, runValidators: true });
        if (!tourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }
        res.status(200).json(tourist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTouristProfile = async (req, res) => {
    try {
        console.log("ammmyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
      const touristId = res.locals.user_id;
      console.log("ammmyyy");
  
      // Find the tour guide by their ID
      const tourist = await Tourist.findById(touristId).populate("nationality")
      .exec();
  
      if (!tourist) {
        return res.status(404).json({ message: "Tourist not found" });
      }
      console.log("helooooooo");
      console.log(tourist);
  
      // Respond with the tour guide's profile
      res.status(200).json(tourist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const updateTouristProfile = async (req, res) => {
    try {
      const tourist1 = await Tourist.findById(res.locals.user_id);
  
      const {
        email,
        username,
        nationality,
        mobile,
        dateOfBirth,
        jobOrStudent,
        wallet,
      } = req.body;
  
  
      if (
        username !== tourist1.username &&
        (await Tourist.findOne({ username }))
      ) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (email !== tourist1.email && (await Tourist.findOne({ email }))) {
        return res.status(400).json({ message: "Email already exists" });
      }
      // Find the Tourist by their ID and update with new data
      const tourist = await Tourist.findByIdAndUpdate(
        res.locals.user_id,
        {
            email,
            username,
            nationality,
            mobile,
            dateOfBirth,
            jobOrStudent,
            wallet,
        },
        { new: true }
      ).populate("nationality")
        .exec();
  
      if (!tourist) {
        return res.status(404).json({ message: "Tourist not found" });
      }
  
      // Respond with the updated profile
      res
        .status(200)
        .json({ message: "Profile updated successfully", tourist });
    } catch (error) {;
      res.status(500).json({ error: error.message });
    }
  };
  











module.exports = {
    deleteTouristAccount,
    getAllTourists,
    getTouristByID,getTourist,
    updateTourist,
    getTouristProfile,
    updateTouristProfile};