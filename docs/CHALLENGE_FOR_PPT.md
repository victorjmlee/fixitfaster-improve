# Fix It Faster – 챌린지 슬라이드/문서용

챌린지 사이트 대신 **PPT나 공유 문서**로 챌린지 내용을 보여줄 때 복사해서 쓰세요.  
`challenges/*.md` 내용을 이 형식으로 정리해 두었습니다.

---

## 슬라이드 1: 오늘의 챌린지

- **Fix It Faster** – Datadog 트러블슈팅 경연
- 각자 PC에서 Agent 띄우고, 본인 Datadog으로 APM 보면서 원인·해결 찾기
- 제출: **리더보드 URL** 에서 이름 + 원인 + 해결 단계 + 소요 시간 입력

---

## 슬라이드 2: 챌린지 예시 – APM 스팬이 안 보일 때

**제목:** APM에서 특정 서비스 스팬이 보이지 않음  

**난이도:** ⭐⭐ Medium | **예상:** 20~30분  
**관련 제품:** APM, Agent, Logs  

**증상**
- 프론트·API 서버 트레이스는 보이는데, **결제 서비스** 스팬만 Service Map / Trace에 없음

**환경**
- Kubernetes (EKS), Datadog Agent 7.x (DaemonSet)
- 결제 서비스: Go, HTTP/gRPC 혼용
- 결제 서비스 로그는 Log Management에는 수집됨

**재현**
1. API → 결제 서비스 호출 시 HTTP 200 정상
2. APM Service Map에 API 서버 → 결제 서비스 엣지 없음
3. 트레이스 상세에서 결제 구간만 비어 있음
4. Logs에는 결제 요청/응답 로그 있음

**허용 리소스**
- Datadog 공식 문서, Help Center, (선택) 내부 Wiki, 검색

**제출**
- 원인 요약 / 해결 단계 / 참고 문서·링크 / 소요 시간

---

## 슬라이드 3: 리더보드 & 다음 챌린지

- **리더보드:** (배포한 사이트 URL)/leaderboard  
  - 예: `https://fixitfaster-xxx.vercel.app/leaderboard`
- 동시 접속 가능 → 모두 같은 리더보드에서 제출·순위 확인
- 다음 챌린지는 `challenges/` 에 .md 추가 후 같은 형식으로 슬라이드에 넣기

---

*챌린지 추가 시 `challenges/_template.md` 복사해서 쓰고, 여기 슬라이드 문구만 맞춰 넣으면 됩니다.*
