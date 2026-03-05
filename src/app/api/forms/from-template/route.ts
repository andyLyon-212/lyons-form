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

  // Create form without conditional logic first (field IDs need remapping)
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
        })),
      },
    },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  // Remap conditional logic fieldId references from old template IDs to new IDs
  const oldToNewId = new Map<string, string>();
  template.fields.forEach((oldField, i) => {
    oldToNewId.set(oldField.id, form.fields[i].id);
  });

  for (let i = 0; i < template.fields.length; i++) {
    const logic = template.fields[i].conditionalLogic as { fieldId?: string; operator?: string; value?: string } | null;
    if (logic?.fieldId) {
      const newFieldId = oldToNewId.get(logic.fieldId);
      if (newFieldId) {
        await prisma.formField.update({
          where: { id: form.fields[i].id },
          data: {
            conditionalLogic: {
              fieldId: newFieldId,
              operator: logic.operator,
              value: logic.value,
            },
          },
        });
        form.fields[i].conditionalLogic = {
          fieldId: newFieldId,
          operator: logic.operator!,
          value: logic.value!,
        };
      }
    }
  }

  return NextResponse.json(form, { status: 201 });
}
