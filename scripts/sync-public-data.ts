// 공공데이터포털(K-APT) 단지 목록/기본정보를 서울·인천·경기·강원 시군구 단위로 동기화합니다.
// 사용법: DATA_GO_KR_KEY, KAKAO_REST_KEY, (선택) VWORLD_KEY를 .env에 설정한 뒤
//   npm run sync:public-data
//
// 각 API 키가 없거나 호출에 실패해도 스크립트 전체가 중단되지 않도록, 단지 단위로
// 에러를 잡아 로그만 남기고 다음 단지로 넘어갑니다.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { fetchComplexList, fetchComplexBasicInfo } from "../src/lib/publicData/dataGoKr";
import { geocodeAddress } from "../src/lib/publicData/kakaoLocal";
import { fetchParcelPolygon } from "../src/lib/publicData/vworld";
import { REGION_CODES } from "../src/lib/publicData/regionCodes";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function parseKaptDate(yyyymmdd?: string): Date | null {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null;
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function syncRegion(region: { sido: string; sigungu: string; code: string }) {
  console.log(`\n[${region.sido} ${region.sigungu}] 단지 목록 조회 중...`);

  const list = await fetchComplexList(region.code);
  console.log(`  -> ${list.length}개 단지`);

  for (const item of list) {
    try {
      const basic = await fetchComplexBasicInfo(item.kaptCode);
      const roadAddress = basic?.kaptAddr ?? item.roadAddress ?? null;

      let coords: { lat: number; lng: number } | null = null;
      if (roadAddress) {
        coords = await geocodeAddress(roadAddress).catch((err) => {
          console.warn(`  ! 지오코딩 실패 (${item.kaptName}): ${(err as Error).message}`);
          return null;
        });
      }

      let polygon = null;
      if (coords) {
        polygon = await fetchParcelPolygon(coords.lat, coords.lng).catch((err) => {
          console.warn(`  ! 폴리곤 조회 실패 (${item.kaptName}): ${(err as Error).message}`);
          return null;
        });
      }

      await prisma.apartmentComplex.upsert({
        where: { kaptCode: item.kaptCode },
        update: {
          name: basic?.kaptName ?? item.kaptName,
          roadAddress: roadAddress ?? undefined,
          sido: region.sido,
          sigungu: region.sigungu,
          totalHouseholds: basic?.kaptdaCnt ? Number(basic.kaptdaCnt) : undefined,
          totalBuildings: basic?.kaptDongCnt ? Number(basic.kaptDongCnt) : undefined,
          approvalDate: parseKaptDate(basic?.kaptUsedate) ?? undefined,
          heatingType: basic?.codeHeatNm ?? undefined,
          saleType: basic?.codeSaleNm ?? undefined,
          totalFloorArea: basic?.kaptMarea ? Number(basic.kaptMarea) : undefined,
          landArea: basic?.kaptTarea ? Number(basic.kaptTarea) : undefined,
          latitude: coords?.lat,
          longitude: coords?.lng,
          polygon: polygon ?? undefined,
          polygonSource: polygon ? "VWORLD" : undefined,
          dataSyncedAt: new Date(),
        },
        create: {
          kaptCode: item.kaptCode,
          name: basic?.kaptName ?? item.kaptName,
          roadAddress: roadAddress ?? undefined,
          sido: region.sido,
          sigungu: region.sigungu,
          totalHouseholds: basic?.kaptdaCnt ? Number(basic.kaptdaCnt) : undefined,
          totalBuildings: basic?.kaptDongCnt ? Number(basic.kaptDongCnt) : undefined,
          approvalDate: parseKaptDate(basic?.kaptUsedate) ?? undefined,
          heatingType: basic?.codeHeatNm ?? undefined,
          saleType: basic?.codeSaleNm ?? undefined,
          totalFloorArea: basic?.kaptMarea ? Number(basic.kaptMarea) : undefined,
          landArea: basic?.kaptTarea ? Number(basic.kaptTarea) : undefined,
          latitude: coords?.lat,
          longitude: coords?.lng,
          polygon: polygon ?? undefined,
          polygonSource: polygon ? "VWORLD" : undefined,
          dataSyncedAt: new Date(),
        },
      });

      console.log(`  ✓ ${item.kaptName}`);
    } catch (err) {
      console.warn(`  ! ${item.kaptName} 동기화 실패: ${(err as Error).message}`);
    }
  }
}

async function main() {
  if (!process.env.DATA_GO_KR_KEY) {
    console.error("DATA_GO_KR_KEY가 없습니다. .env를 확인하세요.");
    process.exit(1);
  }

  for (const region of REGION_CODES) {
    await syncRegion(region);
  }

  console.log("\n공공데이터 동기화 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
