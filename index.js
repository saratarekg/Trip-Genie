require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');

const touristRoutes = require('./routes/touristRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tourismGovernorRoutes = require('./routes/tourismGovernorRoutes');
//const itineraryRoutes = require('./routes/itineraryRoutes');
// const touristItineraryRoutes = require('./routes/touristItineraryRoutes');
const sellerRoutes = require("./routes/sellerRoutes"); 
const tourGuideRoutes = require("./routes/tourGuideRoutes");
const advertiserRoutes = require("./routes/advertiserRoutes");
//const productRoutes = require("./routes/productRoutes");
const cookieParser = require('cookie-parser');
const {requireAuth} = require('./middlewares/authMiddleware');


const PORT = process.env.PORT;

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieParser())


mongoose.connect(process.env.URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => console.log(err));

app.use('/auth',authRoutes);
app.use('/admin', requireAuth('admin'), adminRoutes);
app.use('/tourismGovernor', requireAuth('tourismGovernor'), tourismGovernorRoutes);
app.use('/tourist', requireAuth('tourist'), touristRoutes);
//app.use('/itinerary', requireAuth(''), itineraryRoutes);
// app.use('/touristItinerary', requireAuth, touristItineraryRoutes);
app.use('/seller', requireAuth('seller'), sellerRoutes);

app.use('/tourGuide',requireAuth('tourGuide'), tourGuideRoutes);
//app.use('/product',requireAuth(''), productRoutes);
app.use('/advertiser',requireAuth('advertiser'), advertiserRoutes);
app.get('/sam', requireAuth(''), (req, res) => {
  res.send('Hello From Sam');
});


