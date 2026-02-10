# 시나리오: 로그가 Datadog에 안 보임

**난이도:** ⭐⭐ Medium  
**예상 소요 시간:** 15~25분  
**관련 Datadog 제품:** Log Management, Agent

---

## 증상 요약

이전에는 Datadog Logs에 앱/시스템 로그가 수집됐는데, **어느 순간부터 로그가 전혀 들어오지 않거나 특정 소스만 사라졌습니다.**

---

## 환경

- **플랫폼:** 로컬 Docker (Datadog Agent)
- **Agent:** Datadog Agent 7.x
- **기타:** 로그 소스는 파일/ stdout / 컨테이너 로그 등 (팀에서 지정)

---

## 재현 단계 / 관찰 가능한 현상

1. Datadog 콘솔 → Logs → Explorer 에서 기대하던 로그가 없음
2. (선택) Agent 설정에서 로그 수집이 꺼져 있거나 경로/소스가 잘못됨
3. 앱은 동작 중이고 로그는 로컬에는 남고 있음

---

## 허용 리소스

- [x] Datadog 공식 문서 (Log Management, Agent)
- [x] Help Center, Agent Troubleshooting
- [ ] 내부 Wiki: (팀에서 지정)

---

## 제출 포맷 (참가자용)

- **원인 요약:**
- **해결 단계:**
- **참고한 문서/링크:**
- **소요 시간:**

---

## 주최자용: 망가뜨리는 방법 & 정답

**망가뜨리는 방법 (택 1):**

- **A.** Agent 환경변수 `DD_LOGS_ENABLED=false` 로 설정 후 재시작
- **B.** 로그 수집 경로/파일을 잘못된 경로로 변경 (예: 존재하지 않는 파일)
- **C.** Agent에서 해당 로그 소스만 비활성화하거나 tag를 잘못 설정해 탐색이 안 되게 함

**정답 요약:**

- **A:** `DD_LOGS_ENABLED=true` 복구, Agent 재시작
- **B:** 올바른 로그 경로/설정 복구
- **C:** 소스/태그 설정 복구

**관련 공식 문서:** Log Collection (Agent), Troubleshooting
