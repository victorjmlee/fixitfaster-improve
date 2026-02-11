#!/usr/bin/env bash
# 한 번만 실행: ELB용 보안 그룹 생성(80 허용) 후 .ebextensions에 넣어서 영구 적용
set -e

LEADERBOARD_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$LEADERBOARD_ROOT/.." && pwd)"
CONFIG="$REPO_ROOT/.elasticbeanstalk/config.yml"
EBCONFIG="$LEADERBOARD_ROOT/.ebextensions/02-elb-http80.config"

REGION="${AWS_REGION:-$(grep -E '^\s*default_region:' "$CONFIG" 2>/dev/null | sed 's/.*: *//' | tr -d ' ')}"
REGION="${REGION:-us-east-1}"
PROFILE="${AWS_PROFILE:-$(grep -E '^\s*profile:' "$CONFIG" 2>/dev/null | sed 's/.*: *//' | tr -d ' ')}"
PROFILE="${PROFILE:-default}"

ENV_NAME="${1:-fixitfaster-leaderboard-victorlee}"

echo "==> 환경에서 VPC·ELB 보안 그룹 확인 (env=$ENV_NAME)"
LB_RAW=$(aws elasticbeanstalk describe-environment-resources --environment-name "$ENV_NAME" --region "$REGION" --profile "$PROFILE" --query 'EnvironmentResources.LoadBalancers[0].Name' --output text 2>/dev/null || true)
LB_NAME="$LB_RAW"
[[ "$LB_RAW" == *loadbalancer/app/* ]] && LB_NAME=$(echo "$LB_RAW" | sed 's|.*loadbalancer/app/||' | cut -d'/' -f1)

if [[ -z "$LB_NAME" ]] || [[ "$LB_NAME" == "None" ]]; then
  echo "ERROR: 로드밸런서를 찾을 수 없습니다. 환경 이름을 확인하세요." >&2
  exit 1
fi

VPC_ID=$(aws elbv2 describe-load-balancers --names "$LB_NAME" --region "$REGION" --profile "$PROFILE" --query 'LoadBalancers[0].VpcId' --output text 2>/dev/null || true)
if [[ -z "$VPC_ID" ]] || [[ "$VPC_ID" == "None" ]]; then
  echo "ERROR: VPC를 찾을 수 없습니다." >&2
  exit 1
fi

SG_NAME="fixitfaster-leaderboard-http80"
echo "==> 보안 그룹 생성 (VPC=$VPC_ID, 80 허용)"
SG_ID=$(aws ec2 create-security-group --group-name "$SG_NAME" --description "Allow HTTP 80 for EB leaderboard" --vpc-id "$VPC_ID" --region "$REGION" --profile "$PROFILE" --query 'GroupId' --output text 2>/dev/null || true)

if [[ -z "$SG_ID" ]] || [[ "$SG_ID" == "None" ]]; then
  # 이미 있으면 ID만 조회
  SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$SG_NAME" "Name=vpc-id,Values=$VPC_ID" --region "$REGION" --profile "$PROFILE" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)
  if [[ -z "$SG_ID" ]] || [[ "$SG_ID" == "None" ]]; then
    echo "ERROR: 보안 그룹 생성/조회 실패" >&2
    exit 1
  fi
  echo "    기존 그룹 사용: $SG_ID"
fi
# 값이 sg- 로만 시작하도록 (공백/ARN 붙은 것 제거)
SG_ID=$(echo "$SG_ID" | grep -o 'sg-[a-f0-9]*' | head -1)

aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 --region "$REGION" --profile "$PROFILE" 2>/dev/null || true

# 인스턴스 SG가 우리 SG에서 오는 트래픽(헬스체크 등) 허용하도록 규칙 추가
INSTANCE_SG=$(aws elasticbeanstalk describe-environment-resources --environment-name "$ENV_NAME" --region "$REGION" --profile "$PROFILE" --query 'EnvironmentResources.Instances[0].Id' --output text 2>/dev/null || true)
if [[ -n "$INSTANCE_SG" ]] && [[ "$INSTANCE_SG" != "None" ]]; then
  INSTANCE_SG_ID=$(aws ec2 describe-instances --instance-ids "$INSTANCE_SG" --region "$REGION" --profile "$PROFILE" --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' --output text 2>/dev/null || true)
  if [[ -n "$INSTANCE_SG_ID" ]] && [[ "$INSTANCE_SG_ID" != "None" ]]; then
    aws ec2 authorize-security-group-ingress --group-id "$INSTANCE_SG_ID" --protocol tcp --port 8080 --source-group "$SG_ID" --region "$REGION" --profile "$PROFILE" 2>/dev/null || true
    echo "    인스턴스 SG $INSTANCE_SG_ID 에 우리 SG 허용 규칙 추가함"
  fi
fi

echo "==> .ebextensions/02-elb-http80.config 작성 (EB가 이 SG를 사용하므로 규칙이 사라지지 않음)"
mkdir -p "$LEADERBOARD_ROOT/.ebextensions"
cat > "$EBCONFIG" << EOF
# ELB가 이 보안 그룹을 사용하므로, 80 포트 규칙이 EB에 의해 지워지지 않음 (한 번 설정 후 영구)
option_settings:
  aws:elbv2:loadbalancer:
    ManagedSecurityGroup: "$SG_ID"
    SecurityGroups: "$SG_ID"
EOF

echo "==> 완료. 이제 배포하면 ELB가 이 보안 그룹을 사용합니다."
echo "    cd $LEADERBOARD_ROOT && npm run deploy"
echo "    (기존 배포 스크립트의 '80 포트 열기' 단계는 이 SG를 쓰면 불필요해짐)"
