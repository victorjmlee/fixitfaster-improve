#!/usr/bin/env bash
# 로컬에서 빌드한 뒤 .next 포함해서 EB에 배포 (서버에서는 npm run build 안 함)
set -e

# Repo root = leaderboard app root
LEADERBOARD_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$LEADERBOARD_ROOT"
CONFIG="$REPO_ROOT/.elasticbeanstalk/config.yml"

# 프로필/리전: 인자(region) > AWS_REGION > eb status > config
PROFILE="${AWS_PROFILE:-$(grep -E '^\s*profile:' "$CONFIG" 2>/dev/null | sed 's/.*: *//' | tr -d ' ')}"
PROFILE="${PROFILE:-default}"
export AWS_PROFILE="$PROFILE"
EB_STATUS=$(cd "$REPO_ROOT" 2>/dev/null && eb status 2>/dev/null || true)
# 리전: AWS_REGION 있으면 사용, 없으면 ap-northeast-2 고정 (개인 계정 한국)
REGION="${AWS_REGION:-ap-northeast-2}"
if [[ -n "$2" ]] && [[ "$2" == *-*-* ]]; then REGION="$2"; fi
VERSION_LABEL="leaderboard-$(date +%Y%m%d-%H%M%S)"
ZIP_NAME="deploy-${VERSION_LABEL}.zip"

if [[ ! -f "$CONFIG" ]]; then
  echo "ERROR: $CONFIG not found. Run from repo root: npm run deploy" >&2
  exit 1
fi

# environment: first arg, eb status (already run above), or config
ENV_NAME="$1"
if [[ -z "$ENV_NAME" ]]; then
  ENV_NAME=$(echo "$EB_STATUS" | grep -iE "Environment (name)?:?|details for:" | head -1 | sed 's/.*: *//' | tr -d ' ')
fi
if [[ -z "$ENV_NAME" ]] || [[ "$ENV_NAME" == "None" ]]; then
  ENV_NAME=$(grep -E '^\s+environment:' "$CONFIG" 2>/dev/null | head -1 | sed 's/.*: *//' | tr -d ' ')
fi
if [[ -z "$ENV_NAME" ]]; then
  echo "Usage: $0 [environment-name]" >&2
  echo "Example: $0 fixitfaster-leaderboard-victorlee" >&2
  echo "Or set branch-defaults.default.environment in $CONFIG" >&2
  exit 1
fi

# 환경이 속한 앱·리전 사용 (config와 달라도 반영됨)
APP_NAME=$(aws elasticbeanstalk describe-environments --environment-names "$ENV_NAME" --region "$REGION" --profile "$PROFILE" --query 'Environments[0].ApplicationName' --output text 2>/dev/null || true)
if [[ -z "$APP_NAME" ]] || [[ "$APP_NAME" == "None" ]]; then
  APP_NAME=$(grep -E '^\s*application_name:' "$CONFIG" | sed 's/.*: *//' | tr -d ' ')
fi
if [[ -z "$APP_NAME" ]]; then
  echo "ERROR: could not get application name for environment $ENV_NAME (check region $REGION and profile)" >&2
  echo "  For ap-northeast-2 run: AWS_REGION=ap-northeast-2 npm run deploy" >&2
  exit 1
fi
echo "==> Target: app=$APP_NAME env=$ENV_NAME region=$REGION"

echo "==> Build"
cd "$LEADERBOARD_ROOT"
npm run build

echo "==> Create deployment zip (including .next)"
ZIP_PATH="$LEADERBOARD_ROOT/$ZIP_NAME"
rm -f "$ZIP_PATH"
(cd "$LEADERBOARD_ROOT" && zip -r "$ZIP_NAME" . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".next/cache/*" \
  -x "*.zip" \
  -x ".env*" \
  -x "data/submissions.json" \
  ) >/dev/null 2>&1

if [[ ! -f "$ZIP_PATH" ]]; then
  echo "ERROR: failed to create zip" >&2
  exit 1
