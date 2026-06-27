import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Clock, Mail, MapPin, Phone, Trophy, UserCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Volunteers() {
  const { data } = useQuery({ queryKey: ["/api/ngo/dashboard"] });
  const volunteers = data?.volunteers || [];
  const requests = data?.requests || [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Team coordination</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Volunteers</h1>
        <p className="mt-1 text-slate-500">Verified volunteers assigned to your NGO and their current task load.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Total Volunteers" value={volunteers.length} icon={Users} />
        <Metric label="Available" value={volunteers.filter((item) => item.status === "available").length} icon={UserCheck} />
        <Metric label="Assigned" value={volunteers.filter((item) => item.status === "assigned").length} icon={Clock} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {volunteers.map((volunteer) => {
          const assigned = requests.filter((request) => {
            const assignedVolunteerId = typeof request.assignedVolunteer === "object"
              ? request.assignedVolunteer?.id
              : request.assignedVolunteer;
            return assignedVolunteerId === volunteer.id;
          });
          return (
            <Card key={volunteer.id} className="rounded-3xl border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">{volunteer.user?.fullName || "Volunteer"}</h3>
                    <p className="text-sm font-normal text-slate-500">{volunteer.location || "Location not set"}</p>
                  </div>
                  <Badge variant={volunteer.status === "available" ? "default" : "secondary"}>{volunteer.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(volunteer.skills || []).slice(0, 4).map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
                  {(!volunteer.skills || volunteer.skills.length === 0) && <Badge variant="outline">General relief</Badge>}
                </div>
                <div className="space-y-2 text-sm text-slate-500">
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {volunteer.user?.email || "No email"}</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {volunteer.user?.phone || "No phone"}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {volunteer.city || volunteer.location || "No city"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
                  <div><p className="font-bold">{volunteer.creditPoints || 0}</p><p className="text-slate-500">Credits</p></div>
                  <div><p className="font-bold">{volunteer.totalResponses || 0}</p><p className="text-slate-500">Responses</p></div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-3">
                  <p className="mb-2 flex items-center gap-2 text-sm font-bold"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Assigned tasks</p>
                  {assigned.length > 0 ? assigned.map((request) => (
                    <p key={request.id} className="text-sm text-slate-500">{request.title || request.type} - {request.status}</p>
                  )) : <p className="text-sm text-slate-500">No current assigned task.</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {volunteers.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No volunteers assigned to your NGO yet. Admin approval/assignment will show them here.</p>}
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div><p className="text-sm font-semibold text-slate-500">{label}</p><h2 className="mt-1 text-3xl font-black text-slate-950">{value}</h2></div>
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Icon className="h-6 w-6" /></div>
      </CardContent>
    </Card>
  );
}
