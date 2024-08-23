import React from 'react';

function VehicleCard({ vehicle }) {
  return (
    <div className="vehicle-card">
      <h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2>
      {/* Add more details and actions (edit, delete, view projects) here */}
    </div>
  );
}

export default VehicleCard;
