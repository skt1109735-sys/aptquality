import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ComplexTabs } from "@/components/complex/ComplexTabs";

export default async function ComplexDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [complex, session] = await Promise.all([
    prisma.apartmentComplex.findUnique({
      where: { id },
      include: {
        facilities: { orderBy: { category: "asc" } },
        qualityRecords: { orderBy: { inspectionDate: "asc" } },
        vocRecords: { orderBy: { receivedAt: "desc" } },
        notes: {
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
          include: { author: { select: { id: true, name: true, email: true } } },
        },
      },
    }),
    auth(),
  ]);

  if (!complex) {
    notFound();
  }

  const approvalYear = complex.approvalDate ? new Date(complex.approvalDate).getFullYear() : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm text-black/50 dark:text-white/50">
          {[complex.sido, complex.sigungu, complex.dong].filter(Boolean).join(" ")}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{complex.name}</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          {complex.roadAddress}
          {approvalYear && ` · ${approvalYear}년 준공`}
          {complex.totalHouseholds && ` · ${complex.totalHouseholds.toLocaleString()}세대`}
        </p>
      </div>

      <ComplexTabs
        complex={complex}
        facilities={complex.facilities}
        qualityRecords={complex.qualityRecords}
        vocRecords={complex.vocRecords}
        notes={complex.notes}
        currentUser={session?.user ? { id: session.user.id, role: session.user.role } : null}
      />
    </div>
  );
}
