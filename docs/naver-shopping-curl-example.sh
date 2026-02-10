#!/bin/bash
# 네이버 쇼핑 검색 API - curl 예시
# 사용 전: https://developers.naver.com 에서 앱 등록 후 Client ID, Secret 발급

# === 여기에 본인 값 넣기 ===
CLIENT_ID="YOUR_CLIENT_ID"
CLIENT_SECRET="YOUR_CLIENT_SECRET"

# 검색어 (예: 건축/인테리어 자재)
QUERY="욕실 타일"
# QUERY="마루 바닥재"
# QUERY="도배지"

# 한 번에 가져올 개수 (1~100, 기본 10)
DISPLAY=10
# 정렬: sim(유사도) | date(날짜) | asc(저가순) | dsc(고가순)
SORT="asc"

curl -G "https://openapi.naver.com/v1/search/shop.json" \
  --data-urlencode "query=${QUERY}" \
  --data-urlencode "display=${DISPLAY}" \
  --data-urlencode "sort=${SORT}" \
  -H "X-Naver-Client-Id: ${CLIENT_ID}" \
  -H "X-Naver-Client-Secret: ${CLIENT_SECRET}"

# 예쁘게 보려면: ... | jq .
# 예: curl ... | jq '.items[] | {title: .title, lprice: .lprice, link: .link}'
