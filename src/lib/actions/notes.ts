"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type NoteActionState = { error?: string } | undefined;

export async function createNote(
  complexId: string,
  _prevState: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "GENERAL");
  const pinned = formData.get("pinned") === "on";

  if (!title || !content) {
    return { error: "제목과 내용을 입력해주세요." };
  }

  await prisma.specialNote.create({
    data: {
      complexId,
      authorId: session.user.id,
      title,
      content,
      category: category as never,
      pinned,
    },
  });

  revalidatePath(`/complex/${complexId}`);
  return undefined;
}

export async function updateNote(
  noteId: string,
  complexId: string,
  _prevState: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "로그인이 필요합니다." };
  }

  const note = await prisma.specialNote.findUnique({ where: { id: noteId } });
  if (!note) {
    return { error: "특이사항을 찾을 수 없습니다." };
  }
  if (note.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "작성자 또는 관리자만 수정할 수 있습니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "GENERAL");
  const pinned = formData.get("pinned") === "on";

  if (!title || !content) {
    return { error: "제목과 내용을 입력해주세요." };
  }

  await prisma.specialNote.update({
    where: { id: noteId },
    data: { title, content, category: category as never, pinned },
  });

  revalidatePath(`/complex/${complexId}`);
  return undefined;
}

export async function deleteNote(noteId: string, complexId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("로그인이 필요합니다.");
  }

  const note = await prisma.specialNote.findUnique({ where: { id: noteId } });
  if (!note) return;
  if (note.authorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("작성자 또는 관리자만 삭제할 수 있습니다.");
  }

  await prisma.specialNote.delete({ where: { id: noteId } });
  revalidatePath(`/complex/${complexId}`);
}
