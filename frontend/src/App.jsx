import { Switch, Route, useLocation } from "wouter";
import { Component, useEffect } from "react";
import NotFound from "./pages/not-found";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Footer from "@/components/footer";
import FloatingEmergency from "@/components/floating-emergency";
import Home from "@/pages/home";
import EmergencyRequest from "@/pages/emergency-request";
import Volunteer from "@/pages/volunteer";
import Donate from "@/pages/donate";
import { I18nProvider } from "@/lib/i18n";
import Register from "@/pages/register";
import NgoDashboardPage from "@/pages/ngo-dashboard";
import Login from "@/pages/login";
import VolunteerDashboard from "@/pages/volunteer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { useScrollToTop } from "@/hooks/useScrollToTop";
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) };
  }
  componentDidCatch(error, info) {
    console.error("UI crashed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-4">{this.state.message}</p>
            <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
              Reload Page
            </button>
          </div>
        </div>;
    }
    return this.props.children;
  }
}
function NgoConnectEntry() {
  const [, navigate] = useLocation();
  useEffect(() => {
    const isAuthed = Boolean(localStorage.getItem("ngoAuth"));
    if (isAuthed) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  }, [navigate]);
  return null;
}
function Router() {
  const [location] = useLocation();
  useScrollToTop();
  const isDashboard =
    location.startsWith("/ngo-dashboard") ||
    location.startsWith("/dashboard") ||
    location.startsWith("/ngo-connect") ||
    location.startsWith("/volunteer-dashboard") ||
    location.startsWith("/admin-dashboard");
  return <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          {
    /* Public site */
  }
          <Route path="/" component={Home} />
          <Route path="/emergency" component={EmergencyRequest} />
          <Route path="/emergency-help" component={EmergencyRequest} />
          <Route path="/emergency-request" component={EmergencyRequest} />
          <Route path="/become-a-volunteer" component={Volunteer} />
          <Route path="/volunteer" component={Volunteer} />
          <Route path="/donate" component={Donate} />
          <Route path="/donation" component={Donate} />
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/volunteer-dashboard" component={VolunteerDashboard} />
          <Route path="/admin-dashboard" component={AdminDashboard} />

          {
    /* NGO Connect auth flow */
  }
          <Route path="/ngo-connect" component={NgoConnectEntry} />
          <Route path="/ngo-connect/login" component={Login} />
          <Route path="/ngo-connect/register" component={Register} />

          {
    /* Protected NGO dashboard – all tabs under /ngo-dashboard/... */
  }
          <Route path="/ngo-dashboard/:rest*" component={NgoDashboardPage} />
          <Route path="/ngo-dashboard" component={NgoDashboardPage} />

          {
    /* Legacy aliases if you used /dashboard earlier */
  }
          <Route path="/dashboard/:rest*" component={NgoDashboardPage} />
          <Route path="/dashboard" component={NgoDashboardPage} />

          {
    /* 404 */
  }
          <Route component={NotFound} />
        </Switch>
      </main>
      {!isDashboard && <Footer />}
      <FloatingEmergency />
    </div>;
}
function App() {
  return <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
            <Analytics />
          </TooltipProvider>
        </I18nProvider>
      </QueryClientProvider>
    </ErrorBoundary>;
}
var stdin_default = App;
export {
  stdin_default as default
};
