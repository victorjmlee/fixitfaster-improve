# 시나리오: Trace에서 로그가 연결 안 됨

**난이도:** ⭐⭐ Medium  
**예상 소요 시간:** 15~20분  
**관련 Datadog 제품:** APM, Log Management

---

## 증상 요약

APM Trace 상세 페이지에서 **"Logs" 탭에 로그가 안 보입니다.**  
로그는 따로 들어오고, 트레이스도 따로 들어오는데, **서로 연결이 안 됨.**

---

## 환경

- **서비스:** `correlation-demo` (Node.js + dd-trace)
- **Agent:** Datadog Agent 7.x (Docker)
- **로그:** JSON 형식으로 stdout 출력

---

## 재현 단계 / 관찰 가능한 현상

1. Datadog APM → Traces → `correlation-demo` 서비스의 트레이스 클릭
2. 트레이스 상세 → **Logs** 탭이 비어있음
3. Logs Explorer에서 `service:correlation-demo` 검색하면 로그는 있음
4. 로그에 `dd.trace_id`, `dd.span_id` 필드가 없거나 잘못됨

---

## 허용 리소스

- [x] Datadog 공식 문서 (APM, Logs)
- [x] Connect Logs and Traces
- [x] Node.js APM Docs
- [ ] 내부 Wiki: (팀에서 지정)

---

## 제출 포맷 (참가자용)

- **원인 요약:**
- **해결 단계:**
- **참고한 문서/링크:**
- **소요 시간:**

---

## 주최자용: 망가뜨리는 방법 & 정답

**망가뜨리는 방법:**

- **A.** `DD_LOGS_INJECTION=false`로 설정하여 trace_id 삽입 비활성화
- **B.** 로그에서 `dd.trace_id`, `dd.span_id` 필드를 다른 이름으로 변경
- **C.** 로그 service 태그를 APM service 이름과 다르게 설정 (예: `correlation-demo` vs `correlationdemo`)

**정답 요약:**

- **A:** `DD_LOGS_INJECTION=true` 로 변경 후 컨테이너 재시작
- **B:** Datadog Pipeline에서 Remapper로 `dd.trace_id` → `trace_id` 매핑
- **C:** 서비스 이름 통일 (APM과 Logs에서 동일해야 함)

**Correlation 필수 조건:**
1. 로그에 `dd.trace_id` 필드 존재
2. 로그의 `service` 태그 = APM의 `service` 이름
3. (선택) `dd.span_id`도 있으면 특정 span에 연결

**관련 공식 문서:** Connect Logs and Traces, dd-trace-js
