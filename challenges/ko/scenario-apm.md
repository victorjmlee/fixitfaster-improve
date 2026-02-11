# Scenario: APM traces not appearing in Datadog

**Difficulty:** ⭐⭐⭐⭐ Hard
**Estimated time:** 10–15 min
**Related Datadog products:** APM, Agent


## Symptom summary

trace-demo 서비스의 트레이스가 원래는 Datadog APM에 보였는데, 어느 시점부터 트레이스가 전혀 수신되지 않습니다. 애플리케이션은 여전히 동작 중이며 span을 보낸다고 로그에 남깁니다. Agent 컨테이너는 올라와 있습니다. 트레이스가 Datadog에 도달하지 않는 원인을 찾아야 합니다.


## Environment

- 트레이스 소스: trace-demo 컨테이너 — Datadog Agent로 5초마다 한 개의 span 전송.
- Agent: Datadog Agent 7.x (Docker), 고정 포트에서 트레이스 수신.
- 경로: 애플리케이션(trace-demo) → Agent(트레이스 수신 포트) → Datadog APM.


## Steps to reproduce / What to observe

1. Datadog → APM → Services / Traces에서 trace-demo 서비스가 없거나 새 트레이스가 없습니다.
2. trace-demo 컨테이너 로그에는 "span sent" 같은 메시지가 주기적으로 찍힙니다.
3. Agent 컨테이너는 실행 중이며 정상입니다.
4. 정리: 앱은 보내고, Agent는 올라와 있지만 APM에는 아무것도 안 보입니다.


## What to investigate (hints)

- Agent가 APM을 수신하는지(포트 및 설정) 확인.
- 애플리케이션이 트레이스를 어디로 보내는지: 어떤 호스트, **어떤 포트**인지 확인.
- 애플리케이션 트레이서 설정(코드 또는 트레이스 에이전트용 환경 변수) 확인.
- Datadog 문서: APM 트레이스 수집, Agent 설정, 언어 트레이서(예: Node.js) 설정.


## Allowed resources

- Datadog 문서
- 내부 위키
- AI 사용 금지

## Helpful Commands

trace-demo 컨테이너 로그 확인:
docker logs -f fixitfaster-trace-demo

trace-demo 컨테이너 리빌드 및 재시작:
cd ~/fixitfaster-agent
docker compose --env-file .env.local build trace-demo && docker compose --env-file .env.local up -d trace-demo

Agent 재시작:
cd ~/fixitfaster-agent
npm run agent:restart
