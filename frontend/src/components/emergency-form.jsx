import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock, LocateFixed, Mic, Pause, Play, Send, ShieldCheck, Square, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, apiUrl } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || "9674b0ca033b4f2993529b9c0166f60b";

const emergencyTypes = [
  { value: "Medical", label: "Medical", detail: "Injury, medicine, urgent health support" },
  { value: "Rescue", label: "Rescue", detail: "Stranded, trapped, evacuation needed" },
  { value: "Food", label: "Food", detail: "Meals, drinking water, baby supplies" },
  { value: "Shelter", label: "Shelter", detail: "Temporary stay, blankets, safe place" },
  { value: "Supplies", label: "Supplies", detail: "Clothes, hygiene kits, essentials" },
  { value: "Other", label: "Other", detail: "Any other emergency help" }
];

const urgencyOptions = [
  { value: "critical", label: "Critical", detail: "Life risk or immediate rescue", tone: "border-red-500 bg-red-50 text-red-700" },
  { value: "medium", label: "Urgent", detail: "Need help soon", tone: "border-amber-500 bg-amber-50 text-amber-700" },
  { value: "low", label: "Support", detail: "Can wait briefly", tone: "border-emerald-500 bg-emerald-50 text-emerald-700" }
];

function getBrowserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location access is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });
  });
}

async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_KEY}`
    );
    if (response.ok) {
      const data = await response.json();
      const formatted = data.features?.[0]?.properties?.formatted;
      if (formatted) return formatted;
    }
  } catch {
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    );
    if (response.ok) {
      const data = await response.json();
      if (data?.display_name) return data.display_name;
    }
  } catch {
  }

  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

async function geocodeAddress(address) {
  const cleanAddress = address?.trim();
  if (!cleanAddress) return null;

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cleanAddress)}&limit=1&apiKey=${GEOAPIFY_KEY}`
    );
    if (response.ok) {
      const data = await response.json();
      const properties = data.features?.[0]?.properties;
      if (Number.isFinite(Number(properties?.lat)) && Number.isFinite(Number(properties?.lon))) {
        return {
          coordinates: { lat: Number(properties.lat), lng: Number(properties.lon) },
          address: properties.formatted || cleanAddress
        };
      }
    }
  } catch {
  }

  return null;
}

async function detectLocation() {
  const position = await getBrowserPosition();
  const { latitude, longitude } = position.coords;
  const address = await reverseGeocode(latitude, longitude);

  return {
    coordinates: { lat: latitude, lng: longitude },
    address
  };
}

async function submitEmergencyRequest(data) {
  if (data.audioBlob) {
    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "audioBlob" || value === undefined || value === null) return;
      form.append(key, typeof value === "object" ? JSON.stringify(value) : value);
    });
    form.append("audio", data.audioBlob, `emergency-${Date.now()}.webm`);

    const response = await fetch(apiUrl("/api/emergency-requests"), {
      method: "POST",
      body: form,
      credentials: "include"
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Failed to submit emergency request");
    }

    return response;
  }

  return apiRequest("POST", "/api/emergency-requests", {
    ...data,
    audioNote: data.audioNote || null
  });
}

const initialForm = {
  type: "medical",
  urgency: "critical",
  description: "",
  location: "",
  peopleCount: 1,
  coordinates: null,
  userId: "public",
  requesterName: "",
  requesterPhone: ""
};

