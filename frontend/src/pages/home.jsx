import { useState } from "react";
import NewsTicker from "../components/news-ticker";
import SplitText from "../components/SplitText";
import {
  Card
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Heart,
  Users,
  Zap,
  Shield,
  Phone,
  MessageCircle,
  Mail,
  Satellite,
  CheckCircle,
  Cross,
  ArrowRight,
  Mic,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  MapPin,
  FileText,
  Package
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "../lib/i18n";
import logo from "@/photos/Rescue_Logo_clean.png";
import homeHeroImage from "@/photos/rescuee.jpg";
function Home() {
  const { t } = useI18n();
  const { data: recentDonations } = useQuery({
    queryKey: ["/api/donations"],
    select: (data) => data?.donations || []
  });
  const { data: currentCampaign } = useQuery({
    queryKey: ["/api/campaigns"],
    select: (data) => data?.campaigns?.[0] ?? null
  });
  const { data: adminData } = useQuery({
    queryKey: ["/api/admin/overview"],
    select: (data) => data || { overview: {}, allocations: [] }
  });
  const adminOverview = adminData?.overview || {};
  const { data: operations } = useQuery({ queryKey: ["/api/admin/ngo-operations"] });
  const donationStats = {
    totalDonations: adminOverview?.totalDonationAmount || 0,
    totalHelpRequests: adminOverview?.requests || 0,
    activeCampaigns: currentCampaign ? 1 : 0,
    peopleHelped: operations?.requests?.filter((request) => request.status === "completed").reduce((sum, request) => sum + Number(request.peopleCount || 1), 0) || 0
  };
  const donationTypeTotals = (recentDonations || []).reduce((acc, donation) => {
    const key = donation.donationType || "Disaster Relief";
    acc[key] = (acc[key] || 0) + Number(donation.amount || 0);
    return acc;
  }, {});
  const totalDonationAmount = Object.values(donationTypeTotals).reduce((sum, amount) => sum + amount, 0);
  const donationBreakdown = Object.entries(donationTypeTotals).map(([category, amount], index) => ({
    category: category.replaceAll("_", " "),
    amount,
    percentage: totalDonationAmount ? Math.round(amount / totalDonationAmount * 100) : 0,
    icon: [Package, Cross, Shield, Heart][index % 4],
    color: ["red", "blue", "orange", "green"][index % 4],
    description: "Donation category stored"
  }));
  const recentActivity = [
    ...(operations?.requests || []).map((request) => ({
      action: `${request.type} request ${request.status}`,
      location: request.location,
      amount: `${request.peopleCount || 1} people`,
      time: new Date(request.createdAt).toLocaleString(),
      createdAt: request.createdAt
    })),
    ...(adminData?.allocations || []).map((allocation) => ({
      action: `Funds allocated for ${allocation.purpose}`,
      location: allocation.ngoId,
      amount: `Rs ${Number(allocation.amount || 0).toLocaleString()}`,
      time: new Date(allocation.createdAt).toLocaleString(),
      createdAt: allocation.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const campaignProgress = currentCampaign ? parseFloat(currentCampaign.raisedAmount) / parseFloat(currentCampaign.targetAmount) * 100 : 0;
  const [showContent] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  useGSAP(() => {
    const splashLogo = document.querySelector(".splash-logo");
    const splashWordmark = document.querySelector(".splash-wordmark");
    const splashOverlay = document.querySelector(".splash-overlay");
    const splashCurtain = document.querySelector(".splash-curtain");
    const pageHeader = document.querySelector("header");
    const heroTitleLines = gsap.utils.toArray(".home-hero-title > span");
    const heroCopy = document.querySelector(".home-hero-copy");
    if (!splashLogo || !splashWordmark || !splashOverlay || !splashCurtain) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => setShowSplash(false)
    });

    gsap.set(splashLogo, { y: 150, scale: 0.74, opacity: 0, filter: "blur(0px)", transformOrigin: "50% 50%" });
    gsap.set(splashWordmark, { opacity: 1, filter: "blur(0px)" });
    gsap.set(splashCurtain, { yPercent: 0 });
    if (pageHeader) {
      gsap.set(pageHeader, { y: -22, opacity: 0, filter: "blur(10px)" });
    }
    gsap.set(heroTitleLines, { y: 64, opacity: 0, filter: "blur(14px)" });
    gsap.set(heroCopy, { y: 34, opacity: 0, filter: "blur(10px)" });

    tl.to(splashLogo, { y: 0, scale: 1.85, opacity: 1, duration: 0.9, ease: "back.out(1.3)" })
      .to(splashLogo, { scale: 2, duration: 0.34, ease: "power2.out" })
      .to(splashLogo, { scale: 1.9, duration: 0.32, ease: "power2.inOut" })
      .to(splashWordmark, { y: -18, opacity: 0, filter: "blur(8px)", duration: 0.46, ease: "power2.in" }, "+=1.25")
      .add("sceneReveal")
      .to(splashLogo, {
        y: 0,
        scale: 1.36,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.58,
        ease: "power3.inOut"
      }, "sceneReveal")
      .to(splashCurtain, {
        yPercent: -100,
        duration: 1.12,
        ease: "power4.inOut"
      }, "sceneReveal+=0.12")
      .to(pageHeader, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.56,
        ease: "power3.out"
      }, "sceneReveal+=0.78")
      .to(heroTitleLines, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.78,
        stagger: 0.09,
        ease: "power4.out"
      }, "sceneReveal+=0.88")
      .to(heroCopy, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.64,
        ease: "power3.out"
      }, "sceneReveal+=1.08");
  });
  return <div>
      {showSplash && <div className="splash-overlay pointer-events-none fixed left-0 top-0 z-[100] flex h-[100svh] w-full items-center justify-center overflow-hidden">
        <div className="splash-curtain absolute inset-0 bg-white" />
        <div className="relative z-10 flex w-full flex-col items-center justify-center text-center">
          <img
            className="splash-logo"
            src={logo}
            alt="Rescue Logo"
            style={{
              width: "clamp(126px, 16vw, 210px)",
              height: "clamp(126px, 16vw, 210px)",
              objectFit: "contain"
            }}
          />
          <div className="splash-wordmark mt-28 flex w-full justify-center px-4 sm:mt-36 lg:mt-44">
            <SplitText
              tag="h1"
              text="RESQVERSE"
              className="mx-auto text-center font-black uppercase tracking-[0.16em] text-[#ff6a1a] drop-shadow-[0_22px_50px_rgba(249,115,22,0.36)] text-[clamp(3.6rem,11vw,9.5rem)]"
              delay={58}
              duration={0.72}
              ease="power4.out"
              splitType="chars"
              from={{ opacity: 0, y: 72, rotateX: -70, filter: "blur(12px)" }}
              to={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
              threshold={0}
              rootMargin="0px"
              textAlign="center"
              animateOnMount
              style={{ fontFamily: '"Manrope", "Inter", "Satoshi", system-ui, sans-serif', lineHeight: 0.9 }}
            />
          </div>
        </div>
      </div>}

      {showContent && <div data-testid="page-home" className="pt-0">
          {
    /* UPDATED HERO SECTION WITH DONATION PAGE STYLING */
  }
          <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
            {
    /* Background Image */
  }
            <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${homeHeroImage})` }}
  />

            {
    /* Dark Overlay */
  }
            <div className="absolute inset-0 bg-black/50" />

            {
    /* Hero Content - Using Donation Page Styling */
  }
            <div className="relative z-10 mx-auto max-w-7xl text-center text-white">
              {
    /* Main Heading - Donation Page Style */
  }
              <h1 className="home-hero-title mb-6 text-4xl font-black leading-[0.95] text-white drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
                <span className="block">Unified Platform for</span>
                <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300 bg-clip-text text-transparent">
                  Disaster Relief
                </span>
              </h1>

              {
    /* Subtitle - Donation Page Typography */
  }
              <div className="home-hero-copy mx-auto max-w-5xl">
                <p className="mb-4 text-base leading-relaxed text-white drop-shadow-lg sm:text-xl md:text-2xl">
                  <span className="text-base text-gray-100 sm:text-lg lg:text-xl">
                    Connecting survivors, volunteers, and NGOs when every second
                    counts.
                  </span>
                </p>
              </div>
            </div>
          </section>
          {
    /* END OF HERO SECTION UPDATES */
  }

          <NewsTicker />

          {
    /* Emergency Request System - UNCHANGED */
  }
          <section
    className="py-20 h-auto bg-muted/30"
    data-testid="section-emergency-system"
  >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                <div className="order-2 lg:order-1">
                  <img
    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    alt="Disaster relief volunteers helping community members"
    className="rounded-xl shadow-2xl w-full"
    data-testid="img-emergency-volunteers"
  />
                </div>

                <section className="bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
                      Request Emergency Assistance
                    </h2>
                    <p className="text-xl mb-12 text-gray-600 max-w-2xl mx-auto leading-relaxed">
                      Choose the method that works best for your situation.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-red-500">
                        <Mic className="h-12 w-12 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold mb-3">
                          Voice Emergency
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Record your emergency message when typing isn't
                          possible
                        </p>
                        <Link href="/emergency">
                        <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all">
                          Start Voice Recording
                        </button>
                        </Link>
                      </div>

                      <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-orange-500">
                        <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold mb-3">
                          Emergency Form
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Detailed form for comprehensive emergency information
                        </p>
                        <Link href="/emergency">
                        <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all">
                          Fill Emergency Form
                        </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>

          {
    /* Volunteer Registration - UPDATED LAYOUT */
  }
          <section
    className="py-20 h-full bg-gradient-to-br from-accent/10 to-secondary/10"
    data-testid="section-volunteer"
  >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  {t("volunteer_network_title")}
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  {t("volunteer_network_subtitle")}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                  {
    /* Top Row - Two Cards */
  }
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <Card className="p-6 transition-transform duration-200 hover:scale-105 hover:shadow-xl">
                      <Heart className="text-3xl text-primary mb-4 h-8 w-8" />
                      <h3 className="font-semibold text-foreground mb-2">
                        Medical Response
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        First aid, EMT support, medical supply distribution
                      </p>
                    </Card>

                    <Card className="p-6 transition-transform duration-200 hover:scale-105 hover:shadow-xl">
                      <Users className="text-3xl text-secondary mb-4 h-8 w-8" />
                      <h3 className="font-semibold text-foreground mb-2">
                        Search & Rescue
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Missing person searches, evacuation assistance
                      </p>
                    </Card>
                  </div>

                  {
    /* Bottom Row - Two Cards */
  }
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card className="p-6 transition-transform duration-200 hover:scale-105 hover:shadow-xl">
                      <Zap className="text-3xl text-accent mb-4 h-8 w-8" />
                      <h3 className="font-semibold text-foreground mb-2">
                        Emergency Repair
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Infrastructure repair, debris clearing
                      </p>
                    </Card>

                    <Card className="p-6 transition-transform duration-200 hover:scale-105 hover:shadow-xl">
                      <Shield className="text-3xl text-emergency-green mb-4 h-8 w-8" />
                      <h3 className="font-semibold text-foreground mb-2">
                        Logistics Support
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Supply transport, coordination assistance
                      </p>
                    </Card>
                  </div>

                  {
    /* Register Button - Full Width to Match Bottom Two Cards Combined */
  }
                  <div className="w-full">
                    <Link href="/volunteer">
                      <Button
    className="bg-red-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-200 w-full"
    data-testid="button-volunteer-register"
  >
                        <Users className="mr-2 h-5 w-5" />
                        Register as Volunteer
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-6">
                  <img
    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    alt="Volunteers working together in disaster response"
    className="rounded-xl shadow-lg w-full lg:h-[432px] object-cover"
    data-testid="img-volunteers-working"
  />
                </div>
              </div>
            </div>
          </section>

          {
    /* ENHANCED DONATION TRANSPARENCY SECTION */
  }
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-800">
                  Track Every Rupee
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  See exactly how your donations create real impact. Every
                  contribution is tracked, verified, and transparently allocated
                  to help people in need.
                </p>
              </div>

              {
    /* Donation Stats Overview */
  }
              <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <DollarSign className="h-8 w-8 text-green-600 mb-3" />
                  <div className="text-2xl lg:text-3xl font-bold text-green-800">
                    Rs {Number(donationStats.totalDonations).toLocaleString()}
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    Total Donations
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <Users className="h-8 w-8 text-blue-600 mb-3" />
                  <div className="text-2xl lg:text-3xl font-bold text-blue-800">
                    {Number(donationStats.peopleHelped).toLocaleString()}+
                  </div>
                  <div className="text-blue-600 text-sm font-medium">
                    People Helped
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                  <AlertTriangle className="h-8 w-8 text-orange-600 mb-3" />
                  <div className="text-2xl lg:text-3xl font-bold text-orange-800">
                    {donationStats.totalHelpRequests}
                  </div>
                  <div className="text-orange-600 text-sm font-medium">
                    Help Requests
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
                  <TrendingUp className="h-8 w-8 text-red-600 mb-3" />
                  <div className="text-2xl lg:text-3xl font-bold text-red-800">
                    {donationStats.activeCampaigns}
                  </div>
                  <div className="text-red-600 text-sm font-medium">
                    Active Campaigns
                  </div>
                </div>
              </div>

              {
    /* Donation Breakdown */
  }
              <div className="grid lg:grid-cols-2 gap-12 mb-12">
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">
                    How Your Donations Are Used
                  </h3>
                  <div className="space-y-4">
                    {donationBreakdown.map((item, idx) => {
    const Icon = item.icon;
    const colorClasses = {
      red: "text-red-600 bg-red-50 border-red-200",
      blue: "text-blue-600 bg-blue-50 border-blue-200",
      orange: "text-orange-600 bg-orange-50 border-orange-200",
      green: "text-green-600 bg-green-50 border-green-200"
    };
    const progressColors = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      orange: "bg-orange-500",
      green: "bg-green-500"
    };
    return <div
      key={idx}
      className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all"
    >
                          <div className="flex items-start space-x-4">
                            <div
      className={`w-12 h-12 rounded-xl ${colorClasses[item.color]} flex items-center justify-center flex-shrink-0`}
    >
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-lg text-gray-800">
                                  {item.category}
                                </h4>
                                <span className="text-xl font-bold text-gray-800">
                                  Rs {Number(item.amount).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-3">
                                {item.description}
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
      className={`${progressColors[item.color]} h-3 rounded-full transition-all duration-1000`}
      style={{ width: `${item.percentage}%` }}
    />
                              </div>
                              <div className="text-right mt-1">
                                <span className="text-sm font-medium text-gray-600">
                                  {item.percentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>;
  })}
                  </div>
                </div>

                {
    /* Real-time Activity */
  }
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">
                    Real-Time Impact
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3" />
                      <span className="text-sm font-medium text-gray-600">
                        Live Activity Feed
                      </span>
                    </div>
                    <div className="space-y-4">
                    {recentActivity.slice(0, 4).map((activity, idx) => <div
    key={idx}
    className="bg-white p-4 rounded-xl border"
  >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-gray-800">
                              {activity.action}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.time}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {activity.location}
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {activity.amount}
                          </div>
                        </div>)}
                      {recentActivity.length === 0 && <div className="bg-white p-4 rounded-xl border text-gray-500">
                          No recent response activity yet.
                        </div>}
                    </div>
                    {recentActivity.length > 4 && (
                      <Button asChild variant="outline" className="mt-5 w-full rounded-2xl border-green-200 bg-white/80 font-bold text-green-700 hover:bg-green-50 hover:text-green-800">
                        <Link href="/records/activity">
                          View all activity
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <div className="mt-6 p-4 bg-green-100 rounded-xl border border-green-200">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          All transactions are verified and publicly auditable
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {
    /* Call to Action - UPDATED WITH PROPER LINK */
  }
              <div className="text-center pt-8">
                <div className="bg-gradient-to-r from-green-200 to-green-300 rounded-2xl p-8 text-white">
                  <h3 className="text-3xl font-bold mb-4">
                    Join Our Transparent Mission
                  </h3>
                  <p className="text-lg mb-6 opacity-90 text-black">
                    Every rupee you donate creates measurable impact. See
                    real-time updates on how your contribution helps save lives.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {
    /* DONATE NOW BUTTON WITH LINK TO DONATION PAGE */
  }
                    <Link href="/donate">
                      <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all">
                        <Heart className="inline mr-2 h-5 w-5" />
                        Donate Now
                      </button>
                    </Link>
                    <button className="border-2 border-green-800 text-green-800 px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-green-600 transition-all">
                      <FileText className="inline mr-2 h-5 w-5" />
                      View Full Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {
    /* CONTACT SECTION */
  }
          <section className="pt-10 pb-20 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 text-center">
              <div className="mb-12">
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-800">
                  24/7 Emergency Support
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Multiple ways to reach us when you need help most
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
    {
      icon: Phone,
      title: "Emergency Hotline",
      value: "+91 98765-43210",
      desc: "Instant voice support",
      color: "red"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      value: "Available Now",
      desc: "Real-time messaging",
      color: "blue"
    },
    {
      icon: Mail,
      title: "Email Support",
      value: "help@ResQVerse.org",
      desc: "Detailed assistance",
      color: "green"
    },
    {
      icon: Satellite,
      title: "Satellite Communication",
      value: "Emergency Only",
      desc: "When networks fail",
      color: "orange"
    }
  ].map((contact, i) => {
    const Icon = contact.icon;
    const colorClasses = {
      red: "text-red-500 bg-red-50 border-red-100",
      blue: "text-blue-500 bg-blue-50 border-blue-100",
      green: "text-green-500 bg-green-50 border-green-100",
      orange: "text-orange-500 bg-orange-50 border-orange-100"
    };
    return <div
      key={i}
      className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border hover:scale-105"
    >
                      <div
      className={`w-16 h-16 rounded-2xl ${colorClasses[contact.color]} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
    >
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-gray-800">
                        {contact.title}
                      </h3>
                      <p className="font-semibold text-lg text-gray-700 mb-1">
                        {contact.value}
                      </p>
                      <p className="text-gray-600 text-sm">{contact.desc}</p>
                    </div>;
  })}
              </div>
            </div>
          </section>
        </div>}
    </div>;
}
export {
  Home as default
};
