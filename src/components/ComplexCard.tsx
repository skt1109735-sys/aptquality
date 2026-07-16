import Link from "next/link";

export type ComplexCardData = {
  id: string;
  name: string;
  roadAddress: string | null;
  sido: string | null;
  sigungu: string | null;
  dong: string | null;
  totalHouseholds: number | null;
  totalBuildings: number | null;
  approvalDate: Date | null;
  floorAreaRatio: number | null;
  avgQualityScore: number | null;
  unresolvedVocCount: number;
};

export function ComplexCard({ complex }: { complex: ComplexCardData }) {
  const approvalYear = complex.approvalDate ? new Date(complex.approvalDate).getFullYear() : null;

  return (
    <Link
      href={`/complex/${complex.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-black/10 bg-[var(--background)] p-4 transition-shadow hover:shadow-md dark:border-white/10"
    >
      <div>
        <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {complex.name}
        </h3>
        <p className="mt-0.5 text-sm text-black/55 dark:text-white/55">
          {complex.roadAddress ?? [complex.sido, complex.sigungu, complex.dong].filter(Boolean).join(" ")}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        <div>
          <dt className="text-black/45 dark:text-white/45">세대수</dt>
          <dd className="font-medium">
            {complex.totalHouseholds ? `${complex.totalHouseholds.toLocaleString()}세대` : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-black/45 dark:text-white/45">동수</dt>
          <dd className="font-medium">{complex.totalBuildings ? `${complex.totalBuildings}개동` : "-"}</dd>
        </div>
        <div>
          <dt className="text-black/45 dark:text-white/45">준공년도</dt>
          <dd className="font-medium">{approvalYear ? `${approvalYear}년` : "-"}</dd>
        </div>
        <div>
          <dt className="text-black/45 dark:text-white/45">용적률</dt>
          <dd className="font-medium">{complex.floorAreaRatio ? `${complex.floorAreaRatio}%` : "-"}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center gap-2 border-t border-black/10 pt-3 text-xs dark:border-white/10">
        <span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          품질점수 {complex.avgQualityScore !== null ? Math.round(complex.avgQualityScore) : "-"}
        </span>
        <span
          className={`rounded-full px-2 py-1 font-medium ${
            complex.unresolvedVocCount > 0
              ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          }`}
        >
          미해결 VoC {complex.unresolvedVocCount}건
        </span>
      </div>
    </Link>
  );
}
