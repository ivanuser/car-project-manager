const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partSchema = new Schema({
  name: { type: String, required: true },
  brand: { type: String },
  partNumber: { type: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number },
  supplier: { type: String },
  notes: { type: String },
  photo: { type: String } // We'll handle file uploads later
});

const Part = mongoose.model('Part', partSchema);

module.exports = Part;
