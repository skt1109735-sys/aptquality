import type { ApartmentComplex } from "@/generated/prisma/client";
import { ComplexLocationMap } from "@/components/map/ComplexLocationMap";
import type { GeoPolygon } from "@/lib/geo";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-black/5 py-2.5 text-sm last:border-0 dark:border-white/10">
      <dt className="text-black/55 dark:text-white/55">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export function OverviewTab({ complex }: { complex: ApartmentComplex }) {
  const approvalYear = complex.approvalDate ? new Date(complex.approvalDate).getFullYear() : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <dl className="lg:col-span-2 rounded-xl border border-black/10 p-4 dark:border-white/10">
        <InfoRow label="단지명" value={complex.name} />
        <InfoRow label="주소" value={complex.roadAddress ?? "-"} />
        <InfoRow label="세대수" value={complex.totalHouseholds ? `${complex.totalHouseholds.toLocaleString()}세대` : "-"} />
        <InfoRow label="동수" value={complex.totalBuildings ? `${complex.totalBuildings}개동` : "-"} />
        <InfoRow label="준공년도" value={approvalYear ? `${approvalYear}년` : "-"} />
        <InfoRow label="난방방식" value={complex.heatingType ?? "-"} />
        <InfoRow label="분양형태" value={complex.saleType ?? "-"} />
        <InfoRow label="용적률" value={complex.floorAreaRatio ? `${complex.floorAreaRatio}%` : "-"} />
        <InfoRow label="건폐율" value={complex.buildingCoverageRatio ? `${complex.buildingCoverageRatio}%` : "-"} />
        <InfoRow
          label="연면적"
          value={complex.totalFloorArea ? `${complex.totalFloorArea.toLocaleString()}㎡` : "-"}
        />
        <InfoRow label="대지면적" value={complex.landArea ? `${complex.landArea.toLocaleString()}㎡` : "-"} />
        <InfoRow label="K-APT 코드" value={complex.kaptCode ?? "미연동"} />
        <InfoRow
          label="데이터 갱신일"
          value={complex.dataSyncedAt ? new Date(complex.dataSyncedAt).toLocaleDateString("ko-KR") : "-"}
        />
      </dl>

      <div className="lg:col-span-3">
        <ComplexLocationMap
          latitude={complex.latitude}
          longitude={complex.longitude}
          polygon={complex.polygon as GeoPolygon | null}
          name={complex.name}
        />
      </div>
    </div>
  );
}
