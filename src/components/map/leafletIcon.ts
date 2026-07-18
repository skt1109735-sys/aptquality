import type * as LeafletNS from "leaflet";

// Leaflet의 기본 마커 아이콘은 번들러 환경에서 이미지 경로가 깨지는 고질적인 문제가 있어
// CDN(unpkg) 이미지로 명시적으로 지정합니다.
export function configureDefaultIcon(L: typeof LeafletNS) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}
