import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  FileBadge,
  Home,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  Navigation,
  PenLine,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  WalletCards
} from "lucide-react";
import RequestLocationMap from "@/components/request-location-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const views = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: Route },
  { id: "map", label: "Request Map", icon: MapPin },
  { id: "story", label: "Field Story", icon: BookOpen },
  { id: "certificate", label: "Certificate", icon: FileBadge },
  { id: "profile", label: "Profile", icon: User }
];

const taskSteps = [
  { status: "accepted", label: "Accept", activeLabel: "Accepted", icon: BadgeCheck },
  { status: "started", label: "Start", activeLabel: "Started", icon: Navigation },
  { status: "reached", label: "Reached", activeLabel: "Reached", icon: MapPin },
  { status: "in_progress", label: "In Progress", activeLabel: "In progress", icon: Clock },
  { status: "completed", label: "Complete", activeLabel: "Completed", icon: CheckCircle2 }
];

function nextTaskAction(status) {
  const normalized = status === "assigned" || status === "pending" ? "ready" : status;
  if (normalized === "ready") return taskSteps[0];
  const currentIndex = taskSteps.findIndex((step) => step.status === normalized);
  if (currentIndex < 0) return taskSteps[0];
  return taskSteps[currentIndex + 1] || null;
}

function statusTone(status) {
  const tones = {
    assigned: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-indigo-50 text-indigo-700 border-indigo-200",
    started: "bg-amber-50 text-amber-700 border-amber-200",
    reached: "bg-purple-50 text-purple-700 border-purple-200",
    in_progress: "bg-orange-50 text-orange-700 border-orange-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200"
  };
  return tones[status] || "bg-slate-50 text-slate-700 border-slate-200";
}

function readableStatus(status) {
  return (status || "assigned").replaceAll("_", " ");
}

