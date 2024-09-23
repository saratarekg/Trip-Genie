const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const PORT = 3000;


const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello From Sam');
});

mongoose.connect(process.env.URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
