import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, ClipboardList, HandCoins, LayoutDashboard, LogOut, Package, RadioTower, ShieldCheck, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/lib/auth";

export const ngoNavItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Requests", href: "/dashboard/requests", icon: RadioTower },
  { label: "Volunteers", href: "/dashboard/volunteers", icon: Users },
  { label: "Resources", href: "/dashboard/resources", icon: Package },
  { label: "Funds", href: "/dashboard/funds", icon: HandCoins },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: User }
];

function isActive(location, href) {
  if (href === "/dashboard") return location === "/dashboard" || location === "/ngo-dashboard";
  const dashboardPath = href.replace("/dashboard", "/ngo-dashboard");
  return location.startsWith(href) || location.startsWith(dashboardPath);
}

export function AppSidebar() {
  const [location, navigate] = useLocation();
  const session = getAuthSession();
  const { data: meData } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: Boolean(session?.user?.role === "ngo")
  });
  const profile = meData?.profile || session?.profile;
  const organizationName = profile?.organizationName || session?.user?.profileSummary?.organizationName || "ResQVerse NGO";

  useEffect(() => {
    if (meData?.user && session) {
      setAuthSession({ ...session, user: meData.user, profile: meData.profile });
    }
  }, [meData?.user?.id, meData?.profile?.id]);

  const logout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-500">NGO command</p>
              <h2 className="truncate text-xl font-black text-slate-950">
                {organizationName}
              </h2>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {ngoNavItems.map((item) => {
            const active = isActive(location, item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <p className="text-sm font-black text-emerald-950">Operational</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-emerald-700">Requests, funds, volunteers, and inventory are ready for field coordination.</p>
            <Badge className="mt-3 rounded-full bg-emerald-600">Live</Badge>
          </div>
          <Button variant="outline" className="w-full rounded-2xl" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
