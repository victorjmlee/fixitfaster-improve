/**
 * Datadog APM 트레이싱 (Next.js instrumentation).
 * DD_AGENT_HOST 있으면 Agent로, 없으면 DATADOG_API_KEY 로 agentless 전송.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const useAgent = process.env.DD_AGENT_HOST;
  const apiKey = process.env.DATADOG_API_KEY || process.env.DD_API_KEY;
  if (!useAgent && !apiKey) return;

  const tracer = await import("dd-trace").then((m) => m.default);
  const site = process.env.DATADOG_SITE || process.env.DD_SITE || "datadoghq.com";
  const agentHost = useAgent === "localhost" ? "127.0.0.1" : (useAgent || "127.0.0.1");
  const agentPort = process.env.DD_TRACE_AGENT_PORT || "8126";

  if (useAgent) {
    tracer.init({
      service: process.env.DD_SERVICE || "fixitfaster",
      env: process.env.DD_ENV || "development",
      hostname: agentHost,
      port: agentPort,
    });
  } else {
    // agentless: apiKey/site are valid at runtime; TracerOptions type may omit them
    tracer.init({
      service: process.env.DD_SERVICE || "fixitfaster",
      env: process.env.DD_ENV || "development",
      apiKey,
      site,
    } as Parameters<typeof tracer.init>[0]);
  }

  tracer.use("next");
  tracer.use("http");
}