export default function EmergencyForm() {
  const [formData, setFormData] = useState(initialForm);
  const [mode, setMode] = useState("form");
  const [isLocating, setIsLocating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);
  const audioRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get("mode");
    if (urlMode === "voice" || urlMode === "form") setMode(urlMode);
  }, []);

  const emergencyMutation = useMutation({
    mutationFn: submitEmergencyRequest,
    onSuccess: () => {
      toast({
        title: "Request sent",
        description: "Your emergency request is now visible to the response team."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-requests"] });
      setFormData(initialForm);
      setAudioBlob(null);
      setIsRecording(false);
      setIsPlaying(false);
    },
    onError: (error) => {
      toast({
        title: "Request failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const applyCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const result = await detectLocation();
      setFormData((current) => ({
        ...current,
        location: result.address,
        coordinates: result.coordinates
      }));
      toast({ title: "Location saved", description: result.address });
    } catch (error) {
      toast({
        title: "Location not available",
        description: error.message || "Please type your address manually.",
        variant: "destructive"
      });
    } finally {
      setIsLocating(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch {
      toast({
        title: "Microphone blocked",
        description: "Please allow microphone access or use the text form.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (!audioBlob) return;
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(URL.createObjectURL(audioBlob));
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pauseRecording = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const submitDetailedRequest = (event) => {
    event.preventDefault();
    submitDetailedRequestWithLocation();
  };

  const submitDetailedRequestWithLocation = async () => {
    if (!formData.location.trim()) {
      toast({
        title: "Location needed",
        description: "Add your location so responders can reach you.",
        variant: "destructive"
      });
      return;
    }

    let payloadLocation = formData.location;
    let payloadCoordinates = formData.coordinates;

    if (!payloadCoordinates) {
      setIsLocating(true);
      const geocoded = await geocodeAddress(formData.location);
      setIsLocating(false);

      if (geocoded) {
        payloadLocation = geocoded.address;
        payloadCoordinates = geocoded.coordinates;
        setFormData((current) => ({
          ...current,
          location: geocoded.address,
          coordinates: geocoded.coordinates
        }));
      } else {
        toast({
          title: "Location marker not found",
          description: "Please add a more specific address or use Detect location.",
          variant: "destructive"
        });
        return;
      }
    }

    emergencyMutation.mutate({
      ...formData,
      title: `${emergencyTypes.find((type) => type.value === formData.type)?.label || "Emergency"} support needed`,
      location: payloadLocation,
      coordinates: payloadCoordinates,
      peopleCount: Number(formData.peopleCount) || 1
    });
  };

  const submitVoiceRequest = async () => {
    if (!audioBlob) {
      toast({
        title: "Voice note missing",
        description: "Record a short message before submitting.",
        variant: "destructive"
      });
      return;
    }

    let payloadLocation = formData.location;
    let payloadCoordinates = formData.coordinates;

    if (!payloadLocation) {
      try {
        const result = await detectLocation();
        payloadLocation = result.address;
        payloadCoordinates = result.coordinates;
        setFormData((current) => ({ ...current, location: result.address, coordinates: result.coordinates }));
      } catch {
        toast({
          title: "Location needed",
          description: "Detect your location or type it before sending the voice request.",
          variant: "destructive"
        });
        return;
      }
    }

    if (payloadLocation && !payloadCoordinates) {
      setIsLocating(true);
      const geocoded = await geocodeAddress(payloadLocation);
      setIsLocating(false);
      if (geocoded) {
        payloadLocation = geocoded.address;
        payloadCoordinates = geocoded.coordinates;
        setFormData((current) => ({ ...current, location: geocoded.address, coordinates: geocoded.coordinates }));
      }
    }

    if (!payloadCoordinates) {
      toast({
        title: "Location marker not found",
        description: "Please use Detect location or type a more specific address.",
        variant: "destructive"
      });
      return;
    }

    emergencyMutation.mutate({
      ...formData,
      type: "rescue",
      urgency: "critical",
      title: "Voice emergency request",
      description: "Voice note attached by requester.",
      location: payloadLocation,
      coordinates: payloadCoordinates,
      audioBlob
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
              <ShieldCheck className="h-4 w-4" />
              Emergency intake
            </div>
            <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Tell us what help you need</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Share your location and the situation. The request is stored instantly and shown to response teams.
            </p>
          </div>

          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {[
              { value: "form", label: "Form" },
              { value: "voice", label: "Voice" }
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setMode(item.value)}
                className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  mode === item.value ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === "voice" ? (
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <div className="flex h-full min-h-[360px] flex-col justify-between gap-8">
              <div>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500">
                  <Mic className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold">Send a voice emergency</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Best for victims who cannot type. Record what happened, how many people need help, and any visible landmark.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`h-14 w-full rounded-2xl text-base font-bold ${
                    isRecording ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {isRecording ? <Square className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
                  {isRecording ? "Stop recording" : "Start recording"}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={isPlaying ? pauseRecording : playRecording}
                    disabled={!audioBlob}
                    className="h-12 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    Preview
                  </Button>
                  <Button
                    type="button"
                    onClick={submitVoiceRequest}
                    disabled={emergencyMutation.isPending}
                    className="h-12 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <Label htmlFor="voice-location" className="text-sm font-semibold text-slate-800">Location</Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  id="voice-location"
                  value={formData.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Type address, area, landmark"
                  className="h-12 rounded-2xl bg-white"
                />
                <Button type="button" variant="outline" onClick={applyCurrentLocation} disabled={isLocating} className="h-12 rounded-2xl">
                  <LocateFixed className="mr-2 h-4 w-4" />
                  {isLocating ? "Detecting" : "Detect"}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 p-5">
                <Label htmlFor="voice-name">Name</Label>
                <Input id="voice-name" value={formData.requesterName} onChange={(event) => updateField("requesterName", event.target.value)} className="mt-2 h-12 rounded-2xl" />
              </div>
              <div className="rounded-3xl border border-slate-200 p-5">
                <Label htmlFor="voice-phone">Phone</Label>
                <Input id="voice-phone" value={formData.requesterPhone} onChange={(event) => updateField("requesterPhone", event.target.value)} className="mt-2 h-12 rounded-2xl" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Audio", audioBlob ? "Ready" : "Waiting", audioBlob ? CheckCircle2 : Mic],
                ["Location", formData.location ? "Saved" : "Needed", LocateFixed],
                ["Priority", "Critical", AlertTriangle]
              ].map(([label, value, Icon]) => (
                <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <Icon className="mb-3 h-5 w-5 text-red-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={submitDetailedRequest} className="space-y-7 p-5 sm:p-7" data-testid="form-emergency-request">
          <div>
            <Label className="text-sm font-semibold text-slate-800">Emergency type</Label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {emergencyTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateField("type", type.value)}
                  className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                    formData.type === type.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <span className="block text-base font-bold">{type.label}</span>
                  <span className={`mt-1 block text-xs leading-5 ${formData.type === type.value ? "text-slate-300" : "text-slate-500"}`}>{type.detail}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-800">Urgency</Label>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {urgencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField("urgency", option.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    formData.urgency === option.value ? option.tone : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="block font-bold">{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 opacity-80">{option.detail}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Address, area, or nearest landmark"
                  className="h-12 rounded-2xl"
                  required
                />
                <Button type="button" variant="outline" onClick={applyCurrentLocation} disabled={isLocating} className="h-12 rounded-2xl">
                  <LocateFixed className="mr-2 h-4 w-4" />
                  {isLocating ? "Detecting" : "Detect"}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="people-count">People affected</Label>
              <Input
                id="people-count"
                type="number"
                min="1"
                value={formData.peopleCount}
                onChange={(event) => updateField("peopleCount", event.target.value)}
                className="mt-2 h-12 rounded-2xl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Situation details</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="What happened? What help is needed first?"
              rows={5}
              className="mt-2 rounded-2xl"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="requester-name">Name</Label>
              <Input id="requester-name" value={formData.requesterName} onChange={(event) => updateField("requesterName", event.target.value)} className="mt-2 h-12 rounded-2xl" />
            </div>
            <div>
              <Label htmlFor="requester-phone">Phone</Label>
              <Input id="requester-phone" value={formData.requesterPhone} onChange={(event) => updateField("requesterPhone", event.target.value)} className="mt-2 h-12 rounded-2xl" />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <Clock className="mt-0.5 h-5 w-5 text-slate-500" />
              <span>Requests appear on live dashboards with saved location, urgency, and contact details.</span>
            </div>
            <Button type="submit" disabled={emergencyMutation.isPending} className="h-12 rounded-2xl bg-red-600 px-7 text-white hover:bg-red-700">
              <Send className="mr-2 h-4 w-4" />
              {emergencyMutation.isPending ? "Sending" : "Send request"}
            </Button>
          </div>
        </form>
      )}

      <div className="grid border-t border-slate-100 text-sm text-slate-600 sm:grid-cols-3">
        {[
          ["Verified intake", ShieldCheck],
          ["Location saved", LocateFixed],
          ["Responder matching", Users]
        ].map(([label, Icon]) => (
          <div key={label} className="flex items-center gap-3 border-slate-100 p-4 sm:border-r last:border-r-0">
            <Icon className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-slate-800">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
