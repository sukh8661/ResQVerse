import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowRight,
  Users,
  Activity,
  MapPin,
  Heart,
  RefreshCw
} from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";
function RealTimeDashboard() {
  const [liveData, setLiveData] = useState(null);
  const { isConnected, lastMessage } = useWebSocket();
  const { data: requestsData, refetch: refetchRequests } = useQuery({
    queryKey: ["/api/emergency-requests"],
    refetchInterval: 3e4,
    // Fallback refresh every 30 seconds
    select: (data) => data?.requests || []
  });
  const { data: volunteersData, refetch: refetchVolunteers } = useQuery({
    queryKey: ["/api/volunteers"],
    refetchInterval: 3e4,
    select: (data) => data?.volunteers || []
  });
  const { data: donationsData } = useQuery({
    queryKey: ["/api/donations"],
    refetchInterval: 3e4,
    select: (data) => data?.donations || []
  });
  const { data: resourcesData } = useQuery({
    queryKey: ["/api/resources"],
    refetchInterval: 3e4,
    select: (data) => data?.resources || []
  });
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case "new_emergency_request":
        case "request_status_update":
          refetchRequests();
          break;
        case "new_volunteer":
        case "volunteer_availability_update":
          refetchVolunteers();
          break;
        case "new_donation":
          break;
      }
      setLiveData(lastMessage);
    }
  }, [lastMessage, refetchRequests, refetchVolunteers]);
  const requests = requestsData || [];
  const volunteers = volunteersData || [];
  const donations = donationsData || [];
  const resources = (resourcesData || []).map((resource) => ({
    name: resource.type,
    percentage: resource.quantity ? Math.round(resource.available / resource.quantity * 100) : 0,
    color: "bg-emergency-green"
  }));
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
  return <div className="grid lg:grid-cols-3 gap-8" data-testid="dashboard-real-time">
      {
    /* Connection Status */
  }
      <div className="lg:col-span-3 flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-foreground">Real-time Coordination</h2>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isConnected ? "bg-emergency-green/10 text-emergency-green" : "bg-destructive/10 text-destructive"}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emergency-green animate-pulse" : "bg-destructive"}`} />
            {isConnected ? "Live Updates" : "Offline"}
          </div>
        </div>
      </div>

      {
    /* Active Requests */
  }
      <Card data-testid="card-active-requests">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Active Requests</CardTitle>
          <Badge variant="secondary" className="bg-primary text-primary-foreground" data-testid="badge-active-count">
            {requests.length}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {requests.length === 0 ? <div className="text-center text-muted-foreground py-8" data-testid="text-no-requests">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active emergency requests</p>
              </div> : requests.slice(0, 4).map((request) => <div
    key={request.id}
    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
    data-testid={`request-item-${request.id}`}
  >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                      <span className="font-medium text-foreground">{request.title || request.type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(request.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {request.description?.slice(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className={getUrgencyColor(request.urgency)}>
                      {request.urgency}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {request.location}
                    </div>
                  </div>
                </div>)}
          </div>
          {requests.length > 4 && (
            <Button asChild variant="outline" className="mt-4 w-full rounded-2xl font-bold">
              <Link href="/records/requests">
                View all requests
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {
    /* Available Volunteers */
  }
      <Card data-testid="card-volunteers">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Available Volunteers</CardTitle>
          <Badge variant="secondary" className="bg-emergency-green text-white" data-testid="badge-volunteer-count">
            {volunteers.length}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {volunteers.length === 0 ? <div className="text-center text-muted-foreground py-8" data-testid="text-no-volunteers">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No volunteers available</p>
              </div> : volunteers.slice(0, 4).map((volunteer, index) => <div
    key={volunteer.id}
    className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
    data-testid={`volunteer-item-${volunteer.id}`}
  >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                    {volunteer.user?.fullName?.charAt(0) || "V"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {volunteer.user?.fullName || `Volunteer ${index + 1}`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {volunteer.skills?.[0] || "General Support"} • {volunteer.location || "Location not set"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-match-volunteer-${volunteer.id}`}>
                    Match
                  </Button>
                </div>)}
          </div>
          {volunteers.length > 4 && (
            <Button asChild variant="outline" className="mt-4 w-full rounded-2xl font-bold">
              <Link href="/records/volunteers">
                View all volunteers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {
    /* Resource Status */
  }
      <Card data-testid="card-resources">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Resource Status</CardTitle>
          <RefreshCw className="h-5 w-5 text-accent animate-spin" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources.slice(0, 4).map((resource) => <div key={resource.name} className="space-y-2" data-testid={`resource-${resource.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{resource.name}</span>
                  <span className={`font-medium ${resource.percentage >= 70 ? "text-emergency-green" : resource.percentage >= 40 ? "text-secondary" : "text-primary"}`}>
                    {resource.percentage}%
                  </span>
                </div>
                <Progress value={resource.percentage} className="h-2" />
              </div>)}
            {resources.length === 0 && <p className="text-sm text-muted-foreground">No resources have been added yet.</p>}
            {resources.length > 4 && (
              <Button asChild variant="outline" className="w-full rounded-2xl font-bold">
                <Link href="/records/resources">
                  View all resources
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Critical Needs</h4>
            <ul className="text-sm space-y-1">
              {resources.filter((r) => r.percentage < 30).map((resource) => <li key={resource.name} className="text-primary flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {resource.name} running critically low
                  </li>)}
            </ul>
          </div>
        </CardContent>
      </Card>

      {
    /* Recent Activity Feed */
  }
      <div className="lg:col-span-3">
        <Card data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {liveData && <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-accent">Live Update</span>
                    <Badge variant="outline" className="text-xs">Just now</Badge>
                  </div>
                  <p className="text-sm">
                    {liveData.type === "new_emergency_request" && "New emergency request received"}
                    {liveData.type === "new_volunteer" && "New volunteer joined the network"}
                    {liveData.type === "new_donation" && "New donation received"}
                    {liveData.type === "request_status_update" && "Emergency request status updated"}
                  </p>
                </div>}

              {donations.slice(0, 4).map((donation) => <div key={donation.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Donation received</p>
                      <p className="text-xs text-muted-foreground">
                        Rs {Number(donation.amount || 0).toLocaleString()} for {donation.donationType?.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(donation.timestamp || donation.createdAt)}
                  </span>
                </div>)}
            </div>
            {donations.length > 4 && (
              <Button asChild variant="outline" className="mt-4 w-full rounded-2xl font-bold">
                <Link href="/records/donations">
                  View all donations
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>;
}
export {
  RealTimeDashboard as default
};
