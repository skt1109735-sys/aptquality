// 카카오 로컬 API - 주소 → 좌표 지오코딩
// https://developers.kakao.com/docs/latest/ko/local/dev-guide#address-coord

type KakaoAddressResponse = {
  documents: { x: string; y: string }[]; // x=경도, y=위도
};

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.KAKAO_REST_KEY;
  if (!key) {
    throw new Error("KAKAO_REST_KEY가 설정되지 않았습니다. 카카오 개발자 콘솔에서 발급받은 REST API 키를 .env에 입력하세요.");
  }

  const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
  url.searchParams.set("query", address);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${key}` },
  });

  if (!res.ok) {
    throw new Error(`카카오 지오코딩 요청 실패 (${res.status}): ${address}`);
  }

  const json = (await res.json()) as KakaoAddressResponse;
  const doc = json.documents[0];
  if (!doc) return null;

  return { lat: Number(doc.y), lng: Number(doc.x) };
}
