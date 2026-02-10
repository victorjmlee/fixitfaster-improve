# Elastic Beanstalk 배포 – 커맨드 단계별 가이드

**배포하는 것:** Next.js 앱만 (챌린지 목록 + 리더보드 + 제출). Agent / log-demo 등 Docker는 올리지 않음.

---

## 1. 사전 준비

### 1-1. AWS CLI 설정 (한 번만)

```bash
# AWS CLI 설치 (없다면)
# macOS
brew install awscli

# 로그인/권한 설정 (Access Key, Secret Key 필요)
aws configure
# AWS Access Key ID: 본인 키
# AWS Secret Access Key: 본인 시크릿
# Default region name: ap-northeast-2  (또는 us-east-1 등 원하는 리전)
```

### 1-2. EB CLI 설치 (한 번만)

```bash
# macOS
brew install awsebcli

# 또는 pip
pip install awsebcli --upgrade
```

설치 확인:

```bash
eb --version
```

---

## 2. 프로젝트에서 EB 초기화 (한 번만)

프로젝트 루트로 이동:

```bash
cd /Users/victor.lee/fixitfaster
```

EB 초기화:

```bash
eb init
```

대화형에서 다음처럼 선택 (예시):

- **Select a default region:** 원하는 리전 (예: `ap-northeast-2`)
- **Enter Application Name:** `fixitfaster` (또는 원하는 이름)
- **It appears you are using Node.js. Is this correct?** `y`
- **Select a platform branch:** `Node.js 18 running on 64bit Amazon Linux 2`
- **Set up SSH?** 원하면 `y`, 아니면 `n`
- **Select a keypair:** SSH 쓸 거면 키 선택, 안 쓰면 엔터

완료되면 `.elasticbeanstalk/config.yml` 이 생깁니다.

---

## 3. 환경 만들기 (최초 1회)

```bash
eb create fixitfaster-env
```

- `fixitfaster-env` 는 환경 이름. 바꿔도 됨.
- 인스턴스 타입·용량 등 물어보면 기본값 선택해도 됨.
- 끝나면 **CNAME URL** 이 나옴 (예: `fixitfaster-env.ap-northeast-2.elasticbeanstalk.com`).

이미 콘솔에서 애플리케이션/환경을 만들어 뒀다면:

```bash
eb use fixitfaster-env
```

---

## 4. 환경 변수 넣기 (선택)

리더보드만 쓰면 필수는 아니고, 설정 페이지에서 Datadog 연결 테스트를 쓰려면:

```bash
eb setenv DATADOG_API_KEY=여기에_API_키
```

여러 개:

```bash
eb setenv DATADOG_API_KEY=xxx NODE_ENV=production
```

---

## 5. 배포하기

```bash
eb deploy
```

- Git이 추적하는 파일 기준으로 번들을 만들어 올림 (`.gitignore` 제외).
- 서버에서 `.platform/hooks/predeploy/01_build.sh` 가 `npm install` → `npm run build` 실행 후 `npm start` 로 앱 실행.

배포 상태 확인:

```bash
eb status
```

---

## 6. 브라우저에서 확인

```bash
eb open
```

또는 `eb status` 에 나온 **CNAME** 주소로 접속:

- `http://fixitfaster-env.리전.elasticbeanstalk.com`
- 챌린지 목록, 리더보드, 제출이 보이면 성공.

---

## 7. 자주 쓰는 명령어 정리

| 명령어 | 설명 |
|--------|------|
| `eb status` | 환경 상태·URL 확인 |
| `eb deploy` | 현재 코드로 배포 |
| `eb open` | 브라우저로 환경 열기 |
| `eb logs` | 최근 로그 보기 (빌드/앱 오류 확인) |
| `eb setenv KEY=val` | 환경 변수 설정 |
| `eb ssh` | 인스턴스에 SSH (필요 시) |
| `eb terminate fixitfaster-env` | 환경 삭제 |

---

## 8. 문제 나올 때

**배포 실패**

```bash
eb logs
```

에서 **predeploy** / `npm run build` 오류 확인.  
`Full logs` 에서 `01_build.sh` 출력과 Node 버전 확인.

**앱이 안 뜸**

- `eb status` 로 Health 확인.
- `eb logs` 에서 `npm start` / `scripts/start-server.js` 오류 확인.
- 환경 변수: `eb setenv` 또는 콘솔 **Configuration → Software → Environment properties** 확인.

**리더보드/제출이 비어 있음**

- 인스턴스가 새로 올라오면 `data/submissions.json` 은 비어 있는 상태로 시작합니다. 정상 동작입니다.

---

## 9. 한 번에 복붙용 (이미 init/create 한 경우)

```bash
cd /Users/victor.lee/fixitfaster
eb use fixitfaster-env   # 본인 환경 이름으로
eb setenv DATADOG_API_KEY=원하는경우키
eb deploy
eb open
```

이렇게 하면 **리더보드(챌린지·제출 포함)만** Elastic Beanstalk에 올라가고, Agent/데모는 각자 로컬에서 띄우면 됩니다.
