"use client";

import { useState, useRef } from "react";
import {
  DEFAULT_FORM_STYLES,
  type FormStyles,
} from "@/lib/builder-types";
import {
  getBackgroundStyle,
  getContainerStyle,
  getFontSizeClass,
  getGoogleFontsUrl,
} from "@/lib/style-utils";

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
    styles?: FormStyles;
    fields: PublishedField[];
  };
}

function mergeStyles(saved?: FormStyles): FormStyles {
  if (!saved) return DEFAULT_FORM_STYLES;
  return {
    background: { ...DEFAULT_FORM_STYLES.background, ...saved.background },
    primaryColor: saved.primaryColor ?? DEFAULT_FORM_STYLES.primaryColor,
    fontFamily: saved.fontFamily ?? DEFAULT_FORM_STYLES.fontFamily,
    fontSize: saved.fontSize ?? DEFAULT_FORM_STYLES.fontSize,
    button: { ...DEFAULT_FORM_STYLES.button, ...saved.button },
    container: { ...DEFAULT_FORM_STYLES.container, ...saved.container },
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

  const styles = mergeStyles(form.styles);
  const fontSizeClass = getFontSizeClass(styles.fontSize);

  const setValue = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const visibleFields = form.fields.filter((f) =>
    evaluateCondition(f.conditionalLogic, values)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

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
      <div
        className="flex min-h-screen items-center justify-center p-4"
        style={{
          ...getBackgroundStyle(styles.background),
          fontFamily: `"${styles.fontFamily}", sans-serif`,
        }}
      >
                <link rel="stylesheet" href={getGoogleFontsUrl(styles.fontFamily)} />
        <div
          className="w-full text-center"
          style={{
            ...getContainerStyle(styles),
            maxWidth: styles.container.maxWidth,
          }}
        >
          <h2 className="mb-2 text-2xl font-bold">Thank you!</h2>
          <p className="text-muted-foreground">
            Your response has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen justify-center p-4 py-12 ${fontSizeClass}`}
      style={{
        ...getBackgroundStyle(styles.background),
        fontFamily: `"${styles.fontFamily}", sans-serif`,
      }}
    >
      <link rel="stylesheet" href={getGoogleFontsUrl(styles.fontFamily)} />
      <div className="w-full" style={{ maxWidth: styles.container.maxWidth }}>
        <div className="mb-6" style={getContainerStyle(styles)}>
          <h1 className={`mb-2 font-bold ${fontSizeClass === "text-sm" ? "text-xl" : fontSizeClass === "text-lg" ? "text-3xl" : "text-2xl"}`}>
            {form.title}
          </h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {visibleFields.map((field) => (
            <div key={field.id} style={getContainerStyle(styles)}>
              <FormField
                field={field}
                value={values[field.id] ?? ""}
                onChange={(val) => setValue(field.id, val)}
                primaryColor={styles.primaryColor}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: styles.button.color,
              borderRadius: styles.button.borderRadius,
              padding: "12px 24px",
            }}
          >
            {submitting ? "Submitting..." : styles.button.text || "Submit"}
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
  primaryColor,
}: {
  field: PublishedField;
  value: string;
  onChange: (value: string) => void;
  primaryColor: string;
}) {
  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent";
  const focusStyle = { "--tw-ring-color": `${primaryColor}33` } as React.CSSProperties;

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
        focusStyle={focusStyle}
        primaryColor={primaryColor}
      />
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  inputClass,
  focusStyle,
  primaryColor,
}: {
  field: PublishedField;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  focusStyle: React.CSSProperties;
  primaryColor: string;
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
          style={focusStyle}
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
          style={focusStyle}
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
          style={focusStyle}
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
          style={focusStyle}
        />
      );
    case "select":
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputClass}
          style={focusStyle}
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
                style={{ accentColor: primaryColor }}
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
                  style={{ accentColor: primaryColor }}
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
              className="text-2xl transition-colors"
              style={{
                color: star <= currentRating ? primaryColor : "rgba(0,0,0,0.15)",
              }}
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
          style={focusStyle}
        />
      );
    default:
      return null;
  }
}
