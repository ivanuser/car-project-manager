import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [recentProject, setRecentProject] = useState(null);

  useEffect(() => {
    // Fetch projects from the backend API
    axios.get('/api/projects')
      .then(res => {
        setProjects(res.data);
        // Set the most recent project (you'll need to implement this logic)
        setRecentProject(res.data[0]); // Placeholder for now
      })
      .catch(err => console.error('Error fetching projects:', err));
  }, []);

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>Welcome back, [username]!</h1> 
        {recentProject && (
          <p>Your most recent project: {recentProject.name}</p>
        )}
      </div>

      <div className="quick-actions">
        <button className="create-project">
          <i className="fas fa-plus"></i> Create New Project
        </button>
        <button className="add-vehicle">
          <i className="fas fa-car"></i> Add New Vehicle
        </button>
      </div>

      <div className="project-highlights">
        <h2>Active Projects</h2>
        <div className="project-carousel">
          {projects.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      </div>

      <div className="upcoming-tasks">
        <h2>Upcoming Tasks</h2>
        {/* We'll implement task fetching and display logic later */}
      </div>
    </div>
  );
}

export default Dashboard;
