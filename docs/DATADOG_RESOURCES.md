# Datadog 공식 문서 및 Troubleshooting 리소스

Fix It Faster 경연 시 참고할 **Datadog 공식 문서**와 **Troubleshooting** 링크 정리입니다.  
내부 Wiki는 팀에서 사용하는 경로를 추가해서 활용하세요.

---

## 공식 문서 진입점

| 리소스 | URL | 비고 |
|--------|-----|------|
| **Documentation** | https://docs.datadoghq.com | 전 제품 문서 |
| **Support / Help Center** | https://help.datadoghq.com | 지원, FAQ, Agent Flare 등 |
| **Troubleshooting 랜딩** | https://www.datadoghq.com/specific_interest/troubleshooting | 트러블슈팅 관련 콘텐츠 |

---

## 제품별 Troubleshooting 문서

### Agent

- **Agent Troubleshooting**  
  https://docs.datadoghq.com/agent/troubleshooting  
  - 권한, site 설정, 컨테이너 이슈, Debug 모드, Agent Flare

### APM (Application Performance Monitoring)

- **Tracing**  
  https://docs.datadoghq.com/tracing  
- **APM 메트릭**  
  https://docs.datadoghq.com/tracing/metrics  

### Log Management

- **Log Management**  
  https://docs.datadoghq.com/logs  
- **Observability Pipelines – Troubleshooting**  
  https://docs.datadoghq.com/observability_pipelines/monitoring_and_troubleshooting/troubleshooting  
  https://docs.datadoghq.com/observability_pipelines/troubleshooting  

### Infrastructure / 호스트·컨테이너

- **Infrastructure**  
  https://docs.datadoghq.com/infrastructure  
- 컨테이너/쿠버네티스 관련 문서는 docs 내 해당 섹션 참고

### 통합(Integrations)

- **AWS 등 통합**  
  Help Center 및 docs 내 각 통합 페이지 (IAM, 메트릭 지연, 데이터 불일치 등)

---

## 경연 시 활용 팁

1. **증상 키워드**로 docs.datadoghq.com 검색 → 해당 제품(APM, Logs, Agent 등) 문서로 좁히기  
2. **에러 메시지** 그대로 검색하면 Troubleshooting 문서가 자주 나옴  
3. **제품 조합**: 예) "스팬이 안 보임" → APM + Agent 상태 + 로그 수집 여부를 함께 확인  
4. **내부 Wiki**에 팀만의 Runbook, 장애 패턴이 있으면 챌린지에 "허용 리소스"로 명시해 두기  

---

*마지막 링크 확인: 2025-02 기준. Datadog 사이트 구조 변경 시 경로가 바뀔 수 있습니다.*