export default function VolunteerDashboard() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = getAuthSession();
  const [activeView, setActiveView] = useState("overview");
  const [notes, setNotes] = useState({});
  const [story, setStory] = useState({ title: "", story: "" });
  const [profileForm, setProfileForm] = useState({
    fullName: session?.user?.fullName || "",
    phone: session?.user?.phone || "",
    address: session?.user?.address || ""
  });

  const { data: meData } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: Boolean(session?.user?.role === "volunteer")
  });

  const volunteer = meData?.profile || session?.profile;
  const user = meData?.user || session?.user;

  const { data: ngoData } = useQuery({
    queryKey: ["/api/admin/ngos"],
    enabled: Boolean(session?.user?.role === "volunteer")
  });

  const assignedNgo = (ngoData?.ngos || []).find((ngo) => ngo.id === volunteer?.ngoId);

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/volunteers", volunteer?.id, "tasks"],
    enabled: Boolean(volunteer?.id && volunteer?.verificationStatus === "verified"),
    select: (payload) => payload?.requests || []
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user?.id, user?.fullName, user?.phone, user?.address]);

  if (!session || session.user.role !== "volunteer") {
    navigate("/login");
    return null;
  }

  const isPending = volunteer?.verificationStatus !== "verified";
  const credits = Number(volunteer?.creditPoints || 0);
  const certificateTarget = 1000;
  const certificateUnlocked = credits >= certificateTarget;
  const activeTasks = tasks.filter((task) => task.status !== "completed");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const nextCertificateProgress = Math.min((credits / certificateTarget) * 100, 100);

  const updateTask = async (requestId, status) => {
    await apiRequest("POST", `/api/emergency-requests/${requestId}/progress`, {
      status,
      note: notes[requestId] || `Volunteer marked task as ${readableStatus(status)}`
    });
    setNotes((current) => ({ ...current, [requestId]: "" }));
    queryClient.invalidateQueries({ queryKey: ["/api/volunteers", volunteer?.id, "tasks"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    toast({ title: "Task updated", description: `Marked as ${readableStatus(status)}.` });
  };

  const submitStory = async () => {
    if (!story.title || !story.story || !volunteer?.id) {
      toast({ title: "Story incomplete", description: "Add a title and story before publishing.", variant: "destructive" });
      return;
    }
    await apiRequest("POST", "/api/volunteers/stories", {
      volunteerId: volunteer.id,
      title: story.title,
      story: story.story
    });
    setStory({ title: "", story: "" });
    toast({ title: "Story submitted", description: "Your field update has been published." });
  };

  const saveProfile = async () => {
    const response = await apiRequest("PATCH", "/api/auth/me", profileForm);
    const payload = await response.json();
    setAuthSession({ ...session, user: payload.user, profile: volunteer });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    toast({ title: "Profile saved", description: "Your volunteer profile was updated." });
  };

  const logout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const dashboardStats = [
    { label: "Credit Points", value: credits, icon: WalletCards, detail: `${certificateTarget - Math.min(credits, certificateTarget)} points to certificate` },
    { label: "Active Tasks", value: activeTasks.length, icon: Route, detail: "Assigned relief work" },
    { label: "Completed", value: volunteer?.totalResponses || completedTasks.length, icon: CheckCircle2, detail: "25 credits per completion" },
    { label: "NGO", value: assignedNgo?.organizationName || "Not assigned", icon: Building2, detail: volunteer?.verificationStatus || "pending" }
  ];

  return (
    <div className="min-h-screen bg-slate-100 pt-16">
      <div className="flex">
        <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Volunteer panel</p>
                  <h1 className="text-xl font-black text-slate-950">ResQVerse</h1>
                </div>
              </div>
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
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Volunteer operations</p>
                  <h2 className="text-3xl font-black text-slate-950">Welcome, {user?.fullName || "Volunteer"}</h2>
                  <p className="mt-1 text-slate-500">Update tasks step by step, track credits, and publish verified field stories.</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:hidden">
                  {views.map((item) => (
                    <Button key={item.id} variant={activeView === item.id ? "default" : "outline"} size="sm" onClick={() => setActiveView(item.id)}>
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {isPending && (
              <Card className="rounded-3xl border-amber-200 bg-amber-50 shadow-sm">
                <CardContent className="flex gap-3 p-5">
                  <Clock className="mt-0.5 h-5 w-5 text-amber-700" />
                  <div>
                    <h3 className="font-black text-amber-950">Application pending approval</h3>
                    <p className="text-sm leading-6 text-amber-800">Tasks unlock after admin verification and NGO assignment.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === "overview" && (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {dashboardStats.map((stat) => (
                    <Card key={stat.label} className="rounded-3xl border-slate-200 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                            <h3 className="mt-2 truncate text-2xl font-black text-slate-950">{stat.value}</h3>
                            <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
                          </div>
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                            <stat.icon className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> Certificate Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-3xl bg-slate-950 p-6 text-white">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-slate-300">Appreciation certificate unlocks at</p>
                            <h3 className="text-4xl font-black">1000 credits</h3>
                          </div>
                          {certificateUnlocked ? <Award className="h-14 w-14 text-amber-300" /> : <Lock className="h-14 w-14 text-slate-500" />}
                        </div>
                        <Progress value={nextCertificateProgress} className="mt-6 h-2 bg-slate-800" />
                        <p className="mt-3 text-sm text-slate-300">{credits} / {certificateTarget} credits earned</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader><CardTitle>Next Actions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {activeTasks.slice(0, 3).map((task) => {
                        const action = nextTaskAction(task.status);
                        return (
                          <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
                            <p className="font-bold text-slate-950">{task.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{task.location}</p>
                            {action && (
                              <Button className="mt-3 w-full rounded-2xl" onClick={() => updateTask(task.id, action.status)}>
                                {action.label}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                      {activeTasks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No active tasks right now.</p>}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeView === "tasks" && <TaskBoard tasks={tasks} notes={notes} setNotes={setNotes} updateTask={updateTask} isPending={isPending} />}
            {activeView === "map" && <RequestLocationMap title="Assigned Request Locations" requests={tasks} height={520} />}
            {activeView === "story" && <StoryPanel story={story} setStory={setStory} submitStory={submitStory} disabled={isPending} />}
            {activeView === "certificate" && <CertificatePanel user={user} credits={credits} target={certificateTarget} unlocked={certificateUnlocked} ngo={assignedNgo} />}
            {activeView === "profile" && <ProfilePanel profileForm={profileForm} setProfileForm={setProfileForm} saveProfile={saveProfile} volunteer={volunteer} ngo={assignedNgo} />}
          </section>
        </main>
      </div>
    </div>
  );
}

function TaskBoard({ tasks, notes, setNotes, updateTask, isPending }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {tasks.map((request) => {
        const nextAction = nextTaskAction(request.status);
        return (
          <Card key={request.id} className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-950">{request.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{request.description || "No description added."}</p>
                </div>
                <Badge variant="outline" className={`capitalize ${statusTone(request.status)}`}>{readableStatus(request.status)}</Badge>
              </div>

              <p className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-red-500" />
                {request.location}
              </p>

              <div className="grid grid-cols-5 gap-2">
                {taskSteps.map((step, index) => {
                  const currentIndex = taskSteps.findIndex((item) => item.status === request.status);
                  const active = currentIndex >= index || request.status === "completed";
                  return (
                    <div key={step.status} className={`rounded-2xl p-3 text-center text-xs font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>
                      <step.icon className="mx-auto mb-1 h-4 w-4" />
                      {step.activeLabel}
                    </div>
                  );
                })}
              </div>

              <Textarea
                placeholder="Add progress note for NGO/admin"
                value={notes[request.id] || ""}
                onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                className="rounded-2xl"
              />

              {nextAction ? (
                <Button disabled={isPending} className="h-12 w-full rounded-2xl bg-slate-950 font-bold hover:bg-slate-800" onClick={() => updateTask(request.id, nextAction.status)}>
                  <nextAction.icon className="mr-2 h-4 w-4" />
                  {nextAction.label}
                </Button>
              ) : (
                <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Task completed. 25 credits added after completion.</div>
              )}
            </CardContent>
          </Card>
        );
      })}
      {tasks.length === 0 && <Card className="rounded-3xl border-dashed border-slate-300 xl:col-span-2"><CardContent className="p-10 text-center text-slate-500">Tasks assigned by your NGO will appear here.</CardContent></Card>}
    </div>
  );
}

function StoryPanel({ story, setStory, submitStory, disabled }) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader><CardTitle className="flex items-center gap-2"><PenLine className="h-5 w-5" /> Share Field Story</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Input className="h-12 rounded-2xl" placeholder="Story title" value={story.title} onChange={(event) => setStory({ ...story, title: event.target.value })} disabled={disabled} />
        <Textarea className="min-h-44 rounded-2xl" placeholder="Write what happened in the field..." value={story.story} onChange={(event) => setStory({ ...story, story: event.target.value })} disabled={disabled} />
        <Button onClick={submitStory} disabled={disabled} className="rounded-2xl"><Send className="mr-2 h-4 w-4" /> Publish Story</Button>
      </CardContent>
    </Card>
  );
}

function CertificatePanel({ user, credits, target, unlocked, ngo }) {
  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <div className={`p-8 ${unlocked ? "bg-gradient-to-br from-amber-50 to-white" : "bg-slate-100"}`}>
          <div className="mx-auto max-w-3xl rounded-3xl border-4 border-double border-amber-300 bg-white p-8 text-center shadow-sm">
            {unlocked ? <Award className="mx-auto h-16 w-16 text-amber-500" /> : <Lock className="mx-auto h-16 w-16 text-slate-400" />}
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Certificate of Appreciation</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">{unlocked ? user?.fullName || "Volunteer" : "Locked Certificate"}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
              {unlocked
                ? `Awarded for crossing ${target} verified relief credits with ${ngo?.organizationName || "ResQVerse partners"}.`
                : `Earn ${target - credits} more credits to unlock your official appreciation certificate.`}
            </p>
            <div className="mt-8 rounded-2xl bg-slate-50 p-4">
              <Progress value={Math.min((credits / target) * 100, 100)} className="h-2" />
              <p className="mt-2 text-sm font-semibold text-slate-600">{credits} / {target} credits</p>
            </div>
            <Button className="mt-6 rounded-2xl" disabled={!unlocked}>{unlocked ? "Download Certificate" : "Certificate Locked"}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfilePanel({ profileForm, setProfileForm, saveProfile, volunteer, ngo }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
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
          <Button className="rounded-2xl" onClick={saveProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader><CardTitle>Volunteer Summary</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Summary label="Verification" value={volunteer?.verificationStatus || "pending"} />
          <Summary label="Status" value={volunteer?.status || "pending"} />
          <Summary label="Assigned NGO" value={ngo?.organizationName || "Not assigned"} />
          <Summary label="Skills" value={(volunteer?.skills || []).join(", ") || "Not added"} />
          <Summary label="Availability" value={volunteer?.availability || "Not added"} />
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="flex justify-between gap-4 rounded-2xl bg-slate-50 p-3">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-bold text-slate-950">{value}</span>
    </div>
  );
}
