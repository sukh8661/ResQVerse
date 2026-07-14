import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Activity, AlertTriangle, ArrowRight, Clock, HeartPulse, MapPin, Phone, Radio, ShieldCheck, Users } from "lucide-react";
import EmergencyForm from "@/components/emergency-form";
import RequestLocationMap from "@/components/request-location-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function getTimeAgo(dateString) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${Math.floor(diffHours / 24)} day ago`;
}

function urgencyClass(urgency) {
  if (urgency === "critical") return "bg-red-600 text-white";
  if (urgency === "medium") return "bg-amber-500 text-white";
  return "bg-emerald-500 text-white";
}

export default function EmergencyRequest() {
  const { data: requests = [] } = useQuery({
    queryKey: ["/api/emergency-requests"],
    select: (data) => data?.requests || []
  });

  const activeRequests = requests.filter((request) => !["completed", "cancelled"].includes(request.status));
  const criticalCount = activeRequests.filter((request) => request.urgency === "critical").length;
  const mappedRequests = activeRequests.filter((request) => request.coordinates?.lat && request.coordinates?.lng).length;

  return (
    <main className="min-h-screen bg-[#f6f8fb]" data-testid="page-emergency-request">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1920&q=85"
          alt="Emergency response volunteers coordinating relief"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96),rgba(15,23,42,0.72),rgba(15,23,42,0.45))]" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:px-8 lg:pb-16 lg:pt-32">
          <div className="flex min-h-[360px] flex-col justify-center sm:min-h-[420px]">
            <div className="hero-glass hero-glass-red mb-5 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
              <Radio className="h-4 w-4 text-red-300" />
              24/7 relief coordination
            </div>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl" data-testid="text-emergency-title">
              Request emergency help without confusion.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Submit your location, voice note, or written details. Response teams can see the request, urgency, and map marker immediately.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                { label: "Active requests", value: activeRequests.length, icon: Activity },
                { label: "Critical cases", value: criticalCount, icon: AlertTriangle },
                { label: "Mapped locations", value: mappedRequests, icon: MapPin }
              ].map((item) => (
                <div key={item.label} className="hero-glass-card hero-glass-red rounded-2xl p-4">
                  <item.icon className="mb-3 h-5 w-5 text-red-300" />
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-300">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-glass hero-glass-red rounded-3xl p-4">
            <div className="rounded-2xl border border-white/35 bg-white/90 p-5 text-slate-950 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-500">Emergency hotline</p>
                  <p className="safe-break text-xl font-black sm:text-2xl">+91 9874563210</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  ["Location first", "GPS markers help teams route faster", MapPin],
                  ["Voice accepted", "Audio requests are supported", Radio],
                  ["Live triage", "Urgency is visible to responders", HeartPulse]
                ].map(([title, text, Icon]) => (
                  <div key={title} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <Icon className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-bold">{title}</p>
                      <p className="text-xs text-slate-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,420px)] lg:px-8 lg:py-10">
        <EmergencyForm />

        <aside className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Live intake</p>
                  <h2 className="text-xl font-black text-slate-950">Recent requests</h2>
                </div>
                <Badge className="rounded-full bg-slate-950 px-3 py-1">{activeRequests.length}</Badge>
              </div>

              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {activeRequests.slice(0, 4).map((request) => (
                  <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-950">{request.title || request.type || "Emergency request"}</p>
                        <p className="mt-1 flex items-center gap-1 truncate text-sm text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {request.location || "Location pending"}
                        </p>
                      </div>
                      <Badge className={`shrink-0 rounded-full ${urgencyClass(request.urgency)}`}>{request.urgency || "medium"}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{request.peopleCount || 1} affected</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{getTimeAgo(request.createdAt)}</span>
                    </div>
                  </div>
                ))}

                {activeRequests.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    New emergency requests will appear here for response teams.
                  </div>
                )}
              </div>
              {activeRequests.length > 4 && (
                <Button asChild variant="outline" className="mt-4 w-full rounded-2xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50">
                  <Link href="/records/requests">
                    View all requests
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <RequestLocationMap requests={activeRequests} title="Request locations" height={320} />
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Call emergency services first", text: "For immediate life risk, call local emergency numbers before submitting a platform request.", icon: Phone },
            { title: "Share the nearest landmark", text: "A recognizable road, building, or shelter name helps responders find you faster.", icon: MapPin },
            { title: "Keep your phone reachable", text: "Teams may contact you for confirmation, route updates, or extra details.", icon: ShieldCheck }
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <item.icon className="mb-4 h-6 w-6 text-red-600" />
              <h3 className="font-black text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
