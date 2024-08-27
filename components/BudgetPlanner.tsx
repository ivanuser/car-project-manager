import React, { useState } from 'react';

interface BudgetItem {
  id: string;
  name: string;
  estimatedCost: number;
  actualCost: number;
}

interface BudgetPlannerProps {
  projectId: string;
  budget: BudgetItem[];
}

export default function BudgetPlanner({ projectId, budget }: BudgetPlannerProps) {
  const [newItem, setNewItem] = useState({ name: '', estimatedCost: 0 });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement budget item addition logic
  };

  const totalEstimated = budget.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = budget.reduce((sum, item) => sum + item.actualCost, 0);

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold mb-4">Budget Planner</h3>
      <form onSubmit={handleAddItem} className="mb-4">
        <input
          type="text"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          placeholder="Item name"
          className="mr-2 p-2 border rounded"
        />
        <input
          type="number"
          value={newItem.estimatedCost}
          onChange={(e) => setNewItem({ ...newItem, estimatedCost: parseFloat(e.target.value) })}
          placeholder="Estimated cost"
          className="mr-2 p-2 border rounded"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Add Item
        </button>
      </form>
      <table className="w-full">
        <thead>
          <tr>
            <th>Item</th>
            <th>Estimated Cost</th>
            <th>Actual Cost</th>
          </tr>
        </thead>
        <tbody>
          {budget.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>${item.estimatedCost.toFixed(2)}</td>
              <td>${item.actualCost.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td>Total</td>
            <td>${totalEstimated.toFixed(2)}</td>
            <td>${totalActual.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}