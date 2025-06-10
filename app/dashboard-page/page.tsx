import { redirect } from "next/navigation";

// This is a simple page that redirects to the dashboard
export default function DashboardRedirectPage() {
  redirect("/dashboard");
  return null;
}
