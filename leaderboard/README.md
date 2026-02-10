# Fix It Faster – 리더보드 전용

챌린지 목록 · 제출 · 리더보드만 제공하는 앱입니다.  
Datadog 연동·설정 페이지·instrumentation 없음 → **EB 등에 그대로 배포**하기 좋습니다.

## 로컬 실행

```bash
cd leaderboard
npm install
npm run dev
```

http://localhost:3000

## Vercel 배포 (가장 간단)

1. **가입/로그인**  
   [vercel.com](https://vercel.com) → GitHub(또는 GitLab/Bitbucket)로 로그인.

2. **프로젝트 Import**  
   - **Add New** → **Project** → `fixitfaster` 저장소 선택.
   - **Root Directory**를 `leaderboard`로 설정 (Edit → `leaderboard` 입력).
   - **Framework Preset**: Next.js (자동 인식).
   - **Build Command**: `npm run build` (기본값).
   - **Install Command**: `npm install` (기본값).
   - **Deploy** 클릭.

3. **이후**  
   `leaderboard` 안에서 수정 후 push하면 Vercel이 자동으로 다시 배포합니다.

**CLI로 한 번에 배포하려면** (저장소 연결 없이):
```bash
cd fixitfaster/leaderboard
npx vercel
```
가이드 따라 로그인 후, 프로젝트 루트를 `leaderboard`로 인식해 배포됩니다.

---

## Elastic Beanstalk 배포

**권장: 로컬 빌드 후 배포** (서버에서 `npm run build` 안 함 → monk처럼 빠르게 배포)

1. **환경 선택** (한 번만, 상위에서): `cd fixitfaster && eb use <환경이름>`
2. **리더보드 배포는 반드시 leaderboard 에서만:**
   ```bash
   cd fixitfaster/leaderboard
   npm run deploy
   ```
   **ap-northeast-2 (한국/개인 계정)에 배포할 때:** config에 `default_region`이 us-east-1이면 리전을 지정해야 함.
   ```bash
   AWS_REGION=ap-northeast-2 npm run deploy
   ```
   또는: `./scripts/deploy-eb.sh fixitfaster-leaderboard-victorlee ap-northeast-2`
   ⚠️ **상위(fixitfaster)에서 `eb deploy` 하면 루트 앱이 올라가서 서버에서 npm run build 가 돌아감. 리더보드만 올리려면 항상 leaderboard 에서 `npm run deploy` 만 사용.**

   환경 이름 직접 지정:
   ```bash
   ./scripts/deploy-eb.sh fixitfaster-leaderboard-victorlee
   ```

**80 포트가 매번 사라질 때 (영구 적용)**  
EB가 보안 그룹을 관리해서 수동으로 넣은 80 규칙이 지워질 수 있음. 한 번만 아래 실행 후 배포하면, ELB가 우리 보안 그룹을 쓰게 되어 규칙이 유지됨:
   ```bash
   ./scripts/setup-elb-http80.sh fixitfaster-leaderboard-victorlee
   npm run deploy
   ```

스크립트가 하는 일: 로컬에서 `npm run build` → `.next` 포함 zip 생성 → S3 업로드 → EB 애플리케이션 버전 생성 → 해당 환경에 배포. 서버 predeploy 훅은 `npm install --omit=dev` 만 실행합니다.

---

*기존 방식 (서버에서 빌드, 타임아웃 위험):*
```bash
cd leaderboard
eb deploy   # git 기준 번들 → 서버에서 npm install + build (오래 걸림)
```

## 디렉터리 구조

```
leaderboard/
  app/           # 페이지·API
  lib/           # 챌린지 파싱, 제출 저장
  challenges/    # 시나리오 .md (복사본)
  data/          # submissions.json (런타임 생성)
  .platform/     # EB 배포 훅
  scripts/       # start-server.js (PORT 지원)
```
