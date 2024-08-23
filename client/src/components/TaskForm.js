import React, { useState } from 'react';

function TaskForm({ onSubmit }) {
  const [description, setDescription] = useState('');
  // ... other state variables for dueDate, status, priority, assignee, notes

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create task object and call onSubmit function
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="description">Description:</label>
      <input 
        type="text" 
        id="description" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        required 
      />
      {/* Add other input fields for dueDate, status, priority, assignee, notes */}
      <button type="submit">Create Task</button>
    </form>
  );
}

export default TaskForm;
