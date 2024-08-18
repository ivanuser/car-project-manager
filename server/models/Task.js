const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  description: { type: String, required: true },
  project: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
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
  assignee: { type: String }, 
  notes: { type: String },
  parts: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Part' 
  }]
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
