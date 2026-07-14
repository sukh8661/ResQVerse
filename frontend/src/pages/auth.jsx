import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, BadgeCheck, Building2, Car, Eye, EyeOff, FileUp, HeartHandshake, Lock, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { dashboardPathForRole, setAuthSession } from "@/lib/auth";
import { apiUrl } from "@/lib/queryClient";
import authImage from "@/photos/rescuee.jpg";

const skillOptions = [
  "Medical Aid",
  "Rescue & Evacuation",
  "Driving / Transport",
  "Food & Relief Distribution",
  "Logistics / Coordination",
  "IT / Communication",
  "Construction / Repair",
  "Counseling Support"
];

const initialSignup = {
  role: "volunteer",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  organizationName: "",
  registrationId: "",
  contactPerson: "",
  address: "",
  city: "",
  state: "",
  description: "",
  age: "",
  gender: "",
  availability: "emergency_only",
  preferredRole: "",
  hasVehicle: "no",
  vehicleType: "",
  skills: []
};

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const isLogin = location === "/login";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [files, setFiles] = useState([]);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [signupForm, setSignupForm] = useState(initialSignup);

  const sideCopy = useMemo(() => {
    if (isLogin) {
      return {
        eyebrow: "Welcome back",
        title: "Coordinate faster when every minute matters.",
        body: "Access verified NGO operations, volunteer assignments, donation records, and emergency response updates from one secure command center."
      };
    }
    return {
      eyebrow: "Join ResQVerse",
      title: "Become part of a trusted disaster relief network.",
      body: "Create a verified NGO or volunteer profile with secure document upload, then help relief teams act with clarity and speed."
    };
  }, [isLogin]);

  const setMode = (mode) => {
    navigate(mode === "login" ? "/login" : "/register");
  };

  const toggleSkill = (skill) => {
    setSignupForm((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill]
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      setAuthSession(data);
      toast({ title: "Login successful", description: `Opening ${data.user.role} dashboard` });
      navigate(dashboardPathForRole(data.user.role));
    } catch (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(signupForm).forEach(([key, value]) => {
        payload.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
      });
      files.forEach((file) => payload.append("documents", file));

      const response = await fetch(apiUrl("/api/auth/signup-profile"), {
        method: "POST",
        body: payload
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      setAuthSession(data);
      toast({
        title: "Account created",
        description: data.user.role === "ngo"
          ? "Your NGO profile is saved and pending verification."
          : "Your volunteer profile is saved and pending admin approval."
      });
      navigate(dashboardPathForRole(data.user.role));
    } catch (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100svh] items-center overflow-hidden bg-[#f4f3ef] px-3 pb-4 pt-20 text-slate-950 sm:px-4 lg:pb-6 lg:pt-20">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center">
        <div className="relative max-h-full w-full overflow-hidden rounded-3xl border border-white/80 bg-white p-3 shadow-[0_30px_100px_rgba(15,23,42,0.12)] sm:rounded-[2rem] sm:p-4">

          <div className="grid min-h-0 lg:h-[min(760px,calc(100svh-6rem))] lg:grid-cols-2">
            <section
              className={`flex min-h-0 items-center px-4 py-6 transition-all duration-700 ease-out sm:px-8 lg:px-14 xl:px-16 ${
                isLogin ? "lg:translate-x-full" : "lg:translate-x-0"
              }`}
            >
              <div className="mx-auto flex w-full max-w-xl flex-col lg:max-h-full">
                <div className="mb-5 shrink-0 sm:mb-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold uppercase text-red-500">
                      {isLogin ? "Secure login" : "Create verified account"}
                    </p>
                    {!isLogin && (
                      <button type="button" onClick={() => setMode("login")} className="w-fit text-sm font-semibold text-slate-950 underline underline-offset-4">
                        Already have an account? Login
                      </button>
                    )}
                  </div>
                  <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                    {isLogin ? "Login to ResQVerse" : "Create your account"}
                  </h1>
                  <p className="mt-3 text-sm text-slate-500">
                    {isLogin
                      ? "Use your registered email, username, or phone number."
                      : "Select your role and complete the details required for verification."}
                  </p>
                </div>

                {isLogin ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <Field icon={Mail} label="Email, username, or phone">
                      <Input
                        value={loginForm.identifier}
                        onChange={(event) => setLoginForm({ ...loginForm, identifier: event.target.value })}
                        placeholder="you@example.com"
                        required
                        className="h-12"
                      />
                    </Field>
                    <PasswordField
                      value={loginForm.password}
                      show={showPassword}
                      onToggle={() => setShowPassword((value) => !value)}
                      onChange={(value) => setLoginForm({ ...loginForm, password: value })}
                    />
                    <Button className="h-12 w-full bg-slate-950 text-white hover:bg-slate-800" disabled={loading}>
                      {loading ? "Checking account..." : "Login"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-center text-sm text-slate-500">
                      Do not have an account?{" "}
                      <button type="button" onClick={() => setMode("signup")} className="font-semibold text-slate-950 underline">
                        Sign up
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="auth-form-scroll max-h-[calc(100svh-15rem)] space-y-5 overflow-y-auto pb-24 pr-2 lg:max-h-[540px] lg:pb-6 lg:pr-3">
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 sm:gap-3">
                      {["volunteer", "ngo"].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSignupForm({ ...signupForm, role })}
                          className={`h-11 rounded-xl text-sm font-semibold capitalize transition-all ${
                            signupForm.role === role ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {role === "ngo" ? "NGO" : "Volunteer"}
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field icon={UserRound} label="Full name">
                        <Input required value={signupForm.fullName} onChange={(event) => setSignupForm({ ...signupForm, fullName: event.target.value })} />
                      </Field>
                      <Field icon={Phone} label="Phone">
                        <Input required value={signupForm.phone} onChange={(event) => setSignupForm({ ...signupForm, phone: event.target.value })} />
                      </Field>
                    </div>

                    <Field icon={Mail} label="Email">
                      <Input type="email" required value={signupForm.email} onChange={(event) => setSignupForm({ ...signupForm, email: event.target.value })} />
                    </Field>

                    <PasswordField
                      value={signupForm.password}
                      show={showPassword}
                      onToggle={() => setShowPassword((value) => !value)}
                      onChange={(value) => setSignupForm({ ...signupForm, password: value })}
                    />

                    {signupForm.role === "ngo" ? (
                      <NgoFields form={signupForm} setForm={setSignupForm} />
                    ) : (
                      <VolunteerFields form={signupForm} setForm={setSignupForm} toggleSkill={toggleSkill} />
                    )}

                    <Field icon={FileUp} label={signupForm.role === "ngo" ? "Registration documents" : "Government ID"}>
                      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center transition hover:border-red-300 hover:bg-red-50/40">
                        <FileUp className="mb-2 h-5 w-5 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">Upload PDF or photo</span>
                        <span className="text-xs text-slate-500">Up to 5 files, 10MB each</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={(event) => setFiles(Array.from(event.target.files || []))}
                          className="hidden"
                        />
                      </label>
                      {files.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {files.map((file) => (
                            <span key={file.name} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                              {file.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </Field>

                    <Button className="h-12 w-full bg-slate-950 text-white hover:bg-slate-800" disabled={loading}>
                      {loading ? "Creating account..." : "Sign up"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            </section>

            <section
              className={`relative hidden min-h-0 overflow-hidden rounded-3xl transition-all duration-700 ease-out sm:rounded-[1.5rem] lg:block ${
                isLogin ? "lg:-translate-x-full" : "lg:translate-x-0"
              }`}
            >
              <img src={authImage} alt="Disaster relief volunteer coordination" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
              <div className="absolute left-4 right-4 top-4 flex flex-wrap justify-between gap-2 sm:left-6 sm:right-6 sm:top-6 sm:gap-3">
                <Pill icon={ShieldCheck} text="Verified profiles" tone="green" />
                <Pill icon={BadgeCheck} text="Secure documents" tone="blue" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-12">
                <p className="mb-3 text-sm font-semibold uppercase text-white/80">{sideCopy.eyebrow}</p>
                <h2 className="max-w-xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300 bg-clip-text text-2xl font-bold leading-tight tracking-normal text-transparent drop-shadow-[0_8px_24px_rgba(251,146,60,0.22)] sm:text-4xl lg:text-5xl">
                  {sideCopy.title}
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-6 text-white/80">{sideCopy.body}</p>
                <div className="mt-6 grid max-w-lg grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2">
                  <div className="hero-glass-card hero-glass-green rounded-2xl p-4">
                    <HeartHandshake className="mb-3 h-5 w-5 text-white" />
                    <p className="text-sm font-semibold text-white">Relief network</p>
                  </div>
                  <div className="hero-glass-card hero-glass-blue rounded-2xl p-4">
                    <MapPin className="mb-3 h-5 w-5 text-white" />
                    <p className="text-sm font-semibold text-white">Field ready</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icon className="h-4 w-4 text-slate-400" />
        {label}
      </Label>
      {children}
    </div>
  );
}

function PasswordField({ value, onChange, show, onToggle }) {
  return (
    <Field icon={Lock} label="Password">
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Create a strong password"
          className="h-12 pr-12"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );
}

function NgoFields({ form, setForm }) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field icon={Building2} label="NGO name">
          <Input required value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} />
        </Field>
        <Field icon={ShieldCheck} label="Registration ID">
          <Input required value={form.registrationId} onChange={(event) => setForm({ ...form, registrationId: event.target.value })} />
        </Field>
      </div>
      <Field icon={UserRound} label="Contact person">
        <Input value={form.contactPerson} onChange={(event) => setForm({ ...form, contactPerson: event.target.value })} />
      </Field>
      <Field icon={MapPin} label="Address">
        <Textarea required rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
        <Input placeholder="State" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} />
      </div>
      <Textarea placeholder="NGO focus areas, warehouses, vehicles, or relief capabilities" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
    </div>
  );
}

function VolunteerFields({ form, setForm, toggleSkill }) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Input type="number" min="16" max="80" placeholder="Age" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}>
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value })}>
          <option value="emergency_only">Emergency only</option>
          <option value="part_time">Part time</option>
          <option value="full_time">Full time</option>
          <option value="specific_dates">Specific dates</option>
        </select>
      </div>
      <Field icon={MapPin} label="Address">
        <Textarea required rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
        <Input placeholder="State" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Skills</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {skillOptions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                form.skills.includes(skill) ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
      <Field icon={Car} label="Vehicle availability">
        <div className="grid gap-3 md:grid-cols-2">
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.hasVehicle} onChange={(event) => setForm({ ...form, hasVehicle: event.target.value })}>
            <option value="no">No vehicle</option>
            <option value="yes">Vehicle available</option>
          </select>
          <Input disabled={form.hasVehicle !== "yes"} placeholder="Vehicle type" value={form.vehicleType} onChange={(event) => setForm({ ...form, vehicleType: event.target.value })} />
        </div>
      </Field>
      <Textarea placeholder="Preferred role or additional field experience" rows={3} value={form.preferredRole} onChange={(event) => setForm({ ...form, preferredRole: event.target.value })} />
    </div>
  );
}

function Pill({ icon: Icon, text, tone = "green" }) {
  return (
    <div className={`hero-glass ${tone === "blue" ? "hero-glass-blue" : "hero-glass-green"} flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white`}>
      <Icon className="h-4 w-4" />
      {text}
    </div>
  );
}
