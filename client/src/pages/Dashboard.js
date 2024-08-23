import React from 'react';

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="welcome">
        <h2>Welcome back, John!</h2>
        <p>You have 3 active projects and 5 upcoming tasks.</p>
      </div>

      <div className="quick-actions">
        <button>Create New Project</button>
        <button>Add New Vehicle</button>
        <button>View All Projects</button>
        <button>View All Vehicles</button>
      </div>

      <div className="project-highlights">
        <h3>Featured Projects</h3>
        {/* ProjectCard components will go here */}
      </div>

      <div className="upcoming-tasks">
        <h3>Upcoming Tasks</h3>
        <ul>
          <li>Replace spark plugs (Due: 2023-08-20, Priority: High)</li>
          {/* More task list items will go here */}
        </ul>
      </div>

      <div className="budget-summary">
        <h3>Budget Overview</h3>
        {/* Chart or graph component will go here */}
      </div>
    </div>
  );
}


export default Dashboard;
