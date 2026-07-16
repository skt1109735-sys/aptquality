"use client";

import { useEffect, useRef } from "react";
import { useKakaoMaps } from "./useKakaoMaps";
import { MapPlaceholder } from "./MapPlaceholder";
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
  const status = useKakaoMaps();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "ready" || !containerRef.current || latitude === null || longitude === null) {
      return;
    }

    const center = new window.kakao.maps.LatLng(latitude, longitude);
    const map = new window.kakao.maps.Map(containerRef.current, { center, level: 4 });

    new window.kakao.maps.Marker({ position: center, map, title: name });

    if (polygon?.coordinates?.[0]) {
      const path = polygon.coordinates[0].map(
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
    }
  }, [status, latitude, longitude, polygon, name]);

  if (!latitude || !longitude) {
    return <MapPlaceholder message="위치 좌표가 아직 등록되지 않았습니다." />;
  }

  if (status === "missing-key") {
    return (
      <MapPlaceholder message="카카오맵 API 키(NEXT_PUBLIC_KAKAO_JS_KEY)가 설정되지 않아 지도를 표시할 수 없습니다." />
    );
  }

  if (status === "error") {
    return <MapPlaceholder message="카카오맵을 불러오는 중 오류가 발생했습니다." />;
  }

  return <div ref={containerRef} className="h-full min-h-[280px] w-full rounded-xl" />;
}
