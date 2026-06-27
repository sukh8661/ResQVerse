import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, HeartHandshake, MapPin, ShieldCheck, Sparkles, User, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const skillOptions = [
  { id: "medical_aid", label: "Medical aid", description: "First aid, nursing, health support" },
  { id: "rescue_evacuation", label: "Rescue and evacuation", description: "Search, movement, crowd support" },
  { id: "driving_transport", label: "Driving and transport", description: "Vehicle support and delivery" },
  { id: "food_relief", label: "Food relief", description: "Meals, water, essentials distribution" },
  { id: "logistics_coordination", label: "Logistics", description: "Inventory, planning, field coordination" },
  { id: "it_communication", label: "Communication", description: "Calls, data entry, tech support" },
  { id: "construction_repair", label: "Repair work", description: "Shelter, tools, basic repair" },
  { id: "counseling_support", label: "Care support", description: "Listening, family support, guidance" },
  { id: "language_translation", label: "Translation", description: "Local language assistance" },
  { id: "general_help", label: "General help", description: "Flexible field assistance" }
];

const availabilityOptions = [
  { value: "full_time", label: "Full-time availability" },
  { value: "part_time", label: "Part-time availability" },
  { value: "specific_dates", label: "Specific dates" },
  { value: "emergency_only", label: "Emergency calls only" }
];

const initialForm = {
  name: "",
  age: undefined,
  gender: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  availability: "",
  availabilityDates: "",
  skills: [],
  preferredRole: "",
  selectedNgoId: "",
  consentGiven: false
};

