"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FieldPalette } from "./field-palette";
import { FormCanvas } from "./form-canvas";
import { PropertiesPanel } from "./properties-panel";
import {
  FIELD_DEFINITIONS,
  type FieldType,
  type FormFieldData,
} from "@/lib/builder-types";

interface FormBuilderProps {
  initialForm: {
    id: string;
    title: string;
    description: string | null;
    fields: {
      id: string;
      type: string;
      label: string;
      placeholder: string | null;
      helpText: string | null;
      required: boolean;
      options: string[] | null;
      validationRules: Record<string, unknown> | null;
      order: number;
    }[];
  };
}

function createField(type: FieldType, order: number): FormFieldData {
  const def = FIELD_DEFINITIONS.find((d) => d.type === type);
  const hasOptions = ["select", "checkbox", "radio"].includes(type);
  return {
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    label: def?.label ?? type,
    required: false,
    order,
    ...(hasOptions && { options: ["Option 1", "Option 2"] }),
  };
}

export function FormBuilder({ initialForm }: FormBuilderProps) {
  const [title, setTitle] = useState(initialForm.title);
  const [description, setDescription] = useState(
    initialForm.description ?? ""
  );
  const [fields, setFields] = useState<FormFieldData[]>(
    initialForm.fields.map((f) => ({
      id: f.id,
      type: f.type as FieldType,
      label: f.label,
      placeholder: f.placeholder ?? undefined,
      helpText: f.helpText ?? undefined,
      required: f.required,
      options: (f.options as string[] | null) ?? undefined,
      validationRules:
        (f.validationRules as Record<string, unknown> | null) ?? undefined,
      order: f.order,
    }))
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save current form state to server. Reads latest state via functional
  // setState pattern to avoid stale closures and ref-during-render issues.
  function scheduleSave(
    overrides?: {
      title?: string;
      description?: string;
      fields?: FormFieldData[];
    }
  ) {
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    // Capture overrides immediately — if provided, these are the new values
    // that setState hasn't flushed yet.
    const captured = { ...overrides };

    saveTimeoutRef.current = setTimeout(() => {
      // Use a state reader trick: setFields returns the current state
      // without actually changing it, so we can read it synchronously.
      let currentTitle = "";
      let currentDescription = "";
      let currentFields: FormFieldData[] = [];

      setTitle((t) => { currentTitle = captured.title ?? t; return t; });
      setDescription((d) => { currentDescription = captured.description ?? d; return d; });
      setFields((f) => { currentFields = captured.fields ?? f; return f; });

      setSaveStatus("saving");
      fetch(`/api/forms/${initialForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentTitle,
          description: currentDescription,
          fields: currentFields,
        }),
      })
        .then((res) => {
          setSaveStatus(res.ok ? "saved" : "unsaved");
        })
        .catch(() => {
          setSaveStatus("unsaved");
        });
    }, 1000);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;

    // Dropping from palette onto canvas
    if (activeData?.type === "palette-item") {
      const fieldType = activeData.fieldType as FieldType;
      const newField = createField(fieldType, fields.length);

      if (over.id === "canvas") {
        const newFields = [...fields, newField];
        setFields(newFields);
        scheduleSave({ fields: newFields });
      } else {
        const overIndex = fields.findIndex((f) => f.id === over.id);
        if (overIndex >= 0) {
          const next = [...fields];
          next.splice(overIndex, 0, newField);
          const reordered = next.map((f, i) => ({ ...f, order: i }));
          setFields(reordered);
          scheduleSave({ fields: reordered });
        } else {
          const newFields = [...fields, newField];
          setFields(newFields);
          scheduleSave({ fields: newFields });
        }
      }
      setSelectedFieldId(newField.id);
      return;
    }

    // Reorder on canvas
    if (active.id !== over.id && over.id !== "canvas") {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        const reordered = arrayMove(fields, oldIndex, newIndex).map(
          (f, i) => ({ ...f, order: i })
        );
        setFields(reordered);
        scheduleSave({ fields: reordered });
      }
    }
  };

  const handleDeleteField = (id: string) => {
    const newFields = fields
      .filter((f) => f.id !== id)
      .map((f, i) => ({ ...f, order: i }));
    setFields(newFields);
    if (selectedFieldId === id) setSelectedFieldId(null);
    scheduleSave({ fields: newFields });
  };

  const handleUpdateField = (id: string, updates: Partial<FormFieldData>) => {
    const newFields = fields.map((f) =>
      f.id === id ? { ...f, ...updates } : f
    );
    setFields(newFields);
    scheduleSave({ fields: newFields });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    scheduleSave({ title: newTitle });
  };

  const handleDescriptionChange = (newDesc: string) => {
    setDescription(newDesc);
    scheduleSave({ description: newDesc });
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              &larr; Back
            </a>
            <span className="text-sm font-medium">
              {title || "Untitled Form"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "All changes saved"}
            {saveStatus === "unsaved" && "Unsaved changes"}
          </div>
        </header>

        {/* Three-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          <FieldPalette />
          <FormCanvas
            title={title}
            description={description}
            fields={fields}
            selectedFieldId={selectedFieldId}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
            onSelectField={setSelectedFieldId}
            onDeleteField={handleDeleteField}
          />
          <PropertiesPanel
            field={selectedField}
            onUpdate={handleUpdateField}
            onClose={() => setSelectedFieldId(null)}
          />
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="rounded-md border border-primary bg-card px-4 py-2 text-sm shadow-lg">
            {activeId.startsWith("palette-")
              ? FIELD_DEFINITIONS.find(
                  (d) => `palette-${d.type}` === activeId
                )?.label ?? "Field"
              : fields.find((f) => f.id === activeId)?.label ?? "Field"}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
