#!/bin/bash
# Elastic Beanstalk Node.js: 배포 시 Next.js 빌드 실행
set -e
for DIR in /var/app/ondeck /var/app/staging . ; do
  if [ -f "$DIR/package.json" ]; then
    cd "$DIR"
    npm install
    npm run build
    exit 0
  fi
done
echo "predeploy ERROR: package.json not found in ondeck/staging/." >&2
exit 1
