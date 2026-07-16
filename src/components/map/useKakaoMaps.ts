"use client";

import { useEffect, useState } from "react";

let loadPromise: Promise<void> | null = null;

function loadKakaoSdk(appKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.kakao?.maps) return Promise.resolve();

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => resolve());
      };
      script.onerror = () => reject(new Error("카카오맵 SDK 로드에 실패했습니다."));
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}

export function useKakaoMaps() {
  const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  const [status, setStatus] = useState<"idle" | "ready" | "error" | "missing-key">(
    appKey ? "idle" : "missing-key"
  );

  useEffect(() => {
    if (!appKey) return;

    let cancelled = false;

    void loadKakaoSdk(appKey).then(
      () => {
        if (!cancelled) setStatus("ready");
      },
      () => {
        if (!cancelled) setStatus("error");
      }
    );

    return () => {
      cancelled = true;
    };
  }, [appKey]);

  return status;
}
