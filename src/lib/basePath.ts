// GitHub Pages 정적 데모의 basePath. next.config.ts의 repoName과 반드시 일치해야 합니다.
// 동적 라우트(/complex/[id])로의 클라이언트 사이드 소프트 내비게이션이 정적 export에서
// 깨지는 문제가 있어(Next 16 canary), 해당 링크들은 next/link 대신 일반 <a> 태그로
// 하드 내비게이션을 강제합니다. 이때 basePath를 직접 붙여줘야 합니다.
export const BASE_PATH = "/aptquality";
