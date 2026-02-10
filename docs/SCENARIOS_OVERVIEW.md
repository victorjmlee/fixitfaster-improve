# Fix It Faster 시나리오 개요 (5개, 1시간 30분~2시간)

전체 **5개 시나리오**를 순서대로 진행할 때 **총 1시간 30분~2시간** 내에 마무리될 수 있도록 난이도와 시간을 맞춘 정리입니다.  
모두 **Datadog 공식 문서·Troubleshooting**을 참조해 해결하는 구조입니다.

---

## 공통 참조 문서 (Datadog 공식)

| 영역 | 문서 |
|------|------|
| **Agent** | [Agent Troubleshooting](https://docs.datadoghq.com/agent/troubleshooting) |
| **APM** | [Tracing](https://docs.datadoghq.com/tracing), [APM 메트릭](https://docs.datadoghq.com/tracing/metrics) |
| **Logs** | [Log Management](https://docs.datadoghq.com/logs), [Pipelines / Parsing](https://docs.datadoghq.com/logs/log_configuration/pipelines) |
| **Infrastructure** | [Infrastructure](https://docs.datadoghq.com/infrastructure) |
| **Metrics / Monitors** | [Metrics](https://docs.datadoghq.com/metrics), [Monitors](https://docs.datadoghq.com/monitors) |
| **Trace–Log 연결** | [Connect Logs and Traces](https://docs.datadoghq.com/tracing/other_telemetry/connect_logs_and_traces/) |

---

## 시나리오 1: APM 트레이스가 안 들어옴

- **난이도:** ⭐ Easy  
- **예상 시간:** 15~20분  
- **제품:** APM, Agent  

**증상**  
정상일 때는 APM에 `trace-demo` 서비스 트레이스가 보이는데, 어느 순간부터 **트레이스가 전혀 들어오지 않는다.**  
`trace-demo` 컨테이너 로그에는 "span sent"가 찍히고, Agent는 떠 있다.

**참가자가 할 일**  
Agent 설정·APM 수신 여부를 확인하고, 트레이스가 다시 들어오도록 복구한다.

**참조 문서**  
- [Agent Troubleshooting](https://docs.datadoghq.com/agent/troubleshooting)  
- [APM trace collection](https://docs.datadoghq.com/tracing/trace_pipeline/ingestion_mechanisms/)  

**주최자용**  
- **망가뜨리기:** `docker-compose.yml` Agent에 `DD_APM_ENABLED=false` 설정 후 재시작  
- **정답:** `DD_APM_ENABLED=true` 복구 후 Agent 재시작  

**대응 챌린지 파일:** `challenges/scenario-apm.md`

---

## 시나리오 2: 로그가 Datadog에 안 보임

- **난이도:** ⭐⭐ Medium  
- **예상 시간:** 20~25분  
- **제품:** Log Management, Agent  

**증상**  
이전에는 Logs에 수집되던 로그가 **어느 순간부터 전혀 들어오지 않거나**, 특정 소스만 사라졌다.  
앱은 동작 중이고 로그는 로컬에는 남는다.

**참가자가 할 일**  
Agent 로그 수집 설정(환경변수, 컨테이너 라벨, 제외 규칙 등)을 확인하고, 로그가 다시 수집·전송되도록 복구한다.

**참조 문서**  
- [Log Collection (Agent)](https://docs.datadoghq.com/agent/logs/)  
- [Agent Troubleshooting](https://docs.datadoghq.com/agent/troubleshooting)  
- [Container Log Collection](https://docs.datadoghq.com/agent/docker/log/)  

**주최자용**  
- **망가뜨리기:** Agent에 `DD_LOGS_ENABLED=false` 또는 `DD_CONTAINER_INCLUDE`/`DD_CONTAINER_EXCLUDE`로 log-demo 제외  
- **정답:** 로그 수집 활성화 및 컨테이너 필터 복구 후 Agent 재시작  

**대응 챌린지 파일:** `challenges/scenario-logs.md`

---

## 시나리오 3: 로그 타임스탬프 9시간 밀림 / “Last 15분”에 안 보임

- **난이도:** ⭐⭐ Medium  
- **예상 시간:** 20~25분  
- **제품:** Log Management, Pipelines  

**증상**  
- 로그는 들어오는데 **타임스탬프가 9시간 밀려** 보이거나,  
- **“Last 15 minutes”** 등 시간 범위로 보면 방금 난 로그가 안 보여 **“로그가 안 들어오는 것처럼”** 보인다.  
원인은 파이프라인에서 **Grok/Date Remapper에 Asia/Seoul 타임존이 빠진 경우** (UTC로 해석됨).

**참가자가 할 일**  
Logs 파이프라인에서 `service:log-demo`용 Grok Parser와 Date Remapper를 확인하고, 타임존을 **Asia/Seoul**로 설정해 복구한다.

**참조 문서**  
- [Log Pipelines](https://docs.datadoghq.com/logs/log_configuration/pipelines/)  
- [Grok Parser](https://docs.datadoghq.com/logs/log_configuration/parsing/), [Date Remapper](https://docs.datadoghq.com/logs/log_configuration/processors/?tab=ui#log-date-remapper)  

**주최자용**  
- **망가뜨리기:** `npm run pipeline:setup`으로 만든 파이프라인에서 Date Remapper 삭제 또는 timezone 미설정(UTC), 또는 Grok 규칙 삭제/잘못된 패턴  
- **정답:** Grok으로 timestamp 추출 + Date Remapper Source `timestamp`, Timezone **Asia/Seoul**  

**대응 챌린지 파일:** `challenges/scenario-log-timezone.md`

---

## 시나리오 4: Infrastructure에 호스트가 안 나옴

- **난이도:** ⭐ Easy  
- **예상 시간:** 15~20분  
- **제품:** Infrastructure, Agent  

**증상**  
Datadog **Infrastructure → Host Map / Hosts**에 Agent를 띄운 **호스트가 보이지 않는다.**  
Agent 컨테이너는 떠 있고 `agent status`는 성공한다.

**참가자가 할 일**  
Agent 호스트명·메트릭 전송·API 키 등 인프라 노출에 필요한 설정을 확인하고, 호스트가 다시 목록에 나오도록 복구한다.

**참조 문서**  
- [Infrastructure Monitoring](https://docs.datadoghq.com/infrastructure/)  
- [Agent Troubleshooting](https://docs.datadoghq.com/agent/troubleshooting)  
- [Host naming](https://docs.datadoghq.com/agent/configuration/environment_variables/#host-name)  

**주최자용**  
- **망가뜨리기:** Agent 중지, 또는 `DD_HOSTNAME` 비우기/잘못된 값, 또는 API 키를 다른 org 키로 변경  
- **정답:** Agent 기동, `DD_HOSTNAME` 명시(예: `fixitfaster-agent`), 올바른 API 키로 복구  

**대응 챌린지 파일:** `challenges/scenario-infra.md`

---

## 시나리오 5: 커스텀 메트릭/모니터가 안 나오거나 알람 이상

- **난이도:** ⭐⭐ Medium  
- **예상 시간:** 20~25분  
- **제품:** Metrics, Monitors, Agent  

**증상**  
- **메트릭:** 이전에 보이던 **커스텀 메트릭**(예: `metrics-demo`가 DogStatsD로 보내는 메트릭)이 Metrics Explorer/대시보드에 **안 나오거나 0만** 나온다.  
- **모니터:** 모니터가 설정돼 있는데 **알림이 오지 않거나**, 잘못된 조건으로 자꾸 알림이 온다.  
Agent는 떠 있고 APM/Logs는 정상일 수 있다.

**참가자가 할 일**  
Agent DogStatsD 설정·메트릭 전송 여부, 모니터 쿼리·알림 채널을 확인하고, 메트릭/모니터가 정상 동작하도록 복구한다.

**참조 문서**  
- [Custom Metrics](https://docs.datadoghq.com/metrics/custom_metrics/), [DogStatsD](https://docs.datadoghq.com/developers/dogstatsd/)  
- [Monitors](https://docs.datadoghq.com/monitors/), [Monitor Troubleshooting](https://docs.datadoghq.com/monitors/guide/monitor-creation-best-practices/)  
- [Agent Troubleshooting](https://docs.datadoghq.com/agent/troubleshooting)  

**주최자용**  
- **망가뜨리기:** Agent에 `DD_DOGSTATSD_NON_LOCAL_TRAFFIC=false` 또는 DogStatsD 포트 차단, 또는 모니터 쿼리를 존재하지 않는 메트릭/잘못된 조건으로 변경  
- **정답:** DogStatsD 수신 설정 복구·Agent 재시작, 모니터 쿼리·알림 채널 복구  

**대응 챌린지 파일:** `challenges/scenario-metrics-monitor.md`, `challenges/scenario-custom-metrics.md`

---

## (보너스/교체용) 시나리오: Trace에서 로그가 연결 안 됨

- **난이도:** ⭐⭐ Medium  
- **예상 시간:** 15~20분  
- **제품:** APM, Log Management  

**증상**  
APM Trace 상세의 **“Logs” 탭에 로그가 안 보인다.**  
로그는 Logs Explorer에 있고, 트레이스도 보이는데 **서로 연결이 안 된 상태.**

**참가자가 할 일**  
Trace–Log correlation 조건(로그에 `dd.trace_id`/`dd.span_id`, `service` 태그 일치, 로그 주입 설정)을 확인하고 복구한다.

**참조 문서**  
- [Connect Logs and Traces](https://docs.datadoghq.com/tracing/other_telemetry/connect_logs_and_traces/)  
- [Node.js APM](https://docs.datadoghq.com/tracing/trace_collection/dd_libraries/nodejs/)  

**주최자용**  
- **망가뜨리기:** `correlation-demo`에 `DD_LOGS_INJECTION=false` 또는 로그 service 태그를 APM service와 다르게 설정  
- **정답:** `DD_LOGS_INJECTION=true`, 서비스 이름 통일  

**대응 챌린지 파일:** `challenges/scenario-correlation.md`

---

## 진행 순서 권장 (총 1시간 30분~2시간)

| 순서 | 시나리오 | 예상 시간 |
|------|----------|-----------|
| 1 | APM 트레이스 안 들어옴 | 15~20분 |
| 2 | 로그 안 보임 | 20~25분 |
| 3 | 로그 타임스탬프 9시간 밀림 / Last 15분에 안 보임 | 20~25분 |
| 4 | Infrastructure 호스트 안 나옴 | 15~20분 |
| 5 | 메트릭/모니터 안 나옴 또는 알람 이상 | 20~25분 |
| **합계** | | **약 90~115분 (1.5~2시간)** |

5번 대신 **Trace–Log 연결** 시나리오를 넣고 싶으면, 4번(Infra) 또는 5번(Metrics) 중 하나와 교체해도 됩니다.

---

## 주최자 체크리스트

- [ ] 정상 환경에서 각 시나리오별 “되는 상태” 스크린샷 또는 메모  
- [ ] 시나리오별로 **한 가지씩만** 망가뜨리기 (원인 좁히기 쉽게)  
- [ ] `challenges/scenario-*.md` 에 망가뜨리는 방법·정답 요약 반영  
- [ ] (선택) `solutions/` 에 시나리오별 정답 상세 보관  

위 5개(+ 보너스 1개)는 모두 **Datadog 공식 Troubleshooting·제품 문서**를 참조해 해결하는 구조로 맞춰 두었습니다.
