"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Submission = {
  id: string;
  challengeId: string;
  participantName: string;
  causeSummary: string;
  steps: string;
  docLinks: string;
  elapsedSeconds: number;
  submittedAt: string;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function LeaderboardPage() {
  const [list, setList] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="text-zinc-500">Loading...</span>
      </div>
    );
  }

  const handleReset = async () => {
    if (!confirm("Clear the entire leaderboard?")) return;
    await fetch("/api/reset-leaderboard", { method: "POST" });
    setList([]);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="mt-1 text-zinc-400 text-sm">
            Ordered by submission time; within the same challenge, by shortest time first.
          </p>
        </div>
        {list.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-[var(--border)] px-3 py-1.5 text-sm text-zinc-400 hover:bg-[var(--card)] hover:text-white"
          >
            Reset leaderboard
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-zinc-500">
          No submissions yet.{" "}
          <Link href="/" className="text-[var(--accent)] hover:underline">Start from Challenges</Link>.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-zinc-500">
                <th className="p-3 font-medium">#</th>
                <th className="p-3 font-medium">Participant</th>
                <th className="p-3 font-medium">Challenge</th>
                <th className="p-3 font-medium">Time</th>
                <th className="p-3 font-medium">Submitted at</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={s.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-3 text-zinc-500">{i + 1}</td>
                  <td className="p-3 font-medium text-white">{s.participantName}</td>
                  <td className="p-3">
                    <Link href={`/challenges/${s.challengeId}`} className="text-[var(--accent)] hover:underline">
                      {s.challengeId}
                    </Link>
                  </td>
                  <td className="p-3 font-mono text-[var(--accent)]">{formatTime(s.elapsedSeconds)}</td>
                  <td className="p-3 text-zinc-500">
                    {new Date(s.submittedAt).toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
