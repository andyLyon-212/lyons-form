import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = await request.json();

  const template = await prisma.form.findFirst({
    where: { id: templateId, isTemplate: true },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const slug = `form-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const form = await prisma.form.create({
    data: {
      userId: session.user.id,
      title: template.title,
      description: template.description,
      slug,
      styles: template.styles ?? undefined,
      status: "draft",
      fields: {
        create: template.fields.map((field) => ({
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
    include: { fields: true },
  });

  return NextResponse.json(form, { status: 201 });
}
