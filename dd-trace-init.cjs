/**
 * (현재 미사용) preload 시 Next 워커에서 dd-trace를 찾지 못해 크래시가 나서
 * dev/start 는 instrumentation.ts 만 사용합니다. APM은 instrumentation에서 초기화됩니다.
 */
const path = require('path');

// Next.js가 .env.local을 읽기 전에 실행되므로 여기서 로드
try {
  require('dotenv').config({ path: path.join(__dirname, '.env.local') });
} catch (_) {}

const useAgent = process.env.DD_AGENT_HOST;
const apiKey = process.env.DATADOG_API_KEY || process.env.DD_API_KEY;

if (useAgent || apiKey) {
  // localhost 대신 127.0.0.1 사용 (IPv6 문제 회피)
  const agentHost = useAgent === 'localhost' ? '127.0.0.1' : (useAgent || '127.0.0.1');
  const agentPort = process.env.DD_TRACE_AGENT_PORT || '8126';

  const tracer = require('dd-trace').init({
    service: process.env.DD_SERVICE || 'fixitfaster',
    env: process.env.DD_ENV || 'development',
    debug: !!process.env.DD_TRACE_DEBUG,
    ...(useAgent
      ? {
          hostname: agentHost,
          port: agentPort,
        }
      : {
          apiKey,
          site: process.env.DATADOG_SITE || process.env.DD_SITE || 'datadoghq.com',
        }),
  });
  tracer.use('next');
  tracer.use('http'); // Next 플러그인만으로 안 잡힐 때 HTTP로라도 트레이스 수집

  if (useAgent) {
    console.log('[Fix It Faster] Datadog APM enabled → agent', agentHost + ':' + agentPort);
  } else {
    console.log('[Fix It Faster] Datadog APM enabled → agentless');
  }
}
