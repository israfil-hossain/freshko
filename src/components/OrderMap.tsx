"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface OrderMapProps {
  address: {
    coordinates?: { lat: number; lng: number };
    city?: string;
    state?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function OrderMap({ address }: OrderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const hasCoords = address?.coordinates?.lat && address?.coordinates?.lng;

    const defaultLat = 23.8041;
    const defaultLng = 90.4152;
    const lat = hasCoords ? address.coordinates!.lat : defaultLat;
    const lng = hasCoords ? address.coordinates!.lng : defaultLng;

    const map = L.map(mapRef.current).setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="background:#22c55e;color:white;padding:6px 10px;border-radius:20px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">
        ${address?.firstName || "Delivery"} ${address?.lastName || ""}
      </div>`,
      className: "",
      iconSize: [0, 0],
      iconAnchor: [40, 20],
    });

    L.marker([lat, lng], { icon }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [address]);

  if (!address?.coordinates?.lat || !address?.coordinates?.lng) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
        <div className="text-center">
          <p>No location coordinates available</p>
          <p className="text-xs mt-1">{address?.city}, {address?.state}</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="h-full w-full" />;
}
