const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import multer for file uploads
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination directory
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()); // Specify the file naming convention
  }
});

const upload = multer({ storage: storage }); // Configure multer with storage

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

// Export the app and upload middleware
module.exports = { 
    app, 
    upload 
};
