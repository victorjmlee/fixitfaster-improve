# 트레이스·로그는 어디서 나와서 어디로 가나?

Agent는 **받기만** 합니다. 트레이스와 로그를 **보내는 쪽(소스)** 이 있어야 Datadog에 데이터가 쌓입니다.

---

## 트레이스 (APM)

| 무엇 | 설명 |
|------|------|
| **어디로** | 이 호스트의 **Agent** (포트 8126) |
| **누가 보냄** | **8126으로 트레이스를 전송하는 프로세스** |
| **우리 레포에서** | **trace-demo** 컨테이너가 15초마다 dd-trace로 스팬을 Agent(서비스 이름 `agent`)로 전송. `npm run agent:up` 시 agent + trace-demo + log-demo 가 같이 떠서 **APM에 trace-demo 서비스** 트레이스가 들어감. |
| **다른 예** | Next 앱(`DD_AGENT_HOST=localhost`), 또는 다른 서비스를 instrument 해서 Agent 8126으로 보내도 됨. |

정리: **트레이스는 trace-demo(컨테이너)가 Agent로 보내서** 기본적으로 Datadog APM에 쌓입니다. (Next 앱은 선택.)

---

## 로그 (Logs)

| 무엇 | 설명 |
|------|------|
| **어디서** | 이 호스트에서 도는 **다른 Docker 컨테이너**의 stdout/stderr |
| **누가 모음** | Agent가 **docker.sock** 으로 컨테이너 목록을 보고, 각 컨테이너 로그를 tail 해서 Datadog으로 전송 |
| **우리 레포에서** | `docker-compose` 에 **log-demo** 컨테이너가 있음. 10초마다 한 줄씩 로그 출력 → Agent가 수집 → Datadog Logs 에 보임 |
| **다른 예** | 이 호스트에서 띄운 다른 컨테이너(웹 서버, 앱 등)의 stdout/stderr 도 전부 수집 대상 (Agent 자신 컨테이너만 제외) |

정리: **로그는 “같은 호스트의 다른 컨테이너”에서 나옵니다.**  
`npm run agent:up` (또는 `docker compose up -d`) 하면 agent + log-demo 가 같이 떠서, **Logs에는 log-demo 로그**가 들어갑니다.  
호스트에서만 `npm run dev` 하고 앱을 컨테이너로 안 띄우면, 그 앱의 stdout 은 이 설정만으로는 수집 안 됩니다.

---

## 한 줄 요약

- **트레이스:** **trace-demo** 컨테이너가 15초마다 Agent(8126)로 스팬 전송 → Datadog APM에 `trace-demo` 서비스로 보임.
- **로그:** **log-demo** 컨테이너 stdout → Agent가 수집 → Datadog Logs.
