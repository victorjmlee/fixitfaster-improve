/**
 * 시나리오별 정답 (채점 기준). 서버 전용, 클라이언트에 노출하지 말 것.
 * expectedChange: 채점 시 artifacts(diff/config)와 직접 비교할 "어느 파일에 뭘 바꿔야 하는지".
 */
export const REFERENCE_ANSWERS: Record<
  string,
  { rootCause: string; resolution: string; expectedChange: string }
> = {
  "scenario-infra": {
    rootCause:
      "Agent의 hostname 또는 DD_HOSTNAME이 잘못 설정되어 있음 (예: broken-agent).",
    resolution:
      "docker-compose.yml에서 agent 서비스의 hostname과 DD_HOSTNAME을 fixitfaster-agent로 설정하고 agent 재시작.",
    expectedChange:
      "파일: docker-compose.yml. agent 서비스에 hostname: fixitfaster-agent (또는 DD_HOSTNAME 환경변수 fixitfaster-agent) 있어야 함. broken-agent 등 잘못된 값이 fixitfaster-agent로 바뀌어 있으면 정답.",
  },
  "scenario-autodiscovery": {
    rootCause:
      "conf.d/nginx.d/autoconf.yaml의 ad_identifiers가 nginx 컨테이너 이미지명과 다름 (예: nginxx 오타).",
    resolution:
      "ad_identifiers를 nginx로 수정하고 Agent 재시작.",
    expectedChange:
      "파일: conf.d/nginx.d/autoconf.yaml (또는 conf.d 내 nginx 관련 yaml). ad_identifiers에 nginx가 포함되어야 함. nginxx 등 오타가 nginx로 바뀌어 있으면 정답.",
  },
  "scenario-apm": {
    rootCause:
      "trace-demo가 트레이스를 보내는 포트가 Agent APM 포트(8126)와 다름 (예: 8127).",
    resolution:
      "trace-demo에서 dd-trace 포트를 8126으로 수정 후 재빌드·재시작.",
    expectedChange:
      "파일: trace-demo/index.js (또는 trace-demo 내 진입점). dd-trace 설정에서 port가 8126이어야 함. 8127 등 다른 값이 8126으로 바뀌어 있으면 정답.",
  },
  "scenario-correlation": {
    rootCause:
      "correlation-demo에 DD_LOGS_INJECTION이 false라 로그에 trace_id가 주입되지 않음.",
    resolution:
      "docker-compose.yml에서 correlation-demo의 DD_LOGS_INJECTION을 true로 설정 후 재시작.",
    expectedChange:
      "파일: docker-compose.yml. correlation-demo 서비스에 DD_LOGS_INJECTION: true (또는 환경변수 true) 있어야 함. false가 true로 바뀌어 있으면 정답.",
  },
  "scenario-custom-metrics": {
    rootCause:
      "metrics-demo가 DogStatsD를 잘못된 호스트(127.0.0.1 등)로 보내 Agent가 수신 못 함.",
    resolution:
      "metrics-demo에서 StatsD host를 agent(또는 agent 서비스명)로 수정 후 재빌드·재시작.",
    expectedChange:
      "파일: metrics-demo/index.js (또는 metrics-demo 내 StatsD 클라이언트 설정). host가 agent(또는 fixitfaster-agent 등 agent 서비스 접근 가능한 이름)로 되어 있어야 함. 127.0.0.1/localhost가 agent로 바뀌어 있으면 정답.",
  },
  "scenario-log-timezone": {
    rootCause:
      "log-demo 파이프라인에 Date Remapper 타임존(Asia/Seoul)이 없거나 잘못됨.",
    resolution:
      "Datadog Logs 파이프라인에서 service:log-demo용 Grok Parser + Date Remapper, Timezone Asia/Seoul 설정. 또는 npm run pipeline:setup 실행.",
    expectedChange:
      "artifacts에는 파이프라인 설정 내용이 없을 수 있음. git diff에 pipeline 관련 스크립트/설정 변경, 또는 docker-compose/스크립트에서 pipeline:setup 실행이 있으면 가산. 터미널 출력만으로는 확인 어려우므로, 참가자가 올바른 해결을 했다고 보이는 흔적(예: pipeline, date remapper, Asia/Seoul, timezone)이 artifacts에 있으면 51 이상. 없으면 0.",
  },
};
