# AWS에 배포해서 팀원이 같이 접속하기

localhost는 본인 PC에서만 접속 가능하므로, **팀원이 모두 접속하려면** 앱을 한 URL에 배포해야 합니다.  
회사 AWS 계정을 쓸 수 있다면 아래 방법 중에서 선택하면 됩니다.

---

## 1) AWS Amplify (가장 간단, 권장)

Next.js를 빌드·호스팅해 주고, GitHub 연결만 하면 자동 배포됩니다.  
배포 후 나오는 URL(예: `https://main.xxxxx.amplifyapp.com`)을 팀에 공유하면 됩니다.

### 절차 요약

1. **저장소를 GitHub에 올리기** (이미 올려 두었다면 생략)

2. **AWS 콘솔** → **Amplify** → **New app** → **Host web app**  
   - GitHub 연동 후 이 레포 선택  
   - 브랜치 선택 (예: `main`)

3. **빌드 설정** (Amplify가 Next.js를 감지하면 대부분 자동으로 채워짐)
   - Build command: `npm run build`
   - Output directory: (비워 두거나 Amplify 기본값)
   - Base directory: (비워 두면 루트)

4. **환경 변수** (선택)
   - `DATADOG_API_KEY` – 설정 페이지에서 “연결 테스트” 쓰려면 입력

5. **배포**  
   - 저장 후 자동으로 빌드·배포됨  
   - 완료되면 **앱 URL**이 나옴 → 이 주소를 팀에 공유

### 참고

- 제출/리더보드는 서버리스에서는 **메모리**에만 저장되므로, 인스턴스가 재시작되면 비워질 수 있습니다. 장기 보존이 필요하면 나중에 DynamoDB 등 DB 연동을 추가하면 됩니다.
- 비용: Amplify 무료 티어(빌드/호스팅 제한) 안에서 사용 가능. 사용량이 크면 과금.

---

## 2) Elastic Beanstalk (Node.js)

Next.js 앱을 **Node.js 18** 플랫폼으로 배포하는 방법입니다.  
EB가 `PORT` 환경변수로 포트를 넘기므로, 이 레포는 `npm start` 시 `scripts/start-server.js`로 `PORT`를 사용합니다.  
배포 시 빌드는 `.platform/hooks/predeploy/01_build.sh`에서 실행됩니다.

### 전제

- **배포 대상:** Next.js 웹 앱만 (챌린지·리더보드). Agent / log-demo 등 Docker 컨테이너는 EB에 올리지 않습니다. 각자 로컬에서 Agent를 띄우고, 앱만 EB URL로 접속하는 형태입니다.

### 절차 요약

1. **애플리케이션 생성**
   - AWS 콘솔 → **Elastic Beanstalk** → **Create application**
   - **Platform:** Node.js 18 (Amazon Linux 2)
   - **Application code:** Upload your code 또는 GitHub/S3 등으로 소스 연결

2. **소스에 포함할 것**
   - 프로젝트 루트의 `.platform/` (배포 훅), `scripts/start-server.js`, `package.json` 등 전체 소스
   - `.env*` 는 올리지 말고, EB **Configuration → Software → Environment properties** 에서 설정

3. **환경 변수 (EB 콘솔에서 설정)**
   - `DATADOG_API_KEY` – (선택) 설정 페이지 연결 테스트용
   - 기타 필요 시 `NODE_ENV=production` 등

4. **배포**
   - ZIP으로 압축 후 **Upload and deploy** 또는 GitHub/CodePipeline 연동
   - 배포가 끝나면 **Environment URL** (예: `https://xxx.us-east-1.elasticbeanstalk.com`) 로 접속

5. **동작 확인**
   - 브라우저에서 위 URL 접속 → 챌린지 목록·리더보드 확인
   - (선택) 설정 페이지에서 Datadog 연결 테스트

### 참고

