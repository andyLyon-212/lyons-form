"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  MoreVertical,
  Copy,
  Trash2,
  LogOut,
  Mail,
  Calendar,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

type FormWithCount = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  createdAt: string | Date;
  updatedAt: string | Date;
  _count: { submissions: number };
};

type TemplateWithCount = {
  id: string;
  title: string;
  description: string | null;
  _count: { fields: number };
};

type Props = {
  initialForms: FormWithCount[];
  templates: TemplateWithCount[];
  userName: string;
};

const EXAMPLE_PROMPTS = [
  "Create a customer feedback form for a restaurant with ratings and comments",
  "Build a job application form with personal info, experience, and file upload",
  "Make an event RSVP form with attendee details, dietary preferences, and plus-one option",
];

export function DashboardContent({ initialForms, templates, userName }: Props) {
  const router = useRouter();
  const [forms, setForms] = useState(initialForms);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAiGenerate, setShowAiGenerate] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createFromScratch() {
    setLoading(true);
    const res = await fetch("/api/forms", { method: "POST" });
    const form = await res.json();
    router.push(`/builder/${form.id}`);
  }

  async function generateWithAi() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/forms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Failed to generate form. Please try again.");
        return;
      }
      router.push(`/builder/${data.id}`);
    } catch {
      setAiError("Something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  async function createFromTemplate(templateId: string) {
    setLoading(true);
    const res = await fetch("/api/forms/from-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    });
    const form = await res.json();
    router.push(`/builder/${form.id}`);
  }

  async function duplicateForm(formId: string) {
    setOpenMenu(null);
    const res = await fetch(`/api/forms/${formId}/duplicate`, {
      method: "POST",
    });
    const duplicate = await res.json();
    setForms((prev) => [duplicate, ...prev]);
  }

  async function deleteForm(formId: string) {
    setDeleteConfirm(null);
    setOpenMenu(null);
    await fetch(`/api/forms/${formId}`, { method: "DELETE" });
    setForms((prev) => prev.filter((f) => f.id !== formId));
  }

  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const templateIcons: Record<string, typeof Mail> = {
    "Contact Form": Mail,
    "Event Registration": Calendar,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="border-b border-border/40 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">My Forms</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {userName}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Create button */}
        <button
          onClick={() => {
            setShowCreateModal(true);
            setShowTemplates(false);
          }}
          disabled={loading}
          className="mb-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Create New Form
        </button>

        {/* Form grid */}
        {forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-white/50 py-20">
            <div className="mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-lg font-medium">No forms yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first form to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className="group relative rounded-xl border border-border/50 bg-white p-5 shadow-sm transition-all hover:border-border hover:shadow-md"
              >
                {/* Card content - clickable */}
                <button
                  onClick={() => router.push(`/builder/${form.id}`)}
                  className="block w-full text-left"
                >
                  <h3 className="font-medium leading-tight truncate pr-8">
                    {form.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        form.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {form.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClipboardList className="h-3 w-3" />
                      {form._count.submissions}{" "}
                      {form._count.submissions === 1
                        ? "submission"
                        : "submissions"}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Created {formatDate(form.createdAt)}
                  </p>
                </button>

                {/* Menu button */}
                <div className="absolute right-3 top-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === form.id ? null : form.id);
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-secondary group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {/* Dropdown */}
                  {openMenu === form.id && (
                    <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-border bg-white py-1 shadow-lg">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateForm(form.id);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicate
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(form.id);
                          setOpenMenu(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => {
            if (!aiLoading) {
              setShowCreateModal(false);
              setShowTemplates(false);
              setShowAiGenerate(false);
            }
          }}
        >
          <div
            className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {showAiGenerate ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAiGenerate(false)}
                    disabled={aiLoading}
                    className="rounded-lg p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    &larr;
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold">Generate with AI</h2>
                    <p className="text-sm text-muted-foreground">
                      Describe the form you want to create
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Create a customer feedback form for a restaurant..."
                    disabled={aiLoading}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border/50 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        generateWithAi();
                      }
                    }}
                  />
                </div>

                {aiError && (
                  <p className="mt-2 text-sm text-destructive">{aiError}</p>
                )}

                <div className="mt-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Try an example:
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {EXAMPLE_PROMPTS.map((example) => (
                      <button
                        key={example}
                        onClick={() => setAiPrompt(example)}
                        disabled={aiLoading}
                        className="rounded-lg border border-border/40 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground disabled:opacity-50"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowAiGenerate(false);
                    }}
                    disabled={aiLoading}
                    className="flex-1 rounded-lg border border-border py-2 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateWithAi}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Generating...
                      </span>
                    ) : (
                      "Generate Form"
                    )}
                  </button>
                </div>
              </>
            ) : !showTemplates ? (
              <>
                <h2 className="text-lg font-semibold">Create New Form</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose how you&apos;d like to start
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button
                    onClick={createFromScratch}
                    disabled={loading}
                    className="flex flex-col items-center gap-3 rounded-xl border border-border/50 p-6 text-center transition-all hover:border-primary/30 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 hover:shadow-sm disabled:opacity-50"
                  >
                    <div className="rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-3">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Start from scratch</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Build your form step by step
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowTemplates(true)}
                    disabled={loading}
                    className="flex flex-col items-center gap-3 rounded-xl border border-border/50 p-6 text-center transition-all hover:border-primary/30 hover:bg-gradient-to-br hover:from-violet-50/50 hover:to-purple-50/50 hover:shadow-sm disabled:opacity-50"
                  >
                    <div className="rounded-full bg-gradient-to-br from-violet-100 to-purple-100 p-3">
                      <FileText className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium">Use a template</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Start with a pre-built form
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowAiGenerate(true);
                      setAiPrompt("");
                      setAiError(null);
                    }}
                    disabled={loading}
                    className="flex flex-col items-center gap-3 rounded-xl border border-border/50 p-6 text-center transition-all hover:border-primary/30 hover:bg-gradient-to-br hover:from-amber-50/50 hover:to-orange-50/50 hover:shadow-sm disabled:opacity-50"
                  >
                    <div className="rounded-full bg-gradient-to-br from-amber-100 to-orange-100 p-3">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Generate with AI</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Describe your form in words
                      </p>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="mt-4 w-full rounded-lg py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                  >
                    ←
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold">Choose a Template</h2>
                    <p className="text-sm text-muted-foreground">
                      Select a template to get started quickly
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {templates.map((template) => {
                    const Icon = templateIcons[template.title] ?? FileText;
                    return (
                      <button
                        key={template.id}
                        onClick={() => createFromTemplate(template.id)}
                        disabled={loading}
                        className="flex items-center gap-4 rounded-xl border border-border/50 p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm disabled:opacity-50"
                      >
                        <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 p-2.5">
                          <Icon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{template.title}</p>
                          {template.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground truncate">
                              {template.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {template._count.fields} fields
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowTemplates(false);
                    setShowAiGenerate(false);
                  }}
                  className="mt-4 w-full rounded-lg py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Delete Form</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete this form? This action cannot be
              undone. All submissions will also be deleted.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteForm(deleteConfirm)}
                className="flex-1 rounded-lg bg-destructive py-2 text-sm font-medium text-destructive-foreground transition-colors hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
