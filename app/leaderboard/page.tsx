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
  return `${m}분 ${s}초`;
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
        <span className="text-zinc-500">로딩 중...</span>
      </div>
    );
  }

  const handleReset = async () => {
    if (!confirm("리더보드를 전부 비울까요?")) return;
    await fetch("/api/reset-leaderboard", { method: "POST" });
    setList([]);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">리더보드</h1>
          <p className="mt-1 text-zinc-400 text-sm">
            제출된 순서대로, 동일 챌린지 내에서는 소요 시간이 짧은 순으로 정렬됩니다.
          </p>
        </div>
        {list.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-[var(--border)] px-3 py-1.5 text-sm text-zinc-400 hover:bg-[var(--card)] hover:text-white"
          >
            리더보드 초기화
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-zinc-500">
          아직 제출이 없습니다.{" "}
          <Link href="/" className="text-[var(--accent)] hover:underline">챌린지</Link>에서 시작해 보세요.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-zinc-500">
                <th className="p-3 font-medium">#</th>
                <th className="p-3 font-medium">참가자</th>
                <th className="p-3 font-medium">챌린지</th>
                <th className="p-3 font-medium">소요 시간</th>
                <th className="p-3 font-medium">제출 시각</th>
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
                    {new Date(s.submittedAt).toLocaleString("ko-KR")}
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