- **제출/리더보드:** 인스턴스 디스크의 `data/submissions.json` 에 저장됩니다. 인스턴스가 교체되면 비워질 수 있으므로, 장기 보존이 필요하면 DynamoDB 등 연동을 추가하세요.
- **비용:** EB 환경(EC2 + ELB 등) 요금. 단일 인스턴스로도 동작합니다.
- **빌드:** `.platform/hooks/predeploy/01_build.sh` 가 `npm install` 후 `npm run build` 를 실행합니다. 훅이 실패하면 배포가 실패하므로, 로그에서 빌드 오류를 확인하세요.

---

## 3) EC2 + Node (직접 서버 띄우기)

한 대의 서버에 Node를 설치하고 `npm run build` 후 `npm run start` 로 돌리는 방식입니다.  
URL은 EC2 퍼블릭 IP 또는 도메인 + (선택) ALB/nginx으로 HTTPS 붙이면 됩니다.

### 절차 요약

1. **EC2 인스턴스** 생성 (Amazon Linux 2 또는 Ubuntu), 보안 그룹에서 **80 또는 443** (그리고 SSH 22) 열기

2. **인스턴스에 접속** 후 Node 설치 (예: nvm 또는 공식 Node 바이너리)

3. **앱 배포**
   ```bash
   git clone <이 레포 URL>
   cd fixitfaster
   npm install
   npm run build
   ```
   환경 변수는 `.env` 또는 `export` 로 설정 (예: `DATADOG_API_KEY`)

4. **실행** (백그라운드 유지를 위해 PM2 등 권장)
   ```bash
   npm install -g pm2
   pm2 start npm --name fixitfaster -- start
   pm2 save && pm2 startup
   ```

5. **접속**  
   - 포트 3000만 쓸 때: `http://<EC2퍼블릭IP>:3000`  
   - 80/443 쓰려면 nginx 리버스 프록시 또는 PM2에서 포트 80 바인딩(권한 필요)

6. **(선택)** 도메인 + HTTPS  
   - Route 53으로 도메인 연결, ACM으로 인증서 발급 후 ALB 또는 nginx에 SSL 설정

### 참고

- 제출 데이터는 EC2 디스크의 `data/submissions.json` 에 저장되므로, 인스턴스를 지우지 않으면 유지됩니다.
- 비용: EC2 인스턴스 요금 + 트래픽. t2.micro 등 소형 인스턴스로 시작 가능.

---

## 4) 같은 사무실 네트워크에서만 잠깐 공유 (배포 없이)

AWS 배포 없이, **같은 Wi‑Fi/회사망**에서만 잠깐 쓸 때:

- 이 PC에서 `npm run dev:lan` 실행
- **팀원에게는 0.0.0.0 이 아니라 이 PC의 실제 IP** 로 접속하라고 공유 (예: `http://192.168.0.10:3000`). Mac 이면 `ipconfig getifaddr en0` 로 IP 확인

방화벽에서 3000 포트가 막혀 있으면 접속이 안 될 수 있고, PC를 끄면 사라지므로 “경연용으로 한 번만” 쓰기 적합합니다.

---

## 정리

| 방법 | 난이도 | 팀 접속 | 비고 |
|------|--------|--------|------|
| **AWS Amplify** | 낮음 | 어디서든 URL로 접속 | Next.js 자동 빌드·호스팅, 권장 |
| **Elastic Beanstalk** | 중간 | 어디서든 EB URL로 접속 | Node.js 18, 배포 훅으로 빌드 |
| **EC2 + Node** | 중간 | 어디서든 IP/도메인으로 접속 | 제출 데이터 디스크에 유지 가능 |
| **dev:lan (같은 네트워크)** | 낮음 | 같은 Wi‑Fi/회사망만 | 배포 없이 테스트용 |

팀원 전원이 접속해야 하면 **Amplify**, **Elastic Beanstalk**, **EC2** 중 하나로 URL을 만든 뒤 그 주소를 공유하면 됩니다.
