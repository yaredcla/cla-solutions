import type { Metadata } from "next";
import AdminDashboard from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "CLA Solutions internal dashboard for leads, projects, revenue, and content operations."
};

export default function AdminPage() {
  return <AdminDashboard />;
}
