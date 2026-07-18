"use client";

import { useEffect, useRef } from "react";
import type * as LeafletNS from "leaflet";
import { MapPlaceholder } from "./MapPlaceholder";
import { configureDefaultIcon } from "./leafletIcon";
import type { GeoPolygon } from "@/lib/geo";
import { BASE_PATH } from "@/lib/basePath";

export type MapComplex = {
  id: string;
  name: string;
  roadAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  polygon: GeoPolygon | null;
  unresolvedVocCount: number;
};

export function AllComplexesMap({
  complexes,
  selectedId,
  onSelect,
}: {
  complexes: MapComplex[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const markersRef = useRef<Map<string, LeafletNS.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const located = complexes.filter(
    (c): c is MapComplex & { latitude: number; longitude: number } =>
      c.latitude !== null && c.longitude !== null
  );

  useEffect(() => {
    if (!containerRef.current || located.length === 0) return;

    let cancelled = false;

    import("leaflet").then((leafletModule) => {
      if (cancelled || !containerRef.current) return;
      const L = leafletModule.default;
      configureDefaultIcon(L);

      const map = L.map(containerRef.current);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const bounds = L.latLngBounds([]);

      for (const complex of located) {
        bounds.extend([complex.latitude, complex.longitude]);

        if (complex.polygon?.coordinates?.[0]) {
          const path = complex.polygon.coordinates[0].map(
            ([lng, lat]) => [lat, lng] as [number, number]
          );
          const poly = L.polygon(path, { color: "#2a78d6", weight: 2, fillOpacity: 0.25 }).addTo(map);
          poly.on("click", () => onSelectRef.current(complex.id));
        }

        const marker = L.marker([complex.latitude, complex.longitude]).addTo(map);
        marker.bindPopup(
          `<div style="font-size:13px;max-width:220px;">
             <strong>${complex.name}</strong><br/>
             <span style="color:#666;">${complex.roadAddress ?? ""}</span><br/>
             <a href="${BASE_PATH}/complex/${complex.id}/" style="color:#2a78d6;font-weight:600;">상세보기 →</a>
           </div>`
        );
        marker.on("click", () => onSelectRef.current(complex.id));
        markersRef.current.set(complex.id, marker);
      }

      map.fitBounds(bounds, { padding: [24, 24] });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complexes.length]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const marker = markersRef.current.get(selectedId);
    if (!marker) return;

    mapRef.current.setView(marker.getLatLng(), 15);
    marker.openPopup();
  }, [selectedId]);

  if (located.length === 0) {
    return <MapPlaceholder message="위치 좌표가 등록된 단지가 없습니다." />;
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
