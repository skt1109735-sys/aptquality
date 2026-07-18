// 실제 OSM 건물 데이터를 좌표 근접으로 매칭하는 방식(fetch-osm-polygons.ts)은 이 데모의
// 좌표가 실존하지 않는 가상 단지라서 "가장 가까운 진짜 아파트 건물"이 도로 건너편이거나
// 단독 건물 하나뿐인 등 마커와 동떨어진 결과가 나오는 근본적인 한계가 있었습니다.
//
// 대신 각 단지의 실제 동수(totalBuildings)만큼 판상형 동을 격자로 배치해 그 폴리곤들을
// 합쳐(buffer+union), 마커 좌표를 중심으로 하는 "동 사이 홈이 파인" 비볼록 다각형을
// 생성합니다. 실제 특정 단지의 정확한 모양은 아니지만, 최소한 (a) 마커 위치와 일치하고
// (b) 단지마다 동수에 비례해 다르게 생긴, 사각형이 아닌 형태가 됩니다.

import { readFileSync, writeFileSync } from "node:fs";
import * as turf from "@turf/turf";
import type { Feature, Polygon, MultiPolygon } from "geojson";

const BUFFER_KM = 0.006;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 로컬 미터 오프셋(dx=동쪽, dy=북쪽) -> 위경도
function offset(lat: number, lng: number, dxMeters: number, dyMeters: number): [number, number] {
  const dLat = dyMeters / 111320;
  const dLng = dxMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  return [lng + dLng, lat + dLat];
}

function rectPolygon(
  centerLat: number,
  centerLng: number,
  cxMeters: number,
  cyMeters: number,
  widthMeters: number,
  lengthMeters: number,
  rotationDeg: number
): Feature<Polygon> {
  const hw = widthMeters / 2;
  const hl = lengthMeters / 2;
  const rad = (rotationDeg * Math.PI) / 180;
  const corners: [number, number][] = [
    [-hw, -hl],
    [hw, -hl],
    [hw, hl],
    [-hw, hl],
  ].map(([x, y]) => [x * Math.cos(rad) - y * Math.sin(rad), x * Math.sin(rad) + y * Math.cos(rad)]);

  const ring = corners.map(([x, y]) => offset(centerLat, centerLng, cxMeters + x, cyMeters + y));
  ring.push(ring[0]);
  return turf.polygon([ring]);
}

function largestPolygon(feature: Feature<Polygon | MultiPolygon>): Feature<Polygon> {
  if (feature.geometry.type === "Polygon") return feature as Feature<Polygon>;
  const polys = feature.geometry.coordinates.map((coords) => turf.polygon(coords));
  polys.sort((a, b) => turf.area(b) - turf.area(a));
  return polys[0];
}

function generateComplexPolygon(
  lat: number,
  lng: number,
  buildingCount: number,
  seed: number
): Feature<Polygon> {
  const rand = mulberry32(seed);
  const n = Math.max(3, Math.min(buildingCount || 6, 14));

  const cols = Math.max(2, Math.round(Math.sqrt(n * 1.4)));
  const rows = Math.ceil(n / cols);

  const colSpacing = 34 + rand() * 8; // 동 사이 간격(동->동 중심 거리, m)
  const rowSpacing = 45 + rand() * 10;
  const buildingWidth = 14 + rand() * 4;
  const buildingLength = 46 + rand() * 18;
  const layoutRotation = rand() * 40 - 20; // 단지 전체 방향(도로 방향 등에 맞춰 살짝 회전)

  const gridWidth = (cols - 1) * colSpacing;
  const gridHeight = (rows - 1) * rowSpacing;

  const buildings: Feature<Polygon>[] = [];
  let placed = 0;
  for (let r = 0; r < rows && placed < n; r++) {
    const rowOffsetX = (r % 2 === 1 ? colSpacing * 0.4 : 0) * (rand() > 0.5 ? 1 : -1);
    for (let c = 0; c < cols && placed < n; c++) {
      const localX = c * colSpacing - gridWidth / 2 + rowOffsetX;
      const localY = r * rowSpacing - gridHeight / 2;
      const jitterX = (rand() - 0.5) * 6;
      const jitterY = (rand() - 0.5) * 6;
      const buildingRotation = layoutRotation + (rand() - 0.5) * 12;

      const rad = (layoutRotation * Math.PI) / 180;
      const rx = localX * Math.cos(rad) - localY * Math.sin(rad);
      const ry = localX * Math.sin(rad) + localY * Math.cos(rad);

      buildings.push(
        rectPolygon(
          lat,
          lng,
          rx + jitterX,
          ry + jitterY,
          buildingWidth,
          buildingLength,
          buildingRotation
        )
      );
      placed++;
    }
  }

  const buffered = buildings.map((b) => turf.buffer(b, BUFFER_KM, { units: "kilometers" })!);
  let unioned: Feature<Polygon | MultiPolygon> = buffered[0];
  for (let i = 1; i < buffered.length; i++) {
    const u = turf.union(turf.featureCollection([unioned, buffered[i]]));
    if (u) unioned = u as Feature<Polygon | MultiPolygon>;
  }

  return turf.rewind(largestPolygon(unioned), { reverse: false }) as Feature<Polygon>;
}

function loadData() {
  return JSON.parse(readFileSync("src/data/demo-data.json", "utf-8"));
}

function saveData(raw: unknown) {
  writeFileSync("src/data/demo-data.json", JSON.stringify(raw, null, 2));
}

function main() {
  const raw = loadData();

  raw.forEach((complex: Record<string, unknown>, index: number) => {
    if (complex.latitude === null || complex.longitude === null) return;

    const polygon = generateComplexPolygon(
      complex.latitude as number,
      complex.longitude as number,
      (complex.totalBuildings as number) ?? 6,
      index * 7919 + 13 // 단지별 고정 시드 (재실행해도 같은 모양)
    );

    complex.polygon = polygon.geometry;
    complex.polygonSource = "SYNTHESIZED";
    console.log(`[${complex.name}] 동 ${complex.totalBuildings}개 배치 -> 폴리곤 생성 완료`);
  });

  saveData(raw);
  console.log("완료: src/data/demo-data.json 갱신됨");
}

main();
