import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    include: { fields: { orderBy: { order: "asc" } } },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const slug = `form-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const duplicate = await prisma.form.create({
    data: {
      userId: session.user.id,
      title: `${form.title} (Copy)`,
      description: form.description,
      slug,
      styles: form.styles ?? undefined,
      status: "draft",
      fields: {
        create: form.fields.map((field) => ({
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          helpText: field.helpText,
          required: field.required,
          validationRules: field.validationRules ?? undefined,
          options: field.options ?? undefined,
          order: field.order,
          conditionalLogic: field.conditionalLogic ?? undefined,
        })),
      },
    },
    include: { _count: { select: { submissions: true } } },
  });

  return NextResponse.json(duplicate, { status: 201 });
}
