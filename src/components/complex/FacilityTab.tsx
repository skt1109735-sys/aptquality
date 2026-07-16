import type { Facility } from "@/generated/prisma/client";
import {
  FACILITY_CATEGORY_LABEL,
  FACILITY_STATUS_COLOR,
  FACILITY_STATUS_LABEL,
} from "@/lib/constants";

export function FacilityTab({ facilities }: { facilities: Facility[] }) {
  if (facilities.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/15 p-10 text-center text-sm text-black/50 dark:border-white/15 dark:text-white/50">
        등록된 시설현황이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/[0.03] text-xs text-black/55 dark:bg-white/[0.04] dark:text-white/55">
          <tr>
            <th className="px-4 py-2.5 font-medium">구분</th>
            <th className="px-4 py-2.5 font-medium">시설명</th>
            <th className="px-4 py-2.5 font-medium">수량</th>
            <th className="px-4 py-2.5 font-medium">상태</th>
            <th className="px-4 py-2.5 font-medium">최근 점검일</th>
            <th className="px-4 py-2.5 font-medium">메모</th>
          </tr>
        </thead>
        <tbody>
          {facilities.map((f) => (
            <tr key={f.id} className="border-t border-black/5 dark:border-white/10">
              <td className="px-4 py-2.5">{FACILITY_CATEGORY_LABEL[f.category] ?? f.category}</td>
              <td className="px-4 py-2.5 font-medium">{f.name}</td>
              <td className="px-4 py-2.5 tabular-nums">{f.quantity ?? "-"}</td>
              <td className="px-4 py-2.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${FACILITY_STATUS_COLOR[f.status]}`}
                >
                  {FACILITY_STATUS_LABEL[f.status] ?? f.status}
                </span>
              </td>
              <td className="px-4 py-2.5 tabular-nums text-black/60 dark:text-white/60">
                {f.lastInspectedAt ? new Date(f.lastInspectedAt).toLocaleDateString("ko-KR") : "-"}
              </td>
              <td className="px-4 py-2.5 text-black/60 dark:text-white/60">{f.memo ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
