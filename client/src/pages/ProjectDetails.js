import React from 'react';
import { useParams } from 'react-router-dom';

function ProjectDetails() {
  const { id } = useParams(); // Get the project ID from the URL

  return (
    <div>
      <h1>Project Details</h1>
      <p>Project ID: {id}</p>
      {/* Add code here to fetch and display project details from the backend */}
      <h2>Tasks</h2>
      <ul>
        {/* Add code here to fetch and display tasks associated with this project */}
      </ul>
      <h2>Parts</h2>
      <ul>
        {/* Add code here to fetch and display parts associated with this project */}
      </ul>
      {/* Add sections for notes, documents, and other project details */}
    </div>
  );
}

export default ProjectDetails;
