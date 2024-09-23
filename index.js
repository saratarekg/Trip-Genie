const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const signUpRoutes = require('./routes/signUpRoutes');
const adminRoutes = require('./routes/adminRoutes');

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

app.use('/sign-up', signUpRoutes);
app.use('/admin', adminRoutes);


