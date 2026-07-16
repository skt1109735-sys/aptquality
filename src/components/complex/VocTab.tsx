import type { VocRecord } from "@/generated/prisma/client";
import { VOC_CHANNEL_LABEL, VOC_STATUS_COLOR, VOC_STATUS_LABEL } from "@/lib/constants";

export function VocTab({ vocRecords }: { vocRecords: VocRecord[] }) {
  if (vocRecords.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/15 p-10 text-center text-sm text-black/50 dark:border-white/15 dark:text-white/50">
        등록된 VoC가 없습니다.
      </p>
    );
  }

  const unresolvedCount = vocRecords.filter((v) => v.status !== "RESOLVED").length;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-black/60 dark:text-white/60">
        전체 {vocRecords.length}건 중 <span className="font-semibold text-amber-600 dark:text-amber-400">미해결 {unresolvedCount}건</span>
      </p>

      <div className="flex flex-col gap-2">
        {vocRecords.map((v) => (
          <div key={v.id} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${VOC_STATUS_COLOR[v.status]}`}>
                  {VOC_STATUS_LABEL[v.status] ?? v.status}
                </span>
                <span className="text-xs text-black/45 dark:text-white/45">
                  {VOC_CHANNEL_LABEL[v.channel] ?? v.channel}
                </span>
                <h4 className="font-medium">{v.title}</h4>
              </div>
              <span className="text-xs tabular-nums text-black/45 dark:text-white/45">
                {new Date(v.receivedAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">{v.content}</p>
            {v.assignee && (
              <p className="mt-2 text-xs text-black/45 dark:text-white/45">담당: {v.assignee}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
