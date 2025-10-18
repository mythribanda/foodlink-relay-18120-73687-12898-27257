import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "./ui/card";
import { calculateDistance, formatDistance } from "@/lib/distance";
import { MapPin, Navigation, Home } from "lucide-react";

interface RouteMapProps {
  volunteerLocation: { lat: number; lng: number };
  donorLocation: { lat: number; lng: number };
  ngoLocation: { lat: number; lng: number };
  status: "pending" | "picked_up" | "delivered";
}

export const RouteMap = ({
  volunteerLocation,
  donorLocation,
  ngoLocation,
  status,
}: RouteMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Calculate distances
  const distanceToDonor = calculateDistance(
    volunteerLocation.lat,
    volunteerLocation.lng,
    donorLocation.lat,
    donorLocation.lng
  );

  const distanceToNGO = calculateDistance(
    donorLocation.lat,
    donorLocation.lng,
    ngoLocation.lat,
    ngoLocation.lng
  );

  const totalDistance = distanceToDonor + distanceToNGO;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(
      [volunteerLocation.lat, volunteerLocation.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Custom icons
    const volunteerIcon = L.divIcon({
      html: '<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg></div>',
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const donorIcon = L.divIcon({
      html: '<div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>',
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const ngoIcon = L.divIcon({
      html: '<div class="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>',
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add markers
    L.marker([volunteerLocation.lat, volunteerLocation.lng], { icon: volunteerIcon })
      .addTo(map)
      .bindPopup("Your Location");

    L.marker([donorLocation.lat, donorLocation.lng], { icon: donorIcon })
      .addTo(map)
      .bindPopup("Pickup Location (Donor)");

    L.marker([ngoLocation.lat, ngoLocation.lng], { icon: ngoIcon })
      .addTo(map)
      .bindPopup("Dropoff Location (NGO)");

    // Draw route lines
    if (status === "pending") {
      // Show route to donor
      L.polyline(
        [
          [volunteerLocation.lat, volunteerLocation.lng],
          [donorLocation.lat, donorLocation.lng],
        ],
        { color: "hsl(var(--primary))", weight: 3, dashArray: "10, 5" }
      ).addTo(map);

      // Show route from donor to NGO (lighter)
      L.polyline(
        [
          [donorLocation.lat, donorLocation.lng],
          [ngoLocation.lat, ngoLocation.lng],
        ],
        { color: "hsl(var(--muted-foreground))", weight: 2, dashArray: "5, 5", opacity: 0.5 }
      ).addTo(map);
    } else if (status === "picked_up") {
      // Show completed route to donor
      L.polyline(
        [
          [volunteerLocation.lat, volunteerLocation.lng],
          [donorLocation.lat, donorLocation.lng],
        ],
        { color: "hsl(var(--muted-foreground))", weight: 2, opacity: 0.5 }
      ).addTo(map);

      // Show active route to NGO
      L.polyline(
        [
          [donorLocation.lat, donorLocation.lng],
          [ngoLocation.lat, ngoLocation.lng],
        ],
        { color: "hsl(var(--primary))", weight: 3, dashArray: "10, 5" }
      ).addTo(map);
    }

    // Fit bounds to show all markers
    const bounds = L.latLngBounds([
      [volunteerLocation.lat, volunteerLocation.lng],
      [donorLocation.lat, donorLocation.lng],
      [ngoLocation.lat, ngoLocation.lng],
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [volunteerLocation, donorLocation, ngoLocation, status]);

  return (
    <Card className="overflow-hidden">
      <div ref={mapContainerRef} className="h-64 w-full" />
      <div className="p-4 bg-muted/50 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="font-medium">To Pickup:</span>
          </div>
          <span className="font-semibold">{formatDistance(distanceToDonor)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-secondary" />
            <span className="font-medium">To NGO:</span>
          </div>
          <span className="font-semibold">{formatDistance(distanceToNGO)}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Total Distance:</span>
          </div>
          <span className="font-bold text-primary">{formatDistance(totalDistance)}</span>
        </div>
      </div>
    </Card>
  );
};
