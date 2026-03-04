"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { FormFieldData } from "@/lib/builder-types";
import { CanvasField } from "./canvas-field";

interface FormCanvasProps {
  title: string;
  description: string;
  fields: FormFieldData[];
  selectedFieldId: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSelectField: (id: string | null) => void;
  onDeleteField: (id: string) => void;
}

export function FormCanvas({
  title,
  description,
  fields,
  selectedFieldId,
  onTitleChange,
  onDescriptionChange,
  onSelectField,
  onDeleteField,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  return (
    <div
      className="flex flex-1 flex-col overflow-y-auto bg-muted/30 p-6"
      onClick={() => onSelectField(null)}
    >
      <div className="mx-auto w-full max-w-2xl">
        {/* Form header */}
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground"
            placeholder="Untitled Form"
            onClick={(e) => e.stopPropagation()}
          />
          <input
            type="text"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="mt-2 w-full bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Add a description..."
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Drop zone */}
        <div
          ref={setNodeRef}
          className={`min-h-[200px] space-y-3 rounded-lg border-2 border-dashed p-4 transition-colors ${
            isOver
              ? "border-primary bg-primary/5"
              : fields.length === 0
                ? "border-border"
                : "border-transparent"
          }`}
        >
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">Drag fields from the palette to start building your form</p>
            </div>
          ) : (
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <CanvasField
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => onSelectField(field.id)}
                  onDelete={() => onDeleteField(field.id)}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}
