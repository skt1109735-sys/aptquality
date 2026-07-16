// 브이월드(VWorld) Data API - 단지 폴리곤(지적경계) 조회.
//
// ⚠️ VWorld는 레이어(data 파라미터)가 다양하고 버전이 바뀔 수 있어, 여기서는 연속지적도
// 지번 경계(LP_PA_CBND_BUBUN)를 기본값으로 사용합니다. 건물 외곽선이 필요하다면
// www.vworld.kr 데이터 목록에서 "건물통합정보" 레이어의 정확한 data 코드를 확인해
// VWORLD_BUILDING_LAYER 환경변수로 지정하세요. 조회에 실패하면 null을 반환하며,
// 호출부(sync-public-data.ts)는 이 경우 폴리곤 없이 좌표(마커)만 저장합니다.

import type { GeoPolygon } from "@/lib/geo";

const LAYER = process.env.VWORLD_BUILDING_LAYER ?? "LP_PA_CBND_BUBUN";

type VWorldFeatureResponse = {
  response?: {
    status?: string;
    result?: {
      featureCollection?: {
        features?: { geometry?: { type: string; coordinates: number[][][] } }[];
      };
    };
  };
};

export async function fetchParcelPolygon(lat: number, lng: number): Promise<GeoPolygon | null> {
  const key = process.env.VWORLD_KEY;
  if (!key) {
    throw new Error("VWORLD_KEY가 설정되지 않았습니다. VWorld 오픈API 인증키를 .env에 입력하세요.");
  }

  const buffer = 0.0006;
  const geomFilter = `BOX(${lng - buffer},${lat - buffer},${lng + buffer},${lat + buffer})`;

  const url = new URL("https://api.vworld.kr/req/data");
  url.searchParams.set("service", "data");
  url.searchParams.set("version", "2.0");
  url.searchParams.set("request", "GetFeature");
  url.searchParams.set("format", "json");
  url.searchParams.set("key", key);
  url.searchParams.set("data", LAYER);
  url.searchParams.set("geomFilter", geomFilter);
  url.searchParams.set("size", "1");

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const json = (await res.json()) as VWorldFeatureResponse;
  if (json.response?.status !== "OK") return null;

  const feature = json.response.result?.featureCollection?.features?.[0];
  if (!feature?.geometry || feature.geometry.type !== "Polygon") return null;

  return { type: "Polygon", coordinates: feature.geometry.coordinates };
}
