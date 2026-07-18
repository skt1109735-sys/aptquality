// 현재 DB의 데이터를 정적 JSON으로 내보냅니다. GitHub Pages용 읽기 전용 데모 빌드가
// Prisma/DB 없이 이 JSON만으로 정적 페이지를 생성할 수 있도록 하기 위함입니다.

import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const complexes = await prisma.apartmentComplex.findMany({
    include: {
      facilities: { orderBy: { category: "asc" } },
      qualityRecords: { orderBy: { inspectionDate: "asc" } },
      vocRecords: { orderBy: { receivedAt: "desc" } },
      notes: {
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        include: { author: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  mkdirSync("src/data", { recursive: true });
  writeFileSync("src/data/demo-data.json", JSON.stringify(complexes, null, 2));
  console.log(`${complexes.length}개 단지 데이터를 src/data/demo-data.json 으로 내보냈습니다.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
