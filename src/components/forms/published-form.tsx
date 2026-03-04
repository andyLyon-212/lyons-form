"use client";

import { useState } from "react";

interface PublishedField {
  id: string;
  type: string;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  options: string[] | null;
  validationRules: Record<string, unknown> | null;
  conditionalLogic: {
    fieldId: string;
    operator: string;
    value: string;
  } | null;
}

interface PublishedFormProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    fields: PublishedField[];
  };
}

function evaluateCondition(
  logic: PublishedField["conditionalLogic"],
  values: Record<string, string>
): boolean {
  if (!logic) return true;
  const fieldValue = values[logic.fieldId] ?? "";
  switch (logic.operator) {
    case "equals":
      return fieldValue === logic.value;
    case "not_equals":
      return fieldValue !== logic.value;
    case "contains":
      return fieldValue.toLowerCase().includes(logic.value.toLowerCase());
    default:
      return true;
  }
}

export function PublishedForm({ form }: PublishedFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setValue = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const visibleFields = form.fields.filter((f) =>
    evaluateCondition(f.conditionalLogic, values)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Only include visible field values in submission
    const visibleIds = new Set(visibleFields.map((f) => f.id));
    const submissionData: Record<string, string> = {};
    for (const [key, val] of Object.entries(values)) {
      if (visibleIds.has(key)) {
        submissionData[key] = val;
      }
    }

    try {
      const res = await fetch(`/api/forms/${form.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: submissionData }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-lg">
          <h2 className="mb-2 text-2xl font-bold">Thank you!</h2>
          <p className="text-muted-foreground">
            Your response has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 rounded-xl bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {visibleFields.map((field) => (
            <div
              key={field.id}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <FormField
                field={field}
                value={values[field.id] ?? ""}
                onChange={(val) => setValue(field.id, val)}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

function FormField({
  field,
  value,
  onChange,
}: {
  field: PublishedField;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  if (field.type === "divider") {
    return <hr className="border-border" />;
  }

  if (field.type === "heading") {
    return <h3 className="text-lg font-semibold">{field.label}</h3>;
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {field.helpText && (
        <p className="mb-2 text-xs text-muted-foreground">{field.helpText}</p>
      )}
      <FieldInput
        field={field}
        value={value}
        onChange={onChange}
        inputClass={inputClass}
      />
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  inputClass,
}: {
  field: PublishedField;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
}) {
  switch (field.type) {
    case "text":
    case "email":
    case "phone":
    case "url":
      return (
        <input
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : field.type === "phone" ? "tel" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          className={inputClass}
        />
      );
    case "number":
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          min={field.validationRules?.min as number | undefined}
          max={field.validationRules?.max as number | undefined}
          className={inputClass}
        />
      );
    case "textarea":
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          rows={4}
          className={inputClass}
        />
      );
    case "date":
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          min={field.validationRules?.minDate as string | undefined}
          max={field.validationRules?.maxDate as string | undefined}
          className={inputClass}
        />
      );
    case "select":
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputClass}
        >
          <option value="">{field.placeholder || "Select an option"}</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div className="flex flex-col gap-2">
          {field.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div className="flex flex-col gap-2">
          {field.options?.map((opt) => {
            const selected = value ? value.split(",") : [];
            const checked = selected.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt];
                    onChange(next.join(","));
                  }}
                />
                {opt}
              </label>
            );
          })}
        </div>
      );
    case "rating": {
      const maxStars = (field.validationRules?.maxStars as number) ?? 5;
      const currentRating = parseInt(value) || 0;
      return (
        <div className="flex gap-1">
          {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(String(star))}
              className={`text-2xl transition-colors ${
                star <= currentRating
                  ? "text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      );
    }
    case "file":
      return (
        <input
          type="file"
          onChange={(e) => onChange(e.target.files?.[0]?.name ?? "")}
          className={inputClass}
        />
      );
    default:
      return null;
  }
}
