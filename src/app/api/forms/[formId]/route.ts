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
    include: { fields: { orderBy: { order: "asc" } } },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json(form);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { formId } = await params;
  const body = await request.json();

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const { title, description, fields, styles, status } = body;

  // Update form metadata
  await prisma.form.update({
    where: { id: formId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(styles !== undefined && { styles }),
      ...(status !== undefined && { status }),
    },
  });

  // If fields are provided, replace all fields
  if (fields) {
    await prisma.formField.deleteMany({ where: { formId } });

    if (fields.length > 0) {
      await prisma.formField.createMany({
        data: fields.map(
          (
            field: {
              id: string;
              type: string;
              label: string;
              placeholder?: string;
              helpText?: string;
              required: boolean;
              options?: string[];
              validationRules?: Record<string, unknown>;
              conditionalLogic?: { fieldId: string; operator: string; value: string };
              order: number;
            },
            index: number
          ) => ({
            id: field.id,
            formId,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder ?? null,
            helpText: field.helpText ?? null,
            required: field.required,
            options: field.options ?? null,
            validationRules: field.validationRules ?? null,
            conditionalLogic: field.conditionalLogic ?? null,
            order: index,
          })
        ),
      });
    }
  }

  const updatedForm = await prisma.form.findFirst({
    where: { id: formId },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(updatedForm);
}

export async function DELETE(
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
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  await prisma.form.delete({ where: { id: formId } });

  return NextResponse.json({ success: true });
}
