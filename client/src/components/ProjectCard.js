import React from 'react';

function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <h3>{project.name}</h3>
      <p>Vehicle: {project.vehicle.year} {project.vehicle.make} {project.vehicle.model}</p> 
      <p>Progress: {project.progress}%</p>
      <p>Start Date: {project.startDate ? project.startDate.toDateString() : 'N/A'}</p>
      <p>End Date: {project.endDate ? project.endDate.toDateString() : 'N/A'}</p>
      {/* Add buttons or links to view/edit project details */}
    </div>
  );
}

export default ProjectCard;
