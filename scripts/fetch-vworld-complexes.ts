// 실제 존재하는 아파트 단지의 진짜 필지 경계(연속지적도)를 VWorld에서 가져와
// src/data/demo-data.json을 만듭니다. 이름/주소/좌표/폴리곤은 실제 데이터이고,
// 세대수/동수/준공년도 등은 공개적으로 알려진 값(추정 포함) — K-APT API가 현재
// 불안정해서 정확한 관리비/시설 데이터까지는 못 가져옵니다. 시설/품질/VoC/특이사항은
// 여전히 목업입니다 (실제 사내 데이터 연동 전까지).

import "dotenv/config";
import { writeFileSync } from "node:fs";

const KEY = process.env.VWORLD_KEY!;
const REFERER = "https://skt1109735-sys.github.io/aptquality/";

type ComplexSeed = {
  kaptCode: string;
  name: string;
  jibunAddress: string;
  sido: string;
  sigungu: string;
  dong: string;
  totalHouseholds: number;
  totalBuildings: number;
  approvalYear: number;
  heatingType: string;
  saleType: string;
};

// 실제 존재하는 단지들 (이름/주소는 실제, 세대수 등 수치는 공개적으로 알려진 값 기준)
const SEEDS: ComplexSeed[] = [
  {
    kaptCode: "REAL0001",
    name: "은마아파트",
    jibunAddress: "서울특별시 강남구 대치동 316",
    sido: "서울특별시",
    sigungu: "강남구",
    dong: "대치동",
    totalHouseholds: 4424,
    totalBuildings: 28,
    approvalYear: 1979,
    heatingType: "중앙난방",
    saleType: "분양",
  },
  {
    kaptCode: "REAL0002",
    name: "잠실주공5단지",
    jibunAddress: "서울특별시 송파구 잠실동 27",
    sido: "서울특별시",
    sigungu: "송파구",
    dong: "잠실동",
    totalHouseholds: 3930,
    totalBuildings: 30,
    approvalYear: 1978,
    heatingType: "중앙난방",
    saleType: "분양",
  },
  {
    kaptCode: "REAL0003",
    name: "목동파라곤",
    jibunAddress: "서울특별시 양천구 목동 917",
    sido: "서울특별시",
    sigungu: "양천구",
    dong: "목동",
    totalHouseholds: 1234,
    totalBuildings: 12,
    approvalYear: 2003,
    heatingType: "개별난방",
    saleType: "분양",
  },
  {
    kaptCode: "REAL0004",
    name: "정자동 푸르지오시티",
    jibunAddress: "경기도 성남시 분당구 정자동 162",
    sido: "경기도",
    sigungu: "성남시 분당구",
    dong: "정자동",
    totalHouseholds: 620,
    totalBuildings: 1,
    approvalYear: 2011,
    heatingType: "개별난방",
    saleType: "분양",
  },
  {
    kaptCode: "REAL0005",
    name: "매탄동 현대힐스테이트아파트",
    jibunAddress: "경기도 수원시 영통구 매탄동 176",
    sido: "경기도",
    sigungu: "수원시 영통구",
    dong: "매탄동",
    totalHouseholds: 1220,
    totalBuildings: 12,
    approvalYear: 2008,
    heatingType: "개별난방",
    saleType: "분양",
  },
  {
    kaptCode: "REAL0006",
    name: "더샵송도센트럴파크Ⅲ",
    jibunAddress: "인천광역시 연수구 송도동 92",
    sido: "인천광역시",
    sigungu: "연수구",
    dong: "송도동",
    totalHouseholds: 1300,
    totalBuildings: 5,
    approvalYear: 2013,
    heatingType: "지역난방",
    saleType: "분양",
  },
  {
    kaptCode: "REAL0007",
    name: "구월동 팬더아파트",
    jibunAddress: "인천광역시 남동구 구월동 139",
    sido: "인천광역시",
    sigungu: "남동구",
    dong: "구월동",
    totalHouseholds: 320,
    totalBuildings: 4,
    approvalYear: 1992,
    heatingType: "개별난방",
    saleType: "분양",
  },
];

