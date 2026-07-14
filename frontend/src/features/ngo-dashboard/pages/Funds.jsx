import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock, HandCoins, ReceiptText, Send, Wallet, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function money(amount) {
  return `Rs ${Number(amount || 0).toLocaleString()}`;
}

function statusMeta(status) {
  if (status === "approved") return { label: "Approved", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700" };
  if (status === "partially_approved") return { label: "Partially approved", icon: AlertCircle, className: "bg-amber-100 text-amber-700" };
  if (status === "rejected") return { label: "Rejected", icon: XCircle, className: "bg-red-100 text-red-700" };
  return { label: "Pending review", icon: Clock, className: "bg-slate-100 text-slate-700" };
}

export default function Funds() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery({ queryKey: ["/api/ngo/dashboard"] });
  const allocations = data?.allocations || [];
  const fundRequests = data?.fundRequests || [];
  const pendingRequests = fundRequests.filter((request) => request.status === "pending");
  const total = allocations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const requestedTotal = fundRequests.reduce((sum, item) => sum + Number(item.amountRequested || 0), 0);
  const approvedTotal = fundRequests.reduce((sum, item) => sum + Number(item.amountApproved || 0), 0);
  const [form, setForm] = useState({
    amountRequested: "",
    purpose: "",
    urgency: "medium",
    details: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const submitFundRequest = async () => {
    if (!form.amountRequested || !form.purpose.trim()) {
      toast({ title: "Request incomplete", description: "Amount and purpose are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/ngo/fund-requests", {
        ...form,
        amountRequested: Number(form.amountRequested)
      });
      setForm({ amountRequested: "", purpose: "", urgency: "medium", details: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/ngo/dashboard"] });
      toast({ title: "Fund request sent", description: "Admin can now review and respond to your request." });
    } catch (error) {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Transparent funding</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Allocated Funds</h1>
        <p className="mt-1 text-slate-500">Track approved allocations and request additional funds with a clear purpose, urgency, and admin response.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Total Allocated" value={money(total)} icon={Wallet} />
        <Metric label="Allocation Records" value={allocations.length} icon={ReceiptText} />
        <Metric label="Requested" value={money(requestedTotal)} icon={HandCoins} />
        <Metric label="Pending Requests" value={pendingRequests.length} icon={Clock} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-red-600" />
              Request Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">Approved from requests</p>
              <p className="mt-1 text-3xl font-black">{money(approvedTotal)}</p>
              <p className="mt-2 text-sm text-slate-300">Admin decisions and notes appear in request history.</p>
            </div>
            <div>
              <Label>Amount needed</Label>
              <Input
                className="mt-2 h-12 rounded-2xl"
                type="number"
                min="1"
                placeholder="Example: 25000"
                value={form.amountRequested}
                onChange={(event) => setForm({ ...form, amountRequested: event.target.value })}
              />
            </div>
            <div>
              <Label>Purpose</Label>
              <Input
                className="mt-2 h-12 rounded-2xl"
                placeholder="Food kits, medical supplies, shelter support..."
                value={form.purpose}
                onChange={(event) => setForm({ ...form, purpose: event.target.value })}
              />
            </div>
            <div>
              <Label>Urgency</Label>
              <Select value={form.urgency} onValueChange={(value) => setForm({ ...form, urgency: value })}>
                <SelectTrigger className="mt-2 h-12 rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Details for admin</Label>
              <Textarea
                className="mt-2 min-h-28 rounded-2xl"
                placeholder="Mention why this amount is needed, expected people helped, and any shortage details."
                value={form.details}
                onChange={(event) => setForm({ ...form, details: event.target.value })}
              />
            </div>
            <Button className="h-12 w-full rounded-2xl bg-slate-950 font-bold hover:bg-slate-800" onClick={submitFundRequest} disabled={submitting}>
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Sending request..." : "Send fund request"}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Fund Request History</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {fundRequests.map((request) => {
              const meta = statusMeta(request.status);
              const Icon = meta.icon;
              return (
                <div key={request.id} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge className={meta.className}><Icon className="mr-1 h-3.5 w-3.5" />{meta.label}</Badge>
                        <Badge variant="outline" className="capitalize">{request.urgency}</Badge>
                      </div>
                      <h3 className="font-bold text-slate-950">{request.purpose}</h3>
                      <p className="mt-1 text-sm text-slate-500">{request.details || "No extra details added."}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-slate-500">Requested</p>
                      <p className="text-lg font-black text-slate-950">{money(request.amountRequested)}</p>
                      {request.status !== "pending" && <p className="mt-1 text-sm font-bold text-emerald-700">Approved: {money(request.amountApproved)}</p>}
                    </div>
                  </div>
                  {request.adminNote && (
                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Admin response</p>
                      <p className="mt-1 text-sm leading-6 text-blue-950">{request.adminNote}</p>
                    </div>
                  )}
                  <p className="mt-4 text-xs font-semibold text-slate-400">{new Date(request.createdAt).toLocaleString()}</p>
                </div>
              );
            })}
            {fundRequests.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No fund requests submitted yet.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader><CardTitle>Allocation History</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {allocations.map((allocation) => (
            <div key={allocation.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge>{money(allocation.amount)}</Badge>
                  {allocation.donation && <Badge variant="outline">Donation linked</Badge>}
                </div>
                <h3 className="font-bold text-slate-950">{allocation.purpose}</h3>
                <p className="mt-1 text-sm text-slate-500">{allocation.notes || "No additional notes."}</p>
                {allocation.donation && (
                  <p className="mt-2 text-sm text-slate-500">
                    Source donation: {money(allocation.donation.amount)} for {allocation.donation.donationType || "relief"}
                  </p>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-500">{new Date(allocation.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {allocations.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No fund allocations have been assigned to your NGO yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div><p className="text-sm font-semibold text-slate-500">{label}</p><h2 className="mt-1 text-2xl font-black text-slate-950">{value}</h2></div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><Icon className="h-6 w-6" /></div>
      </CardContent>
    </Card>
  );
}
