# Scenario: Custom metrics not appearing

**Difficulty:** ⭐⭐⭐⭐ Hard
**Estimated time:** 10–20 min
**Related Datadog products:** Metrics, Agent (DogStatsD)


## Symptom summary

앱이 DogStatsD로 커스텀 메트릭을 보내지만, Metrics Explorer에는 해당 메트릭이 나타나지 않습니다. fixitfaster.demo.* 메트릭이 보이지 않습니다. metrics-demo 컨테이너는 실행 중이고 로그에는 "sent metrics"가 찍힙니다. Agent도 올라와 있습니다. 메트릭이 Datadog에 도달하지 않는 원인을 찾아야 합니다.


## Environment

- 메트릭 소스: metrics-demo 컨테이너(DogStatsD 클라이언트), 5초마다 전송.
- Agent: Datadog Agent 7.x (Docker), 8125/udp에서 DogStatsD 수신.
- 경로: 애플리케이션(metrics-demo) → Agent(호스트+포트) → Datadog Metrics.


## Steps to reproduce / What to observe

1. Datadog Metrics → Explorer에서 fixitfaster.demo. 로 검색합니다.
2. 메트릭이 나오지 않고(자동완성에도 없음).
3. metrics-demo 컨테이너 로그에는 "sent metrics"가 주기적으로 찍힙니다.
4. Agent 컨테이너는 실행 중이며 정상입니다.
5. 정리: 앱은 보내고, Agent는 올라와 있지만 Metrics Explorer에는 아무것도 안 보입니다.


## What to investigate (hints)

- 애플리케이션이 메트릭을 어디로 보내는지(호스트·포트) 확인.
- 애플리케이션의 DogStatsD 클라이언트 설정(코드 또는 설정) 확인.
- Datadog 문서: DogStatsD, 커스텀 메트릭, Agent 설정.


## Allowed resources

- Datadog 문서
- 내부 위키
- AI 사용 금지

## Helpful Commands

metrics-demo 컨테이너 로그 확인:
docker logs -f fixitfaster-metrics-demo

metrics-demo 컨테이너 리빌드 및 재시작:
cd ~/fixitfaster-agent
docker compose --env-file .env.local build metrics-demo && docker compose --env-file .env.local up -d metrics-demo

metrics-demo 컨테이너 중지:
cd ~/fixitfaster-agent
docker compose --env-file .env.local stop metrics-demo

Agent 재시작:
cd ~/fixitfaster-agent
npm run agent:restart
