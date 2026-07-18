// src/data/demo-data.json의 각 단지에 대해 OpenStreetMap Overpass API에서 실제 건물
// footprint를 조회하고, 그 점들의 convex hull을 단지 폴리곤으로 사용합니다.
// (목업 데이터의 좌표는 실제 지번과 대응되지 않지만, 좌표 자체는 실제 위치이므로
// 주변 실존 건물 형태를 가져와 "사각형이 아닌" 폴리곤을 만드는 용도입니다.)
// API 키 불필요, 공개 Overpass 서버 사용. 재실행 시 이미 처리된(OSM) 단지는 건너뜁니다.

import { readFileSync, writeFileSync } from "node:fs";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RADII = [150, 300, 500]; // m, 단계적으로 넓혀가며 시도

type LatLon = { lat: number; lon: number };

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function queryBuildings(lat: number, lng: number, radius: number): Promise<LatLon[]> {
  const query = `[out:json][timeout:25];way(around:${radius},${lat},${lng})["building"];out geom;`;

  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Accept: "application/json",
        "User-Agent": "aptquality-demo/1.0 (static demo polygon fetch script)",
      },
      body: query,
    });

    if (res.status === 429 || res.status === 504) {
      const wait = attempt * 8000;
      console.log(`  ! rate limited (${res.status}), ${wait / 1000}초 대기 후 재시도 (${attempt}/5)`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      throw new Error(`Overpass 요청 실패: ${res.status} ${await res.text().catch(() => "")}`);
    }

    const json = (await res.json()) as { elements: { geometry?: LatLon[] }[] };
    return json.elements.flatMap((el) => el.geometry ?? []);
  }

  throw new Error("Overpass rate limit 재시도 초과");
}

// Andrew's monotone chain convex hull
function convexHull(points: [number, number][]): [number, number][] {
  const pts = [...new Set(points.map((p) => p.join(",")))]
    .map((s) => s.split(",").map(Number) as [number, number])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;

  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

function loadData() {
  return JSON.parse(readFileSync("src/data/demo-data.json", "utf-8"));
}

function saveData(raw: unknown) {
  writeFileSync("src/data/demo-data.json", JSON.stringify(raw, null, 2));
}

async function main() {
  const raw = loadData();

  for (const complex of raw) {
    if (complex.latitude === null || complex.longitude === null) continue;
    if (complex.polygonSource === "OSM") {
      console.log(`[${complex.name}] 이미 처리됨, 건너뜀`);
      continue;
    }

    let hullLngLat: [number, number][] | null = null;

    for (const radius of RADII) {
      console.log(`[${complex.name}] Overpass 조회 (반경 ${radius}m)...`);
      const points = await queryBuildings(complex.latitude, complex.longitude, radius);
      if (points.length >= 3) {
        const hull = convexHull(points.map((p) => [p.lat, p.lon] as [number, number]));
        if (hull.length >= 3) {
          hullLngLat = hull.map(([lat, lon]) => [lon, lat]);
          console.log(`  -> 건물 ${points.length}개 지점, hull ${hull.length}각형`);
          break;
        }
      }
      await sleep(2000);
    }

    if (hullLngLat) {
      const ring = [...hullLngLat, hullLngLat[0]];
      complex.polygon = { type: "Polygon", coordinates: [ring] };
      complex.polygonSource = "OSM";
    } else {
      console.log(`  -> 건물 데이터를 찾지 못해 기존 폴리곤 유지: ${complex.name}`);
    }

    saveData(raw); // 단지별로 즉시 저장 (rate limit으로 중단돼도 진행 상황 보존)
    await sleep(2000);
  }

  console.log("완료: src/data/demo-data.json 갱신됨");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
