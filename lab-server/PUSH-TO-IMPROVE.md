# fixitfaster-improve 레포에 push 하기

새 레포: https://github.com/victorjmlee/fixitfaster-improve.git

## 명령어 (fixitfaster 폴더에서 실행)

```bash
# 1. fixitfaster 프로젝트 폴더로 이동
cd /Users/victor.lee/fixitfaster

# 2. 새 레포를 원격으로 추가 (이름: improve)
git remote add improve https://github.com/victorjmlee/fixitfaster-improve.git

# 3. 변경 사항 있으면 커밋
git status
git add .
git commit -m "Add lab-server and EC2 deploy docs"

# 4. improve 레포로 push (main 브랜치)
git push -u improve main
```

이미 다 커밋돼 있으면 3번은 건너뛰고 4번만 하면 됩니다.

## 한 번에 복사용

```bash
cd /Users/victor.lee/fixitfaster
git remote add improve https://github.com/victorjmlee/fixitfaster-improve.git
git add .
git status
git commit -m "Add lab-server and EC2 deploy docs"   # 변경 없으면 생략
git push -u improve main
```

## 주의

- `improve` 원격은 한 번만 추가하면 됩니다. 이미 추가했으면 `git remote add improve ...` 는 건너뛰세요. (에러: remote improve already exists)
- HTTPS 대신 SSH 쓰려면:  
  `git remote add improve git@github.com:victorjmlee/fixitfaster-improve.git`
