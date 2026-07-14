import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AlertTriangle, Heart, LogIn, Menu, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/photos/Rescue_Logo_clean.png";

function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isSolidPage =
    location === "/login" ||
    location === "/register" ||
    location.startsWith("/dashboard") ||
    location.startsWith("/ngo-dashboard") ||
    location.startsWith("/volunteer-dashboard") ||
    location.startsWith("/admin-dashboard") ||
    location.startsWith("/ngo-connect");
  const isAuthPage = location === "/login" || location === "/register";
  const needsDarkTransparentText = location === "/donate" || location === "/donation";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = useMemo(
    () => [
      {
        name: "Emergency Help",
        href: "/emergency",
        icon: AlertTriangle
      },
      {
        name: "Become a Volunteer",
        href: "/volunteer",
        icon: Users
      },
      {
        name: "Donation",
        href: "/donate",
        icon: Heart
      }
    ],
    []
  );

  const isTransparent = !isSolidPage && !isScrolled;
  const headerClass = isTransparent
    ? "border-transparent bg-transparent shadow-none"
    : "border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(15,23,42,0.10)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70";
  const textClass = isTransparent
    ? needsDarkTransparentText
      ? "text-slate-700 hover:text-slate-950"
      : "text-white/90 hover:text-white"
    : "text-slate-700 hover:text-slate-950";
  const subtitleClass = isTransparent && !needsDarkTransparentText ? "text-white/70" : "text-slate-500";

  return (
    <header className={`fixed left-0 top-0 z-50 w-full border-b transition-all duration-300 ${headerClass}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-[4.25rem]">
          <div className="flex min-w-0 shrink-0 items-center">
            <Link href="/" className="group flex items-center gap-2">
              <div className="-my-2 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg lg:h-[3.75rem] lg:w-[3.75rem]">
                <img
                  src={logo}
                  alt="ResQVerse Logo"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="hidden sm:block">
                <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-xl font-black leading-tight text-transparent">
                  ResQVerse
                </div>
                <div className={`-mt-0.5 text-xs font-semibold transition-colors duration-300 ${subtitleClass}`}>
                  Unified Disaster Relief Platform
                </div>
              </div>
            </Link>
          </div>

          <nav className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl lg:flex ${
            isTransparent && needsDarkTransparentText
              ? "border-slate-200/70 bg-white/60"
              : "border-white/40 bg-white/20"
          }`}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              const activeClass = isTransparent
                ? needsDarkTransparentText
                  ? "bg-white/80 text-slate-950 shadow-sm hover:bg-white/80 hover:text-slate-950 focus:bg-white/80 focus:text-slate-950 active:bg-white/80 active:text-slate-950 focus-visible:ring-0 focus-visible:ring-offset-0"
                  : "bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] hover:bg-white/20 hover:text-white focus:bg-white/20 focus:text-white active:bg-white/20 active:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                : "bg-slate-100 text-slate-950 shadow-sm hover:bg-slate-100 hover:text-slate-950 focus:bg-slate-100 focus:text-slate-950 active:bg-slate-100 active:text-slate-950 focus-visible:ring-0 focus-visible:ring-offset-0";
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`group relative h-10 rounded-xl px-4 font-semibold transition-all duration-300 ${
                      isActive ? activeClass : `${textClass} hover:bg-white/55`
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    {item.name}
                    {isActive && <span className={`absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full ${isTransparent && !needsDarkTransparentText ? "bg-white/80" : "bg-orange-500"}`} />}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {!isAuthPage && <Link href="/login" className="hidden sm:block">
              <Button
                className={`h-10 rounded-2xl px-5 font-bold transition-all duration-300 ${
                  location === "/login" || location === "/register"
                    ? "bg-slate-950 text-white shadow-[0_14px_34px_rgba(15,23,42,0.18)] hover:bg-slate-800"
                    : isTransparent && !needsDarkTransparentText
                      ? "border border-white/30 bg-white/20 text-white shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl hover:bg-white/25"
                      : "bg-slate-950 text-white shadow-[0_14px_34px_rgba(15,23,42,0.16)] hover:bg-slate-800"
                }`}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-2xl transition-all duration-300 lg:hidden ${
                    isTransparent && !needsDarkTransparentText
                      ? "border-white/30 bg-white/20 text-white backdrop-blur-xl hover:bg-white/25 hover:text-white"
                      : "border-slate-200 bg-white/80 text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[min(20rem,calc(100vw-1rem))] border-l border-slate-200 bg-white p-0">
                <div className="flex h-full flex-col">
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                        <img src={logo} alt="ResQVerse Logo" className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-lg font-black text-transparent">
                          ResQVerse
                        </div>
                        <div className="text-xs font-semibold text-slate-500">Emergency Response</div>
                      </div>
                    </div>
                  </div>

                  <nav className="flex-1 space-y-2 p-4">
                    {[...navigation, { name: "Login", href: "/login", icon: LogIn }].map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      return (
                        <Link key={item.name} href={item.href}>
                          <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className={`h-12 w-full justify-start rounded-2xl px-4 font-bold transition-all duration-300 ${
                              isActive ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                            }`}
                          >
                            <Icon className="mr-3 h-5 w-5" />
                            {item.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export {
  Header as default
};
