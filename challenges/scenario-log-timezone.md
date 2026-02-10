# 시나리오: 로그 타임스탬프가 9시간 밀려 보임 / 로그가 안 들어온 것처럼 보임

**난이도:** ⭐⭐ Medium  
**예상 소요 시간:** 15~25분  
**관련 Datadog 제품:** Log Management, Pipelines

---

## 증상 요약

- **A.** 로그는 Datadog에 들어오는데 **타임스탬프가 9시간 밀려서** 실시간 모니터링이 안 됨 (오후 2시 로그가 오후 11시로 보이거나 그 반대).
- **B.** "Last 15 minutes" 등 시간 범위로 보면 **방금 낸 로그가 안 보임** → 마치 로그가 안 들어오는 것처럼 보이는 시나리오.

둘 다 **Grok 파싱 + Date Remapper에서 Asia/Seoul 타임존이 빠졌을 때** 발생할 수 있습니다 (로그는 UTC 기준으로 해석됨).

---

## 환경

- **로그 소스:** `log-demo` 컨테이너 (Asia/Seoul 타임존으로 로그 출력)
- **로그 포맷:** `2024-01-15 14:30:00 [INFO] [log-demo] User 123 completed action`
- **Agent:** Datadog Agent 7.x (Docker)

---

## 재현 단계 / 관찰 가능한 현상

1. Datadog Logs → Explorer에서 `service:log-demo` 검색
2. 로그의 **timestamp**가 실제 시간과 9시간 차이남
3. "Last 15 minutes" 필터 시 방금 발생한 로그가 안 보임

---

## 허용 리소스

- [x] Datadog 공식 문서 (Log Management, Pipelines)
- [x] Log Parsing, Date Remapper
- [ ] 내부 Wiki: (팀에서 지정)

---

## 제출 포맷 (참가자용)

- **원인 요약:**
- **해결 단계:**
- **참고한 문서/링크:**
- **소요 시간:**

---

## 주최자용: 정상 버전 vs 망가뜨리기 & 정답

**정상 버전 (참가자에게 먼저 보여줄 기준):**

- 이 레포에서 **`npm run pipeline:setup`** (또는 `npm run agent:up:full`) 실행 시 생성되는 파이프라인이 **정상**입니다.
- Logs → Configuration → Pipelines → "log-demo (Asia/Seoul Timezone)" 에 Grok Parser + **Date Remapper(Asia/Seoul)** 가 들어 있는 상태.

**망가뜨리는 방법 (시나리오용):**

- **A.** 위 파이프라인에서 **Date Remapper를 삭제**하거나, **Timezone을 UTC(또는 미설정)** 으로 두기 → 타임스탬프 9시간 밀림 / "Last 15 minutes"에 안 보임.
- **B.** **Grok Parser 규칙을 삭제**하거나 잘못된 패턴으로 바꿔서 `timestamp`가 파싱되지 않게 하기 → Date Remapper가 동작하지 않아 로그 시간이 잘못되거나 안 들어온 것처럼 보임.
- **C.** 파이프라인 자체를 비활성화하거나, filter를 `service:log-demo` 가 아니게 바꿔서 log-demo 로그가 이 파이프라인을 타지 않게 하기.

**정답 요약:**

1. Logs → Configuration → Pipelines 에서 `service:log-demo`용 파이프라인 확인/생성.
2. Grok Parser로 타임스탬프 추출 (예: `%{date("yyyy-MM-dd HH:mm:ss"):timestamp} \[%{word:level}\] ...`).
3. Date Remapper 추가/수정: Source `timestamp`, **Timezone: Asia/Seoul**.
4. 저장 후 새 로그로 시간·시간대 확인.

**관련 공식 문서:** Log Pipelines, Date Remapper, Parsing
