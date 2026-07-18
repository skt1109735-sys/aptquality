import { NOTE_CATEGORY_LABEL } from "@/lib/constants";
import type { NoteWithAuthor } from "./ComplexTabs";

export function NotesTab({ notes }: { complexId: string; notes: NoteWithAuthor[] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-xl border border-dashed border-black/15 p-4 text-sm text-black/55 dark:border-white/15 dark:text-white/55">
        읽기 전용 데모입니다. 특이사항 작성/수정/삭제는 로그인이 가능한 배포 환경에서 지원됩니다.
      </p>

      {notes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 p-10 text-center text-sm text-black/50 dark:border-white/15 dark:text-white/50">
          등록된 특이사항이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {note.pinned && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      고정
                    </span>
                  )}
                  <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black/60 dark:bg-white/10 dark:text-white/60">
                    {NOTE_CATEGORY_LABEL[note.category] ?? note.category}
                  </span>
                  <h4 className="font-medium">{note.title}</h4>
                </div>
                <span className="text-xs text-black/45 dark:text-white/45">
                  {note.author.name ?? note.author.email} · {new Date(note.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-black/70 dark:text-white/70">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
