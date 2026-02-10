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
        <span className="text-zinc-500">로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">챌린지 목록</h1>
        <p className="text-zinc-400 text-sm">
          챌린지를 선택하면 타이머가 시작됩니다. 해결 후 제출하면 리더보드에 반영됩니다.
        </p>
        {datadogOk === true && (
          <p className="text-emerald-500/90 text-sm">✓ Datadog 연결됨</p>
        )}
        {datadogOk === false && (
          <p className="text-amber-500/90 text-sm">
            Datadog API 키가 없거나 유효하지 않습니다.{" "}
            <Link href="/setup" className="underline">설정</Link>에서 .env.local을 확인하세요.
          </p>
        )}
      </div>

      {challenges.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-zinc-500">
          등록된 챌린지가 없습니다. <code className="text-zinc-400">challenges/</code> 폴더에 .md 파일을 추가하세요.
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
                  <span className="shrink-0 text-[var(--accent)]">시작 →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]/50 p-4 text-sm text-zinc-500">
        <strong className="text-zinc-400">리소스:</strong>{" "}
        <a
          href="https://docs.datadoghq.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          Datadog 공식 문서
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
