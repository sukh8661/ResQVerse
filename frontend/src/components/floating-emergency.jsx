import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
function FloatingEmergency() {
  const [, setLocation] = useLocation();
  const handleEmergencyClick = () => {
    setLocation("/emergency");
  };
  return <div className="fixed bottom-6 right-6 z-50">
      <Button
    onClick={handleEmergencyClick}
    className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 emergency-pulse p-0"
    data-testid="button-floating-emergency"
  >
        <AlertTriangle className="h-8 w-8" />
      </Button>
    </div>;
}
export {
  FloatingEmergency as default
};
