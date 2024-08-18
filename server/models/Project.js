const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: { type: String, required: true },
  vehicle: { 
    type: Schema.Types.ObjectId, 
    ref: 'Vehicle', // Reference to the Vehicle model
    required: true 
  },
  startDate: { type: Date },
  endDate: { type: Date },
  budget: { type: Number },
  progress: { type: Number, default: 0 }, // Percentage completion (0-100)
  tasks: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Task' // Reference to the Task model
  }],
  notes: { type: String },
  documents: [{ type: String }] // Array to store document URLs (we'll handle file uploads later)
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
