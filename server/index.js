const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const uri = process.env.MONGODB_URI; 
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB database connection established successfully'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
const apiRouter = require('./routes/api'); 
app.use('/api', apiRouter); 

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

module.exports = app;
