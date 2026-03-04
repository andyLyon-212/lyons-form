"use client";

import { X, Plus, Trash2 } from "lucide-react";
import type { FormFieldData, FieldType } from "@/lib/builder-types";

interface PropertiesPanelProps {
  field: FormFieldData | null;
  onUpdate: (id: string, updates: Partial<FormFieldData>) => void;
  onClose: () => void;
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text Field",
  email: "Email Field",
  number: "Number Field",
  textarea: "Text Area",
  select: "Dropdown",
  checkbox: "Checkbox Group",
  radio: "Radio Group",
  file: "File Upload",
  date: "Date Picker",
  phone: "Phone Field",
  url: "URL Field",
  rating: "Rating",
  divider: "Divider",
  heading: "Heading",
};

const FIELDS_WITH_OPTIONS: FieldType[] = ["select", "checkbox", "radio"];
const LAYOUT_FIELDS: FieldType[] = ["divider", "heading"];

export function PropertiesPanel({ field, onUpdate, onClose }: PropertiesPanelProps) {
  if (!field) {
    return (
      <div className="flex h-full w-72 flex-col border-l border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Properties</h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
          Select a field to edit its properties
        </div>
      </div>
    );
  }

  const isLayout = LAYOUT_FIELDS.includes(field.type);
  const hasOptions = FIELDS_WITH_OPTIONS.includes(field.type);

  return (
    <div className="flex h-full w-72 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">
          {FIELD_TYPE_LABELS[field.type]}
        </h2>
        <button onClick={onClose} className="rounded p-1 hover:bg-accent">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Label */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {!isLayout && (
            <>
              {/* Placeholder */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={field.placeholder ?? ""}
                  onChange={(e) =>
                    onUpdate(field.id, { placeholder: e.target.value || undefined })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Help Text */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Help Text
                </label>
                <input
                  type="text"
                  value={field.helpText ?? ""}
                  onChange={(e) =>
                    onUpdate(field.id, { helpText: e.target.value || undefined })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Required */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Required</label>
                <button
                  onClick={() => onUpdate(field.id, { required: !field.required })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    field.required ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      field.required ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </>
          )}

          {/* Options for select/checkbox/radio */}
          {hasOptions && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Options
              </label>
              <div className="space-y-2">
                {(field.options ?? []).map((option, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(field.options ?? [])];
                        newOptions[index] = e.target.value;
                        onUpdate(field.id, { options: newOptions });
                      }}
                      className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    />
                    <button
                      onClick={() => {
                        const newOptions = (field.options ?? []).filter(
                          (_, i) => i !== index
                        );
                        onUpdate(field.id, { options: newOptions });
                      }}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [
                      ...(field.options ?? []),
                      `Option ${(field.options?.length ?? 0) + 1}`,
                    ];
                    onUpdate(field.id, { options: newOptions });
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Add option
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
