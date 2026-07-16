import { prisma } from "@/lib/prisma";
import { MapPageClient } from "@/components/map/MapPageClient";
import type { MapComplex } from "@/components/map/AllComplexesMap";
import type { GeoPolygon } from "@/lib/geo";

export default async function MapPage() {
  const complexes = await prisma.apartmentComplex.findMany({
    select: {
      id: true,
      name: true,
      roadAddress: true,
      latitude: true,
      longitude: true,
      polygon: true,
      vocRecords: { select: { status: true } },
    },
    orderBy: { name: "asc" },
  });

  const mapComplexes: MapComplex[] = complexes.map((c) => ({
    id: c.id,
    name: c.name,
    roadAddress: c.roadAddress,
    latitude: c.latitude,
    longitude: c.longitude,
    polygon: c.polygon as GeoPolygon | null,
    unresolvedVocCount: c.vocRecords.filter((v) => v.status !== "RESOLVED").length,
  }));

  return <MapPageClient complexes={mapComplexes} />;
}
