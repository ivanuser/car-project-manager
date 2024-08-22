import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your page components (we'll create these later)
import Dashboard from './pages/Dashboard';
import VehicleList from './pages/VehicleList';
import ProjectDetails from './pages/ProjectDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicles" element={<VehicleList />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
