import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">읽기 전용 데모</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        이 페이지는 GitHub Pages에 배포된 정적 데모입니다. 로그인, 특이사항 작성/수정/삭제 등
        서버 기능은 이 데모에서 비활성화되어 있습니다. 전체 기능은 Postgres + Next.js 서버를
        갖춘 환경(Vercel 등)에서 동작합니다.
      </p>
      <Link href="/" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
        ← 대시보드로 돌아가기
      </Link>
    </div>
  );
}
