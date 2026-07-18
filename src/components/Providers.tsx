import type { ReactNode } from "react";

// GitHub Pages 정적 데모 빌드에는 NextAuth 서버(API 라우트)가 없으므로
// SessionProvider 없이 children을 그대로 렌더링합니다.
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
