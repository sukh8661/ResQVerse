import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, HandCoins, Heart, MapPin, RadioTower, ShieldCheck, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function money(amount) {
  return `Rs ${Number(amount || 0).toLocaleString()}`;
}

function dateLabel(value) {
  if (!value) return "Recent";
  return new Date(value).toLocaleString();
}

function titleFor(kind) {
  const titles = {
    donations: "All Donations",
    requests: "All Emergency Requests",
    allocations: "All Fund Allocations",
    activity: "Complete Activity Feed",
    ngos: "All NGO Partners",
    resources: "All Resources",
    volunteers: "Volunteer Leaderboard",
    stories: "All Field Stories"
  };
  return titles[kind] || "All Records";
}

function descriptionFor(kind) {
  const descriptions = {
    donations: "Every successful donation recorded by the relief network.",
    requests: "Complete emergency request history with location, urgency, and status.",
    allocations: "Fund allocation records approved for partner NGOs.",
    activity: "Combined relief activity from requests and fund movements.",
    ngos: "Verified and registered NGO partners available for relief coordination.",
    resources: "Current relief inventory and available stock records.",
    volunteers: "Volunteer credits and completed response performance.",
    stories: "Field updates shared by verified volunteers."
  };
  return descriptions[kind] || "Complete records from the platform.";
}

function recordDate(record) {
  return record?.createdAt || record?.timestamp || record?.updatedAt || "";
}

function RecordIcon({ kind }) {
  const icons = {
    donations: Heart,
    requests: RadioTower,
    allocations: HandCoins,
    activity: Clock,
    ngos: Users,
    resources: ShieldCheck,
    volunteers: Users,
    stories: Star
  };
  const Icon = icons[kind] || Clock;
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
      <Icon className="h-5 w-5" />
    </div>
  );
}

function renderRecord(kind, item, index) {
  if (kind === "donations") {
    const donorName = item.isAnonymous ? "Anonymous" : item.donorData?.name || "Donor";
    return (
      <>
        <div>
          <h3 className="font-black text-slate-950">{donorName}</h3>
          <p className="mt-1 text-sm text-slate-500">For {item.donationType || "Disaster Relief"}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-orange-600">{money(item.amount)}</p>
          <p className="mt-1 text-xs text-slate-500">{dateLabel(recordDate(item))}</p>
        </div>
      </>
    );
  }

  if (kind === "requests") {
    return (
      <>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="safe-break font-black text-slate-950">{item.title || item.type || "Emergency request"}</h3>
            <Badge className="capitalize">{item.status || "pending"}</Badge>
          </div>
          <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="safe-break">{item.location || "Location pending"}</span>
          </p>
        </div>
        <div className="text-right">
          <Badge variant={item.urgency === "critical" ? "destructive" : "secondary"} className="capitalize">{item.urgency || "medium"}</Badge>
          <p className="mt-2 text-xs text-slate-500">{item.peopleCount || 1} affected</p>
          <p className="mt-1 text-xs text-slate-500">{dateLabel(recordDate(item))}</p>
        </div>
      </>
    );
  }

  if (kind === "allocations") {
    return (
      <>
        <div>
          <h3 className="font-black text-slate-950">{item.purpose || "Relief allocation"}</h3>
          <p className="mt-1 text-sm text-slate-500">NGO: {item.ngoId || item.ngoName || "Assigned partner"}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-emerald-600">{money(item.amount)}</p>
          <p className="mt-1 text-xs text-slate-500">{dateLabel(recordDate(item))}</p>
        </div>
      </>
    );
  }

  if (kind === "volunteers") {
    return (
      <>
        <div>
          <h3 className="font-black text-slate-950">#{index + 1} {item.user?.fullName || "Volunteer"}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.primarySkill || item.skills?.[0] || "Relief support"}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-emerald-600">{item.creditPoints || 0} pts</p>
          <p className="mt-1 text-xs text-slate-500">{item.totalResponses || 0} responses</p>
        </div>
      </>
    );
  }

  if (kind === "resources") {
    return (
      <>
        <div>
          <h3 className="font-black capitalize text-slate-950">{item.type || item.name || "Resource"}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.location || item.category || "Relief inventory"}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-blue-600">{item.available || 0}/{item.quantity || 0}</p>
          <p className="mt-1 text-xs text-slate-500">{item.unit || "units"}</p>
        </div>
      </>
    );
  }

  if (kind === "ngos") {
    return (
      <>
        <div>
          <h3 className="font-black text-slate-950">{item.organizationName || item.name || "NGO Partner"}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.location || item.address || "Location not added"}</p>
        </div>
        <div className="text-right">
          <Badge className={item.isVerified || item.kycStatus === "verified" ? "bg-emerald-600" : ""}>{item.kycStatus || "pending"}</Badge>
          <p className="mt-2 text-xs text-slate-500">{item.warehouses?.length || 0} warehouses</p>
        </div>
      </>
    );
  }

  if (kind === "stories") {
    return (
      <div className="min-w-0">
        <h3 className="font-black text-slate-950">{item.title || "Field story"}</h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{dateLabel(recordDate(item))}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.story || item.description || "No story details available."}</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h3 className="font-black text-slate-950">{item.action || item.title || "Activity update"}</h3>
        <p className="mt-1 text-sm text-slate-500">{item.location || "Platform activity"}</p>
      </div>
      <div className="text-right">
        <p className="font-black text-emerald-600">{item.amount || item.status || "Updated"}</p>
        <p className="mt-1 text-xs text-slate-500">{item.time || dateLabel(recordDate(item))}</p>
      </div>
    </>
  );
}

