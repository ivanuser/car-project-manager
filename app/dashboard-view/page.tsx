import BasicDashboard from '../dashboard/basic-page';
import DashboardLayout from '../dashboard/layout';

// This is a fixed version of the dashboard page that avoids the route.ts conflict
export default function DashboardViewPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard View</h1>
      <p className="mb-6 text-gray-600">This is the fixed dashboard view that bypasses routing issues</p>
      
      {/* Import the actual dashboard component */}
      <BasicDashboard />
    </div>
  );
}