fi
# 배포 번들에 leaderboard predeploy(빌드 없음) 가 들어갔는지 확인
if unzip -l "$ZIP_PATH" 2>/dev/null | grep -q "platform/hooks/predeploy/01_build.sh"; then
  echo "==> Zip contains .platform/hooks/predeploy/01_build.sh (leaderboard, no build)"
else
  echo "WARN: .platform/hooks/predeploy/01_build.sh not found in zip" >&2
fi

echo "==> Get EB S3 bucket (region=$REGION profile=$PROFILE)"
# create-storage-location: 기존 버킷 반환 또는 생성 (describe-storage-location 은 구 CLI 에 없을 수 있음)
BUCKET=$(aws elasticbeanstalk create-storage-location --region "$REGION" --profile "$PROFILE" --query 'S3Bucket' --output text 2>&1) || true
if [[ -z "$BUCKET" ]] || [[ "$BUCKET" == *"Error"* ]] || [[ "$BUCKET" == *"error"* ]] || [[ "$BUCKET" == *"invalid"* ]]; then
  echo "ERROR: could not get EB storage bucket." >&2
  echo "  Region: $REGION  Profile: $PROFILE" >&2
  echo "  AWS output: $BUCKET" >&2
  exit 1
fi

S3_KEY="eb-$APP_NAME/$ZIP_NAME"
echo "==> Upload to s3://$BUCKET/$S3_KEY"
aws s3 cp "$ZIP_PATH" "s3://$BUCKET/$S3_KEY" --region "$REGION" --profile "$PROFILE"

echo "==> Create application version: $VERSION_LABEL"
aws elasticbeanstalk create-application-version \
  --application-name "$APP_NAME" \
  --version-label "$VERSION_LABEL" \
  --source-bundle "S3Bucket=$BUCKET,S3Key=$S3_KEY" \
  --region "$REGION" \
  --profile "$PROFILE" \
  --output text --query 'ApplicationVersion.VersionLabel' 2>/dev/null || true

echo "==> Deploy to environment: $ENV_NAME (version=$VERSION_LABEL)"
if ! aws elasticbeanstalk update-environment \
  --environment-name "$ENV_NAME" \
  --version-label "$VERSION_LABEL" \
  --region "$REGION" \
  --profile "$PROFILE" \
  --output text --query 'EnvironmentId' 2>&1; then
  echo "ERROR: update-environment failed. Deploy the version manually:" >&2
  echo "  aws elasticbeanstalk update-environment --environment-name $ENV_NAME --version-label $VERSION_LABEL --region $REGION --profile $PROFILE" >&2
  exit 1
fi

echo "==> ELB 보안 그룹에 80 포트 열기 (EB가 수동 규칙을 지우므로 배포마다 적용)"
LB_RAW=$(aws elasticbeanstalk describe-environment-resources --environment-name "$ENV_NAME" --region "$REGION" --profile "$PROFILE" --query 'EnvironmentResources.LoadBalancers[0].Name' --output text 2>/dev/null || true)
# ARN 이 오면 이름만 추출 (loadbalancer/app/이름/id)
LB_NAME="$LB_RAW"
[[ "$LB_RAW" == *loadbalancer/app/* ]] && LB_NAME=$(echo "$LB_RAW" | sed 's|.*loadbalancer/app/||' | cut -d'/' -f1)
if [[ -n "$LB_NAME" ]] && [[ "$LB_NAME" != "None" ]] && [[ ${#LB_NAME} -le 32 ]]; then
  SG_ID=$(aws elbv2 describe-load-balancers --names "$LB_NAME" --region "$REGION" --profile "$PROFILE" --query 'LoadBalancers[0].SecurityGroups[0]' --output text 2>/dev/null || true)
  if [[ -n "$SG_ID" ]] && [[ "$SG_ID" != "None" ]] && [[ "$SG_ID" == sg-* ]]; then
    aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 --region "$REGION" --profile "$PROFILE" 2>/dev/null || true
    echo "    (sg $SG_ID 에 80 허용 적용됨)"
  fi
fi

rm -f "$ZIP_PATH"
echo "==> Done. Monitor: eb status (from repo root) or AWS Console."
