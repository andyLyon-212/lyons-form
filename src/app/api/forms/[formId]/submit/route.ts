import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ValidationError {
  fieldId: string;
  message: string;
}

function validateField(
  field: {
    id: string;
    type: string;
    label: string;
    required: boolean;
    validationRules: Record<string, unknown> | null;
    options: string[] | null;
  },
  value: string | undefined
): string | null {
  const val = value ?? "";
  const rules = field.validationRules ?? {};

  // Required check
  if (field.required && !val.trim()) {
    return `${field.label} is required`;
  }

  // Skip further validation if empty and not required
  if (!val.trim()) return null;

  // Type-specific validation
  switch (field.type) {
    case "email":
      if (rules.emailFormat !== false && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return `${field.label} must be a valid email address`;
      }
      break;

    case "phone":
      if (rules.phoneFormat !== false && !/^[+\d][\d\s\-().]{6,}$/.test(val)) {
        return `${field.label} must be a valid phone number`;
      }
      break;

    case "url":
      if (rules.urlFormat !== false) {
        try {
          new URL(val);
        } catch {
          return `${field.label} must be a valid URL`;
        }
      }
      break;

    case "number": {
      const num = Number(val);
      if (isNaN(num)) {
        return `${field.label} must be a number`;
      }
      if (rules.min !== undefined && num < Number(rules.min)) {
        return `${field.label} must be at least ${rules.min}`;
      }
      if (rules.max !== undefined && num > Number(rules.max)) {
        return `${field.label} must be at most ${rules.max}`;
      }
      break;
    }

    case "text":
    case "textarea": {
      if (rules.minLength !== undefined && val.length < Number(rules.minLength)) {
        return `${field.label} must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength !== undefined && val.length > Number(rules.maxLength)) {
        return `${field.label} must be at most ${rules.maxLength} characters`;
      }
      if (rules.pattern && typeof rules.pattern === "string") {
        try {
          const regex = new RegExp(rules.pattern);
          if (!regex.test(val)) {
            return (rules.patternMessage as string) || `${field.label} format is invalid`;
          }
        } catch {
          // Invalid regex, skip
        }
      }
      break;
    }

    case "date": {
      if (rules.minDate && typeof rules.minDate === "string" && val < rules.minDate) {
        return `${field.label} must be on or after ${rules.minDate}`;
      }
      if (rules.maxDate && typeof rules.maxDate === "string" && val > rules.maxDate) {
        return `${field.label} must be on or before ${rules.maxDate}`;
      }
      break;
    }

    case "select":
    case "radio": {
      if (field.options && !field.options.includes(val)) {
        return `${field.label} has an invalid selection`;
      }
      break;
    }

    case "checkbox": {
      if (val && field.options) {
        const selected = val.split(",");
        const invalid = selected.filter((s) => !field.options!.includes(s));
        if (invalid.length > 0) {
          return `${field.label} has invalid selections`;
        }
      }
      break;
    }

    case "rating": {
      const rating = parseInt(val);
      const maxStars = (rules.maxStars as number) ?? 5;
      if (isNaN(rating) || rating < 1 || rating > maxStars) {
        return `${field.label} must be between 1 and ${maxStars}`;
      }
      break;
    }

    case "file": {
      // File validation happens at upload time; here we just check the field has a value if required
      break;
    }
  }

  return null;
}

function evaluateCondition(
  logic: { fieldId: string; operator: string; value: string } | null,
  data: Record<string, string>
): boolean {
  if (!logic) return true;
  const fieldValue = data[logic.fieldId] ?? "";
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

  const form = await prisma.form.findFirst({
    where: { id: formId, status: "published" },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const body = await request.json();
  const { data } = body;

  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Determine visible fields based on conditional logic
  const visibleFields = form.fields.filter((field) => {
    const logic = field.conditionalLogic as { fieldId: string; operator: string; value: string } | null;
    return evaluateCondition(logic, data);
  });

  // Validate all visible fields
  const errors: ValidationError[] = [];
  for (const field of visibleFields) {
    if (field.type === "divider" || field.type === "heading") continue;

    const error = validateField(
      {
        id: field.id,
        type: field.type,
        label: field.label,
        required: field.required,
        validationRules: field.validationRules as Record<string, unknown> | null,
        options: field.options as string[] | null,
      },
      data[field.id]
    );
    if (error) {
      errors.push({ fieldId: field.id, message: error });
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  // Only save data for visible fields
  const visibleIds = new Set(visibleFields.map((f) => f.id));
  const cleanedData: Record<string, string> = {};
  for (const [key, val] of Object.entries(data)) {
    if (visibleIds.has(key)) {
      cleanedData[key] = val as string;
    }
  }

  const submission = await prisma.formSubmission.create({
    data: {
      formId,
      data: cleanedData,
    },
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
