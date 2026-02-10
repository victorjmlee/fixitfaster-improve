# 시나리오: 커스텀 메트릭이 안 들어옴

**난이도:** ⭐⭐ Medium  
**예상 소요 시간:** 10~20분  
**관련 Datadog 제품:** Metrics, Agent (DogStatsD)

---

## 증상 요약

앱에서 DogStatsD로 커스텀 메트릭을 보내는데, **Metrics Explorer에 해당 메트릭이 안 보입니다.**  
`fixitfaster.demo.*` 메트릭이 전혀 나타나지 않음.

---

## 환경

- **메트릭 소스:** `metrics-demo` 컨테이너 (DogStatsD 클라이언트)
- **Agent:** Datadog Agent 7.x (Docker)
- **DogStatsD 포트:** 8125/udp

---

## 재현 단계 / 관찰 가능한 현상

1. Datadog Metrics → Explorer에서 `fixitfaster.demo` 검색
2. 메트릭이 없음 (자동완성에도 안 나옴)
3. `metrics-demo` 컨테이너 로그에는 "sent metrics" 메시지가 정상 출력
4. (선택) Agent status에서 DogStatsD 상태 확인 필요

---

## 허용 리소스

- [x] Datadog 공식 문서 (Metrics, DogStatsD)
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

**망가뜨리는 방법:**

- **A.** `DD_DOGSTATSD_NON_LOCAL_TRAFFIC=false` 설정 → 외부 컨테이너에서 메트릭 수신 거부
- **B.** 8125 포트 매핑 제거 또는 막기
- **C.** Agent에서 `dogstatsd_stats_enable: false` 또는 DogStatsD 완전 비활성화

**정답 요약:**

- **A:** `DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true` 설정 후 Agent 재시작
- **B:** docker-compose.yml에 `8125:8125/udp` 포트 매핑 추가
- **C:** DogStatsD 활성화 설정 복구

**확인 방법:**
```bash
# Agent 컨테이너에서 DogStatsD 상태 확인
docker exec fixitfaster-agent agent status | grep -A5 DogStatsD
```

**관련 공식 문서:** DogStatsD, Custom Metrics
