# 아파트 단지 현황/품질 대시보드

아파트 단지 기본현황(호갱노노 스타일 카드 + 지도 폴리곤)과 사내 시설/품질/VoC 현황, 그리고
사용자가 직접 관리하는 단지별 특이사항을 한 곳에서 보여주는 대시보드입니다.

## 기술 스택

- Next.js 16 (App Router) + TypeScript, Tailwind CSS
- PostgreSQL (로컬은 `prisma dev`로 실행, Docker 불필요) + Prisma ORM 7
- NextAuth.js (Credentials) - 자체 계정 로그인
- 카카오맵 JS SDK - 지도/폴리곤 렌더링
- recharts - 품질점수 추이 차트

## 처음 시작하기

1. 의존성 설치

   ```bash
   npm install
   ```

2. 로컬 Postgres 실행 (별도 터미널에서 계속 켜둡니다)

   ```bash
   npm run db:dev
   ```

   실행 후 출력되는 `DATABASE_URL` / `SHADOW_DATABASE_URL` 값을 `.env`에 반영하세요
   (`.env.example` 참고). 이 프로젝트는 `prisma migrate dev` 대신 `prisma db push`로
   스키마를 동기화합니다 (로컬 dev DB 환경에서 더 안정적으로 동작함을 확인했습니다).

3. 스키마 적용 + 목업 데이터 시드

   ```bash
   npm run db:push
   npm run db:seed
   ```

   시드 후 관리자 계정: `admin@aptquality.local` / `aptquality123!`

4. 개발 서버 실행

   ```bash
   npm run dev
   ```

   http://localhost:3000 에서 확인합니다.

## 환경변수

`.env.example`을 `.env`로 복사해 채워 넣으세요.

| 변수 | 용도 | 발급처 |
|---|---|---|
| `DATABASE_URL` / `SHADOW_DATABASE_URL` | 로컬 Postgres 연결 | `npm run db:dev` 출력값 |
| `NEXTAUTH_SECRET` | NextAuth 세션 암호화 | 임의의 랜덤 문자열 |
| `DATA_GO_KR_KEY` | 단지 기본현황(K-APT) 연동 | https://www.data.go.kr |
| `NEXT_PUBLIC_KAKAO_JS_KEY`, `KAKAO_REST_KEY` | 지도/지오코딩 | https://developers.kakao.com |
| `VWORLD_KEY` | 단지 폴리곤(지적경계) 조회 | https://www.vworld.kr |

카카오/공공데이터/브이월드 키가 없어도 목업 시드 데이터로 대시보드 전체(카드/지도 UI 뼈대/상세/특이사항 CRUD)를 확인할 수 있습니다.
다만 지도는 카카오 JS 키가 있어야 실제로 렌더링됩니다.

## 공공데이터 동기화

서울/인천/경기/강원 시군구 단위로 K-APT 단지 목록·기본정보를 가져와 DB에 반영합니다.

```bash
npm run sync:public-data
```

- `DATA_GO_KR_KEY`가 필요합니다. `KAKAO_REST_KEY`가 있으면 주소를 좌표로 변환하고,
  `VWORLD_KEY`가 있으면 단지 경계 폴리곤도 함께 채웁니다(둘 다 없어도 나머지 정보는 저장됩니다).
- `src/lib/publicData/dataGoKr.ts`의 Endpoint는 웹 검색으로 확인한 서비스명을 기준으로 한
  기본값입니다. 키 발급 후 data.go.kr의 Swagger UI에서 정확한 Endpoint를 다시 확인하고,
  다르면 `.env`의 `DATA_GO_KR_*_PATH` 값으로 덮어쓰세요.
- `src/lib/publicData/regionCodes.ts`의 법정동코드는 행정구역 개편으로 바뀔 수 있으니
  실제 동기화 전에 https://www.code.go.kr 에서 최신값인지 확인하세요.

## 주요 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run db:dev` | 로컬 Postgres 실행 |
| `npm run db:push` | Prisma 스키마 → DB 반영 |
| `npm run db:seed` | 목업 데이터 시드 |
| `npm run db:studio` | Prisma Studio (DB GUI) |
| `npm run sync:public-data` | 공공데이터 동기화 |

## 폴더 구조

```
prisma/schema.prisma       데이터 모델
prisma/seed.ts             목업 시드 데이터
src/app/                   페이지 (대시보드 / 지도 / 단지 상세 / 로그인)
src/components/            UI 컴포넌트 (map/, complex/ 하위 포함)
src/lib/                   prisma 클라이언트, 인증, 서버 액션, 공공데이터 클라이언트
scripts/sync-public-data.ts 공공데이터 동기화 스크립트
```

## 아직 사내 데이터와 연동되지 않은 부분

시설현황/품질현황/VoC현황은 현재 목업 데이터로 채워져 있습니다. 실제 사내 시스템(DB/API)이
정해지면 `prisma/schema.prisma`의 `Facility`/`QualityRecord`/`VocRecord` 모델 필드를
기준으로 데이터를 채우는 동기화 로직만 추가하면 되도록 설계되어 있습니다.
