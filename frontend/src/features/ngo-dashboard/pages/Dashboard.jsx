import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AlertTriangle, ArrowUpRight, HandCoins, Headphones, RadioTower, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import RequestLocationMap from "@/components/request-location-map";

function money(amount) {
  return `Rs ${Number(amount || 0).toLocaleString()}`;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["/api/ngo/dashboard"] });
  const stats = data?.stats || {};
  const requests = data?.requests || [];
  const liveRequests = data?.liveRequests || [];
  const resources = data?.resources || [];
  const allocations = data?.allocations || [];

  const cards = [
    ["Live Queue", stats.liveQueue || 0, "pending requests", RadioTower, "text-red-600 bg-red-50"],
    ["Active Cases", stats.activeRequests || 0, "accepted or assigned", AlertTriangle, "text-amber-600 bg-amber-50"],
    ["Volunteers", stats.volunteers || 0, `${stats.availableVolunteers || 0} available`, Users, "text-blue-600 bg-blue-50"],
    ["Allocated Funds", money(stats.totalFunds), "from admin", HandCoins, "text-emerald-600 bg-emerald-50"]
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">NGO operations</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Dashboard</h1>
          <p className="mt-1 text-slate-500">Accept requests, assign teams, and track funds/resources in real time.</p>
        </div>
        <Badge className="w-fit bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Live sync active</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, hint, Icon, color]) => (
          <Card key={label} className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{isLoading ? "..." : value}</h2>
                <p className="mt-1 text-xs text-slate-400">{hint}</p>
              </div>
              <div className={`rounded-2xl p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="xl:col-span-2">
          <RequestLocationMap
            title="NGO Request Locations"
            requests={[...liveRequests, ...requests]}
            height={380}
          />
        </div>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Assigned Requests
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.slice(0, 4).map((request) => (
              <div key={request.id} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={request.urgency === "critical" ? "destructive" : "secondary"}>{request.urgency}</Badge>
                      <Badge variant="outline">{request.status}</Badge>
                    </div>
                    <h3 className="mt-2 font-bold">{request.title || request.type}</h3>
                    <p className="mt-1 text-sm text-slate-500">{request.location}</p>
                    {request.audioNote?.url && (
                      <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-800">
                          <Headphones className="h-4 w-4" />
                          Voice preview
                        </div>
                        <audio controls preload="metadata" className="w-full">
                          <source src={request.audioNote.url} type={request.audioNote.type || "audio/webm"} />
                          Your browser does not support audio preview.
                        </audio>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{request.peopleCount || 1} people</p>
                </div>
              </div>
            ))}
            {requests.length === 0 && <Empty text="No accepted requests yet. Accept live requests to start operations." />}
            {requests.length > 4 && (
              <Button asChild variant="outline" className="w-full rounded-2xl font-bold">
                <Link href="/dashboard/requests">
                  View all requests
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Resource Health</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {resources.slice(0, 4).map((resource) => {
                const percent = resource.quantity ? Math.round((resource.available / resource.quantity) * 100) : 0;
                return (
                  <div key={resource.id}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-semibold capitalize">{resource.type}</span>
                      <span className="text-slate-500">{resource.available}/{resource.quantity} {resource.unit}</span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                );
              })}
              {resources.length === 0 && <Empty text="No resources added yet." />}
              {resources.length > 4 && (
                <Button asChild variant="outline" className="w-full rounded-2xl font-bold">
                  <Link href="/dashboard/resources">
                    View all resources
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Recent Fund Allocations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {allocations.slice(0, 4).map((allocation) => (
                <div key={allocation.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold">{allocation.purpose}</p>
                    <p className="text-xs text-slate-500">{new Date(allocation.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge>{money(allocation.amount)}</Badge>
                </div>
              ))}
              {allocations.length === 0 && <Empty text="No funds allocated to your NGO yet." />}
              {allocations.length > 4 && (
                <Button asChild variant="outline" className="w-full rounded-2xl font-bold">
                  <Link href="/dashboard/funds">
                    View all allocations
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {liveRequests.length > 0 && (
        <Card className="rounded-3xl border-red-200 bg-red-50/50 shadow-sm">
          <CardContent className="p-5">
            <p className="font-bold text-red-900">{liveRequests.length} live request{liveRequests.length > 1 ? "s" : ""} waiting for NGO acceptance.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Empty({ text }) {
  return <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">{text}</p>;
}
