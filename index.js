require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const signUpRoutes = require('./routes/signUpRoutes');
const museumRoutes=require('./routes/museumRoutes');
const categoryRoutes=require('./routes/categoryRoutes');

// const touristRoutes = require('./routes/touristRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tourismGovernorRoutes = require('./routes/tourismGovernorRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const touristItineraryRoutes = require('./routes/touristItineraryRoutes');
const sellerRoutes = require("./routes/sellerRoutes"); 
const activityRoutes = require("./routes/activityRoutes");
const tourGuideRoutes = require("./routes/tourGuideRoutes");

const PORT = process.env.PORT;

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());


mongoose.connect(process.env.URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello From Sam');
});

app.use('/sign-up', signUpRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', tourismGovernorRoutes);
app.use('/itinerary',itineraryRoutes);
app.use('/touristItinerary',touristItineraryRoutes);
app.use('/seller', sellerRoutes);
app.use('/activity',activityRoutes);
app.use('/museums',museumRoutes);
app.use('/category',categoryRoutes);
app.use('/tourGuide',tourGuideRoutes);