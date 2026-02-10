# 예시: APM에서 특정 서비스 스팬이 보이지 않음

**난이도:** ⭐⭐ Medium  
**예상 소요 시간:** 20~30분  
**관련 Datadog 제품:** APM, Agent, Logs (선택)

---

## 증상 요약

프론트엔드와 API 서버 트레이스는 Datadog APM에 보이는데, 중간에 호출하는 **결제 서비스**의 스팬만 Service Map과 Trace 목록에 전혀 나타나지 않습니다.

---

## 환경

- **플랫폼:** Kubernetes (EKS)
- **Agent:** Datadog Agent 7.x (DaemonSet)
- **결제 서비스:** Go 서비스, HTTP/gRPC 혼용
- **기타:** 트래픽은 정상적으로 들어오고 있으며, 결제 서비스 로그는 Log Management에는 수집되고 있음

---

## 재현 단계 / 관찰 가능한 현상

1. API 서버에서 결제 서비스를 호출하면 HTTP 200과 함께 정상 응답이 옴
2. APM Service Map에서 API 서버 → 결제 서비스 엣지가 없음
3. 트레이스 상세에서 결제 서비스 구간만 비어 있음
4. Logs에서는 결제 서비스의 요청/응답 로그는 확인 가능

---

## 허용 리소스

- [x] Datadog 공식 문서 (docs.datadoghq.com)
- [x] Datadog Help Center (help.datadoghq.com)
- [ ] 내부 Wiki: (팀 Wiki가 있다면 URL 추가)
- [ ] 기타: 검색엔진 사용 가능

---

## 제출 포맷 (참가자용)

- **원인 요약:**
- **해결 단계:**
- **참고한 문서/링크:**
- **소요 시간:**

---

## 정답 요약 (주최자용, 경연 후 공개)

<!-- 실제 정답은 solutions/example-apm-missing-spans.md 등으로 분리해 두어도 됨 -->

- **근본 원인:** (예: 트레이싱 라이브러리 미설치, DD_TRACE_ENABLED=false, 샘플링으로 인한 미수집 등 중 하나로 설정)
- **권장 해결:** (예: Go tracer 설정 및 환경변수 확인, Agent와 서비스 간 네트워크/포트 확인)
- **관련 공식 문서:** APM Go 문서, Agent Troubleshooting
