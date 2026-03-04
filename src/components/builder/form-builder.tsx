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
import { StylePanel } from "./style-panel";
import {
  DEFAULT_FORM_STYLES,
  FIELD_DEFINITIONS,
  type ConditionalLogic,
  type FieldType,
  type FormFieldData,
  type FormStyles,
} from "@/lib/builder-types";

type RightPanelTab = "fields" | "style";

interface FormBuilderProps {
  initialForm: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    status: string;
    styles: FormStyles | null;
    fields: {
      id: string;
      type: string;
      label: string;
      placeholder: string | null;
      helpText: string | null;
      required: boolean;
      options: string[] | null;
      validationRules: Record<string, unknown> | null;
      conditionalLogic: ConditionalLogic | null;
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

function mergeStyles(saved: FormStyles | null): FormStyles {
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
      conditionalLogic:
        (f.conditionalLogic as ConditionalLogic | null) ?? undefined,
      order: f.order,
    }))
  );
  const [styles, setStyles] = useState<FormStyles>(
    mergeStyles(initialForm.styles)
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightPanelTab>("fields");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const [isPublished, setIsPublished] = useState(
    initialForm.status === "published"
  );
  const [publishing, setPublishing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleSave(
    overrides?: {
      title?: string;
      description?: string;
      fields?: FormFieldData[];
      styles?: FormStyles;
    }
  ) {
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const captured = { ...overrides };

    saveTimeoutRef.current = setTimeout(() => {
      let currentTitle = "";
      let currentDescription = "";
      let currentFields: FormFieldData[] = [];
      let currentStyles: FormStyles = DEFAULT_FORM_STYLES;

      setTitle((t) => { currentTitle = captured.title ?? t; return t; });
      setDescription((d) => { currentDescription = captured.description ?? d; return d; });
      setFields((f) => { currentFields = captured.fields ?? f; return f; });
      setStyles((s) => { currentStyles = captured.styles ?? s; return s; });

      setSaveStatus("saving");
      fetch(`/api/forms/${initialForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentTitle,
          description: currentDescription,
          fields: currentFields,
          styles: currentStyles,
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
      setRightTab("fields");
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

  const handleStylesChange = (newStyles: FormStyles) => {
    setStyles(newStyles);
    scheduleSave({ styles: newStyles });
  };

  const handleFieldSelect = (id: string | null) => {
    setSelectedFieldId(id);
    if (id) setRightTab("fields");
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    const newStatus = isPublished ? "draft" : "published";
    try {
      const res = await fetch(`/api/forms/${initialForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setIsPublished(!isPublished);
        if (newStatus === "published") {
          setShowShareModal(true);
        }
      }
    } finally {
      setPublishing(false);
    }
  };

  const formUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${initialForm.slug}`
      : `/f/${initialForm.slug}`;

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
          <div className="flex items-center gap-4">
            {/* Right panel tabs */}
            <div className="flex rounded-md border border-border bg-muted p-0.5">
              <button
                onClick={() => setRightTab("fields")}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  rightTab === "fields"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Fields
              </button>
              <button
                onClick={() => setRightTab("style")}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  rightTab === "style"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Style
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "saved" && "All changes saved"}
              {saveStatus === "unsaved" && "Unsaved changes"}
            </div>
            {isPublished && (
              <button
                onClick={() => setShowShareModal(true)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                Share
              </button>
            )}
            <button
              onClick={handleTogglePublish}
              disabled={publishing}
              className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50 ${
                isPublished
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {publishing
                ? "..."
                : isPublished
                  ? "Unpublish"
                  : "Publish"}
            </button>
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
            styles={styles}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
            onSelectField={handleFieldSelect}
            onDeleteField={handleDeleteField}
          />
          {rightTab === "fields" ? (
            <PropertiesPanel
              field={selectedField}
              allFields={fields}
              onUpdate={handleUpdateField}
              onClose={() => setSelectedFieldId(null)}
            />
          ) : (
            <StylePanel styles={styles} onUpdate={handleStylesChange} />
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          formUrl={formUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}

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

function ShareModal({
  formUrl,
  onClose,
}: {
  formUrl: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const [embedWidth, setEmbedWidth] = useState("100%");
  const [embedHeight, setEmbedHeight] = useState("600");

  const embedCode = `<iframe src="${formUrl}" width="${embedWidth}" height="${embedHeight}" frameborder="0" style="border: none;"></iframe>`;

  const copyToClipboard = async (text: string, type: "link" | "embed") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share Form</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            &times;
          </button>
        </div>

        {/* Direct Link */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Direct Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={formUrl}
              className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm"
            />
            <button
              onClick={() => copyToClipboard(formUrl, "link")}
              className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {copied === "link" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Embed Code */}
        <div>
          <label className="mb-2 block text-sm font-medium">Embed Code</label>
          <div className="mb-3 flex gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Width
              </label>
              <input
                type="text"
                value={embedWidth}
                onChange={(e) => setEmbedWidth(e.target.value)}
                className="w-24 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Height (px)
              </label>
              <input
                type="text"
                value={embedHeight}
                onChange={(e) => setEmbedHeight(e.target.value)}
                className="w-24 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="relative">
            <pre className="overflow-x-auto rounded-md border border-input bg-muted p-3 text-xs">
              {embedCode}
            </pre>
            <button
              onClick={() => copyToClipboard(embedCode, "embed")}
              className="absolute right-2 top-2 rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {copied === "embed" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
