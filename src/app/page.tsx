import { loadDemoComplexes } from "@/lib/demoData";
import { DashboardClient } from "@/components/DashboardClient";
import type { ComplexCardData } from "@/components/ComplexCard";

export default function DashboardPage() {
  const complexes = loadDemoComplexes();

  const cards: ComplexCardData[] = complexes.map((c) => {
    const scores = c.qualityRecords.map((q) => q.score).filter((s): s is number => s !== null);
    const avgQualityScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    const unresolvedVocCount = c.vocRecords.filter((v) => v.status !== "RESOLVED").length;

    return {
      id: c.id,
      name: c.name,
      roadAddress: c.roadAddress,
      sido: c.sido,
      sigungu: c.sigungu,
      dong: c.dong,
      totalHouseholds: c.totalHouseholds,
      totalBuildings: c.totalBuildings,
      approvalDate: c.approvalDate,
      floorAreaRatio: c.floorAreaRatio,
      avgQualityScore,
      unresolvedVocCount,
    };
  });

  return <DashboardClient cards={cards} />;
}
