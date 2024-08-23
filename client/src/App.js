import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Import your page components 
import Dashboard from './pages/Dashboard';
import VehicleList from './pages/VehicleList';
import ProjectDetails from './pages/ProjectDetails';

function App() {
  return (
    <Router>
      <Header /> 
      <div className="container"> {/* Add a container for main content */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
      <Footer /> 
    </Router>
  );
}

export default App;
