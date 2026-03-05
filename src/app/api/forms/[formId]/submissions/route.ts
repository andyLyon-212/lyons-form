import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { formId } = await params;

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
    include: {
      fields: { orderBy: { order: "asc" } },
      submissions: { orderBy: { submittedAt: "desc" } },
    },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json({
    form: {
      id: form.id,
      title: form.title,
    },
    fields: form.fields.map((f) => ({
      id: f.id,
      label: f.label,
      type: f.type,
    })),
    submissions: form.submissions.map((s) => ({
      id: s.id,
      data: s.data,
      submittedAt: s.submittedAt,
    })),
  });
}
