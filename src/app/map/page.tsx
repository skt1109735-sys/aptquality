import { loadDemoComplexes } from "@/lib/demoData";
import { MapPageClient } from "@/components/map/MapPageClient";
import type { MapComplex } from "@/components/map/AllComplexesMap";
import type { GeoPolygon } from "@/lib/geo";

export default function MapPage() {
  const complexes = loadDemoComplexes();

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
