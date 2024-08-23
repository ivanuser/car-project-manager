import React from 'react';

function TaskList({ tasks }) {
  return (
    <div className="task-list">
      {/* Implement Kanban board or other visual representation here */}
      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            <h4>{task.description}</h4>
            <p>Due Date: {task.dueDate ? task.dueDate.toDateString() : 'N/A'}</p>
            <p>Status: {task.status}</p>
            <p>Priority: {task.priority}</p>
            {/* Add more details and actions (edit, delete, view parts) here */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
