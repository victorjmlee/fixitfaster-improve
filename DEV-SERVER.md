# 로컬에서 Lab 화면이 안 열릴 때

## 원인

1. **다른 프로그램이 3000 포트 사용** → Next가 3001, 3002… 로 뜸. 브라우저에서 `localhost:3000`만 열면 **다른 앱**이 나와서 404나 에러.
2. **예전 빌드 캐시** → `Cannot find module './276.js'` 같은 오류.

## 해결 (순서대로)

### 1. 기존 서버/프로세스 정리

```bash
# 3000 포트 쓰는 프로세스 확인 (Mac/Linux)
lsof -i :3000

# 나오는 PID로 종료 (예: PID가 12345면)
kill 12345
```

또는 터미널에서 `npm run dev` 돌리던 창에서 **Ctrl+C**로 종료.

### 2. 캐시 삭제 후 실행

```bash
cd /Users/victor.lee/fixitfaster
rm -rf .next
npm run dev
```

### 3. 터미널에 나온 주소로 접속

- `Local: http://localhost:3000` 이면 → **http://localhost:3000/lab**
- `Port 3000 is in use, trying 3001` 이면 → **http://localhost:3001/lab**
- 포트 번호는 터미널에 찍힌 **Local:** 주소를 그대로 쓰면 됨.

### 4. Lab 직접 주소로 열기

홈이 아니라 주소창에 직접 입력:

- **http://localhost:3000/lab** (또는 터미널에 나온 포트)

---

정리: **캐시 삭제(`rm -rf .next`) + 터미널에 나온 포트로 `/lab` 접속** 하면 됨.
