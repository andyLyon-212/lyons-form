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
    case "url": {
      const tMinLen = field.validationRules?.minLength as number | undefined;
      const tMaxLen = field.validationRules?.maxLength as number | undefined;
      return (
        <div>
          <input
            type="text"
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            disabled
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {field.type === "text" && (tMinLen !== undefined || tMaxLen !== undefined) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {tMinLen !== undefined && tMaxLen !== undefined
                ? `${tMinLen}-${tMaxLen} characters`
                : tMinLen !== undefined
                  ? `Min ${tMinLen} characters`
                  : `Max ${tMaxLen} characters`}
            </p>
          )}
        </div>
      );
    }
    case "number": {
      const minVal = field.validationRules?.min as number | undefined;
      const maxVal = field.validationRules?.max as number | undefined;
      return (
        <div>
          <input
            type="number"
            placeholder={field.placeholder || "0"}
            disabled
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {(minVal !== undefined || maxVal !== undefined) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {minVal !== undefined && maxVal !== undefined
                ? `Between ${minVal} and ${maxVal}`
                : minVal !== undefined
                  ? `Min: ${minVal}`
                  : `Max: ${maxVal}`}
            </p>
          )}
        </div>
      );
    }
    case "textarea": {
      const taMinLen = field.validationRules?.minLength as number | undefined;
      const taMaxLen = field.validationRules?.maxLength as number | undefined;
      return (
        <div>
          <textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            disabled
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {(taMinLen !== undefined || taMaxLen !== undefined) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {taMinLen !== undefined && taMaxLen !== undefined
                ? `${taMinLen}-${taMaxLen} characters`
                : taMinLen !== undefined
                  ? `Min ${taMinLen} characters`
                  : `Max ${taMaxLen} characters`}
            </p>
          )}
        </div>
      );
    }
    case "date": {
      const minDate = field.validationRules?.minDate as string | undefined;
      const maxDate = field.validationRules?.maxDate as string | undefined;
      return (
        <div>
          <input
            type="date"
            min={minDate}
            max={maxDate}
            disabled
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {(minDate || maxDate) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {minDate && maxDate
                ? `${minDate} to ${maxDate}`
                : minDate
                  ? `From ${minDate}`
                  : `Until ${maxDate}`}
            </p>
          )}
        </div>
      );
    }
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
    case "file": {
      const acceptedTypes = field.validationRules?.acceptedTypes as string | undefined;
      const maxFileSize = field.validationRules?.maxFileSize as number | undefined;
      return (
        <div>
          <div className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-input bg-background px-3 py-6 text-sm text-muted-foreground">
            Click or drag to upload a file
          </div>
          {(acceptedTypes || maxFileSize) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {[
                acceptedTypes && `Accepts: ${acceptedTypes}`,
                maxFileSize && `Max size: ${maxFileSize}MB`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      );
    }
    case "rating": {
      const maxStars = (field.validationRules?.maxStars as number) ?? 5;
      return (
        <div className="flex gap-1">
          {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
            <span key={star} className="text-xl text-muted-foreground/40">
              ★
            </span>
          ))}
        </div>
      );
    }
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
