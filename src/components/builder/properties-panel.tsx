"use client";

import { X, Plus, Trash2, GripVertical, Eye } from "lucide-react";
import type { FormFieldData, FieldType, ConditionalLogic, ConditionalOperator } from "@/lib/builder-types";

interface PropertiesPanelProps {
  field: FormFieldData | null;
  allFields: FormFieldData[];
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

export function PropertiesPanel({ field, allFields, onUpdate, onClose }: PropertiesPanelProps) {
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
                    <button
                      className="cursor-grab rounded p-0.5 text-muted-foreground hover:bg-accent"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const container = e.currentTarget.parentElement?.parentElement;
                        if (!container) return;
                        const items = Array.from(container.querySelectorAll("[data-option-index]"));
                        const startIndex = index;
                        let currentIndex = startIndex;

                        const onMouseMove = (moveEvent: MouseEvent) => {
                          for (let i = 0; i < items.length; i++) {
                            const rect = items[i].getBoundingClientRect();
                            if (moveEvent.clientY < rect.top + rect.height / 2) {
                              currentIndex = i;
                              return;
                            }
                          }
                          currentIndex = items.length - 1;
                        };

                        const onMouseUp = () => {
                          document.removeEventListener("mousemove", onMouseMove);
                          document.removeEventListener("mouseup", onMouseUp);
                          if (currentIndex !== startIndex) {
                            const newOptions = [...(field.options ?? [])];
                            const [moved] = newOptions.splice(startIndex, 1);
                            newOptions.splice(currentIndex, 0, moved);
                            onUpdate(field.id, { options: newOptions });
                          }
                        };

                        document.addEventListener("mousemove", onMouseMove);
                        document.addEventListener("mouseup", onMouseUp);
                      }}
                    >
                      <GripVertical className="h-3 w-3" />
                    </button>
                    <input
                      type="text"
                      value={option}
                      data-option-index={index}
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

          {/* Validation section */}
          <ValidationSection field={field} onUpdate={onUpdate} />

          {/* Conditional Logic section */}
          {!isLayout && (
            <ConditionalLogicSection
              field={field}
              allFields={allFields}
              onUpdate={onUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function getRule(field: FormFieldData, key: string): unknown {
  return field.validationRules?.[key];
}

function setRule(
  field: FormFieldData,
  onUpdate: PropertiesPanelProps["onUpdate"],
  key: string,
  value: unknown
) {
  const rules = { ...(field.validationRules ?? {}) };
  if (value === "" || value === undefined || value === null) {
    delete rules[key];
  } else {
    rules[key] = value;
  }
  onUpdate(field.id, {
    validationRules: Object.keys(rules).length > 0 ? rules : undefined,
  });
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

function ValidationSection({
  field,
  onUpdate,
}: {
  field: FormFieldData;
  onUpdate: PropertiesPanelProps["onUpdate"];
}) {
  switch (field.type) {
    case "text":
    case "textarea":
      return (
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            Validation
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Min Length</label>
              <input
                type="number"
                min={0}
                value={(getRule(field, "minLength") as number) ?? ""}
                onChange={(e) =>
                  setRule(field, onUpdate, "minLength", e.target.value ? Number(e.target.value) : undefined)
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max Length</label>
              <input
                type="number"
                min={0}
                value={(getRule(field, "maxLength") as number) ?? ""}
                onChange={(e) =>
                  setRule(field, onUpdate, "maxLength", e.target.value ? Number(e.target.value) : undefined)
                }
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Regex Pattern</label>
            <input
              type="text"
              placeholder="e.g. ^[A-Z].*"
              value={(getRule(field, "pattern") as string) ?? ""}
              onChange={(e) =>
                setRule(field, onUpdate, "pattern", e.target.value || undefined)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Pattern Error Message</label>
            <input
              type="text"
              placeholder="Custom error for invalid input"
              value={(getRule(field, "patternError") as string) ?? ""}
              onChange={(e) =>
                setRule(field, onUpdate, "patternError", e.target.value || undefined)
              }
              className={inputClass}
            />
          </div>
        </div>
      );

    case "number":
      return (
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            Validation
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Min Value</label>
              <input
                type="number"
                value={(getRule(field, "min") as number) ?? ""}
                onChange={(e) =>
                  setRule(field, onUpdate, "min", e.target.value ? Number(e.target.value) : undefined)
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max Value</label>
              <input
                type="number"
                value={(getRule(field, "max") as number) ?? ""}
                onChange={(e) =>
                  setRule(field, onUpdate, "max", e.target.value ? Number(e.target.value) : undefined)
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>
      );

    case "email":
      return (
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            Validation
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Email Format</label>
              <p className="text-xs text-muted-foreground">
                Validate email address format
              </p>
            </div>
            <button
              onClick={() =>
                setRule(
                  field,
                  onUpdate,
                  "emailFormat",
                  getRule(field, "emailFormat") === false ? true : false
                )
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                getRule(field, "emailFormat") !== false
                  ? "bg-primary"
                  : "bg-input"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  getRule(field, "emailFormat") !== false
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      );

    case "phone":
      return (
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            Validation
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Phone Format</label>
              <p className="text-xs text-muted-foreground">
                Validate phone number format
              </p>
            </div>
            <button
              onClick={() =>
                setRule(
                  field,
                  onUpdate,
                  "phoneFormat",
                  getRule(field, "phoneFormat") === false ? true : false
                )
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                getRule(field, "phoneFormat") !== false
                  ? "bg-primary"
                  : "bg-input"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  getRule(field, "phoneFormat") !== false
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      );

    case "url":
      return (
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            Validation
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">URL Format</label>
              <p className="text-xs text-muted-foreground">
                Validate URL format
              </p>
            </div>
            <button
              onClick={() =>
                setRule(
                  field,
                  onUpdate,
                  "urlFormat",
                  getRule(field, "urlFormat") === false ? true : false
                )
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                getRule(field, "urlFormat") !== false
                  ? "bg-primary"
                  : "bg-input"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  getRule(field, "urlFormat") !== false
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      );

    case "file":
      return (
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            File Settings
          </h3>
          <div>
            <label className={labelClass}>Accepted File Types</label>
            <input
              type="text"
              placeholder=".pdf, .jpg, .png"
              value={(getRule(field, "acceptedTypes") as string) ?? ""}
              onChange={(e) =>
                setRule(field, onUpdate, "acceptedTypes", e.target.value || undefined)
              }
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Comma-separated extensions
            </p>
          </div>
          <div>
            <label className={labelClass}>Max File Size (MB)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={(getRule(field, "maxFileSize") as number) ?? ""}
              onChange={(e) =>
                setRule(field, onUpdate, "maxFileSize", e.target.value ? Number(e.target.value) : undefined)
              }
              className={inputClass}
            />
          </div>
        </div>
      );

    case "date":
      return (
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            Validation
          </h3>
          <div>
            <label className={labelClass}>Min Date</label>
            <input
              type="date"
              value={(getRule(field, "minDate") as string) ?? ""}
              onChange={(e) =>
                setRule(field, onUpdate, "minDate", e.target.value || undefined)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Max Date</label>
            <input
              type="date"
              value={(getRule(field, "maxDate") as string) ?? ""}
              onChange={(e) =>
                setRule(field, onUpdate, "maxDate", e.target.value || undefined)
              }
              className={inputClass}
            />
          </div>
        </div>
      );

    case "rating":
      return (
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            Rating Settings
          </h3>
          <div>
            <label className={labelClass}>Max Stars (3-10)</label>
            <input
              type="number"
              min={3}
              max={10}
              value={(getRule(field, "maxStars") as number) ?? 5}
              onChange={(e) => {
                const val = Math.min(10, Math.max(3, Number(e.target.value) || 5));
                setRule(field, onUpdate, "maxStars", val);
              }}
              className={inputClass}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

const OPERATOR_LABELS: Record<ConditionalOperator, string> = {
  equals: "Equals",
  not_equals: "Not Equals",
  contains: "Contains",
};

function ConditionalLogicSection({
  field,
  allFields,
  onUpdate,
}: {
  field: FormFieldData;
  allFields: FormFieldData[];
  onUpdate: PropertiesPanelProps["onUpdate"];
}) {
  const otherFields = allFields.filter(
    (f) => f.id !== field.id && f.type !== "divider" && f.type !== "heading"
  );
  const logic = field.conditionalLogic;
  const enabled = !!logic;

  const toggleEnabled = () => {
    if (enabled) {
      onUpdate(field.id, { conditionalLogic: undefined });
    } else if (otherFields.length > 0) {
      onUpdate(field.id, {
        conditionalLogic: {
          fieldId: otherFields[0].id,
          operator: "equals",
          value: "",
        },
      });
    }
  };

  const updateLogic = (updates: Partial<ConditionalLogic>) => {
    if (!logic) return;
    onUpdate(field.id, {
      conditionalLogic: { ...logic, ...updates },
    });
  };

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            Conditional Logic
          </h3>
        </div>
        <button
          onClick={toggleEnabled}
          disabled={otherFields.length === 0}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-input"
          } ${otherFields.length === 0 ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {otherFields.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Add more fields to use conditional logic
        </p>
      )}

      {enabled && logic && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Show this field when:
          </p>

          {/* Field selector */}
          <div>
            <label className={labelClass}>Field</label>
            <select
              value={logic.fieldId}
              onChange={(e) => updateLogic({ fieldId: e.target.value })}
              className={inputClass}
            >
              {otherFields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Operator */}
          <div>
            <label className={labelClass}>Condition</label>
            <select
              value={logic.operator}
              onChange={(e) =>
                updateLogic({ operator: e.target.value as ConditionalOperator })
              }
              className={inputClass}
            >
              {(Object.keys(OPERATOR_LABELS) as ConditionalOperator[]).map(
                (op) => (
                  <option key={op} value={op}>
                    {OPERATOR_LABELS[op]}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Value */}
          <div>
            <label className={labelClass}>Value</label>
            <input
              type="text"
              value={logic.value}
              onChange={(e) => updateLogic({ value: e.target.value })}
              placeholder="Enter value..."
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}
