"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createNote, deleteNote, updateNote, type NoteActionState } from "@/lib/actions/notes";
import { NOTE_CATEGORY_LABEL } from "@/lib/constants";
import type { NoteWithAuthor } from "./ComplexTabs";

const CATEGORY_KEYS = Object.keys(NOTE_CATEGORY_LABEL);

function NoteForm({
  action,
  initial,
  submitLabel,
  onCancel,
  onSuccess,
}: {
  action: (state: NoteActionState, formData: FormData) => Promise<NoteActionState>;
  initial?: { title: string; content: string; category: string; pinned: boolean };
  submitLabel: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      onSuccess?.();
    }
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-black/60 dark:text-white/60">제목</label>
        <input
          name="title"
          required
          defaultValue={initial?.title}
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-black/60 dark:text-white/60">내용</label>
        <textarea
          name="content"
          required
          rows={3}
          defaultValue={initial?.content}
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/15"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-black/60 dark:text-white/60">분류</label>
          <select
            name="category"
            defaultValue={initial?.category ?? "GENERAL"}
            className="rounded-md border border-black/15 bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/15"
          >
            {CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {NOTE_CATEGORY_LABEL[key]}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="pinned" defaultChecked={initial?.pinned} />
          상단 고정
        </label>
      </div>

      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {pending ? "저장 중..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}

function NoteItem({
  note,
  complexId,
  canManage,
}: {
  note: NoteWithAuthor;
  complexId: string;
  canManage: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <NoteForm
        action={updateNote.bind(null, note.id, complexId)}
        initial={{ title: note.title, content: note.content, category: note.category, pinned: note.pinned }}
        submitLabel="수정 완료"
        onCancel={() => setEditing(false)}
        onSuccess={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
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

      {canManage && (
        <div className="mt-3 flex gap-3 text-xs">
          <button
            onClick={() => setEditing(true)}
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            수정
          </button>
          <button
            onClick={() => {
              if (confirm("이 특이사항을 삭제할까요?")) {
                deleteNote(note.id, complexId);
              }
            }}
            className="font-medium text-rose-600 hover:underline dark:text-rose-400"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

export function NotesTab({
  complexId,
  notes,
  currentUser,
}: {
  complexId: string;
  notes: NoteWithAuthor[];
  currentUser: { id: string; role: string } | null;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {currentUser ? (
        showForm ? (
          <NoteForm
            action={createNote.bind(null, complexId)}
            submitLabel="등록"
            onCancel={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            + 특이사항 작성
          </button>
        )
      ) : (
        <p className="rounded-xl border border-dashed border-black/15 p-4 text-sm text-black/55 dark:border-white/15 dark:text-white/55">
          <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            로그인
          </Link>
          하면 특이사항을 작성할 수 있습니다.
        </p>
      )}

      {notes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 p-10 text-center text-sm text-black/50 dark:border-white/15 dark:text-white/50">
          등록된 특이사항이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              complexId={complexId}
              canManage={!!currentUser && (currentUser.id === note.authorId || currentUser.role === "ADMIN")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
