import React from 'react';

function VehicleList() {
  return (
    <div>
      <h1>My Vehicles</h1>
      {/* Add code here to fetch and display a list of vehicles from the backend */}
      <ul>
        {/* Example vehicle list item (replace with actual data later) */}
        <li>
          <h2>2010 Toyota Camry LE</h2>
          <p>VIN: 123456789ABCDEFG</p>
          <p>Mileage: 100000</p>
          {/* Add more details and actions (edit, delete, view projects) here */}
        </li>
      </ul>
    </div>
  );
}

export default VehicleList;
