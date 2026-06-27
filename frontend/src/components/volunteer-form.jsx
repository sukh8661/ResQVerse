import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, MapPin, Mic, MicOff, Play, Square } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
const skillOptions = [
  "Medical Training",
  "Search & Rescue",
  "Emergency Repair",
  "Logistics & Transport",
  "Communication & Coordination",
  "Food Service",
  "Counseling & Support",
  "Language Translation",
  "Technical Support",
  "Administrative Support"
];
function VolunteerForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    primarySkill: "",
    skills: [],
    vehicleType: "",
    location: "",
    coordinates: null,
    userId: "temp-user-id"
    // In a real app, this would come from auth context
  });
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorder = useRef(null);
  const audioRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const volunteerMutation = useMutation({
    mutationFn: async (data) => {
      const userData = {
        username: data.email,
        email: data.email,
        fullName: data.fullName,
        password: "temp-password",
        // In real implementation, this would be handled by auth
        phone: data.phone,
        role: "volunteer"
      };
      const userResponse = await apiRequest(
        "POST",
        "/api/auth/register",
        userData
      );
      const userResponseData = await userResponse.json();
      const userId = userResponseData.user.id;
      return await apiRequest("POST", "/api/volunteers", {
        userId,
        skills: data.skills,
        location: data.location,
        vehicleType: data.vehicleType || null,
        coordinates: data.coordinates || null
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Welcome to the ResQVerse volunteer network! Your profile is under review."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        primarySkill: "",
        skills: [],
        vehicleType: "",
        location: "",
        coordinates: null,
        userId: "temp-user-id"
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register volunteer",
        variant: "destructive"
      });
    }
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.primarySkill) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    const skills = formData.primarySkill ? [
      formData.primarySkill,
      ...formData.skills.filter((s) => s !== formData.primarySkill)
    ] : formData.skills;
    volunteerMutation.mutate({ ...formData, skills });
  };
  const handleSkillToggle = (skill, checked) => {
    if (checked) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    } else {
      setFormData({
        ...formData,
        skills: formData.skills.filter((s) => s !== skill)
      });
    }
  };
  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude }
          }));
          let address = "";
          try {
            const response = await fetch(
              `https://api.postalpincode.in/coordinates/${latitude},${longitude}`
            );
            const data = await response.json();
            if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
              const place = data[0].PostOffice[0];
              address = `${place.Name}, ${place.District}, ${place.State} - ${place.Pincode}`;
            }
          } catch (error) {
          }
          if (!address) {
            try {
              const osmRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const osmData = await osmRes.json();
              if (osmData && osmData.address) {
                const addr = osmData.address;
                let locality = addr.suburb || addr.village || addr.town || addr.hamlet || addr.locality || "";
                let city = addr.city || addr.county || addr.district || "";
                let state = addr.state || "";
                let country = addr.country || "";
                address = [locality, city, state, country].filter(Boolean).join(", ");
              } else if (osmData && osmData.display_name) {
                address = osmData.display_name;
              }
            } catch (error) {
            }
          }
          setFormData((prev) => ({ ...prev, location: address || "" }));
          if (!address) {
            toast({
              title: "Location Error",
              description: "Unable to fetch address. Please enter your location manually.",
              variant: "destructive"
            });
          }
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
    }
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
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
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
      audioRef.current = audio;
    }
  };
  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };
  return <Card
    className="w-full max-w-3xl mt-28 mb-10 mx-auto"
    data-testid="card-volunteer-form"
  >
      <CardHeader className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-6 mb-6 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center justify-center space-x-3 text-2xl">
          <span className="font-bold">Join Our Volunteer Network</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
    onSubmit={handleSubmit}
    className="space-y-6"
    data-testid="form-volunteer-registration"
  >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
    id="fullName"
    value={formData.fullName}
    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
    placeholder="Your full name"
    data-testid="input-volunteer-name"
  />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
    id="email"
    type="email"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    placeholder="your.email@example.com"
    data-testid="input-volunteer-email"
  />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
    id="phone"
    type="tel"
    value={formData.phone}
    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
    placeholder="Your phone number"
    data-testid="input-volunteer-phone"
  />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primarySkill">Primary Skill *</Label>
            <Select
    value={formData.primarySkill}
    onValueChange={(value) => setFormData({ ...formData, primarySkill: value })}
  >
              <SelectTrigger data-testid="select-primary-skill">
                <SelectValue placeholder="Select your primary skill" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {skillOptions.map((skill) => <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Additional Skills</Label>
            <div className="grid grid-cols-2 gap-2">
              {skillOptions.filter((skill) => skill !== formData.primarySkill).map((skill) => <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
    id={`skill-${skill}`}
    checked={formData.skills.includes(skill)}
    onCheckedChange={(checked) => handleSkillToggle(skill, checked)}
    data-testid={`checkbox-skill-${skill.toLowerCase().replace(/\s+/g, "-")}`}
  />
                    <Label htmlFor={`skill-${skill}`} className="text-sm">
                      {skill}
                    </Label>
                  </div>)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type (Optional)</Label>
            <Select
    value={formData.vehicleType}
    onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
  >
              <SelectTrigger data-testid="select-vehicle-type">
                <SelectValue placeholder="Select vehicle type if available" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="car">Personal Car</SelectItem>
                <SelectItem value="truck">Pickup Truck</SelectItem>
                <SelectItem value="van">Van/SUV</SelectItem>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="bicycle">Bicycle</SelectItem>
                <SelectItem value="boat">Boat</SelectItem>
                <SelectItem value="none">No Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex space-x-3">
              <Input
    id="location"
    value={formData.location}
    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
    placeholder="Your city or area"
    className="flex-1"
    data-testid="input-volunteer-location"
  />
              <Button
    type="button"
    variant="outline"
    size="icon"
    onClick={getCurrentLocation}
    data-testid="button-get-location"
  >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {formData.coordinates && <p className="text-xs text-muted-foreground">
                📍 Location detected: {formData.coordinates.lat.toFixed(6)},{" "}
                {formData.coordinates.lng.toFixed(6)}
              </p>}
          </div>

          {
    /* Voice Message Section */
  }
          <div className="space-y-3">
            <Label>Voice Message (Optional)</Label>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Record a brief introduction about yourself and why you want to
                volunteer.
              </p>
              <div className="flex items-center gap-3">
                {!isRecording ? <Button
    type="button"
    variant="outline"
    onClick={startRecording}
    className="flex items-center gap-2"
    data-testid="button-start-recording"
  >
                    <Mic className="h-4 w-4" />
                    Start Recording
                  </Button> : <Button
    type="button"
    variant="destructive"
    onClick={stopRecording}
    className="flex items-center gap-2 animate-pulse"
    data-testid="button-stop-recording"
  >
                    <MicOff className="h-4 w-4" />
                    Stop Recording
                  </Button>}

                {audioBlob && <div className="flex items-center gap-2">
                    {!isPlaying ? <Button
    type="button"
    variant="secondary"
    size="sm"
    onClick={playRecording}
    data-testid="button-play-recording"
  >
                        <Play className="h-3 w-3 mr-1" />
                        Play
                      </Button> : <Button
    type="button"
    variant="secondary"
    size="sm"
    onClick={stopPlaying}
    data-testid="button-stop-playing"
  >
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>}
                    <span className="text-xs text-muted-foreground">
                      Voice message recorded
                    </span>
                  </div>}
              </div>
            </div>
          </div>

          <Button
    type="submit"
    className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
    disabled={volunteerMutation.isPending}
    data-testid="button-submit-volunteer"
  >
            <UserPlus className="mr-2 h-5 w-5" />
            {volunteerMutation.isPending ? "Registering..." : "Join Volunteer Network"}
          </Button>
        </form>
      </CardContent>
    </Card>;
}
export {
  VolunteerForm as default
};
