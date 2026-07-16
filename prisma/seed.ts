import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 실제 사내 데이터 연동 전까지 화면/구조 검증용 목업 데이터입니다.
// 단지명은 실제 브랜드/시공사명을 사용하지 않은 가상의 이름입니다.
const COMPLEXES = [
  {
    kaptCode: "A10000001",
    name: "대치마을1단지",
    sido: "서울특별시",
    sigungu: "강남구",
    dong: "대치동",
    roadAddress: "서울특별시 강남구 대치동 123-4",
    lat: 37.4944,
    lng: 127.0619,
    households: 1240,
    buildings: 14,
    approvalYear: 1998,
    heatingType: "지역난방",
    saleType: "분양",
    far: 218,
    bcr: 19.5,
  },
  {
    kaptCode: "A10000002",
    name: "잠실중앙마을3단지",
    sido: "서울특별시",
    sigungu: "송파구",
    dong: "잠실동",
    roadAddress: "서울특별시 송파구 잠실동 45-6",
    lat: 37.5133,
    lng: 127.1,
    households: 2180,
    buildings: 22,
    approvalYear: 2005,
    heatingType: "지역난방",
    saleType: "분양",
    far: 245,
    bcr: 21.2,
  },
  {
    kaptCode: "A10000003",
    name: "송도한빛마을2단지",
    sido: "인천광역시",
    sigungu: "연수구",
    dong: "송도동",
    roadAddress: "인천광역시 연수구 송도동 789-1",
    lat: 37.3894,
    lng: 126.6329,
    households: 980,
    buildings: 9,
    approvalYear: 2012,
    heatingType: "개별난방",
    saleType: "분양",
    far: 189,
    bcr: 17.8,
  },
  {
    kaptCode: "A10000004",
    name: "구월신도시1단지",
    sido: "인천광역시",
    sigungu: "남동구",
    dong: "구월동",
    roadAddress: "인천광역시 남동구 구월동 321-9",
    lat: 37.4483,
    lng: 126.7025,
    households: 1560,
    buildings: 16,
    approvalYear: 2001,
    heatingType: "중앙난방",
    saleType: "분양",
    far: 205,
    bcr: 18.9,
  },
  {
    kaptCode: "A10000005",
    name: "정자늘푸른마을4단지",
    sido: "경기도",
    sigungu: "성남시 분당구",
    dong: "정자동",
    roadAddress: "경기도 성남시 분당구 정자동 55-3",
    lat: 37.3665,
    lng: 127.1086,
    households: 1420,
    buildings: 15,
    approvalYear: 1996,
    heatingType: "지역난방",
    saleType: "분양",
    far: 178,
    bcr: 16.4,
  },
  {
    kaptCode: "A10000006",
    name: "매탄푸른숲마을",
    sido: "경기도",
    sigungu: "수원시 영통구",
    dong: "매탄동",
    roadAddress: "경기도 수원시 영통구 매탄동 210-7",
    lat: 37.2668,
    lng: 127.0489,
    households: 760,
    buildings: 8,
    approvalYear: 2009,
    heatingType: "개별난방",
    saleType: "임대",
    far: 195,
    bcr: 18.1,
  },
  {
    kaptCode: "A10000007",
    name: "일산호수마을5단지",
    sido: "경기도",
    sigungu: "고양시 일산동구",
    dong: "장항동",
    roadAddress: "경기도 고양시 일산동구 장항동 88-2",
    lat: 37.6733,
    lng: 126.7738,
    households: 1890,
    buildings: 19,
    approvalYear: 1994,
    heatingType: "지역난방",
    saleType: "분양",
    far: 169,
    bcr: 15.7,
  },
  {
    kaptCode: "A10000008",
    name: "춘천석사중앙마을",
    sido: "강원특별자치도",
    sigungu: "춘천시",
    dong: "석사동",
    roadAddress: "강원특별자치도 춘천시 석사동 12-1",
    lat: 37.8564,
    lng: 127.7519,
    households: 540,
    buildings: 6,
    approvalYear: 2016,
    heatingType: "개별난방",
    saleType: "분양",
    far: 182,
    bcr: 17.2,
  },
];

const FACILITY_TEMPLATES: {
  category: string;
  name: string;
  status: string;
}[] = [
  { category: "ELEVATOR", name: "동별 승강기", status: "NORMAL" },
  { category: "PARKING", name: "지하주차장", status: "NORMAL" },
  { category: "PLAYGROUND", name: "어린이놀이터", status: "NORMAL" },
  { category: "SECURITY", name: "경비실", status: "NORMAL" },
  { category: "CCTV", name: "단지 내 CCTV", status: "NORMAL" },
  { category: "COMMUNITY", name: "커뮤니티센터", status: "NORMAL" },
  { category: "FIRE_SAFETY", name: "소방설비", status: "NORMAL" },
];

