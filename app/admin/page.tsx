"use client";

import { useState, useEffect, useCallback } from "react";

type ReferenceAnswer = {
  rootCause: string;
  resolution: string;
  expectedChange: string;
  artifactCheck: string[][];
  artifactScore: number;
  solutionMaxPoints?: number;
  scoreGuide: { ko: string; en: string };
};

type Draft = {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  scenarioId: string;
  markdown: string;
  referenceAnswer: ReferenceAnswer;
  topic?: string;
  generationNotes?: string;
};

function headers(secret: string): Record<string, string> {
  return secret
    ? { "Content-Type": "application/json", "x-admin-secret": secret }
    : { "Content-Type": "application/json" };
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/drafts", { headers: headers(secret) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDrafts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-draft", {
        method: "POST",
        headers: headers(secret),
        body: JSON.stringify({ topic: topic.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error || `HTTP ${res.status}`
        );
      }
      setTopic("");
      await fetchDrafts();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/drafts/${id}`, {
        method: "PATCH",
        headers: headers(secret),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          (data as { error?: string }).error || `HTTP ${res.status}`
        );
      if (status === "approved" && (data as { promoted?: boolean }).promoted) {
        alert(`Approved & promoted! Challenge is now live.`);
      }
      await fetchDrafts();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const deleteDraft = async (id: string) => {
    if (!confirm("Delete this draft?")) return;
    try {
      await fetch(`/api/admin/drafts/${id}`, {
        method: "DELETE",
        headers: headers(secret),
      });
      await fetchDrafts();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "text-green-400 border-green-400/50";
    if (s === "rejected") return "text-red-400 border-red-400/50";
    return "text-yellow-400 border-yellow-400/50";
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin - Challenge Drafts</h1>

      {/* Secret input */}
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Admin secret (leave empty if not configured)"
          className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-white placeholder:text-zinc-500 w-72"
        />
        <button
          onClick={fetchDrafts}
          className="rounded border border-[var(--border)] px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Reload
        </button>
      </div>

      {/* Generate section */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
        <h2 className="font-semibold text-white">Generate New Challenge Draft</h2>
        <p className="text-sm text-zinc-400">
          AI will generate a Datadog troubleshooting challenge. Optionally specify a topic.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !generating && generate()}
            placeholder="Topic (e.g. Network Monitoring, RBAC, Containers...)"
            className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-white placeholder:text-zinc-500 flex-1 min-w-48"
          />
          <button
            onClick={generate}
            disabled={generating}
            className="rounded border border-[var(--accent)] bg-[var(--accent)]/20 px-4 py-2 text-sm text-[var(--accent)] hover:bg-[var(--accent)]/30 disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Draft"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Drafts list */}
      <div className="space-y-4">
        <h2 className="font-semibold text-white">
          Drafts ({drafts.length})
        </h2>

        {loading && (
          <p className="text-zinc-500 text-sm">Loading...</p>
        )}

        {!loading && drafts.length === 0 && (
          <p className="text-zinc-500 text-sm">
            No drafts yet. Generate one above.
          </p>
        )}

        {drafts
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((d) => {
            const expanded = expandedId === d.id;
            return (
              <div
                key={d.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {d.scenarioId}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${statusColor(d.status)}`}
                      >
                        {d.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Created: {new Date(d.createdAt).toLocaleString()}
                      {d.topic && ` | Topic: ${d.topic}`}
                      {d.generationNotes && ` | ${d.generationNotes}`}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedId(expanded ? null : d.id)
                    }
                    className="text-sm text-[var(--accent)] hover:underline shrink-0"
                  >
                    {expanded ? "Collapse" : "Expand"}
                  </button>
                </div>

                {/* Expanded content */}
                {expanded && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-zinc-400 mb-1">
                        Challenge Markdown
                      </h4>
                      <pre className="rounded border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-zinc-300 overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap">
                        {d.markdown}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-zinc-400 mb-1">
                        Reference Answer
                      </h4>
                      <pre className="rounded border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-zinc-300 overflow-x-auto max-h-60 overflow-y-auto">
                        {JSON.stringify(d.referenceAnswer, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {d.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(d.id, "approved")}
                        className="rounded border border-green-500/50 bg-green-500/10 px-3 py-1.5 text-xs text-green-400 hover:bg-green-500/20"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(d.id, "rejected")}
                        className="rounded border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {d.status === "approved" && (
                    <span className="text-xs text-green-400">
                      Live
                    </span>
                  )}
                  <button
                    onClick={() => deleteDraft(d.id)}
                    className="rounded border border-zinc-600 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
