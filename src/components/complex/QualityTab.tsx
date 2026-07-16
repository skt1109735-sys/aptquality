import type { QualityRecord } from "@/generated/prisma/client";
import { QUALITY_CATEGORY_LABEL, QUALITY_SEVERITY_COLOR, QUALITY_SEVERITY_LABEL } from "@/lib/constants";
import { QualityTrendChart } from "./QualityTrendChart";

export function QualityTab({ qualityRecords }: { qualityRecords: QualityRecord[] }) {
  if (qualityRecords.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/15 p-10 text-center text-sm text-black/50 dark:border-white/15 dark:text-white/50">
        등록된 품질현황이 없습니다.
      </p>
    );
  }

  const chartData = qualityRecords
    .filter((r) => r.score !== null)
    .map((r) => ({
      date: new Date(r.inspectionDate).toLocaleDateString("ko-KR", { year: "2-digit", month: "short" }),
      score: Math.round(r.score as number),
    }));

  const sortedDesc = [...qualityRecords].sort(
    (a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
        <h3 className="mb-3 text-sm font-semibold">품질점수 추이</h3>
        <QualityTrendChart data={chartData} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[0.03] text-xs text-black/55 dark:bg-white/[0.04] dark:text-white/55">
            <tr>
              <th className="px-4 py-2.5 font-medium">점검일</th>
              <th className="px-4 py-2.5 font-medium">구분</th>
              <th className="px-4 py-2.5 font-medium">심각도</th>
              <th className="px-4 py-2.5 font-medium">하자건수</th>
              <th className="px-4 py-2.5 font-medium">조치완료</th>
              <th className="px-4 py-2.5 font-medium">점수</th>
              <th className="px-4 py-2.5 font-medium">점검자</th>
            </tr>
          </thead>
          <tbody>
            {sortedDesc.map((r) => (
              <tr key={r.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-4 py-2.5 tabular-nums">
                  {new Date(r.inspectionDate).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-2.5">{QUALITY_CATEGORY_LABEL[r.category] ?? r.category}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${QUALITY_SEVERITY_COLOR[r.severity]}`}
                  >
                    {QUALITY_SEVERITY_LABEL[r.severity] ?? r.severity}
                  </span>
                </td>
                <td className="px-4 py-2.5 tabular-nums">{r.defectCount}</td>
                <td className="px-4 py-2.5 tabular-nums">{r.resolvedCount}</td>
                <td className="px-4 py-2.5 tabular-nums font-medium">{r.score ?? "-"}</td>
                <td className="px-4 py-2.5 text-black/60 dark:text-white/60">{r.inspector ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
