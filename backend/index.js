require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const guestRoutes = require('./routes/guestRoutes');
const touristRoutes = require('./routes/touristRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tourismGovernorRoutes = require('./routes/tourismGovernorRoutes');
const sellerRoutes = require("./routes/sellerRoutes"); 
const tourGuideRoutes = require("./routes/tourGuideRoutes");
const advertiserRoutes = require("./routes/advertiserRoutes");
const nationalityController = require('./controllers/nationalityController');
const tagController = require('./controllers/tagController');
const categoryController = require('./controllers/categoryController');
const historicaltagController = require('./controllers/historicalTagController');

//const productRoutes = require("./routes/productRoutes");
const cookieParser = require('cookie-parser');
const {requireAuth} = require('./middlewares/authMiddleware');
const { getAllLanguages } = require('./controllers/itineraryController');


const PORT = process.env.PORT;

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(cookieParser())


mongoose.connect(process.env.URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => console.log(err));

app.use('/auth',authRoutes);
app.use('/guest', guestRoutes);
app.use('/admin', requireAuth('admin'), adminRoutes);
app.use('/tourism-governor', requireAuth('tourism-governor'), tourismGovernorRoutes);
app.use('/tourist', requireAuth('tourist'), touristRoutes);
app.use('/seller', requireAuth('seller'), sellerRoutes);
app.use('/tour-guide',requireAuth('tour-guide'), tourGuideRoutes);
app.use('/advertiser',requireAuth('advertiser'), advertiserRoutes);
app.get('/api/nationalities',nationalityController.getAllNationalities);
app.get('/api/getAllTypes',tagController.getAllTypes);
app.get('/api/getAllCategories',categoryController.getAllCategories);
app.get('/api/getAllHistoricalTypes',historicaltagController.getAllHistoricalTypes);
app.get('/api/getAllHistoricalPeriods',historicaltagController.getAllHistoricalPeriods);

app.get('/api/getAllLanguages' ,getAllLanguages)
