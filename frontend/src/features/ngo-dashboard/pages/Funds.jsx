import { useQuery } from "@tanstack/react-query";
import { HandCoins, ReceiptText, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function money(amount) {
  return `Rs ${Number(amount || 0).toLocaleString()}`;
}

export default function Funds() {
  const { data } = useQuery({ queryKey: ["/api/ngo/dashboard"] });
  const allocations = data?.allocations || [];
  const total = allocations.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Transparent funding</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Allocated Funds</h1>
        <p className="mt-1 text-slate-500">Funds allocated by admin to your NGO, linked to donation records when available.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Total Allocated" value={money(total)} icon={Wallet} />
        <Metric label="Allocation Records" value={allocations.length} icon={ReceiptText} />
        <Metric label="Latest Amount" value={money(allocations[0]?.amount || 0)} icon={HandCoins} />
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
