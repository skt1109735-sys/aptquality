export const FACILITY_CATEGORY_LABEL: Record<string, string> = {
  ELEVATOR: "승강기",
  PARKING: "주차장",
  PLAYGROUND: "놀이터",
  SECURITY: "경비실",
  CCTV: "CCTV",
  COMMUNITY: "커뮤니티시설",
  FIRE_SAFETY: "소방/안전",
  OTHER: "기타",
};

export const FACILITY_STATUS_LABEL: Record<string, string> = {
  NORMAL: "정상",
  NEEDS_REPAIR: "보수 필요",
  UNDER_REPAIR: "보수중",
  OUT_OF_SERVICE: "사용중지",
};

export const FACILITY_STATUS_COLOR: Record<string, string> = {
  NORMAL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  NEEDS_REPAIR: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  UNDER_REPAIR: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  OUT_OF_SERVICE: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export const QUALITY_CATEGORY_LABEL: Record<string, string> = {
  STRUCTURE: "구조",
  LEAK: "누수",
  FINISH: "마감",
  FACILITY: "설비",
  OTHER: "기타",
};

export const QUALITY_SEVERITY_LABEL: Record<string, string> = {
  LOW: "경미",
  MEDIUM: "보통",
  HIGH: "심각",
  CRITICAL: "긴급",
};

export const QUALITY_SEVERITY_COLOR: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  CRITICAL: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export const VOC_CHANNEL_LABEL: Record<string, string> = {
  PHONE: "전화",
  APP: "앱",
  VISIT: "방문",
  ONLINE: "온라인",
  ETC: "기타",
};

export const VOC_STATUS_LABEL: Record<string, string> = {
  RECEIVED: "접수",
  IN_PROGRESS: "처리중",
  RESOLVED: "완료",
};

export const VOC_STATUS_COLOR: Record<string, string> = {
  RECEIVED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  IN_PROGRESS: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  RESOLVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export const NOTE_CATEGORY_LABEL: Record<string, string> = {
  GENERAL: "일반",
  SAFETY: "안전",
  CONSTRUCTION: "공사",
  COMPLAINT: "민원",
  INSPECTION: "점검",
  OTHER: "기타",
};

export const SIDO_LIST = ["서울특별시", "인천광역시", "경기도", "강원특별자치도"];
