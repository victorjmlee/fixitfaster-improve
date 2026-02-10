#!/bin/bash
# [LEADERBOARD] .next는 배포 번들에 이미 포함됨. 서버에서는 production 의존성만 설치 (빌드 없음).
set -e
echo "[LEADERBOARD predeploy] install only, no build"
for DIR in /var/app/ondeck /var/app/staging . ; do
  if [ -f "$DIR/package.json" ]; then
    cd "$DIR"
    npm install --omit=dev
    exit 0
  fi
done
echo "predeploy ERROR: package.json not found" >&2
exit 1
