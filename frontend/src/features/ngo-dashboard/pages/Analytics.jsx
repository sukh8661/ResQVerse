import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, CheckCircle2, Clock, PieChart as PieIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#64748b"];

export default function Analytics() {
  const { data } = useQuery({ queryKey: ["/api/ngo/dashboard"] });
  const requests = data?.requests || [];
  const resources = data?.resources || [];

  const statusData = useMemo(() => {
    const counts = requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [requests]);

  const resourceData = resources.map((resource) => ({
    name: resource.type,
    available: Number(resource.available || 0),
    distributed: Number(resource.distributed || 0)
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Operational intelligence</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Analytics</h1>
        <p className="mt-1 text-slate-500">Request progress and inventory movement for your NGO.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Completed" value={requests.filter((r) => r.status === "completed").length} icon={CheckCircle2} />
        <Metric label="In Progress" value={requests.filter((r) => ["assigned", "in_progress", "accepted"].includes(r.status)).length} icon={Activity} />
        <Metric label="Pending Queue" value={data?.liveRequests?.length || 0} icon={Clock} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><PieIcon className="h-5 w-5" /> Request Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={statusData.length ? statusData : [{ name: "No requests", value: 1 }]} dataKey="value" nameKey="name" outerRadius={110}>
                  {(statusData.length ? statusData : [{ name: "No requests" }]).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Resource Movement</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={resourceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="available" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="distributed" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div><p className="text-sm font-semibold text-slate-500">{label}</p><h2 className="mt-1 text-3xl font-black text-slate-950">{value}</h2></div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><Icon className="h-6 w-6" /></div>
      </CardContent>
    </Card>
  );
}
