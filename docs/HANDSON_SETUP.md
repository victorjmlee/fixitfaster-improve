# Fix It Faster 핸즈온 환경 구성

**목표:** 각자 PC에서 Agent를 띄우고, **각자 Datadog 콘솔**에서 APM / Logs / Infra / Metrics·Monitor를 보면서 트러블슈팅하는 핸즈온.

그래서 **먼저 “되는 환경”을 만들고**, 그다음 **시나리오별로 의도적으로 망가뜨려 둔 뒤** 참가자가 고치게 합니다.

---

## 1단계: 정상 환경 만들기 (참가자 공통)

이 레포의 **Agent(docker-compose)** 는 배포하면 **트레이스 + 로그**가 잘 수집되도록 맞춰져 있습니다.

| 항목 | 하는 일 |
|------|--------|
| **Agent** | `npm run agent:up` (또는 `npm run agent:up:full` → Agent + log-demo 파이프라인까지 생성) |
| **log-demo 파이프라인** | Agent 띄운 뒤 `npm run pipeline:setup` 한 번 실행 → 본인 Datadog에 "log-demo (Asia/Seoul Timezone)" 파이프라인 생성 (Grok + Date Remapper). 시나리오용 **정상 버전** 기준 |
| **.env.local** | `DATADOG_API_KEY`, `DATADOG_APP_KEY` (파이프라인 생성용), (선택) `DD_AGENT_HOST=localhost` |
| **확인** | Datadog 콘솔에서 **APM**, **Logs** 에 데이터가 들어오는지, Logs → Pipelines에 log-demo 파이프라인이 있는지 확인 |

**이 Agent가 수집하는 것:**

- **APM(트레이스):** 포트 8126으로 들어오는 트레이스 → Datadog APM으로 전송. **소스:** 8126으로 보내는 앱(예: Next 앱을 `DD_AGENT_HOST=localhost` 로 띄울 때).  
- **Logs:** `docker.sock` 마운트로 **다른 컨테이너의 stdout/stderr** 자동 수집. **소스:** 같은 compose 에 있는 **log-demo** 컨테이너(10초마다 한 줄 출력). `npm run agent:up` 시 agent + log-demo 가 같이 떠서 Logs에 데이터가 들어감.  

→ 자세한 출처: [WHERE_TRACES_AND_LOGS_COME_FROM.md](WHERE_TRACES_AND_LOGS_COME_FROM.md)

정상일 때:

- **APM:** 트레이스/서비스 맵에 데이터 있음  
- **Logs:** Logs Explorer에 (다른) 컨테이너 로그 보임  
- **Infrastructure:** 호스트 목록에 `fixitfaster-agent` 보임  

이 상태를 **스크린샷이나 메모**로 남겨 두면, 시나리오에서 망가뜨린 뒤 비교하기 좋습니다.

---

## 2단계: 시나리오별로 “망가뜨리기” (주최자용)

정상 환경을 만든 뒤, **시나리오마다 한 가지씩만** 깨면 참가자가 원인을 좁히기 쉽습니다.

| 시나리오 | 망가뜨리는 방법 (예시) | 참가자가 할 일 |
|----------|------------------------|----------------|
| **APM** | Agent에서 APM 수신 끄기, 또는 앱에서 tracer 비활성화 | 트레이스가 안 들어오는 원인 찾아서 복구 |
| **Logs** | 로그 수집 비활성화, 또는 소스/태그 잘못 설정 | 로그가 안 보이는 원인 찾아서 복구 |
| **Infra** | Agent 중단, 또는 호스트 태그/이름 잘못 설정 | 인프라 목록에 호스트가 안 나오는 문제 해결 |
| **Metrics / Monitor** | 메트릭 전송 중단, 또는 모니터 임계값/쿼리 잘못 설정 | 메트릭/알람이 안 나오는(또는 잘못 나오는) 원인 해결 |

실제로 “망가뜨릴” 때는:

- **문서화:** `challenges/` 아래 시나리오별 .md에 “주최자: 이렇게 깨뜨림” 한 줄씩 적어 두기  
- **복구용:** 같은 문서에 “정답: 이렇게 고치면 됨” 요약해 두면 경연 후 리뷰할 때 유용

---

## 3단계: 시나리오 파일 구조 (예시)

```
challenges/
  _template.md           # 챌린지 작성 템플릿
  example-apm-missing-spans.md   # 기존 APM 예시
  scenario-apm.md        # APM 시나리오 (정상 → 망가뜨리기 → 고치기)
  scenario-logs.md       # Logs 시나리오
  scenario-infra.md      # Infra 시나리오
  scenario-metrics-monitor.md   # Metrics/Monitor 시나리오
```

각 시나리오 .md에는:

- **증상:** “콘솔에서 OO가 안 보인다 / 이상하다”
- **환경:** Agent/앱 버전, 사용 제품(APM/Logs/Infra/Metrics)
- **허용 리소스:** 공식 Troubleshooting, 내부 Wiki 등
- **(주최자용)** 망가뜨리는 방법 + 정답 요약

---

## 요약

1. **되는 환경 먼저:** 각자 Agent 띄우고, APM·Logs·Infra·Metrics가 들어오는 상태를 만든다.  
2. **그다음 망가뜨리기:** 시나리오별로 한 가지씩만 깨서, 참가자가 각자 콘솔에서 원인을 찾고 고치게 한다.  
3. **시나리오:** APM, Logs, Infra, Metrics/Monitor 정도만 해도 핸즈온으로 충분히 운영 가능하다.

세부 “망가뜨리는” 단계는 `challenges/scenario-*.md` 에 채워 넣으면 됩니다.
