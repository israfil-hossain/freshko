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
  riderLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function OrderMap({ address, riderLocation }: OrderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

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

    // Customer marker
    const customerIcon = L.divIcon({
      html: `<div style="background:#22c55e;color:white;padding:6px 10px;border-radius:20px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">
        ${address?.firstName || "Delivery"} ${address?.lastName || ""}
      </div>`,
      className: "",
      iconSize: [0, 0],
      iconAnchor: [40, 20],
    });

    L.marker([lat, lng], { icon: customerIcon }).addTo(map);

    // Rider marker (if available)
    if (riderLocation) {
      const riderIcon = L.divIcon({
        html: `<div style="background:#f59e0b;color:white;padding:6px 10px;border-radius:20px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">
          🚴 Rider
        </div>`,
        className: "",
        iconSize: [0, 0],
        iconAnchor: [40, 20],
      });

      riderMarkerRef.current = L.marker([riderLocation.latitude, riderLocation.longitude], { icon: riderIcon }).addTo(map);

      // Draw route line
      routeLineRef.current = L.polyline(
        [
          [riderLocation.latitude, riderLocation.longitude],
          [lat, lng],
        ],
        {
          color: "#f59e0b",
          weight: 3,
          dashArray: "10, 10",
          opacity: 0.7,
        }
      ).addTo(map);

      // Fit bounds to show both markers
      const bounds = L.latLngBounds(
        [riderLocation.latitude, riderLocation.longitude],
        [lat, lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [address]);

  // Update rider location when it changes
  useEffect(() => {
    if (mapInstanceRef.current && riderLocation) {
      // Remove old rider marker
      if (riderMarkerRef.current) {
        mapInstanceRef.current.removeLayer(riderMarkerRef.current);
      }
      if (routeLineRef.current) {
        mapInstanceRef.current.removeLayer(routeLineRef.current);
      }

      const riderIcon = L.divIcon({
        html: `<div style="background:#f59e0b;color:white;padding:6px 10px;border-radius:20px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">
          🚴 Rider
        </div>`,
        className: "",
        iconSize: [0, 0],
        iconAnchor: [40, 20],
      });

      riderMarkerRef.current = L.marker([riderLocation.latitude, riderLocation.longitude], { icon: riderIcon }).addTo(mapInstanceRef.current);

      // Draw route line
      const hasCoords = address?.coordinates?.lat && address?.coordinates?.lng;
      if (hasCoords) {
        routeLineRef.current = L.polyline(
          [
            [riderLocation.latitude, riderLocation.longitude],
            [address.coordinates!.lat, address.coordinates!.lng],
          ],
          {
            color: "#f59e0b",
            weight: 3,
            dashArray: "10, 10",
            opacity: 0.7,
          }
        ).addTo(mapInstanceRef.current);
      }
    }
  }, [riderLocation, address]);

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
