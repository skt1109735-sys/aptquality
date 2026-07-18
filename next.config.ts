import type { NextConfig } from "next";

// GitHub Pages 읽기 전용 데모 빌드용 설정. 저장소 이름(aptquality) 하위 경로로 서빙되므로
// basePath/assetPrefix를 지정합니다. 리포지토리 이름이 바뀌면 이 값도 함께 바꿔야 합니다.
const repoName = "aptquality";

const nextConfig: NextConfig = {
  output: "export",
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
