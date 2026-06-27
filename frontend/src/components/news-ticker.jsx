import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Info, Zap } from "lucide-react";
function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: activeDisasters } = useQuery({
    queryKey: ["/api/disasters/active"],
    refetchInterval: 2 * 60 * 1e3
    // Refresh every 2 minutes
  });
  const disasterNewsItems = (activeDisasters?.disasters || []).slice(0, 3).map((disaster) => ({
    id: `disaster-${disaster.id}`,
    type: disaster.severity === "critical" ? "alert" : disaster.severity === "high" ? "warning" : "info",
    message: `\u{1F30D} ${disaster.name} - ${disaster.type} in ${disaster.location.region || disaster.location.country}. Status: ${disaster.status.toUpperCase()}`,
    timestamp: "Live"
  }));
  const staticNewsItems = [
    {
      id: "1",
      type: "warning",
      message: "\u{1F6A8} Flood Warning: Heavy rainfall expected in coastal areas. Stay alert and avoid low-lying areas.",
      timestamp: "2 min ago"
    },
    {
      id: "2",
      type: "info",
      message: "\u{1F4E2} Cyclone Update: Storm system moving towards eastern coast. Emergency shelters activated.",
      timestamp: "15 min ago"
    },
    {
      id: "3",
      type: "alert",
      message: "\u26A1 Power Outage Alert: Several areas experiencing power cuts. Backup generators deployed.",
      timestamp: "1 hour ago"
    },
    {
      id: "4",
      type: "info",
      message: "\u{1F3E5} Medical Aid: Mobile medical units deployed in affected areas. Call emergency helpline for assistance.",
      timestamp: "2 hours ago"
    },
    {
      id: "5",
      type: "warning",
      message: "\u{1F30A} Tsunami Watch: Coastal areas under watch. Residents advised to move to higher ground.",
      timestamp: "3 hours ago"
    }
  ];
  const newsItems = [...disasterNewsItems, ...staticNewsItems];
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 5e3);
    return () => clearInterval(timer);
  }, [newsItems.length]);
  const getIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "alert":
        return <Zap className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  const getBgColor = (type) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "alert":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };
  return <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">LATEST ALERTS</span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="flex-1 mx-6">
            <div className="relative overflow-hidden">
              <div
    className="flex transition-transform duration-500 ease-in-out"
    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
  >
                {newsItems.map((item, index) => <div
    key={item.id}
    className={`w-full flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-lg border ${getBgColor(item.type)}`}
  >
                    {getIcon(item.type)}
                    <span className="text-sm font-medium text-gray-800 flex-1">
                      {item.message}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.timestamp}
                    </span>
                  </div>)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {newsItems.map((_, index) => <button
    key={index}
    onClick={() => setCurrentIndex(index)}
    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-blue-500 scale-125" : "bg-gray-300 hover:bg-gray-400"}`}
  />)}
          </div>
        </div>
      </div>
    </div>;
}
export {
  NewsTicker as default
};
