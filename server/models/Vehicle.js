const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
  year: { type: Number, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  trim: { type: String },
  vin: { type: String },
  mileage: { type: Number },
  photos: [{ type: String }] // Array to store image URLs
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
