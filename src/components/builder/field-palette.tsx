"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  Type,
  Mail,
  Hash,
  AlignLeft,
  Phone,
  Link,
  Calendar,
  ChevronDown,
  CheckSquare,
  Circle,
  Upload,
  Star,
  Minus,
  Heading,
  type LucideIcon,
} from "lucide-react";
import { FIELD_DEFINITIONS, type FieldDefinition } from "@/lib/builder-types";

const ICON_MAP: Record<string, LucideIcon> = {
  Type,
  Mail,
  Hash,
  AlignLeft,
  Phone,
  Link,
  Calendar,
  ChevronDown,
  CheckSquare,
  Circle,
  Upload,
  Star,
  Minus,
  Heading,
};

const CATEGORY_LABELS: Record<string, string> = {
  basic: "Basic Fields",
  choice: "Choice Fields",
  advanced: "Advanced",
  layout: "Layout",
};

function PaletteItem({ field }: { field: FieldDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${field.type}`,
    data: { type: "palette-item", fieldType: field.type },
  });

  const Icon = ICON_MAP[field.icon];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex cursor-grab items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <span>{field.label}</span>
    </div>
  );
}

export function FieldPalette() {
  const categories = ["basic", "choice", "advanced", "layout"] as const;

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Field Types</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {categories.map((category) => {
          const fields = FIELD_DEFINITIONS.filter(
            (f) => f.category === category
          );
          if (fields.length === 0) return null;
          return (
            <div key={category} className="mb-4">
              <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                {CATEGORY_LABELS[category]}
              </h3>
              <div className="flex flex-col gap-1">
                {fields.map((field) => (
                  <PaletteItem key={field.type} field={field} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
