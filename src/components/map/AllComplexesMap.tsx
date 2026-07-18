"use client";

import { useEffect, useRef } from "react";
import { useKakaoMaps } from "./useKakaoMaps";
import { MapPlaceholder } from "./MapPlaceholder";
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
  const status = useKakaoMaps();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<Map<string, kakao.maps.Marker>>(new Map());
  const infoWindowRef = useRef<kakao.maps.InfoWindow | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const located = complexes.filter(
    (c): c is MapComplex & { latitude: number; longitude: number } =>
      c.latitude !== null && c.longitude !== null
  );

  useEffect(() => {
    if (status !== "ready" || !containerRef.current || located.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    const center = new window.kakao.maps.LatLng(located[0].latitude, located[0].longitude);
    const map = new window.kakao.maps.Map(containerRef.current, { center, level: 9 });
    mapRef.current = map;
    infoWindowRef.current = new window.kakao.maps.InfoWindow({ removable: true });

    for (const complex of located) {
      const position = new window.kakao.maps.LatLng(complex.latitude, complex.longitude);
      bounds.extend(position);

      if (complex.polygon?.coordinates?.[0]) {
        const path = complex.polygon.coordinates[0].map(
          ([lng, lat]) => new window.kakao.maps.LatLng(lat, lng)
        );
        const poly = new window.kakao.maps.Polygon({
          path,
          strokeWeight: 2,
          strokeColor: "#2a78d6",
          strokeOpacity: 0.8,
          fillColor: "#2a78d6",
          fillOpacity: 0.25,
        });
        poly.setMap(map);
        window.kakao.maps.event.addListener(poly, "click", () => onSelectRef.current(complex.id));
      }

      const marker = new window.kakao.maps.Marker({ position, map, title: complex.name });
      markersRef.current.set(complex.id, marker);
      window.kakao.maps.event.addListener(marker, "click", () => onSelectRef.current(complex.id));
    }

    map.setBounds(bounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, complexes.length]);

  useEffect(() => {
    if (!selectedId || !mapRef.current || !infoWindowRef.current) return;
    const complex = located.find((c) => c.id === selectedId);
    const marker = markersRef.current.get(selectedId);
    if (!complex || !marker) return;

    mapRef.current.setCenter(marker.getPosition());
    infoWindowRef.current.setContent(
      `<div style="padding:8px 10px;font-size:13px;max-width:220px;">
         <strong>${complex.name}</strong><br/>
         <span style="color:#666;">${complex.roadAddress ?? ""}</span><br/>
         <a href="${BASE_PATH}/complex/${complex.id}/" style="color:#2a78d6;font-weight:600;">상세보기 →</a>
       </div>`
    );
    infoWindowRef.current.open(mapRef.current, marker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (located.length === 0) {
    return <MapPlaceholder message="위치 좌표가 등록된 단지가 없습니다." />;
  }

  if (status === "missing-key") {
    return (
      <MapPlaceholder message="카카오맵 API 키(NEXT_PUBLIC_KAKAO_JS_KEY)가 설정되지 않아 지도를 표시할 수 없습니다." />
    );
  }

  if (status === "error") {
    return <MapPlaceholder message="카카오맵을 불러오는 중 오류가 발생했습니다." />;
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
