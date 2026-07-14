import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  HandCoins,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShieldCheck,
  User,
  Users,
  WalletCards
} from "lucide-react";
import RequestLocationMap from "@/components/request-location-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import logo from "@/photos/Rescue_Logo_clean.png";

const views = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: ClipboardCheck },
  { id: "operations", label: "Operations Map", icon: MapPin },
  { id: "fundRequests", label: "Fund Requests", icon: Clock },
  { id: "allocations", label: "Fund Allocation", icon: HandCoins },
  { id: "donations", label: "Donations", icon: WalletCards },
  { id: "ngos", label: "NGOs", icon: Building2 },
  { id: "profile", label: "Profile", icon: User }
];

function money(value) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = getAuthSession();
  const [activeView, setActiveView] = useState("overview");
  const [allocation, setAllocation] = useState({ donationId: "", ngoId: "", amount: "", purpose: "" });
  const [selectedNgoByVolunteer, setSelectedNgoByVolunteer] = useState({});
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [profileForm, setProfileForm] = useState({
    fullName: session?.user?.fullName || "",
    phone: session?.user?.phone || "",
    address: session?.user?.address || ""
  });

  const { data: meData } = useQuery({ queryKey: ["/api/auth/me"], enabled: Boolean(session?.user?.role === "admin") });
  const { data } = useQuery({ queryKey: ["/api/admin/overview"], enabled: Boolean(session?.user?.role === "admin") });
  const { data: ngoData } = useQuery({ queryKey: ["/api/admin/ngos"], enabled: Boolean(session?.user?.role === "admin") });
  const { data: applicationsData } = useQuery({
    queryKey: ["/api/admin/volunteer-applications"],
    enabled: Boolean(session?.user?.role === "admin")
  });
  const { data: operationsData } = useQuery({
    queryKey: ["/api/admin/ngo-operations"],
    enabled: Boolean(session?.user?.role === "admin")
  });

  useEffect(() => {
    const user = meData?.user || session?.user;
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [meData?.user?.id]);

  if (!session || session.user.role !== "admin") {
    navigate("/login");
    return null;
  }

  const overview = data?.overview || {};
  const donations = data?.donations || [];
  const allocations = data?.allocations || [];
  const ngos = ngoData?.ngos || [];
  const applications = applicationsData?.applications || [];
  const operations = operationsData || {};
  const requests = operations.requests || [];
  const volunteers = operations.volunteers || [];
  const resources = operations.resources || [];
  const fundRequests = data?.fundRequests || operations.fundRequests || [];
  const pendingFundRequests = fundRequests.filter((request) => request.status === "pending");
  const totalDonationAmount = Number(overview.totalDonationAmount || 0);
  const allocatedAmount = Number(overview.allocatedAmount || 0);
  const unallocatedAmount = Number(overview.unallocatedAmount || 0);

  const allocationPercent = totalDonationAmount ? Math.min((allocatedAmount / totalDonationAmount) * 100, 100) : 0;

  const submitAllocation = async () => {
    if (!allocation.ngoId || !allocation.amount || !allocation.purpose) {
      toast({ title: "Allocation incomplete", description: "Choose NGO, amount, and purpose.", variant: "destructive" });
      return;
    }
    await apiRequest("POST", "/api/admin/allocations", allocation);
    setAllocation({ donationId: "", ngoId: "", amount: "", purpose: "" });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/overview"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/ngo-operations"] });
    toast({ title: "Funds allocated", description: "Allocation has been saved." });
  };

  const updateReviewDraft = (requestId, patch) => {
    setReviewDrafts((current) => ({ ...current, [requestId]: { ...(current[requestId] || {}), ...patch } }));
  };

  const reviewFundRequest = async (request, decision) => {
    const draft = reviewDrafts[request.id] || {};
    const amountApproved = decision === "approve" ? request.amountRequested : draft.amountApproved;
    if (decision !== "reject" && (!amountApproved || Number(amountApproved) <= 0)) {
      toast({ title: "Amount required", description: "Enter an approved amount for this request.", variant: "destructive" });
      return;
    }
    await apiRequest("PATCH", `/api/admin/fund-requests/${request.id}/review`, {
      decision,
      amountApproved: Number(amountApproved || 0),
      adminNote: draft.adminNote || (decision === "approve"
        ? "Full requested amount approved. We had enough relief funds available, so the complete request has been allocated."
        : decision === "partial"
          ? "Partial amount approved based on available relief funds."
          : "Request could not be approved at this time.")
    });
    setReviewDrafts((current) => ({ ...current, [request.id]: {} }));
    queryClient.invalidateQueries({ queryKey: ["/api/admin/overview"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/ngo-operations"] });
    toast({
      title: decision === "reject" ? "Fund request rejected" : "Fund request reviewed",
      description: decision === "approve" ? "Full amount allocated to the NGO." : decision === "partial" ? "Partial funds allocated with your note." : "Reason saved for the NGO."
    });
  };

  const approveVolunteer = async (volunteerId) => {
    const ngoId = selectedNgoByVolunteer[volunteerId];
    if (!ngoId) {
      toast({ title: "Select NGO first", description: "Volunteer must be assigned to an NGO.", variant: "destructive" });
      return;
    }

    await apiRequest("PATCH", `/api/admin/volunteers/${volunteerId}/assign-ngo`, { ngoId });
    setSelectedNgoByVolunteer((current) => ({ ...current, [volunteerId]: "" }));
    queryClient.invalidateQueries({ queryKey: ["/api/admin/volunteer-applications"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/overview"] });
    queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
    toast({ title: "Volunteer approved", description: "Profile verified and assigned to NGO." });
  };

  const verifyNgo = async (ngoId, status = "verified") => {
    await apiRequest("PATCH", `/api/admin/ngos/${ngoId}/verify`, { status });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/ngos"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/overview"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/ngo-operations"] });
    queryClient.invalidateQueries({ queryKey: ["/api/ngos?verified=true"] });
    toast({
      title: status === "rejected" ? "NGO rejected" : "NGO approved",
      description: status === "rejected" ? "The NGO verification status was updated." : "The NGO is now verified and visible as a partner."
    });
  };

  const saveProfile = async () => {
    const response = await apiRequest("PATCH", "/api/auth/me", profileForm);
    const payload = await response.json();
    setAuthSession({ ...session, user: payload.user });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    toast({ title: "Profile saved", description: "Admin profile was updated." });
  };

  const logout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const metrics = [
    { label: "NGOs", value: overview.ngos || 0, icon: Building2, tone: "bg-blue-50 text-blue-700" },
    { label: "Volunteers", value: overview.volunteers || 0, icon: Users, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Pending", value: overview.pendingVolunteerApplications || applications.length || 0, icon: ShieldCheck, tone: "bg-amber-50 text-amber-700" },
    { label: "Fund Requests", value: overview.pendingFundRequests || pendingFundRequests.length || 0, icon: Clock, tone: "bg-orange-50 text-orange-700" },
    { label: "Requests", value: overview.requests || requests.length || 0, icon: Activity, tone: "bg-red-50 text-red-700" },
    { label: "Unallocated", value: money(unallocatedAmount), icon: HandCoins, tone: "bg-purple-50 text-purple-700" }
  ];

  const donationOptions = useMemo(() => donations.filter((donation) => Number(donation.amount || 0) > Number(donation.allocatedAmount || 0)), [donations]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
          <div className="flex h-full flex-col">
            <div className="flex h-[136px] items-center border-b border-slate-100 px-6">
              <Link href="/" className="group flex items-center gap-3">
                <div className="-my-2 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                  <img src={logo} alt="ResQVerse Logo" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div>
                  <h1 className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-xl font-black leading-tight text-transparent">ResQVerse</h1>
                  <p className="-mt-0.5 text-xs font-semibold text-slate-500">Unified Disaster Relief Platform</p>
                </div>
              </Link>
            </div>

            <nav className="flex-1 space-y-2 p-4">
              {views.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                    activeView === item.id ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                  {item.id === "applications" && applications.length > 0 && <Badge className="ml-auto bg-red-600">{applications.length}</Badge>}
                  {item.id === "fundRequests" && pendingFundRequests.length > 0 && <Badge className="ml-auto bg-orange-600">{pendingFundRequests.length}</Badge>}
                </button>
              ))}
            </nav>

            <div className="border-t border-slate-100 p-4">
              <Button variant="outline" className="w-full rounded-2xl" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 lg:pl-72">
          <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Platform command center</p>
                  <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Admin Dashboard</h2>
                  <p className="mt-1 text-slate-500">Approve volunteers, track live requests, allocate funds, and monitor partner NGOs.</p>
                </div>
                <div className="mobile-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
                  {views.map((item) => (
                    <Button key={item.id} variant={activeView === item.id ? "default" : "outline"} size="sm" className="shrink-0 rounded-2xl" onClick={() => setActiveView(item.id)}>
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {activeView === "overview" && (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                  {metrics.map((metric) => (
                    <Card key={metric.label} className="rounded-3xl border-slate-200 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                            <h3 className="mt-2 truncate text-2xl font-black text-slate-950">{metric.value}</h3>
                          </div>
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${metric.tone}`}>
                            <metric.icon className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader><CardTitle>Fund Movement</CardTitle></CardHeader>
                    <CardContent>
                      <div className="rounded-3xl bg-slate-950 p-6 text-white">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <MoneyBlock label="Collected" value={totalDonationAmount} />
                          <MoneyBlock label="Allocated" value={allocatedAmount} />
                          <MoneyBlock label="Available" value={unallocatedAmount} />
                        </div>
                        <Progress value={allocationPercent} className="mt-6 h-2 bg-slate-800" />
                        <p className="mt-3 text-sm text-slate-300">{Math.round(allocationPercent)}% of successful donations allocated</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader><CardTitle>Operational Snapshot</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Snapshot label="Active requests" value={operations.stats?.activeRequests || 0} />
                      <Snapshot label="Critical requests" value={operations.stats?.criticalRequests || 0} />
                      <Snapshot label="Assigned volunteers" value={operations.stats?.volunteersAssigned || 0} />
                      <Snapshot label="Available resources" value={operations.stats?.resourcesAvailable || 0} />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeView === "applications" && <ApplicationsPanel applications={applications} ngos={ngos} selectedNgoByVolunteer={selectedNgoByVolunteer} setSelectedNgoByVolunteer={setSelectedNgoByVolunteer} approveVolunteer={approveVolunteer} />}
            {activeView === "operations" && <OperationsPanel requests={requests} volunteers={volunteers} resources={resources} />}
            {activeView === "fundRequests" && <FundRequestsPanel fundRequests={fundRequests} reviewDrafts={reviewDrafts} updateReviewDraft={updateReviewDraft} reviewFundRequest={reviewFundRequest} />}
            {activeView === "allocations" && <AllocationPanel allocation={allocation} setAllocation={setAllocation} submitAllocation={submitAllocation} donations={donationOptions} ngos={ngos} allocations={allocations} />}
            {activeView === "donations" && <DonationsPanel donations={donations} />}
            {activeView === "ngos" && <NgosPanel ngos={ngos} verifyNgo={verifyNgo} />}
            {activeView === "profile" && <ProfilePanel profileForm={profileForm} setProfileForm={setProfileForm} saveProfile={saveProfile} session={session} />}
          </section>
        </main>
      </div>
    </div>
  );
}

function MoneyBlock({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-black">{money(value)}</p>
    </div>
  );
}

function Snapshot({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="text-lg font-black text-slate-950">{value}</span>
    </div>
  );
}

function ApplicationsPanel({ applications, ngos, selectedNgoByVolunteer, setSelectedNgoByVolunteer, approveVolunteer }) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Volunteer Applications</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {applications.map((application) => (
          <div key={application.id} className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h3 className="safe-break text-lg font-black text-slate-950">{application.user?.fullName || "Volunteer applicant"}</h3>
                <p className="safe-break text-sm text-slate-500">{application.user?.email || application.user?.phone || "No contact saved"}</p>
                <p className="safe-break mt-1 text-sm text-slate-600">{application.location || application.address || "Location not provided"}</p>
              </div>
              <Badge variant="outline" className="w-fit capitalize">{application.verificationStatus}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(application.skills || []).slice(0, 4).map((skill) => <Badge key={skill} variant="secondary">{skill.replaceAll("_", " ")}</Badge>)}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Select
                value={selectedNgoByVolunteer[application.id]}
                onValueChange={(value) => setSelectedNgoByVolunteer((current) => ({ ...current, [application.id]: value }))}
              >
                <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Assign NGO" /></SelectTrigger>
                <SelectContent className="bg-white">
                  {ngos.map((ngo) => <SelectItem key={ngo.id} value={ngo.id}>{ngo.organizationName}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="rounded-2xl" onClick={() => approveVolunteer(application.id)} disabled={!selectedNgoByVolunteer[application.id]}>
                Approve
              </Button>
            </div>
          </div>
        ))}
        {applications.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 xl:col-span-2">No pending volunteer applications right now.</p>}
      </CardContent>
    </Card>
  );
}

function OperationsPanel({ requests, volunteers, resources }) {
  return (
    <div className="space-y-6">
      <RequestLocationMap title="Platform Live Request Locations" requests={requests} height={430} />
      <div className="grid gap-6 xl:grid-cols-3">
        <ListCard title="Recent Requests" items={requests} viewAllHref="/records/requests" render={(request) => <span>{request.title || request.type} <Badge className="ml-2 capitalize">{request.status}</Badge></span>} />
        <ListCard title="Volunteer Network" items={volunteers} viewAllHref="/records/volunteers" render={(volunteer) => <span>{volunteer.user?.fullName || "Volunteer"} <Badge className="ml-2 capitalize">{volunteer.status}</Badge></span>} />
        <ListCard title="Resources" items={resources} viewAllHref="/records/resources" render={(resource) => <span>{resource.type} <span className="text-slate-500">({resource.available || 0} {resource.unit})</span></span>} />
      </div>
    </div>
  );
}

function requestStatusClass(status) {
  if (status === "approved") return "bg-emerald-100 text-emerald-700";
  if (status === "partially_approved") return "bg-amber-100 text-amber-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

function FundRequestsPanel({ fundRequests, reviewDrafts, updateReviewDraft, reviewFundRequest }) {
  const pending = fundRequests.filter((request) => request.status === "pending");
  const reviewed = fundRequests.filter((request) => request.status !== "pending");
  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            NGO Fund Requests
            {pending.length > 0 && <Badge className="bg-orange-600">{pending.length} pending</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pending.map((request) => {
            const draft = reviewDrafts[request.id] || {};
            return (
              <div key={request.id} className="rounded-3xl border border-orange-100 bg-orange-50/40 p-5">
                <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge className="bg-slate-950">Pending review</Badge>
                      <Badge variant="outline" className="capitalize">{request.urgency}</Badge>
                    </div>
                    <h3 className="text-lg font-black text-slate-950">{request.purpose}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{request.ngo?.organizationName || "NGO partner"}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{request.details || "No additional details provided."}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoPill label="Requested" value={money(request.amountRequested)} />
                      <InfoPill label="Requested on" value={new Date(request.createdAt).toLocaleDateString()} />
                    </div>
                  </div>
                  <div className="space-y-3 rounded-3xl border border-white bg-white p-4 shadow-sm">
                    <div>
                      <Label>Approved amount</Label>
                      <Input
                        className="mt-2 h-11 rounded-2xl"
                        type="number"
                        min="1"
                        max={request.amountRequested}
                        placeholder={`${request.amountRequested}`}
                        value={draft.amountApproved || ""}
                        onChange={(event) => updateReviewDraft(request.id, { amountApproved: event.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Admin note / reason</Label>
                      <Textarea
                        className="mt-2 min-h-24 rounded-2xl"
                        placeholder="Tell NGO why full/partial/rejected funds were decided."
                        value={draft.adminNote || ""}
                        onChange={(event) => updateReviewDraft(request.id, { adminNote: event.target.value })}
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700" onClick={() => reviewFundRequest(request, "approve")}>
                        Full
                      </Button>
                      <Button variant="outline" className="rounded-2xl border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => reviewFundRequest(request, "partial")}>
                        Partial
                      </Button>
                      <Button variant="outline" className="rounded-2xl border-red-200 text-red-700 hover:bg-red-50" onClick={() => reviewFundRequest(request, "reject")}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {pending.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No pending NGO fund requests right now.</p>}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader><CardTitle>Reviewed Requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reviewed.map((request) => (
            <div key={request.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge className={requestStatusClass(request.status)}>{request.status.replaceAll("_", " ")}</Badge>
                  <Badge variant="outline">{request.ngo?.organizationName || "NGO"}</Badge>
                </div>
                <h3 className="font-bold text-slate-950">{request.purpose}</h3>
                <p className="mt-1 text-sm text-slate-500">{request.adminNote || "No admin note saved."}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">Requested {money(request.amountRequested)}</p>
                <p className="text-lg font-black text-emerald-700">Approved {money(request.amountApproved)}</p>
              </div>
            </div>
          ))}
          {reviewed.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">Reviewed decisions will appear here.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function AllocationPanel({ allocation, setAllocation, submitAllocation, donations, ngos, allocations }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader><CardTitle>Allocate Donation to NGO</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Donation</Label>
            <Select value={allocation.donationId} onValueChange={(value) => setAllocation({ ...allocation, donationId: value })}>
              <SelectTrigger className="mt-2 rounded-2xl"><SelectValue placeholder="Select donation or leave general" /></SelectTrigger>
              <SelectContent className="bg-white">
                {donations.map((donation) => <SelectItem key={donation.id} value={donation.id}>{money(donation.amount)} - {donation.donationType || "relief"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>NGO</Label>
            <Select value={allocation.ngoId} onValueChange={(value) => setAllocation({ ...allocation, ngoId: value })}>
              <SelectTrigger className="mt-2 rounded-2xl"><SelectValue placeholder="Select NGO" /></SelectTrigger>
              <SelectContent className="bg-white">{ngos.map((ngo) => <SelectItem key={ngo.id} value={ngo.id}>{ngo.organizationName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Input className="h-12 rounded-2xl" placeholder="Amount" value={allocation.amount} onChange={(event) => setAllocation({ ...allocation, amount: event.target.value })} />
          <Input className="h-12 rounded-2xl" placeholder="Purpose" value={allocation.purpose} onChange={(event) => setAllocation({ ...allocation, purpose: event.target.value })} />
          <Button className="h-12 w-full rounded-2xl" onClick={submitAllocation}>Allocate Funds</Button>
        </CardContent>
      </Card>

      <ListCard title="Recent Allocations" items={allocations} viewAllHref="/records/allocations" render={(allocationItem) => <span>{money(allocationItem.amount)} <span className="text-slate-500">for {allocationItem.purpose}</span></span>} />
    </div>
  );
}

function DonationsPanel({ donations }) {
  return <ListCard title="Recent Donations" items={donations} viewAllHref="/records/donations" render={(donation) => <span>{donation.isAnonymous ? "Anonymous" : donation.donorData?.name || "Donor"} donated <strong>{money(donation.amount)}</strong> <span className="text-slate-500">for {donation.donationType || "relief"}</span></span>} />;
}

function NgosPanel({ ngos, verifyNgo }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {ngos.map((ngo) => (
        <Card key={ngo.id} className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h3 className="safe-break font-black text-slate-950">{ngo.organizationName}</h3>
                <p className="safe-break mt-1 text-sm text-slate-500">{ngo.location || ngo.address || "Location not added"}</p>
              </div>
              {ngo.isVerified ? <Badge className="bg-emerald-600">Verified</Badge> : ngo.kycStatus === "rejected" ? <Badge variant="destructive">Rejected</Badge> : <Badge variant="outline">Pending</Badge>}
            </div>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{ngo.description || "No description available."}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <InfoPill label="Registration" value={ngo.registrationId || "Not added"} />
              <InfoPill label="Documents" value={`${ngo.documents?.length || 0}`} />
              <InfoPill label="Contact" value={ngo.phone || ngo.email || "Not added"} />
              <InfoPill label="KYC" value={ngo.kycStatus || "pending"} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {!ngo.isVerified && ngo.kycStatus !== "rejected" && (
                <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700" onClick={() => verifyNgo(ngo.id, "verified")}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve NGO
                </Button>
              )}
              {ngo.kycStatus !== "rejected" && (
                <Button variant="outline" className="rounded-2xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => verifyNgo(ngo.id, "rejected")}>
                  Reject
                </Button>
              )}
              {ngo.kycStatus === "rejected" && (
                <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700" onClick={() => verifyNgo(ngo.id, "verified")}>
                  Re-approve
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {ngos.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">No NGO records available yet.</p>}
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate font-bold text-slate-800">{value}</p>
    </div>
  );
}

function ProfilePanel({ profileForm, setProfileForm, saveProfile, session }) {
  return (
    <Card className="max-w-2xl rounded-3xl border-slate-200 shadow-sm">
      <CardHeader><CardTitle>Admin Profile</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Full name</Label>
          <Input className="mt-2 h-12 rounded-2xl" value={profileForm.fullName} onChange={(event) => setProfileForm({ ...profileForm, fullName: event.target.value })} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input className="mt-2 h-12 rounded-2xl" value={profileForm.phone || ""} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} />
        </div>
        <div>
          <Label>Address</Label>
          <Input className="mt-2 h-12 rounded-2xl" value={profileForm.address || ""} onChange={(event) => setProfileForm({ ...profileForm, address: event.target.value })} />
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Signed in as <strong>{session.user.email || session.user.username}</strong>
        </div>
        <Button className="rounded-2xl" onClick={saveProfile}>Save Profile</Button>
      </CardContent>
    </Card>
  );
}

function ListCard({ title, items, render, viewAllHref }) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> {title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800">
            {render(item)}
          </div>
        ))}
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No records available.</p>}
        {items.length > 4 && viewAllHref && (
          <Button asChild variant="outline" className="w-full rounded-2xl font-bold">
            <Link href={viewAllHref}>
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
