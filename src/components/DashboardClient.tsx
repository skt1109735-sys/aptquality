"use client";

import { useMemo, useState } from "react";
import { ComplexCard, type ComplexCardData } from "@/components/ComplexCard";
import { StatTile } from "@/components/StatTile";
import { SIDO_LIST } from "@/lib/constants";

export function DashboardClient({ cards }: { cards: ComplexCardData[] }) {
  const [q, setQ] = useState("");
  const [sido, setSido] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return cards.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query) ||
        (c.roadAddress ?? "").toLowerCase().includes(query) ||
        (c.dong ?? "").toLowerCase().includes(query);
      const matchesSido = !sido || c.sido === sido;
      return matchesQuery && matchesSido;
    });
  }, [cards, q, sido]);

  const complexesWithScore = cards.filter((c) => c.avgQualityScore !== null);
  const overallAvgQuality = complexesWithScore.length
    ? complexesWithScore.reduce((sum, c) => sum + (c.avgQualityScore ?? 0), 0) / complexesWithScore.length
    : null;
  const totalUnresolvedVoc = cards.reduce((sum, c) => sum + c.unresolvedVocCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">아파트 단지 현황 대시보드</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          단지 기본현황과 시설/품질/VoC 현황을 한눈에 확인하세요.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="전체 단지 수" value={`${cards.length}개`} />
        <StatTile
          label="평균 품질점수"
          value={overallAvgQuality !== null ? overallAvgQuality.toFixed(1) : "-"}
          hint="100점 만점"
        />
        <StatTile label="미해결 VoC" value={`${totalUnresolvedVoc}건`} />
        <StatTile label="검색 결과" value={`${filtered.length}개`} />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="단지명, 주소, 동으로 검색"
          className="min-w-[220px] flex-1 rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/15"
        />
        <select
          value={sido}
          onChange={(e) => setSido(e.target.value)}
          className="rounded-md border border-black/15 bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/15"
        >
          <option value="">전체 시/도</option>
          {SIDO_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 p-10 text-center text-sm text-black/50 dark:border-white/15 dark:text-white/50">
          조건에 맞는 단지가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <ComplexCard key={c.id} complex={c} />
          ))}
        </div>
      )}
    </div>
  );
}
