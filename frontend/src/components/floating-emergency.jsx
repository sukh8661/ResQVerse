import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
function FloatingEmergency() {
  const [, setLocation] = useLocation();
  const handleEmergencyClick = () => {
    setLocation("/emergency");
  };
  return <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <Button
    onClick={handleEmergencyClick}
    className="h-14 w-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 p-0 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl sm:h-16 sm:w-16 emergency-pulse"
    data-testid="button-floating-emergency"
  >
        <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8" />
      </Button>
    </div>;
}
export {
  FloatingEmergency as default
};
