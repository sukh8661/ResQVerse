import RealTimeDashboard from "@/components/real-time-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
  Eye
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
function Dashboard() {
  const { t } = useI18n();
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 3e4,
    // Refresh every 30 seconds
    select: (data) => data?.stats || {
      activeCases: 0,
      volunteers: 0,
      donationsRaised: "0",
      livesHelped: 0
    }
  });
  const { data: requests } = useQuery({
    queryKey: ["/api/emergency-requests"],
    refetchInterval: 15e3,
    // More frequent for real-time feel
    select: (data) => data?.requests || []
  });
  const { data: volunteers } = useQuery({
    queryKey: ["/api/volunteers"],
    refetchInterval: 3e4,
    select: (data) => data?.volunteers || []
  });
  const { data: recentDonations } = useQuery({
    queryKey: ["/api/donations/recent"],
    refetchInterval: 3e4,
    select: (data) => data?.donations || []
  });
  const criticalRequests = requests?.filter((req) => req.urgency === "critical").length || 0;
  const responseTime = "2.3";
  const successRate = "94";
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1e3 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "critical":
        return "bg-primary text-primary-foreground";
      case "medium":
        return "bg-secondary text-secondary-foreground";
      case "low":
        return "bg-emergency-yellow text-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  return <div className="min-h-screen bg-muted/30" data-testid="page-dashboard">
      {
    /* Header */
  }
      <section className="bg-background border-b border-border py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
                {t("command_center")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("command_center_subtitle")}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emergency-green/10 text-emergency-green">
                <div className="w-2 h-2 rounded-full bg-emergency-green animate-pulse" />
                <span className="text-sm font-medium">{t("system_operational")}</span>
              </div>
              <Button variant="outline" data-testid="button-export-data">
                <BarChart3 className="mr-2 h-4 w-4" />
                {t("export_data")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {
    /* Key Metrics */
  }
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg" data-testid="card-metric-active-cases">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.activeCases.toLocaleString() || "0"}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">{criticalRequests}</span> critical
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="card-metric-volunteers">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Volunteers</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.volunteers.toLocaleString() || "0"}</p>
                    <p className="text-sm text-emergency-green">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +12% this week
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emergency-green/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-emergency-green" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="card-metric-donations">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Donations Raised</p>
                    <p className="text-3xl font-bold text-foreground">
                      ${parseFloat(stats?.donationsRaised || "0").toLocaleString(void 0, { maximumFractionDigits: 0 })}M
                    </p>
                    <p className="text-sm text-secondary">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +$284K today
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="card-metric-lives-helped">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lives Helped</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.livesHelped.toLocaleString() || "0"}</p>
                    <p className="text-sm text-accent">
                      <CheckCircle className="inline h-3 w-3 mr-1" />
                      {successRate}% success rate
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {
    /* Performance Metrics */
  }
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">{responseTime} min</div>
                <div className="text-sm text-muted-foreground mb-4">Average response time</div>
                <Progress value={85} className="h-2" />
                <div className="text-xs text-muted-foreground mt-2">Target: &lt; 3 min</div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emergency-green" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">{successRate}%</div>
                <div className="text-sm text-muted-foreground mb-4">Successful resolutions</div>
                <Progress value={parseInt(successRate)} className="h-2" />
                <div className="text-xs text-muted-foreground mt-2">Target: &gt; 90%</div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Platform Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">78%</div>
                <div className="text-sm text-muted-foreground mb-4">Current capacity usage</div>
                <Progress value={78} className="h-2" />
                <div className="text-xs text-muted-foreground mt-2">Optimal range: 60-80%</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {
    /* Real-time Dashboard */
  }
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RealTimeDashboard />
        </div>
      </section>

      {
    /* Analytics & Insights */
  }
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {
    /* Geographic Distribution */
  }
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
    { region: "Southeast Region", cases: 45, percentage: 38 },
    { region: "West Coast", cases: 32, percentage: 27 },
    { region: "Northeast", cases: 24, percentage: 20 },
    { region: "Midwest", cases: 18, percentage: 15 }
  ].map((region, index) => <div key={index} className="space-y-2" data-testid={`region-${region.region.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{region.region}</span>
                        <span className="text-muted-foreground">{region.cases} cases ({region.percentage}%)</span>
                      </div>
                      <Progress value={region.percentage} className="h-2" />
                    </div>)}
                </div>
              </CardContent>
            </Card>

            {
    /* Emergency Types */
  }
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-secondary" />
                  Emergency Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
    { type: "Natural Disasters", count: 34, color: "bg-primary" },
    { type: "Medical Emergencies", count: 28, color: "bg-secondary" },
    { type: "Fire Emergencies", count: 19, color: "bg-destructive" },
    { type: "Missing Persons", count: 15, color: "bg-accent" },
    { type: "Structural Issues", count: 12, color: "bg-emergency-yellow" }
  ].map((type, index) => <div key={index} className="flex items-center justify-between" data-testid={`emergency-type-${type.type.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${type.color}`} />
                        <span className="text-sm text-foreground">{type.type}</span>
                      </div>
                      <Badge variant="outline">{type.count}</Badge>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {
    /* Recent Activity Timeline */
  }
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-accent" />
                Recent Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {
    /* Emergency Requests */
  }
                {requests?.slice(0, 3).map((request) => <div key={request.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg" data-testid={`timeline-request-${request.id}`}>
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">{request.title || request.type}</h4>
                          <p className="text-sm text-muted-foreground">{request.location}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getUrgencyColor(request.urgency)}>{request.urgency}</Badge>
                          <div className="text-xs text-muted-foreground mt-1">{getTimeAgo(request.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>)}

                {
    /* Donations */
  }
                {recentDonations?.slice(0, 2).map((donation) => <div key={donation.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg" data-testid={`timeline-donation-${donation.id}`}>
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">New Donation Received</h4>
                          <p className="text-sm text-muted-foreground">
                            ${parseFloat(donation.amount).toFixed(2)} for {donation.donationType?.replace("_", " ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-secondary border-secondary">Confirmed</Badge>
                          <div className="text-xs text-muted-foreground mt-1">{getTimeAgo(donation.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>)}

                {
    /* Volunteers */
  }
                {volunteers?.slice(0, 2).map((volunteer) => <div key={volunteer.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg" data-testid={`timeline-volunteer-${volunteer.id}`}>
                    <div className="w-10 h-10 bg-emergency-green rounded-full flex items-center justify-center text-white">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">New Volunteer Registered</h4>
                          <p className="text-sm text-muted-foreground">
                            {volunteer.skills?.[0] || "General Support"} • {volunteer.location || "Location not set"}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-emergency-green border-emergency-green">Active</Badge>
                          <div className="text-xs text-muted-foreground mt-1">{getTimeAgo(volunteer.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>;
}
export {
  Dashboard as default
};
