# Scenario: Host not showing in Infrastructure

**Difficulty:** ⭐ Easy
**Estimated time:** 5–10 min
**Related Datadog products:** Infrastructure (Host Map, etc.), Agent


## Symptom summary

Datadog 인프라(호스트 맵, 호스트 목록)에 기대하는 호스트 'fixitfaster-agent'가 보이지 않습니다. broken-agent 같은 다른 호스트명만 보이거나, 아예 호스트가 없을 수 있습니다. Agent 컨테이너는 동작 중이고 agent status는 정상입니다. 인프라에 기대하는 호스트가 올바르게 표시되도록 해야 합니다.


## Environment

- 플랫폼: 로컬 Docker (Datadog Agent).
- Agent: Datadog Agent 7.x.
- 동일 API 키; 호스트가 잘못된 이름으로 보이거나 목록에 없음.


## Steps to reproduce / What to observe

1. Datadog → 인프라 → 호스트 맵(또는 호스트)에서 기대하는 호스트명(예: fixitfaster-agent)을 확인합니다.
2. 기대하는 호스트가 없고, 다른 이름(예: broken-agent)만 보일 수 있습니다.
3. Agent 컨테이너는 실행 중이며, docker exec fixitfaster-agent agent status 는 성공합니다.
4. 정리: 에이전트는 올라와 있지만, Datadog에 보이는 호스트가 기대와 다릅니다.


## What to investigate (hints)

- Agent가 호스트명을 어떻게 보고하는지 확인: docker-compose(hostname, DD_HOSTNAME) 및 Agent 문서.
- Datadog 문서: 인프라, Agent 호스트명, 컨테이너 내 호스트명.


## Allowed resources

- Datadog 문서
- 내부 위키
- AI 사용 금지

## Helpful Commands

Agent 컨테이너 및 상태 확인:
docker ps | grep agent
docker exec fixitfaster-agent agent status

Agent 재시작:
cd ~/fixitfaster-agent
npm run agent:restart

