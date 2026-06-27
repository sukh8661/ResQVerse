import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function Resources() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery({ queryKey: ["/api/ngo/dashboard"] });
  const resources = data?.resources || [];
  const [form, setForm] = useState({ type: "", quantity: "", unit: "" });
  const [amounts, setAmounts] = useState({});

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["/api/ngo/dashboard"] });

  const create = async () => {
    if (!form.type || !form.quantity || !form.unit) return;
    await apiRequest("POST", "/api/ngo/resources", form);
    setForm({ type: "", quantity: "", unit: "" });
    toast({ title: "Resource added", description: "Inventory is now stored against your NGO." });
    refresh();
  };

  const update = async (resource, action) => {
    const amount = Number(amounts[resource.id] || 0);
    if (!amount) return;
    await apiRequest("PATCH", `/api/ngo/resources/${resource.id}`, { action, amount });
    setAmounts((current) => ({ ...current, [resource.id]: "" }));
    toast({ title: "Inventory updated", description: `${resource.type} stock has been updated.` });
    refresh();
  };

  const remove = async (id) => {
    await apiRequest("DELETE", `/api/ngo/resources/${id}`);
    toast({ title: "Resource removed", description: "The item was removed from your NGO inventory." });
    refresh();
  };

  const totals = resources.reduce((acc, item) => {
    acc.quantity += Number(item.quantity || 0);
    acc.available += Number(item.available || 0);
    acc.distributed += Number(item.distributed || 0);
    return acc;
  }, { quantity: 0, available: 0, distributed: 0 });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Relief inventory</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Resources</h1>
        <p className="mt-1 text-slate-500">Add stock, distribute supplies, and keep NGO inventory current.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Total Stock" value={totals.quantity} />
        <Metric label="Available" value={totals.available} tone="emerald" />
        <Metric label="Distributed" value={totals.distributed} tone="blue" />
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add Resource</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_160px_160px_auto]">
          <div><Label>Type</Label><Input placeholder="food, water, medical" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
          <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
          <div><Label>Unit</Label><Input placeholder="packets" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
          <Button className="self-end bg-slate-950 hover:bg-slate-800" onClick={create}>Add</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => {
          const percent = resource.quantity ? Math.round((resource.available / resource.quantity) * 100) : 0;
          return (
            <Card key={resource.id} className="rounded-3xl border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 capitalize"><Package className="h-5 w-5 text-red-500" /> {resource.type}</span>
                  <Badge>{percent}%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={percent} />
                <div className="grid grid-cols-3 rounded-2xl bg-slate-50 p-3 text-center text-sm">
                  <div><p className="font-bold">{resource.quantity}</p><p className="text-slate-500">Total</p></div>
                  <div><p className="font-bold text-emerald-600">{resource.available}</p><p className="text-slate-500">Available</p></div>
                  <div><p className="font-bold">{resource.distributed}</p><p className="text-slate-500">Used</p></div>
                </div>
                <Input type="number" placeholder={`Amount in ${resource.unit}`} value={amounts[resource.id] || ""} onChange={(event) => setAmounts({ ...amounts, [resource.id]: event.target.value })} />
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Button size="sm" onClick={() => update(resource, "add")}>Add</Button>
                  <Button size="sm" variant="outline" onClick={() => update(resource, "distribute")}>Distribute</Button>
                  <Button size="sm" variant="outline" onClick={() => remove(resource.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {resources.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No resources added yet.</p>}
    </div>
  );
}

function Metric({ label, value, tone = "slate" }) {
  const color = tone === "emerald" ? "text-emerald-600" : tone === "blue" ? "text-blue-600" : "text-slate-950";
  return <Card className="rounded-3xl border-slate-200 shadow-sm"><CardContent className="p-5"><p className="text-sm font-semibold text-slate-500">{label}</p><h2 className={`mt-1 text-3xl font-black ${color}`}>{value}</h2></CardContent></Card>;
}
