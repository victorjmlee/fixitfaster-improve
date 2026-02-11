/**
 * 시나리오별 정답 요약 (채점 기준). 서버 전용, 클라이언트에 노출하지 말 것.
 */
export const REFERENCE_ANSWERS: Record<
  string,
  { rootCause: string; resolution: string }
> = {
  "scenario-infra": {
    rootCause:
      "Agent의 hostname 또는 DD_HOSTNAME이 잘못 설정되어 있음 (예: broken-agent). Datadog에는 해당 이름으로만 호스트가 보이거나 기대하는 호스트명이 없음.",
    resolution:
      "docker-compose.yml에서 agent 서비스의 hostname과 DD_HOSTNAME을 fixitfaster-agent로 설정하고 npm run agent:restart 실행.",
  },
  "scenario-autodiscovery": {
    rootCause:
      "Autodiscovery 설정(conf.d/nginx.d/autoconf.yaml)의 ad_identifiers가 실제 nginx 컨테이너의 short image 이름(nginx)과 다름 (예: nginxx 오타).",
    resolution:
      "ad_identifiers를 nginx로 수정하고 Agent 재시작 (npm run agent:restart).",
  },
  "scenario-apm": {
    rootCause:
      "trace-demo 앱이 트레이스를 보내는 포트가 Agent의 APM 수신 포트(8126)와 다름 (예: 8127로 설정).",
    resolution:
      "trace-demo/index.js에서 dd-trace의 port를 8126으로 수정한 뒤 trace-demo 컨테이너 재빌드 및 재시작.",
  },
  "scenario-correlation": {
    rootCause:
      "DD_LOGS_INJECTION이 false로 설정되어 로그에 trace_id가 주입되지 않아 Trace와 로그가 연결되지 않음.",
    resolution:
      "docker-compose.yml에서 correlation-demo의 DD_LOGS_INJECTION을 true로 설정하고 컨테이너 재시작.",
  },
  "scenario-custom-metrics": {
    rootCause:
      "metrics-demo가 DogStatsD 메트릭을 잘못된 호스트(127.0.0.1 등)로 전송하여 Agent가 수신하지 못함.",
    resolution:
      "metrics-demo/index.js에서 StatsD 클라이언트의 host를 agent로 수정한 뒤 컨테이너 재빌드 및 재시작.",
  },
  "scenario-log-timezone": {
    rootCause:
      "log-demo 파이프라인에 Date Remapper의 타임존(Asia/Seoul)이 없거나 잘못되어 로그 타임스탬프가 9시간 어긋나거나 최근 로그가 시간 필터에 안 잡힘.",
    resolution:
      "Datadog Logs 파이프라인에서 service:log-demo용 Grok Parser와 Date Remapper를 설정하고 Timezone을 Asia/Seoul로 지정. 또는 npm run pipeline:setup 실행.",
  },
};
