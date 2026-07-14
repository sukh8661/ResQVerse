import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Menu, RadioTower, Search } from "lucide-react";
import { AppSidebar, ngoNavItems } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/lib/auth";

function isActive(location, href) {
  if (href === "/dashboard") return location === "/dashboard" || location === "/ngo-dashboard";
  const dashboardPath = href.replace("/dashboard", "/ngo-dashboard");
  return location.startsWith(href) || location.startsWith(dashboardPath);
}

export function DashboardLayout({ children }) {
  const [location, navigate] = useLocation();
  const session = getAuthSession();
  const { data: meData } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: Boolean(session?.user?.role === "ngo")
  });
  const profile = meData?.profile || session?.profile;
  const organizationName = profile?.organizationName || session?.user?.profileSummary?.organizationName || "NGO Dashboard";

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
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex">
        <AppSidebar />

        <main className="min-w-0 flex-1 lg:pl-72">
          <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="mt-1 rounded-2xl lg:hidden">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[min(20rem,calc(100vw-1rem))] bg-white p-0">
                      <div className="border-b border-slate-100 p-5">
                        <p className="text-sm font-semibold text-slate-500">NGO command</p>
                        <h2 className="text-xl font-black text-slate-950">{organizationName}</h2>
                      </div>
                      <div className="space-y-2 p-4">
                        {ngoNavItems.map((item) => (
                          <Link key={item.href} href={item.href}>
                            <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${isActive(location, item.href) ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                              <item.icon className="h-5 w-5" />
                              {item.label}
                            </div>
                          </Link>
                        ))}
                        <Button variant="outline" className="mt-4 w-full rounded-2xl" onClick={logout}>Logout</Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-wide text-red-700">NGO operations center</p>
                    <h1 className="safe-break text-2xl font-black text-slate-950 sm:text-3xl">{organizationName}</h1>
                    <p className="mt-1 text-slate-500">Accept requests, assign volunteers, manage resources, and track funds from one workspace.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="hidden h-11 w-full max-w-72 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 md:flex">
                    <Search className="h-4 w-4" />
                    Live relief operations
                  </div>
                  <Badge className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-emerald-700 hover:bg-emerald-100">
                    <RadioTower className="mr-2 h-4 w-4" />
                    Live sync
                  </Badge>
                  <Button variant="outline" size="icon" className="relative rounded-2xl">
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                  </Button>
                </div>
              </div>

              <div className="mobile-scrollbar -mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
                {ngoNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button variant={isActive(location, item.href) ? "default" : "outline"} size="sm" className="shrink-0 rounded-2xl">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl">
            <div className="p-0">{children}</div>
          </section>
        </main>
      </div>
    </div>
  );
}
