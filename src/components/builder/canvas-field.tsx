"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { FormFieldData } from "@/lib/builder-types";
import { cn } from "@/lib/utils";

interface CanvasFieldProps {
  field: FormFieldData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function FieldPreview({ field }: { field: FormFieldData }) {
  switch (field.type) {
    case "text":
    case "email":
    case "phone":
    case "url":
      return (
        <input
          type="text"
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          disabled
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      );
    case "number":
      return (
        <input
          type="number"
          placeholder={field.placeholder || "0"}
          disabled
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      );
    case "textarea":
      return (
        <textarea
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          disabled
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      );
    case "date":
      return (
        <input
          type="date"
          disabled
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      );
    case "select":
      return (
        <select
          disabled
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option>{field.placeholder || "Select an option"}</option>
          {field.options?.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      );
    case "checkbox":
      return (
        <div className="flex flex-col gap-2">
          {(field.options?.length ? field.options : ["Option 1", "Option 2"]).map(
            (opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input type="checkbox" disabled className="rounded border-input" />
                {opt}
              </label>
            )
          )}
        </div>
      );
    case "radio":
      return (
        <div className="flex flex-col gap-2">
          {(field.options?.length ? field.options : ["Option 1", "Option 2"]).map(
            (opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input type="radio" disabled name={field.id} />
                {opt}
              </label>
            )
          )}
        </div>
      );
    case "file":
      return (
        <div className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-input bg-background px-3 py-6 text-sm text-muted-foreground">
          Click or drag to upload a file
        </div>
      );
    case "rating":
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="text-xl text-muted-foreground/40">
              ★
            </span>
          ))}
        </div>
      );
    case "divider":
      return <hr className="border-border" />;
    case "heading":
      return (
        <h3 className="text-lg font-semibold">{field.label}</h3>
      );
    default:
      return null;
  }
}

export function CanvasField({
  field,
  isSelected,
  onSelect,
  onDelete,
}: CanvasFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isLayoutField = field.type === "divider" || field.type === "heading";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-colors",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/50",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      <div className="absolute -left-0 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          className="cursor-grab rounded p-1 hover:bg-accent"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="absolute -right-0 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded p-1 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="pl-4">
        {!isLayoutField && (
          <label className="mb-1 block text-sm font-medium">
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        {field.helpText && !isLayoutField && (
          <p className="mb-2 text-xs text-muted-foreground">{field.helpText}</p>
        )}
        <FieldPreview field={field} />
      </div>
    </div>
  );
}
