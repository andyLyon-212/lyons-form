import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PublishedForm } from "@/components/forms/published-form";
import type { FormStyles } from "@/lib/builder-types";

export default async function PublishedFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const form = await prisma.form.findFirst({
    where: { slug, status: "published" },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  if (!form) {
    notFound();
  }

  return (
    <PublishedForm
      form={{
        id: form.id,
        title: form.title,
        description: form.description,
        styles: (form.styles as FormStyles | null) ?? undefined,
        fields: form.fields.map((f) => ({
          id: f.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          helpText: f.helpText,
          required: f.required,
          options: f.options as string[] | null,
          validationRules: f.validationRules as Record<string, unknown> | null,
          conditionalLogic: f.conditionalLogic as {
            fieldId: string;
            operator: string;
            value: string;
          } | null,
        })),
      }}
    />
  );
}
