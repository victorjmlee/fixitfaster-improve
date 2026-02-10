# 시나리오: Infrastructure에 호스트가 안 나옴

**난이도:** ⭐ Easy  
**예상 소요 시간:** 10~20분  
**관련 Datadog 제품:** Infrastructure (Host Map, 등), Agent

---

## 증상 요약

Datadog Infrastructure(호스트 맵, 인벤토리 등)에 **Agent를 띄운 호스트가 보이지 않습니다.**  
이전에는 보였거나, 막 Agent를 올린 참가자는 “한 번도 안 보였다” 상태.

---

## 환경

- **플랫폼:** 로컬 Docker (Datadog Agent)
- **Agent:** Datadog Agent 7.x
- **기타:** API 키는 동일한데 호스트만 안 보임

---

## 재현 단계 / 관찰 가능한 현상

1. Datadog 콘솔 → Infrastructure → Host Map (또는 Hosts) 에서 해당 호스트 없음
2. Agent 컨테이너는 떠 있고 `agent status` 는 성공
3. (선택) 메트릭/APM도 안 들어오거나, 일부만 들어옴

---

## 허용 리소스

- [x] Datadog 공식 문서 (Infrastructure, Agent)
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

**망가뜨리는 방법 (택 1, 구현 쉬운 순):**

**방법 A. 호스트 이름을 잘못된 값으로 변경 (추천)**  
→ Infrastructure에는 호스트가 “다른 이름”으로만 보이고, 기대하는 `fixitfaster-agent`는 안 보임.

`docker-compose.yml` 의 **agent** 서비스에서:

1. `hostname: fixitfaster-agent` 를 **`hostname: broken-infra-host`** 로 변경
2. `DD_HOSTNAME=fixitfaster-agent` 를 **`DD_HOSTNAME=broken-infra-host`** 로 변경 (또는 이 줄 삭제)

저장 후 Agent만 재시작:

```bash
npm run agent:down && npm run agent:up
```

그러면 Datadog Infrastructure → Hosts / Host Map 에는 **`broken-infra-host`** 만 보이고, **`fixitfaster-agent`** 는 목록에 없음. 참가자는 “Agent 호스트가 안 보인다” → 문서에서 호스트명 설정 확인 → compose 에서 `DD_HOSTNAME`·`hostname` 복구.

**방법 B. Agent 컨테이너 중지**  
→ 호스트가 아예 메트릭을 안 보내서 몇 분 뒤 Infrastructure에서 사라짐.

```bash
docker stop fixitfaster-agent
```

(다른 데모 컨테이너는 계속 떠 있어도 됨. Agent만 중지.)  
참가자: Agent 다시 기동 (`npm run agent:up` 또는 `docker start fixitfaster-agent`).

**방법 C. API 키를 다른 org 키로 변경**  
→ 데이터가 다른 org로 가서 이 org의 Infrastructure에는 호스트가 안 보임. 다른 org API 키가 있을 때만 사용.

---

**정답 요약:**

- **A:** `docker-compose.yml` 에서 `hostname: fixitfaster-agent`, `DD_HOSTNAME=fixitfaster-agent` 복구 후 `npm run agent:down && npm run agent:up`
- **B:** `npm run agent:up` 또는 `docker start fixitfaster-agent`
- **C:** `.env.local` 의 `DATADOG_API_KEY` 를 올바른 org 키로 복구 후 Agent 재시작

**관련 공식 문서:**  
[Infrastructure Monitoring](https://docs.datadoghq.com/infrastructure/), [Agent Troubleshooting](https://docs.datadoghq.com/agent/troubleshooting/), [Hostname in Containers](https://docs.datadoghq.com/agent/troubleshooting/hostname_containers/)
