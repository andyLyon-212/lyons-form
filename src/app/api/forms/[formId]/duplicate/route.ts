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

  // Create duplicate without conditional logic first (field IDs need remapping)
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
        })),
      },
    },
    include: { fields: { orderBy: { order: "asc" } }, _count: { select: { submissions: true } } },
  });

  // Remap conditional logic fieldId references from old IDs to new IDs
  const oldToNewId = new Map<string, string>();
  form.fields.forEach((oldField, i) => {
    oldToNewId.set(oldField.id, duplicate.fields[i].id);
  });

  for (let i = 0; i < form.fields.length; i++) {
    const logic = form.fields[i].conditionalLogic as { fieldId?: string; operator?: string; value?: string } | null;
    if (logic?.fieldId) {
      const newFieldId = oldToNewId.get(logic.fieldId);
      if (newFieldId) {
        await prisma.formField.update({
          where: { id: duplicate.fields[i].id },
          data: {
            conditionalLogic: {
              fieldId: newFieldId,
              operator: logic.operator,
              value: logic.value,
            },
          },
        });
      }
    }
  }

  return NextResponse.json(duplicate, { status: 201 });
}