export default function VolunteerRegistrationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialForm);
  const [credentials, setCredentials] = useState(null);

  const { data: ngosData, isLoading: isLoadingNGOs } = useQuery({
    queryKey: ["/api/ngos?verified=true"],
    select: (data) => data || { ngos: [] }
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/volunteers/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCredentials(data.credentials);
      setFormData(initialForm);
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers/leaderboard"] });
      toast({
        title: "Registration submitted",
        description: "Your volunteer profile has been sent for review."
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check the form and try again.",
        variant: "destructive"
      });
    }
  });

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const toggleSkill = (skillId) => {
    setFormData((current) => ({
      ...current,
      skills: current.skills.includes(skillId)
        ? current.skills.filter((id) => id !== skillId)
        : [...current.skills, skillId]
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.skills.length === 0) {
      toast({
        title: "Select at least one skill",
        description: "This helps teams assign the right task.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.consentGiven) {
      toast({
        title: "Consent required",
        description: "Please confirm that response coordinators may use your details.",
        variant: "destructive"
      });
      return;
    }
    registerMutation.mutate(formData);
  };

  const selectedNgo = ngosData?.ngos?.find((ngo) => ngo.id === formData.selectedNgoId);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 p-5 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <HeartHandshake className="h-4 w-4" />
              Volunteer intake
            </div>
            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Register for field response</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Your profile is reviewed before assignments are sent to your dashboard.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-bold text-slate-950">{formData.skills.length}</span> skills selected
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {credentials && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-black">Volunteer credentials generated</p>
                <p className="mt-2 text-sm">Login ID: <strong>{credentials.username}</strong></p>
                <p className="text-sm">Password: <strong>{credentials.password}</strong></p>
                <p className="mt-2 text-sm text-emerald-800">Use these after approval to access volunteer assignments.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" data-testid="form-volunteer-registration">
          <section className="space-y-4">
            <SectionTitle icon={User} title="Personal details" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" htmlFor="volunteer-name" required>
                <Input id="volunteer-name" value={formData.name} onChange={(event) => updateField("name", event.target.value)} className="h-12 rounded-2xl" required />
              </Field>
              <Field label="Phone number" htmlFor="volunteer-phone" required>
                <Input id="volunteer-phone" type="tel" value={formData.phone} onChange={(event) => updateField("phone", event.target.value)} className="h-12 rounded-2xl" required />
              </Field>
              <Field label="Email" htmlFor="volunteer-email">
                <Input id="volunteer-email" type="email" value={formData.email} onChange={(event) => updateField("email", event.target.value)} className="h-12 rounded-2xl" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Age" htmlFor="volunteer-age">
                  <Input id="volunteer-age" type="number" min="16" max="80" value={formData.age || ""} onChange={(event) => updateField("age", Number(event.target.value) || undefined)} className="h-12 rounded-2xl" />
                </Field>
                <Field label="Gender" htmlFor="volunteer-gender">
                  <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                    <SelectTrigger id="volunteer-gender" className="h-12 rounded-2xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle icon={MapPin} title="Location and availability" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Address" htmlFor="volunteer-address">
                <Input id="volunteer-address" value={formData.address} onChange={(event) => updateField("address", event.target.value)} className="h-12 rounded-2xl" />
              </Field>
              <Field label="City" htmlFor="volunteer-city">
                <Input id="volunteer-city" value={formData.city} onChange={(event) => updateField("city", event.target.value)} className="h-12 rounded-2xl" />
              </Field>
              <Field label="State" htmlFor="volunteer-state">
                <Input id="volunteer-state" value={formData.state} onChange={(event) => updateField("state", event.target.value)} className="h-12 rounded-2xl" />
              </Field>
              <Field label="Availability" htmlFor="volunteer-availability" required>
                <Select value={formData.availability} onValueChange={(value) => updateField("availability", value)} required>
                  <SelectTrigger id="volunteer-availability" className="h-12 rounded-2xl">
                    <SelectValue placeholder="Choose availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {formData.availability === "specific_dates" && (
              <Field label="Available dates" htmlFor="volunteer-dates">
                <Input id="volunteer-dates" value={formData.availabilityDates} onChange={(event) => updateField("availabilityDates", event.target.value)} className="h-12 rounded-2xl" placeholder="Example: weekends, 12-18 July" />
              </Field>
            )}
          </section>

          <section className="space-y-4">
            <SectionTitle icon={Wrench} title="Skills and role" />
            <div className="grid gap-3 sm:grid-cols-2">
              {skillOptions.map((skill) => {
                const selected = formData.skills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                      selected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex gap-3">
                      <Checkbox checked={selected} className="mt-1" />
                      <div>
                        <p className="font-bold text-slate-950">{skill.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{skill.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <Field label="Preferred role or notes" htmlFor="volunteer-role">
              <Textarea id="volunteer-role" value={formData.preferredRole} onChange={(event) => updateField("preferredRole", event.target.value)} rows={4} className="rounded-2xl" />
            </Field>
          </section>

          <section className="space-y-4">
            <SectionTitle icon={Building2} title="NGO preference" />
            <Field label="Preferred NGO" htmlFor="volunteer-ngo">
              <Select value={formData.selectedNgoId} onValueChange={(value) => updateField("selectedNgoId", value)}>
                <SelectTrigger id="volunteer-ngo" className="h-12 rounded-2xl">
                  <SelectValue placeholder="Choose an NGO, or leave open" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingNGOs && <SelectItem value="loading" disabled>Loading NGOs...</SelectItem>}
                  {(ngosData?.ngos || []).map((ngo) => (
                    <SelectItem key={ngo.id} value={ngo.id}>{ngo.organizationName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {selectedNgo && (
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-950">{selectedNgo.organizationName}</p>
                  {selectedNgo.isVerified && <Badge className="bg-emerald-600">Verified</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{selectedNgo.description || selectedNgo.location}</p>
              </div>
            )}
          </section>

          <div className="rounded-3xl bg-slate-50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox checked={formData.consentGiven} onCheckedChange={(checked) => updateField("consentGiven", Boolean(checked))} className="mt-1" />
              <span className="text-sm leading-6 text-slate-600">
                I agree that ResQVerse coordinators and partner NGOs may use my details for verification, assignments, and emergency response communication.
              </span>
            </label>
          </div>

          <Button type="submit" disabled={registerMutation.isPending} className="h-14 w-full rounded-2xl bg-slate-950 py-6 text-base font-bold text-white hover:bg-slate-800">
            <ShieldCheck className="mr-2 h-5 w-5" />
            {registerMutation.isPending ? "Submitting registration" : "Submit volunteer profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <Sparkles className="h-4 w-4 text-emerald-500" />
    </div>
  );
}

function Field({ label, htmlFor, required, children }) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-800">
        {label}{required ? " *" : ""}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
