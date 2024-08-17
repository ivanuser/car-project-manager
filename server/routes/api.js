const express = require('express');
const router = express.Router();

// Import the Vehicle model
const Vehicle = require('../models/Vehicle');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// GET all vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new vehicle
router.post('/vehicles', async (req, res) => {
  const vehicle = new Vehicle({
    year: req.body.year,
    make: req.body.make,
    model: req.body.model,
    trim: req.body.trim,
    vin: req.body.vin,
    mileage: req.body.mileage,
    photos: req.body.photos 
  });

  try {
    const newVehicle = await vehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ... other routes (we'll add more later) ...

module.exports = router;
