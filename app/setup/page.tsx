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
      setResult({ valid: false, error: "Request failed" });
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
        <h1 className="text-2xl font-bold">Setup</h1>
        <p className="mt-1 text-zinc-400 text-sm">
          Set your API key. Create a <code className="text-zinc-500">.env.local</code> file at the project root with the variables below, then restart the server.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 font-mono text-sm">
        <pre className="whitespace-pre-wrap text-zinc-300">
{`# Required
DATADOG_API_KEY=your_api_key_here

# Optional (for some features)
DATADOG_APP_KEY=your_app_key_here

# For EU or other sites
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
          {testing ? "Checking..." : "Test connection"}
        </button>
        {result && (
          <span className={result.valid ? "text-emerald-500" : "text-amber-500"}>
            {result.valid ? "✓ Connected" : `✗ ${result.error || "Connection failed"}`}
          </span>
        )}
      </div>

      {result?.valid && (
        <p className="text-sm text-zinc-500">
          When connected, you can use the challenge list and Datadog resources for troubleshooting.
        </p>
      )}
    </div>
  );
}
