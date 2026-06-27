import { useEffect } from "react";
import { useLocation } from "wouter";
import { getAuthSession } from "@/lib/auth";
import { DashboardLayout } from "@/features/ngo-dashboard/DashboardLayout";
import Dashboard from "@/features/ngo-dashboard/pages/Dashboard";
import Requests from "@/features/ngo-dashboard/pages/Requests";
import Resources from "@/features/ngo-dashboard/pages/Resources";
import Volunteers from "@/features/ngo-dashboard/pages/Volunteers";
import Analytics from "@/features/ngo-dashboard/pages/Analytics";
import Funds from "@/features/ngo-dashboard/pages/Funds";
import Profile from "@/features/ngo-dashboard/pages/Profile";
function getTabFromPath(path) {
  if (path.includes("/requests")) return "requests";
  if (path.includes("/resources")) return "resources";
  if (path.includes("/volunteers")) return "volunteers";
  if (path.includes("/funds")) return "funds";
  if (path.includes("/analytics")) return "analytics";
  if (path.includes("/profile")) return "profile";
  return "overview";
}
function NgoDashboardPage() {
  const [location, navigate] = useLocation();
  const tab = getTabFromPath(location);
  useEffect(() => {
    const session = getAuthSession();
    if (!session || session.user.role !== "ngo") {
      navigate("/login");
    }
  }, [navigate]);
  const renderContent = () => {
    switch (tab) {
      case "requests":
        return <Requests />;
      case "resources":
        return <Resources />;
      case "volunteers":
        return <Volunteers />;
      case "funds":
        return <Funds />;
      case "analytics":
        return <Analytics />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };
  return <DashboardLayout>{renderContent()}</DashboardLayout>;
}
export {
  NgoDashboardPage as default
};
