"use client";

import { useState, useEffect } from "react";

export default function SetupPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; error?: string } | null>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const res = await fetch("/api/validate");
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ valid: false, error: "요청 실패" });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="mt-1 text-zinc-400 text-sm">
          API 키만 넣으면 됩니다. 프로젝트 루트에 <code className="text-zinc-500">.env.local</code> 파일을 만들고 아래 변수를 설정한 뒤 서버를 재시작하세요.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 font-mono text-sm">
        <pre className="whitespace-pre-wrap text-zinc-300">
{`# 필수
DATADOG_API_KEY=여기에_API_키_입력

# 선택 (일부 기능용)
DATADOG_APP_KEY=여기에_앱_키_입력

# EU 등 다른 사이트 사용 시
# DATADOG_SITE=datadoghq.eu`}
        </pre>
        <p className="mt-4 text-zinc-500 text-xs">
          API Key: Organization Settings → API Keys / Application Key: Application Keys
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={runTest}
          disabled={testing}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-[var(--bg)] hover:opacity-90 disabled:opacity-50"
        >
          {testing ? "확인 중..." : "연결 테스트"}
        </button>
        {result && (
          <span className={result.valid ? "text-emerald-500" : "text-amber-500"}>
            {result.valid ? "✓ 연결 성공" : `✗ ${result.error || "연결 실패"}`}
          </span>
        )}
      </div>

      {result?.valid && (
        <p className="text-sm text-zinc-500">
          연결이 정상이면 챌린지 목록에서 Datadog 리소스를 활용해 트러블슈팅을 진행할 수 있습니다.
        </p>
      )}
    </div>
  );
}