const QUALITY_CATEGORIES = ["STRUCTURE", "LEAK", "FINISH", "FACILITY", "OTHER"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const VOC_CHANNELS = ["PHONE", "APP", "VISIT", "ONLINE", "ETC"];
const VOC_STATUSES = ["RECEIVED", "IN_PROGRESS", "RESOLVED"];
const VOC_TITLES = [
  "주차장 조명 고장 문의",
  "층간소음 민원",
  "엘리베이터 소음 문의",
  "놀이터 시설 파손 신고",
  "누수 관련 문의",
  "관리비 산정 문의",
  "단지 내 흡연 민원",
  "커뮤니티센터 예약 문의",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function rectanglePolygon(lat: number, lng: number) {
  const dLat = 0.0007;
  const dLng = 0.0009;
  return {
    type: "Polygon",
    coordinates: [
      [
        [lng - dLng, lat - dLat],
        [lng + dLng, lat - dLat],
        [lng + dLng, lat + dLat],
        [lng - dLng, lat + dLat],
        [lng - dLng, lat - dLat],
      ],
    ],
  };
}

async function main() {
  const adminPassword = await bcrypt.hash("aptquality123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@aptquality.local" },
    update: {},
    create: {
      email: "admin@aptquality.local",
      name: "관리자",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  for (let i = 0; i < COMPLEXES.length; i++) {
    const c = COMPLEXES[i];
    const totalFloorArea = Math.round(c.households * 84 * 1.1);
    const landArea = Math.round(totalFloorArea / (c.far / 100));

    const complex = await prisma.apartmentComplex.upsert({
      where: { kaptCode: c.kaptCode },
      update: {},
      create: {
        kaptCode: c.kaptCode,
        name: c.name,
        roadAddress: c.roadAddress,
        jibunAddress: c.roadAddress,
        sido: c.sido,
        sigungu: c.sigungu,
        dong: c.dong,
        totalHouseholds: c.households,
        totalBuildings: c.buildings,
        approvalDate: new Date(`${c.approvalYear}-06-01`),
        heatingType: c.heatingType,
        saleType: c.saleType,
        floorAreaRatio: c.far,
        buildingCoverageRatio: c.bcr,
        totalFloorArea,
        landArea,
        latitude: c.lat,
        longitude: c.lng,
        polygon: rectanglePolygon(c.lat, c.lng),
        polygonSource: "MOCK",
        dataSyncedAt: new Date(),
      },
    });

    // 시설현황
    for (let j = 0; j < FACILITY_TEMPLATES.length; j++) {
      const tpl = FACILITY_TEMPLATES[j];
      const seed = i * 7 + j;
      const status = seed % 9 === 0 ? "NEEDS_REPAIR" : seed % 13 === 0 ? "UNDER_REPAIR" : "NORMAL";
      await prisma.facility.create({
        data: {
          complexId: complex.id,
          category: tpl.category as never,
          name: tpl.name,
          quantity: 1 + (seed % 6),
          status: status as never,
          installedAt: new Date(`${c.approvalYear}-06-01`),
          lastInspectedAt: new Date("2026-04-01"),
          memo: status === "NORMAL" ? null : "정기점검에서 경미한 이상 발견, 후속 조치 필요",
        },
      });
    }

    // 품질현황(하자)
    for (let k = 0; k < 4; k++) {
      const seed = i * 5 + k;
      const defectCount = 3 + (seed % 12);
      const resolvedCount = Math.max(0, defectCount - (seed % 5));
      await prisma.qualityRecord.create({
        data: {
          complexId: complex.id,
          inspectionDate: new Date(2025, k * 3, 10 + i),
          category: pick(QUALITY_CATEGORIES, seed) as never,
          severity: pick(SEVERITIES, seed + k) as never,
          defectCount,
          resolvedCount,
          score: Math.round(70 + ((seed * 13) % 30)),
          inspector: "품질진단팀",
          memo: "정기 품질점검 결과",
        },
      });
    }

    // VoC현황
    for (let v = 0; v < 6; v++) {
      const seed = i * 11 + v;
      const status = pick(VOC_STATUSES, seed);
      await prisma.vocRecord.create({
        data: {
          complexId: complex.id,
          receivedAt: new Date(2026, v, 5 + i),
          channel: pick(VOC_CHANNELS, seed) as never,
          category: pick(QUALITY_CATEGORIES, seed + 2),
          title: pick(VOC_TITLES, seed),
          content: `${pick(VOC_TITLES, seed)} 관련 입주민 문의 내용입니다.`,
          status: status as never,
          assignee: status === "RECEIVED" ? null : "관리사무소",
          resolvedAt: status === "RESOLVED" ? new Date(2026, v, 12 + i) : null,
        },
      });
    }

    // 특이사항
    await prisma.specialNote.create({
      data: {
        complexId: complex.id,
        authorId: admin.id,
        title: "정기 순회점검 메모",
        content: "단지 정기 순회점검 시 특이사항 없음. 다음 점검 예정일 확인 필요.",
        category: "INSPECTION",
        pinned: i === 0,
      },
    });
  }

  console.log("시드 데이터 생성 완료");
  console.log("관리자 로그인 계정: admin@aptquality.local / aptquality123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
