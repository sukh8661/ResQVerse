import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, MapPin } from "lucide-react";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || "9674b0ca033b4f2993529b9c0166f60b";

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);

  return new Promise((resolve, reject) => {
    if (!document.querySelector("link[data-leaflet-css]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.leafletCss = "true";
      document.head.appendChild(link);
    }

    const existing = document.querySelector("script[data-leaflet-js]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.dataset.leafletJs = "true";
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function validPoints(requests) {
  return (requests || [])
    .filter((request) => Number.isFinite(Number(request.coordinates?.lat)) && Number.isFinite(Number(request.coordinates?.lng)))
    .map((request) => ({
      ...request,
      lat: Number(request.coordinates.lat),
      lng: Number(request.coordinates.lng)
    }));
}

export default function RequestLocationMap({ requests = [], title = "Live Request Map", height = 360 }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [error, setError] = useState("");
  const points = useMemo(() => validPoints(requests), [requests]);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapEl.current) return;

        if (!mapRef.current) {
          mapRef.current = L.map(mapEl.current, { zoomControl: true, scrollWheelZoom: false }).setView([28.6139, 77.209], 5);
          L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`, {
            attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a> | © OpenStreetMap contributors',
            maxZoom: 20
          }).addTo(mapRef.current);
        }

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        if (points.length === 0) {
          mapRef.current.setView([28.6139, 77.209], 5);
          return;
        }

        const bounds = [];
        points.forEach((request) => {
          const marker = L.marker([request.lat, request.lng]).addTo(mapRef.current);
          marker.bindPopup(`
            <div style="min-width:180px">
              <strong>${request.title || request.type || "Emergency Request"}</strong><br/>
              <span>${request.location || "Location saved"}</span><br/>
              <span>Urgency: ${request.urgency || "medium"}</span><br/>
              <span>Status: ${request.status || "pending"}</span>
            </div>
          `);
          markersRef.current.push(marker);
          bounds.push([request.lat, request.lng]);
        });

        mapRef.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
        setTimeout(() => mapRef.current?.invalidateSize(), 100);
      })
      .catch(() => setError("Unable to load map. Check internet connection or Geoapify key."));

    return () => {
      cancelled = true;
    };
  }, [points]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <MapPin className="h-5 w-5 text-red-500" />
            {title}
          </h2>
          <p className="text-sm text-slate-500">{points.length} request marker{points.length === 1 ? "" : "s"} with saved coordinates</p>
        </div>
        {points.length === 0 && <AlertTriangle className="h-5 w-5 text-amber-500" />}
      </div>
      <div ref={mapEl} style={{ height }} className="z-0 w-full bg-slate-100" />
      {error && <p className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
