"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DeliveryMapProps {
  address: {
    coordinates?: { lat: number; lng: number };
    city?: string;
    state?: string;
    firstName?: string;
    lastName?: string;
    houseNumber?: string;
    roadNumber?: string;
  };
}

export default function DeliveryMap({ address }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const hasCoords = address?.coordinates?.lat && address?.coordinates?.lng;

    const defaultLat = 23.8041;
    const defaultLng = 90.4152;
    const lat = hasCoords ? address.coordinates!.lat : defaultLat;
    const lng = hasCoords ? address.coordinates!.lng : defaultLng;

    const map = L.map(mapRef.current).setView([lat, lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="background:#22c55e;color:white;padding:4px 8px;border-radius:16px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">
        📍 ${address?.firstName || "Customer"}
      </div>`,
      className: "",
      iconSize: [0, 0],
      iconAnchor: [30, 16],
    });

    L.marker([lat, lng], { icon }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [address]);

  return (
    <div>
      {address?.coordinates?.lat && address?.coordinates?.lng ? (
        <div ref={mapRef} className="h-48 w-full rounded-lg" />
      ) : (
        <div className="h-48 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
          <div className="text-center">
            <p>📍 No map coordinates</p>
            <p className="text-xs mt-1">House {address?.houseNumber}, Road {address?.roadNumber}, {address?.city}</p>
          </div>
        </div>
      )}
    </div>
  );
}
