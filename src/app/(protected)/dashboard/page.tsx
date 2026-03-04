import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await auth();

  const [forms, templates] = await Promise.all([
    prisma.form.findMany({
      where: { userId: session!.user!.id },
      include: { _count: { select: { submissions: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.form.findMany({
      where: { isTemplate: true },
      include: { _count: { select: { fields: true } } },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <DashboardContent
      initialForms={forms}
      templates={templates}
      userName={session?.user?.name ?? "User"}
    />
  );
}
