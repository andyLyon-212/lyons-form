import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FormBuilder } from "@/components/builder/form-builder";
import type { ConditionalLogic, FormStyles } from "@/lib/builder-types";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { formId } = await params;

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  if (!form) notFound();

  return (
    <FormBuilder
      initialForm={{
        id: form.id,
        title: form.title,
        description: form.description,
        styles: form.styles as FormStyles | null,
        fields: form.fields.map((f) => ({
          id: f.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          helpText: f.helpText,
          required: f.required,
          options: f.options as string[] | null,
          validationRules: f.validationRules as Record<string, unknown> | null,
          conditionalLogic: f.conditionalLogic as ConditionalLogic | null,
          order: f.order,
        })),
      }}
    />
  );
}
