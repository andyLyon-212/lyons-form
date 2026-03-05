"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Eye, X } from "lucide-react";

type Field = {
  id: string;
  label: string;
  type: string;
};

type Submission = {
  id: string;
  data: Record<string, string>;
  submittedAt: string;
};

type Props = {
  formId: string;
  formTitle: string;
  fields: Field[];
  submissions: Submission[];
};

export function SubmissionsView({
  formTitle,
  fields,
  submissions,
}: Props) {
  const [selected, setSelected] = useState<Submission | null>(null);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function exportCsv() {
    const headers = ["Submitted At", ...fields.map((f) => f.label)];
    const rows = submissions.map((s) => [
      formatDate(s.submittedAt),
      ...fields.map((f) => {
        const val = s.data[f.id] ?? "";
        // Escape CSV values
        return val.includes(",") || val.includes('"') || val.includes("\n")
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      }),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formTitle || "form"}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="border-b border-border/40 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Link
            href="/dashboard"
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {formTitle || "Untitled Form"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {submissions.length}{" "}
              {submissions.length === 1 ? "submission" : "submissions"}
            </p>
          </div>
          {submissions.length > 0 && (
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-white/50 py-20">
            <p className="text-lg font-medium">No submissions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Submissions will appear here once someone fills out your form
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-slate-50/80">
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      #
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      Submitted
                    </th>
                    {fields.slice(0, 4).map((field) => (
                      <th
                        key={field.id}
                        className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground"
                      >
                        {field.label}
                      </th>
                    ))}
                    <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, index) => (
                    <tr
                      key={submission.id}
                      className="border-b border-border/30 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {submissions.length - index}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatDate(submission.submittedAt)}
                      </td>
                      {fields.slice(0, 4).map((field) => (
                        <td
                          key={field.id}
                          className="max-w-[200px] truncate px-4 py-3"
                        >
                          {submission.data[field.id] || "—"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelected(submission)}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="mx-4 w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Submission Details</h2>
                <p className="text-xs text-muted-foreground">
                  {formatDate(selected.submittedAt)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field) => {
                const value = selected.data[field.id];
                if (!value) return null;
                return (
                  <div key={field.id}>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {field.label}
                    </label>
                    <p className="mt-1 rounded-lg border border-border/50 bg-slate-50/50 px-3 py-2 text-sm whitespace-pre-wrap">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
