"use client";

import { useState } from "react";
import type {
  ApartmentComplex,
  Facility,
  QualityRecord,
  VocRecord,
} from "@/generated/prisma/client";
import { OverviewTab } from "./OverviewTab";
import { FacilityTab } from "./FacilityTab";
import { QualityTab } from "./QualityTab";
import { VocTab } from "./VocTab";
import { NotesTab } from "./NotesTab";

export type NoteWithAuthor = {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: { id: string; name: string | null; email: string };
};

const TABS = [
  { key: "overview", label: "기본정보" },
  { key: "facility", label: "시설현황" },
  { key: "quality", label: "품질현황" },
  { key: "voc", label: "VoC현황" },
  { key: "notes", label: "특이사항" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ComplexTabs({
  complex,
  facilities,
  qualityRecords,
  vocRecords,
  notes,
}: {
  complex: ApartmentComplex;
  facilities: Facility[];
  qualityRecords: QualityRecord[];
  vocRecords: VocRecord[];
  notes: NoteWithAuthor[];
}) {
  const [active, setActive] = useState<TabKey>("overview");

  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-black/10 dark:border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active === tab.key
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white"
            }`}
          >
            {tab.label}
            {tab.key === "voc" && vocRecords.some((v) => v.status !== "RESOLVED") && (
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-middle" />
            )}
          </button>
        ))}
      </div>

      {active === "overview" && <OverviewTab complex={complex} />}
      {active === "facility" && <FacilityTab facilities={facilities} />}
      {active === "quality" && <QualityTab qualityRecords={qualityRecords} />}
      {active === "voc" && <VocTab vocRecords={vocRecords} />}
      {active === "notes" && <NotesTab complexId={complex.id} notes={notes} />}
    </div>
  );
}
