"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ChallengeMeta = {
  id: string;
  title: string;
  difficulty: string;
  estimatedMinutes: string;
  products: string;
};

export default function HomePage() {
  const [challenges, setChallenges] = useState<ChallengeMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [datadogOk, setDatadogOk] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/challenges").then((r) => r.json()),
      fetch("/api/validate").then((r) => r.json()).catch(() => ({ valid: false })),
    ]).then(([list, validation]) => {
      setChallenges(Array.isArray(list) ? list : []);
      setDatadogOk(validation.valid === true);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="text-zinc-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Challenges</h1>
        <p className="text-zinc-400 text-sm">
          Pick a challenge to start the timer. Submit when done to appear on the leaderboard.
        </p>
        {datadogOk === true && (
          <p className="text-emerald-500/90 text-sm">✓ Datadog connected</p>
        )}
        {datadogOk === false && (
          <p className="text-amber-500/90 text-sm">
            Datadog API key is missing or invalid. Check .env.local in{" "}
            <Link href="/setup" className="underline">Setup</Link>.
          </p>
        )}
      </div>

      {challenges.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-zinc-500">
          No challenges yet. Add .md files to the <code className="text-zinc-400">challenges/</code> folder.
        </div>
      ) : (
        <ul className="grid gap-4">
          {challenges.map((c) => (
            <li key={c.id}>
              <Link
                href={`/challenges/${c.id}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--accent-dim)] hover:bg-[var(--card)]/90"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-white">{c.title}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {c.difficulty} · {c.estimatedMinutes} · {c.products}
                    </p>
                  </div>
                  <span className="shrink-0 text-[var(--accent)]">Start →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]/50 p-4 text-sm text-zinc-500">
        <strong className="text-zinc-400">Resources:</strong>{" "}
        <a
          href="https://docs.datadoghq.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          Datadog Documentation
        </a>
        {" · "}
        <a
          href="https://docs.datadoghq.com/agent/troubleshooting"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          Agent Troubleshooting
        </a>
      </div>
    </div>
  );
}
