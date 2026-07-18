// GitHub Pages 정적 데모 전용 데이터 로더. Prisma/DB 없이 scripts/export-demo-data.ts로
// 미리 내보낸 src/data/demo-data.json을 읽어 앱 전역에서 쓰는 Prisma 타입 형태로 변환합니다.

import raw from "@/data/demo-data.json";
import type {
  ApartmentComplex,
  Facility,
  QualityRecord,
  VocRecord,
} from "@/generated/prisma/client";
import type { NoteWithAuthor } from "@/components/complex/ComplexTabs";

type RawComplex = (typeof raw)[number];

export type DemoComplex = ApartmentComplex & {
  facilities: Facility[];
  qualityRecords: QualityRecord[];
  vocRecords: VocRecord[];
  notes: NoteWithAuthor[];
};

function toDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

function convertComplex(c: RawComplex): DemoComplex {
  return {
    ...c,
    approvalDate: toDate(c.approvalDate),
    dataSyncedAt: toDate(c.dataSyncedAt),
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    facilities: c.facilities.map((f) => ({
      ...f,
      installedAt: toDate(f.installedAt),
      lastInspectedAt: toDate(f.lastInspectedAt),
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
    })),
    qualityRecords: c.qualityRecords.map((q) => ({
      ...q,
      inspectionDate: new Date(q.inspectionDate),
      createdAt: new Date(q.createdAt),
      updatedAt: new Date(q.updatedAt),
    })),
    vocRecords: c.vocRecords.map((v) => ({
      ...v,
      receivedAt: new Date(v.receivedAt),
      resolvedAt: toDate(v.resolvedAt),
      createdAt: new Date(v.createdAt),
      updatedAt: new Date(v.updatedAt),
    })),
    notes: c.notes.map((n) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      updatedAt: new Date(n.updatedAt),
    })),
  } as DemoComplex;
}

let cache: DemoComplex[] | null = null;

export function loadDemoComplexes(): DemoComplex[] {
  if (!cache) {
    cache = (raw as RawComplex[]).map(convertComplex);
  }
  return cache;
}

export function loadDemoComplex(id: string): DemoComplex | null {
  return loadDemoComplexes().find((c) => c.id === id) ?? null;
}
