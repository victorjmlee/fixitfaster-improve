# 시나리오: APM 트레이스가 안 들어옴

**난이도:** ⭐ Easy (Warm-up)  
**예상 소요 시간:** 5~10분  
**관련 Datadog 제품:** APM, Agent

---

## 증상 요약

정상일 때는 Datadog APM에 `trace-demo` 서비스의 트레이스가 보이는데,  
어느 순간부터 **트레이스가 전혀 들어오지 않습니다.**

---

## 환경

- **트레이스 소스:** `trace-demo` 컨테이너 (15초마다 스팬 전송)
- **Agent:** Datadog Agent 7.x (Docker)
- **포트:** 8126 (APM trace intake)

---

## 재현 단계 / 관찰 가능한 현상

1. Datadog 콘솔 → APM → Services / Traces 에서 `trace-demo` 서비스가 없음
2. `trace-demo` 컨테이너 로그에는 "span sent" 메시지가 정상 출력됨
3. Agent는 떠 있음

---

## 허용 리소스

- [x] Datadog 공식 문서 (APM, Agent)
- [x] Agent Troubleshooting
- [ ] 내부 Wiki: (팀에서 지정)

---

## 제출 포맷 (참가자용)

- **원인 요약:**
- **해결 단계:**
- **참고한 문서/링크:**
- **소요 시간:**

---

## 주최자용: 망가뜨리는 방법 & 정답

<!-- 경연 전에 참가자에게 알리지 말고, 경연 후 리뷰용으로만 사용 -->

**망가뜨리는 방법:**

docker-compose.yml에서 Agent의 `DD_APM_ENABLED=true` 를 `DD_APM_ENABLED=false` 로 변경

```yaml
# docker-compose.yml (agent 서비스)
environment:
  - DD_APM_ENABLED=false  # ← 이걸로 변경
```

그리고 Agent 재시작:
```bash
npm run agent:down && npm run agent:up
```

**정답 요약:**

1. docker-compose.yml에서 `DD_APM_ENABLED=true`로 복구
2. Agent 재시작: `npm run agent:down && npm run agent:up`
3. 1~2분 후 APM에서 `trace-demo` 서비스 확인

**관련 공식 문서:** Agent Troubleshooting, APM trace collection
