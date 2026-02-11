# Scenario: Logs not linked from Trace

**Difficulty:** ⭐ Easy
**Estimated time:** 5–10 min
**Related Datadog products:** APM, Log Management


## Symptom summary

APM 트레이스 상세 페이지의 "Logs" 탭에 로그가 없습니다.
로그는 수집되고 트레이스도 있지만, 서로 연결되어 있지 않습니다.


## Environment

- 서비스: correlation-demo (Node.js + dd-trace)
- Agent: Datadog Agent 7.x (Docker)
- 로그: JSON 형식, stdout 출력


## Steps to reproduce / What to observe

1. Datadog APM → Traces에서 correlation-demo 서비스 트레이스를 엽니다.
2. 트레이스 상세 페이지에서 Logs 탭이 비어 있습니다.
3. Logs Explorer에서 service:correlation-demo로 검색하면 로그가 나옵니다.
4. 로그에 dd.trace_id / dd.span_id 필드가 없거나 잘못되어 있습니다.


## Allowed resources

- Datadog 문서
- 내부 위키
- AI 사용 금지

## Helpful Commands

correlation-demo 컨테이너 로그 확인:
docker logs -f fixitfaster-correlation-demo

correlation-demo 재빌드 및 재시작:
cd ~/fixitfaster-agent
docker compose --env-file .env.local build correlation-demo && docker compose --env-file .env.local up -d correlation-demo

Agent 재시작:
cd ~/fixitfaster-agent
npm run agent:restart
