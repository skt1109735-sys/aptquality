"use client";

import { useEffect, useRef } from "react";
import type * as LeafletNS from "leaflet";
import { MapPlaceholder } from "./MapPlaceholder";
import { configureDefaultIcon } from "./leafletIcon";
import type { GeoPolygon } from "@/lib/geo";

export function ComplexLocationMap({
  latitude,
  longitude,
  polygon,
  name,
}: {
  latitude: number | null;
  longitude: number | null;
  polygon: GeoPolygon | null;
  name: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || latitude === null || longitude === null) return;

    let cancelled = false;

    import("leaflet").then((leafletModule) => {
      if (cancelled || !containerRef.current) return;
      const L = leafletModule.default;
      configureDefaultIcon(L);

      const map = L.map(containerRef.current).setView([latitude, longitude], 16);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.marker([latitude, longitude]).addTo(map).bindPopup(name);

      if (polygon?.coordinates?.[0]) {
        const path = polygon.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
        L.polygon(path, { color: "#2a78d6", weight: 2, fillOpacity: 0.25 }).addTo(map);
      }
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, polygon, name]);

  if (!latitude || !longitude) {
    return <MapPlaceholder message="위치 좌표가 아직 등록되지 않았습니다." />;
  }

  return <div ref={containerRef} className="h-full min-h-[280px] w-full rounded-xl" />;
}
