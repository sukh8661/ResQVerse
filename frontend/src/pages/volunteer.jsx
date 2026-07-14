import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Activity,
  ArrowRight,
  Award,
  CalendarCheck,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  MessageSquare,
  Route,
  ShieldCheck,
  Star,
  Stethoscope,
  TrendingUp,
  Truck,
  Users
} from "lucide-react";
import RequestLocationMap from "@/components/request-location-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function readableSkill(skill) {
  return skill.replaceAll("_", " ");
}

export default function Volunteer() {
  const { data: volunteers = [] } = useQuery({
    queryKey: ["/api/volunteers"],
    select: (data) => data?.volunteers || []
  });
  const { data: requests = [] } = useQuery({
    queryKey: ["/api/emergency-requests"],
    select: (data) => data?.requests || []
  });
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/volunteers/leaderboard"],
    select: (data) => data?.volunteers || []
  });
  const { data: fieldStories = [] } = useQuery({
    queryKey: ["/api/volunteers/stories"],
    select: (data) => data?.stories || []
  });

  const activeRequests = requests.filter((request) => !["completed", "cancelled"].includes(request.status));
  const completedTasks = volunteers.reduce((sum, volunteer) => sum + Number(volunteer.totalResponses || 0), 0);
  const totalPoints = volunteers.reduce((sum, volunteer) => sum + Number(volunteer.creditPoints || 0), 0);

  const skillCategories = useMemo(() => {
    const counts = new Map();
    volunteers.forEach((volunteer) => {
      (volunteer.skills || ["general_help"]).forEach((skill) => counts.set(skill, (counts.get(skill) || 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [volunteers]);

  const missionTracks = [
    {
      title: "Medical response",
      text: "Support first aid, medicines, patient checks, and health camp coordination.",
      icon: Stethoscope,
      accent: "bg-red-50 text-red-700"
    },
    {
      title: "Transport support",
      text: "Move supplies, people, food packets, and urgent relief material across zones.",
      icon: Truck,
      accent: "bg-blue-50 text-blue-700"
    },
    {
      title: "Field coordination",
      text: "Help verify requests, update status, guide families, and coordinate local teams.",
      icon: MessageSquare,
      accent: "bg-amber-50 text-amber-700"
    },
    {
      title: "Rescue routing",
      text: "Assist evacuation teams with locations, landmarks, safe routes, and live updates.",
      icon: Route,
      accent: "bg-emerald-50 text-emerald-700"
    }
  ];

  return (
    <main className="min-h-screen bg-[#f6f8fb]" data-testid="page-volunteer">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1920&q=85"
          alt="Volunteers coordinating disaster relief supplies"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.95),rgba(15,23,42,0.76),rgba(15,23,42,0.42))]" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:px-8 lg:pb-16 lg:pt-32">
          <div className="flex min-h-[360px] flex-col justify-center sm:min-h-[420px]">
            <div className="hero-glass hero-glass-green mb-5 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
              <HeartHandshake className="h-4 w-4 text-emerald-300" />
              Field volunteer network
            </div>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl" data-testid="text-volunteer-title">
              Join the people who move relief faster.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Register your skills, location, and availability so verified NGOs can assign the right tasks during active emergencies.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="hero-glass-button hero-glass-green h-12 w-full rounded-2xl px-6 font-bold text-white sm:w-auto">
                  Create volunteer profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" className="hero-glass-button h-12 w-full rounded-2xl px-6 font-bold text-white hover:text-white sm:w-auto">
                  Volunteer login
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                { label: "Volunteers", value: volunteers.length, icon: Users },
                { label: "Live requests", value: activeRequests.length, icon: Activity },
                { label: "Tasks completed", value: completedTasks, icon: ShieldCheck }
              ].map((item) => (
                <div key={item.label} className="hero-glass-card hero-glass-green rounded-2xl p-4">
                  <item.icon className="mb-3 h-5 w-5 text-emerald-300" />
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-300">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-glass hero-glass-green rounded-3xl p-4">
            <div className="rounded-2xl border border-white/35 bg-white/90 p-5 text-slate-950 shadow-2xl backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Volunteer progress</p>
                  <p className="text-3xl font-black">{totalPoints}</p>
                  <p className="text-sm text-slate-500">Total contribution points</p>
                </div>
              </div>
              <Progress value={Math.min(totalPoints, 100)} className="mt-5 h-2" />
              <div className="mt-5 space-y-3">
                {[
                  ["Complete emergency task", "+25 pts"],
                  ["Share field update", "Tracked"],
                  ["Publish verified story", "Featured"]
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm">
                    <span className="font-semibold text-slate-700">{label}</span>
                    <Badge className="bg-slate-950">{value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,420px)] lg:px-8 lg:py-10">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="bg-slate-950 p-6 text-white sm:p-8">
                  <div className="hero-glass hero-glass-green mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
                    <CalendarCheck className="h-4 w-4" />
                    How volunteering works
                  </div>
                  <h2 className="text-3xl font-black">Get assigned where you can help most.</h2>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    Create your profile once, get verified, then receive relevant tasks from NGOs and coordinators based on your skills and location.
                  </p>
                  <Link href="/register">
                    <Button className="mt-6 h-12 rounded-2xl bg-white px-6 font-bold text-slate-950 hover:bg-slate-100">
                      Signup as volunteer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="grid gap-4 p-5 sm:p-6">
                  {[
                    ["Create profile", "Add contact details, address, skills, availability, and verification information."],
                    ["Admin review", "Your profile is checked so NGOs can safely assign relief work."],
                    ["Get matched", "Tasks appear based on live requests, location, and the help you can provide."],
                    ["Share progress", "Update status from the field and build verified contribution points."]
                  ].map(([title, text], index) => (
                    <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-black text-slate-950">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Choose your lane</p>
                <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Relief roles that need real people</h2>
              </div>
              <Badge variant="outline" className="w-fit rounded-full border-slate-300 px-4 py-2">4 active tracks</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {missionTracks.map((track) => (
                <Card key={track.title} className="rounded-3xl border-slate-200 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${track.accent}`}>
                      <track.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-950">{track.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{track.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
              {[
                ["Safe assignments", "Tasks come through verified NGOs.", ShieldCheck],
                ["Clear locations", "Map markers keep teams oriented.", MapPin],
                ["Real impact", "Completed tasks build your profile.", CheckCircle2]
              ].map(([title, text, Icon]) => (
                <div key={title} className="rounded-2xl bg-slate-50 p-4">
                  <Icon className="mb-3 h-5 w-5 text-emerald-600" />
                  <p className="font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Current need</p>
                  <h2 className="text-xl font-black text-slate-950">Skill coverage</h2>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="space-y-4">
                {skillCategories.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold capitalize text-slate-800">{readableSkill(skill.name)}</span>
                      <span className="text-xs font-semibold text-slate-500">{skill.count} active</span>
                    </div>
                    <Progress value={Math.min(skill.count * 20, 100)} className="h-2" />
                  </div>
                ))}
                {skillCategories.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Volunteer skill coverage will appear after new profiles are approved.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <RequestLocationMap requests={activeRequests} title="Live request areas" height={310} />

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-950">Top volunteers</h2>
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="space-y-3">
                {leaderboard.slice(0, 4).map((volunteer, index) => (
                  <div key={volunteer.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">
                        {index + 1}
                      </div>
                      <span className="max-w-[min(190px,48vw)] truncate text-sm font-bold text-slate-800">{volunteer.user?.fullName || "Volunteer"}</span>
                    </div>
                    <Badge className="bg-emerald-600">{volunteer.creditPoints || 0} pts</Badge>
                  </div>
                ))}
                {leaderboard.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Leaderboard will update as volunteers complete tasks.</p>}
              </div>
              {leaderboard.length > 4 && (
                <Button asChild variant="outline" className="mt-4 w-full rounded-2xl border-emerald-200 font-bold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                  <Link href="/records/volunteers">
                    View all volunteers
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Field stories</p>
            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Updates from the relief network</h2>
          </div>
          <Badge variant="outline" className="w-fit rounded-full border-slate-300 px-4 py-2">{fieldStories.length} stories</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {fieldStories.slice(0, 4).map((story) => (
            <Card key={story.id} className="rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-black text-emerald-700">
                  {story.title?.charAt(0) || "R"}
                </div>
                <h3 className="font-black text-slate-950">{story.title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : "Recent"}
                </p>
                <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">{story.story}</p>
              </CardContent>
            </Card>
          ))}
          {fieldStories.length === 0 && (
            <Card className="rounded-3xl border-dashed border-slate-300 md:col-span-3">
              <CardContent className="flex flex-col items-center justify-center p-10 text-center text-slate-500">
                <MapPin className="mb-3 h-8 w-8" />
                Field stories from completed relief work will appear here.
              </CardContent>
            </Card>
          )}
        </div>
        {fieldStories.length > 4 && (
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" className="rounded-2xl border-emerald-200 bg-white font-bold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
              <Link href="/records/stories">
                View all field stories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
