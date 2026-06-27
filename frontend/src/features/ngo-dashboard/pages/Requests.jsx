import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Headphones, MapPin, UserCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Requests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedVolunteer, setSelectedVolunteer] = useState({});
  const [notes, setNotes] = useState({});
  const { data } = useQuery({ queryKey: ["/api/ngo/dashboard"], refetchInterval: 20000 });

  const liveRequests = data?.liveRequests || [];
  const acceptedRequests = data?.requests || [];
  const volunteers = (data?.volunteers || []).filter((volunteer) => volunteer.verificationStatus === "verified");
  const availableVolunteers = volunteers.filter((volunteer) => volunteer.status === "available");

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["/api/ngo/dashboard"] });

  const accept = async (id) => {
    await apiRequest("PATCH", `/api/ngo/requests/${id}/accept`);
    toast({ title: "Request accepted", description: "The request is now visible in your NGO queue." });
    refresh();
  };

  const assign = async (id) => {
    const volunteerId = selectedVolunteer[id];
    if (!volunteerId) {
      toast({ title: "Select volunteer", description: "Choose an available verified volunteer first.", variant: "destructive" });
      return;
    }
    await apiRequest("PATCH", `/api/ngo/requests/${id}/assign`, { volunteerId });
    toast({ title: "Volunteer assigned", description: "The task has been assigned and is visible to the volunteer." });
    refresh();
  };

  const updateStatus = async (id, status) => {
    await apiRequest("PATCH", `/api/ngo/requests/${id}/status`, {
      status,
      note: notes[id] || `NGO marked request as ${status}`
    });
    setNotes((current) => ({ ...current, [id]: "" }));
    toast({ title: "Request updated", description: `Status changed to ${status}.` });
    refresh();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Operations queue</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Live Requests</h1>
        <p className="mt-1 text-slate-500">Accept public requests, assign verified volunteers, and update relief progress.</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Public Live Queue
              <Badge variant="destructive">{liveRequests.length} pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveRequests.map((request) => (
              <RequestCard key={request.id} request={request}>
                <Button onClick={() => accept(request.id)} className="bg-slate-950 hover:bg-slate-800">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accept Request
                </Button>
              </RequestCard>
            ))}
            {liveRequests.length === 0 && <Empty text="No unaccepted live requests right now." />}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Your NGO Requests
              <Badge>{acceptedRequests.length} active/history</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {acceptedRequests.map((request) => (
              <RequestCard key={request.id} request={request}>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <select
                    value={selectedVolunteer[request.id] || ""}
                    onChange={(event) => setSelectedVolunteer({ ...selectedVolunteer, [request.id]: event.target.value })}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    disabled={request.status === "completed" || request.status === "rejected"}
                  >
                    <option value="">Assign available volunteer</option>
                    {availableVolunteers.map((volunteer) => (
                      <option key={volunteer.id} value={volunteer.id}>
                        {volunteer.user?.fullName || volunteer.id} - {volunteer.skills?.join(", ") || "general"}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" onClick={() => assign(request.id)} disabled={request.status === "completed" || request.status === "rejected"}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assign
                  </Button>
                </div>
                <Textarea
                  placeholder="Progress note for volunteers/admin"
                  value={notes[request.id] || ""}
                  onChange={(event) => setNotes({ ...notes, [request.id]: event.target.value })}
                  className="min-h-20"
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateStatus(request.id, "in_progress")}>In Progress</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(request.id, "completed")}>Complete</Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => updateStatus(request.id, "rejected")}>Reject</Button>
                </div>
              </RequestCard>
            ))}
            {acceptedRequests.length === 0 && <Empty text="Accept a live request to begin handling it." />}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function RequestCard({ request, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant={request.urgency === "critical" ? "destructive" : "secondary"}>{request.urgency}</Badge>
            <Badge variant="outline">{request.status}</Badge>
          </div>
          <h3 className="font-bold text-slate-950">{request.title || `${request.type} request`}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{request.description || "No description provided."}</p>
        </div>
        <AlertTriangle className="h-5 w-5 text-red-500" />
      </div>
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {request.location}</span>
        <span>{request.peopleCount || 1} people affected</span>
      </div>
      {request.audioNote?.url && (
        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-800">
            <Headphones className="h-4 w-4" />
            Voice request preview
          </div>
          <audio controls preload="metadata" className="w-full">
            <source src={request.audioNote.url} type={request.audioNote.type || "audio/webm"} />
            Your browser does not support audio preview.
          </audio>
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">{text}</p>;
}
