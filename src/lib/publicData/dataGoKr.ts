// 공공데이터포털(data.go.kr) 국토교통부 오픈API 클라이언트.
//
// ⚠️ data.go.kr은 API별로 Swagger UI를 통해서만 정확한 Endpoint/파라미터명을 제공하며,
// 이 코드는 웹 검색으로 확인한 서비스명을 기준으로 한 "가장 유력한 기본값"입니다.
// 실제 키를 발급받은 뒤 www.data.go.kr에서 해당 서비스의 "활용신청 상세" > Swagger UI로
// 정확한 Endpoint를 확인하고, 다르다면 아래 DATA_GO_KR_PATHS 또는 .env 값을 수정하세요.
//
// 대상 서비스:
// - 국토교통부_공동주택 단지 목록제공 서비스 (data.go.kr/data/15057332/openapi.do)
// - 국토교통부_공동주택 기본 정보제공 서비스 (data.go.kr/data/15058453/openapi.do)
// - 국토교통부_아파트 매매 실거래가 자료 (data.go.kr/data/15126469/openapi.do)

const BASE_URL = "http://apis.data.go.kr";

export const DATA_GO_KR_PATHS = {
  complexList: process.env.DATA_GO_KR_COMPLEX_LIST_PATH ?? "/1613000/AptListService2/getSigunguAptList",
  complexBasicInfo:
    process.env.DATA_GO_KR_COMPLEX_INFO_PATH ?? "/1613000/AptBasisInfoServiceV3/getAphusBassInfoV3",
  aptTrade: process.env.DATA_GO_KR_APT_TRADE_PATH ?? "/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade",
};

type DataGoKrEnvelope<T> = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: { item?: T[] | T } | T[];
      totalCount?: number;
      numOfRows?: number;
      pageNo?: number;
    };
  };
};

function getServiceKey(): string {
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) {
    throw new Error(
      "DATA_GO_KR_KEY가 설정되지 않았습니다. data.go.kr에서 발급받은 인증키를 .env에 입력하세요."
    );
  }
  return key;
}

async function callDataGoKr<T>(path: string, params: Record<string, string | number>): Promise<T[]> {
  const url = new URL(BASE_URL + path);
  url.searchParams.set("serviceKey", getServiceKey());
  url.searchParams.set("type", "json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`data.go.kr 요청 실패 (${res.status}): ${path}`);
  }

  const json = (await res.json()) as DataGoKrEnvelope<T>;
  const resultCode = json.response?.header?.resultCode;
  if (resultCode && resultCode !== "00" && resultCode !== "000") {
    throw new Error(`data.go.kr 오류 응답: ${json.response?.header?.resultMsg ?? resultCode} (${path})`);
  }

  const items = json.response?.body?.items;
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (!items.item) return [];
  return Array.isArray(items.item) ? items.item : [items.item];
}

export type ComplexListItem = {
  kaptCode: string;
  kaptName: string;
  bjdCode?: string;
  as1?: string; // 시도
  as2?: string; // 시군구
  as3?: string; // 읍면동
  as4?: string; // 리
  roadAddress?: string;
};

export async function fetchComplexList(sigunguCode: string, pageNo = 1, numOfRows = 100) {
  return callDataGoKr<ComplexListItem>(DATA_GO_KR_PATHS.complexList, {
    sigunguCode,
    pageNo,
    numOfRows,
  });
}

export type ComplexBasicInfoItem = {
  kaptCode: string;
  kaptName: string;
  kaptAddr?: string;
  kaptDongCnt?: string; // 동수
  kaptdaCnt?: string; // 세대수
  kaptUsedate?: string; // 사용승인일 (YYYYMMDD)
  kaptMarea?: string; // 관리비부과면적 등
  kaptTarea?: string; // 대지면적
  kaptMparea_60?: string;
  codeHeatNm?: string; // 난방방식
  codeSaleNm?: string; // 분양형태
  kaptBcompany?: string; // 시공사
  hoCnt?: string;
};

export async function fetchComplexBasicInfo(kaptCode: string) {
  const items = await callDataGoKr<ComplexBasicInfoItem>(DATA_GO_KR_PATHS.complexBasicInfo, { kaptCode });
  return items[0] ?? null;
}

export type AptTradeItem = {
  aptNm?: string;
  dealAmount?: string;
  dealYear?: string;
  dealMonth?: string;
  dealDay?: string;
  excluUseAr?: string; // 전용면적
  floor?: string;
};

export async function fetchAptTrade(lawdCd: string, dealYmd: string) {
  return callDataGoKr<AptTradeItem>(DATA_GO_KR_PATHS.aptTrade, { LAWD_CD: lawdCd, DEAL_YMD: dealYmd });
}
