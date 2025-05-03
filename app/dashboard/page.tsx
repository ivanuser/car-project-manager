import BasicDashboard from './basic-page';

// This is a temporary solution to bypass authentication issues
// We're using a basic dashboard that doesn't require auth
export default function DashboardPage() {
  return <BasicDashboard />;
}
