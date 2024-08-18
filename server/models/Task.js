const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  description: { type: String, required: true },
  project: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', // Reference to the Project model
    required: true 
  },
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ['To-Do', 'In Progress', 'Completed'], 
    default: 'To-Do' 
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  assignee: { type: String }, // Optional, for assigning tasks to specific people (if applicable)
  notes: { type: String },
  parts: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Part' // Reference to the Part model (we'll create this later)
  }]
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
