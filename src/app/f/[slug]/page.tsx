import { prisma } from "@/lib/prisma";
import { PublishedForm } from "@/components/forms/published-form";
import type { FormStyles } from "@/lib/builder-types";

export default async function PublishedFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const form = await prisma.form.findFirst({
    where: { slug },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  if (!form || form.status !== "published") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted p-4">
        <div className="w-full max-w-md rounded-lg bg-card p-8 text-center shadow-md">
          <div className="mb-4 text-4xl">🚫</div>
          <h1 className="mb-2 text-xl font-bold">Form Not Available</h1>
          <p className="text-sm text-muted-foreground">
            This form is not currently accepting responses. It may have been
            unpublished or removed by its owner.
          </p>
        </div>
      </div>
    );
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
