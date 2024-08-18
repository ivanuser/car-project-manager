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
const apiRouter = require('./routes/api'); // Import the api.js router
app.use('/api', apiRouter); // Use the router for all routes starting with '/api'

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
const multer = require('multer');
const upload = multer({
  dest: 'uploads/' // Specify the destination folder for uploaded files (we'll create this later)
});
// Export the upload middleware
module.exports = { 
    app, 
    upload 
};
