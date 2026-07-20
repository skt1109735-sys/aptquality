// src/data/real-complexes.json(실제 이름/주소/좌표/폴리곤)에 목업 시설/품질/VoC/특이사항
// 데이터를 붙여 최종 src/data/demo-data.json을 만듭니다.
// 시설현황/품질현황/VoC현황/특이사항은 사내 데이터 연동 전까지 계속 목업입니다.

import { readFileSync, writeFileSync } from "node:fs";

const FACILITY_TEMPLATES = [
  { category: "ELEVATOR", name: "동별 승강기" },
  { category: "PARKING", name: "지하주차장" },
  { category: "PLAYGROUND", name: "어린이놀이터" },
  { category: "SECURITY", name: "경비실" },
  { category: "CCTV", name: "단지 내 CCTV" },
  { category: "COMMUNITY", name: "커뮤니티센터" },
  { category: "FIRE_SAFETY", name: "소방설비" },
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

const AUTHOR = { id: "demo-admin", name: "관리자", email: "admin@aptquality.local" };

function buildOperationalData(complexId: string, index: number, approvalYear: number) {
  const facilities = FACILITY_TEMPLATES.map((tpl, j) => {
    const seed = index * 7 + j;
    const status = seed % 9 === 0 ? "NEEDS_REPAIR" : seed % 13 === 0 ? "UNDER_REPAIR" : "NORMAL";
    return {
      id: `${complexId}-fac-${j}`,
      complexId,
      category: tpl.category,
      name: tpl.name,
      quantity: 1 + (seed % 6),
      status,
      installedAt: `${approvalYear}-06-01T00:00:00.000Z`,
      lastInspectedAt: "2026-04-01T00:00:00.000Z",
      memo: status === "NORMAL" ? null : "정기점검에서 경미한 이상 발견, 후속 조치 필요",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const qualityRecords = Array.from({ length: 4 }, (_, k) => {
    const seed = index * 5 + k;
    const defectCount = 3 + (seed % 12);
    const resolvedCount = Math.max(0, defectCount - (seed % 5));
    return {
      id: `${complexId}-qr-${k}`,
      complexId,
      inspectionDate: new Date(2025, k * 3, 10 + index).toISOString(),
      category: pick(QUALITY_CATEGORIES, seed),
      severity: pick(SEVERITIES, seed + k),
      defectCount,
      resolvedCount,
      score: Math.round(70 + ((seed * 13) % 30)),
      inspector: "품질진단팀",
      memo: "정기 품질점검 결과",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const vocRecords = Array.from({ length: 6 }, (_, v) => {
    const seed = index * 11 + v;
    const status = pick(VOC_STATUSES, seed);
    return {
      id: `${complexId}-voc-${v}`,
      complexId,
      receivedAt: new Date(2026, v, 5 + index).toISOString(),
      channel: pick(VOC_CHANNELS, seed),
      category: pick(QUALITY_CATEGORIES, seed + 2),
      title: pick(VOC_TITLES, seed),
      content: `${pick(VOC_TITLES, seed)} 관련 입주민 문의 내용입니다.`,
      status,
      assignee: status === "RECEIVED" ? null : "관리사무소",
      resolvedAt: status === "RESOLVED" ? new Date(2026, v, 12 + index).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const notes = [
    {
      id: `${complexId}-note-0`,
      complexId,
      authorId: AUTHOR.id,
      title: "정기 순회점검 메모",
      content: "단지 정기 순회점검 시 특이사항 없음. 다음 점검 예정일 확인 필요.",
      category: "INSPECTION",
      pinned: index === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: AUTHOR,
    },
  ];

  return { facilities, qualityRecords, vocRecords, notes };
}

function main() {
  const complexes = JSON.parse(readFileSync("src/data/real-complexes.json", "utf-8"));

  const final = complexes.map((c: Record<string, unknown>, index: number) => {
    const approvalYear = new Date(c.approvalDate as string).getFullYear();
    const ops = buildOperationalData(c.id as string, index, approvalYear);
    return { ...c, ...ops };
  });

  writeFileSync("src/data/demo-data.json", JSON.stringify(final, null, 2));
  console.log(`완료: ${final.length}개 실제 단지 -> src/data/demo-data.json`);
}

main();
