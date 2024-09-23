require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const signUpRoutes = require('./routes/signUpRoutes');
// const touristRoutes = require('./routes/touristRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tourismGovernorRoutes = require('./routes/tourismGovernorRoutes');
const iteneraryRouter = require('./routes/itinerary')
const touristIteneraryRouter = require('./routes/touristItinerary')
const sellerRoutes = require("./routes/sellerRoutes"); 

const PORT = process.env.PORT;

const app = express();

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
app.use('/itinerary',iteneraryRouter)
app.use('/touristItinerary',touristIteneraryRouter)
app.use('/seller', sellerRoutes)


