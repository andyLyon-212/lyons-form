import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatCompletion } from "@/lib/llm";
import type { Prisma } from "@/generated/prisma/client";

const SYSTEM_PROMPT = `You are a form builder AI. Given a user's description, generate a complete form structure as JSON.

Return ONLY valid JSON with this exact structure:
{
  "title": "Form Title",
  "description": "Brief form description",
  "fields": [
    {
      "type": "<field_type>",
      "label": "Field Label",
      "placeholder": "Placeholder text",
      "helpText": "Optional help text",
      "required": true/false,
      "options": ["Option 1", "Option 2"],
      "validationRules": {}
    }
  ]
}

Available field types: text, email, number, textarea, select, checkbox, radio, file, date, phone, url, rating, divider, heading

Rules:
- Use "heading" fields to create logical section groupings
- Use "divider" fields to separate sections visually
- heading fields should have a descriptive label (the section title)
- For select, checkbox, and radio fields, include an "options" array
- Set "required" to true for essential fields
- Use appropriate field types (email for emails, phone for phone numbers, etc.)
- Include reasonable placeholder text
- Add helpText only when the field needs clarification
- For rating fields, set validationRules.maxStars (default 5)
- Keep forms practical and well-organized
- Return raw JSON only, no markdown code blocks`;

interface GeneratedField {
  type: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: string[];
  validationRules?: Record<string, unknown>;
}

interface GeneratedForm {
  title: string;
  description: string;
  fields: GeneratedField[];
}

const VALID_TYPES = new Set([
  "text", "email", "number", "textarea", "select", "checkbox",
  "radio", "file", "date", "phone", "url", "rating", "divider", "heading",
]);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { prompt } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
    return NextResponse.json(
      { error: "Please provide a description of the form you want to create." },
      { status: 400 }
    );
  }

  try {
    const response = await chatCompletion(SYSTEM_PROMPT, prompt.trim());

    // Parse and validate the response
    let generated: GeneratedForm;
    try {
      generated = JSON.parse(response);
    } catch {
      return NextResponse.json(
        { error: "AI generated an invalid response. Please try again." },
        { status: 500 }
      );
    }

    if (!generated.title || !Array.isArray(generated.fields)) {
      return NextResponse.json(
        { error: "AI generated an incomplete form. Please try again." },
        { status: 500 }
      );
    }

    // Filter to valid field types and sanitize
    const validFields = generated.fields.filter((f) => VALID_TYPES.has(f.type));

    if (validFields.length === 0) {
      return NextResponse.json(
        { error: "AI could not generate valid form fields. Please try again with a different description." },
        { status: 500 }
      );
    }

    // Create the form in the database
    const slug = `form-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const form = await prisma.form.create({
      data: {
        userId: session.user.id,
        title: generated.title,
        description: generated.description || "",
        slug,
        fields: {
          create: validFields.map((f, i) => ({
            type: f.type,
            label: f.label || `Field ${i + 1}`,
            placeholder: f.placeholder || null,
            helpText: f.helpText || null,
            required: f.required ?? false,
            options: f.options ?? [],
            validationRules: (f.validationRules ?? {}) as Prisma.InputJsonValue,
            order: i,
          })),
        },
      },
      include: { fields: true },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error("AI form generation error:", error);
    const message =
      error instanceof Error && error.message.includes("API")
        ? "Failed to connect to AI service. Please check your API key configuration."
        : "Something went wrong generating your form. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
