"use client";

import { useState } from "react";
import { AllComplexesMap, type MapComplex } from "./AllComplexesMap";
import { BASE_PATH } from "@/lib/basePath";

export function MapPageClient({ complexes }: { complexes: MapComplex[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col sm:flex-row">
      <aside className="order-2 h-64 w-full overflow-y-auto border-black/10 sm:order-1 sm:h-full sm:w-80 sm:border-r dark:border-white/10">
        <div className="border-b border-black/10 p-3 text-sm font-semibold dark:border-white/10">
          단지 목록 ({complexes.length})
        </div>
        <ul>
          {complexes.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setSelectedId(c.id)}
                className={`flex w-full flex-col gap-0.5 border-b border-black/5 px-3 py-2.5 text-left text-sm transition-colors dark:border-white/10 ${
                  selectedId === c.id
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                }`}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-black/50 dark:text-white/50">{c.roadAddress}</span>
                {c.unresolvedVocCount > 0 && (
                  <span className="mt-0.5 w-fit rounded-full bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    미해결 VoC {c.unresolvedVocCount}건
                  </span>
                )}
                <a
                  href={`${BASE_PATH}/complex/${c.id}/`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 w-fit text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  상세보기 →
                </a>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="order-1 h-80 flex-1 sm:order-2 sm:h-full">
        <AllComplexesMap complexes={complexes} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </div>
  );
}