async function geocode(address: string) {
  const url = new URL("https://api.vworld.kr/req/address");
  url.searchParams.set("service", "address");
  url.searchParams.set("request", "getcoord");
  url.searchParams.set("version", "2.0");
  url.searchParams.set("crs", "epsg:4326");
  url.searchParams.set("address", address);
  url.searchParams.set("type", "parcel");
  url.searchParams.set("key", KEY);
  const res = await fetch(url, { headers: { Referer: REFERER } });
  return res.json();
}

async function getParcelPolygon(lat: number, lng: number) {
  const url = new URL("https://api.vworld.kr/req/data");
  url.searchParams.set("service", "data");
  url.searchParams.set("version", "2.0");
  url.searchParams.set("request", "GetFeature");
  url.searchParams.set("format", "json");
  url.searchParams.set("key", KEY);
  url.searchParams.set("data", "LP_PA_CBND_BUBUN");
  url.searchParams.set("geomFilter", `POINT(${lng} ${lat})`);
  url.searchParams.set("size", "1");
  const res = await fetch(url, { headers: { Referer: REFERER } });
  return res.json();
}

async function buildComplex(seed: ComplexSeed, index: number) {
  const geo = await geocode(seed.jibunAddress);
  const point = geo?.response?.result?.point;
  if (!point) {
    console.log(`  ! 지오코딩 실패: ${seed.name}`);
    return null;
  }
  const lat = Number(point.y);
  const lng = Number(point.x);

  const parcelRes = await getParcelPolygon(lat, lng);
  const feature = parcelRes?.response?.result?.featureCollection?.features?.[0];
  const geometry = feature?.geometry;
  const realAddr = feature?.properties?.addr ?? seed.jibunAddress;

  let polygon = null;
  if (geometry?.type === "MultiPolygon") {
    // MultiPolygon의 첫 폴리곤(대부분 단일)만 사용
    polygon = { type: "Polygon", coordinates: geometry.coordinates[0] };
  } else if (geometry?.type === "Polygon") {
    polygon = geometry;
  }

  console.log(`  -> ${seed.name}: (${lat}, ${lng}) 폴리곤 ${polygon ? "확보" : "없음"}`);

  const now = new Date().toISOString();
  const totalFloorArea = Math.round(seed.totalHouseholds * 84 * 1.15);
  const landArea = polygon ? null : Math.round(seed.totalHouseholds * 30);

  return {
    id: `real-${index}-${seed.kaptCode.toLowerCase()}`,
    kaptCode: seed.kaptCode,
    name: seed.name,
    roadAddress: realAddr,
    jibunAddress: realAddr,
    sido: seed.sido,
    sigungu: seed.sigungu,
    dong: seed.dong,
    totalHouseholds: seed.totalHouseholds,
    totalBuildings: seed.totalBuildings,
    approvalDate: `${seed.approvalYear}-01-01T00:00:00.000Z`,
    heatingType: seed.heatingType,
    saleType: seed.saleType,
    floorAreaRatio: null,
    buildingCoverageRatio: null,
    totalFloorArea,
    landArea,
    latitude: lat,
    longitude: lng,
    polygon,
    polygonSource: polygon ? "VWORLD" : null,
    dataSyncedAt: now,
    createdAt: now,
    updatedAt: now,
    facilities: [],
    qualityRecords: [],
    vocRecords: [],
    notes: [],
  };
}

async function main() {
  const results = [];
  for (let i = 0; i < SEEDS.length; i++) {
    console.log(`[${SEEDS[i].name}] 처리 중...`);
    const complex = await buildComplex(SEEDS[i], i);
    if (complex) results.push(complex);
    await new Promise((r) => setTimeout(r, 500));
  }
  writeFileSync("src/data/real-complexes.json", JSON.stringify(results, null, 2));
  console.log(`완료: ${results.length}개 단지 -> src/data/real-complexes.json`);
}

main();
