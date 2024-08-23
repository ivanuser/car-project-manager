import React from 'react';

function PartList({ parts }) {
  return (
    <div className="part-list">
      <ul>
        {parts.map(part => (
          <li key={part._id}>
            <h4>{part.name}</h4>
            <p>Brand: {part.brand}</p>
            <p>Part Number: {part.partNumber}</p>
            <p>Quantity: {part.quantity}</p>
            {/* Add more details and actions (edit, delete) here */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PartList;
