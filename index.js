const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const touristRoutes = require('./routes/touristRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tourismGovernorRoutes = require('./routes/tourismGovernorRoutes');

require('dotenv').config();
const PORT = 3000;


const app = express();

app.use(express.json());
app.use(cors());


mongoose.connect(process.env.URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello From Sam');
});

app.use('/tourists', touristRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', tourismGovernorRoutes);



