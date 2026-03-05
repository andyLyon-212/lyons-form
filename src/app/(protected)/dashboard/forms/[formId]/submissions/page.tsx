import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubmissionsView } from "@/components/submissions/submissions-view";

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const session = await auth();
  const { formId } = await params;

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session!.user!.id },
    include: {
      fields: { orderBy: { order: "asc" } },
      submissions: { orderBy: { submittedAt: "desc" } },
    },
  });

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Form not found</p>
      </div>
    );
  }

  const fields = form.fields
    .filter((f) => f.type !== "divider" && f.type !== "heading")
    .map((f) => ({
      id: f.id,
      label: f.label,
      type: f.type,
    }));

  const submissions = form.submissions.map((s) => ({
    id: s.id,
    data: s.data as Record<string, string>,
    submittedAt: s.submittedAt.toISOString(),
  }));

  return (
    <SubmissionsView
      formId={form.id}
      formTitle={form.title}
      fields={fields}
      submissions={submissions}
    />
  );
}