export default function RecordsPage({ params }) {
  const kind = params?.kind || "activity";
  const { data: donationsData } = useQuery({ queryKey: ["/api/donations"] });
  const { data: requestsData } = useQuery({ queryKey: ["/api/emergency-requests"] });
  const { data: adminData } = useQuery({ queryKey: ["/api/admin/overview"] });
  const { data: operations } = useQuery({ queryKey: ["/api/admin/ngo-operations"] });
  const { data: leaderboardData } = useQuery({ queryKey: ["/api/volunteers/leaderboard"] });
  const { data: storiesData } = useQuery({ queryKey: ["/api/volunteers/stories"] });
  const { data: ngoData } = useQuery({ queryKey: ["/api/admin/ngos"] });

  const donations = donationsData?.donations || [];
  const requests = requestsData?.requests || operations?.requests || [];
  const allocations = adminData?.allocations || [];
  const volunteers = leaderboardData?.volunteers || operations?.volunteers || [];
  const resources = operations?.resources || [];
  const ngos = ngoData?.ngos || [];
  const stories = storiesData?.stories || [];
  const activity = [
    ...(operations?.requests || requests).map((request) => ({
      id: `request-${request.id}`,
      action: `${request.type || request.title || "Relief"} request ${request.status || "updated"}`,
      location: request.location,
      amount: `${request.peopleCount || 1} people`,
      time: dateLabel(recordDate(request)),
      createdAt: recordDate(request)
    })),
    ...allocations.map((allocation) => ({
      id: `allocation-${allocation.id}`,
      action: `Funds allocated for ${allocation.purpose || "relief"}`,
      location: allocation.ngoId,
      amount: money(allocation.amount),
      time: dateLabel(recordDate(allocation)),
      createdAt: recordDate(allocation)
    }))
  ].sort((a, b) => new Date(recordDate(b)).getTime() - new Date(recordDate(a)).getTime());

  const dataByKind = {
    donations,
    requests,
    allocations,
    activity,
    ngos,
    resources,
    volunteers,
    stories
  };
  const records = dataByKind[kind] || activity;

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-3 -ml-3 rounded-2xl text-slate-600">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Complete records</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{titleFor(kind)}</h1>
            <p className="mt-2 max-w-2xl text-slate-500">{descriptionFor(kind)}</p>
          </div>
          <Badge className="w-fit rounded-full bg-slate-950 px-4 py-2">{records.length} records</Badge>
        </div>

        <div className="space-y-3">
          {records.map((item, index) => (
            <Card key={item.id || `${kind}-${index}`} className="rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <RecordIcon kind={kind} />
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {renderRecord(kind, item, index)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {records.length === 0 && (
            <Card className="rounded-3xl border-dashed border-slate-300">
              <CardContent className="p-10 text-center text-slate-500">No records are available yet.</CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
