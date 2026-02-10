#!/usr/bin/env node
/**
 * Elastic Beanstalk 등에서 PORT 환경변수를 쓰기 위한 Next.js 시작 스크립트.
 * 로컬에서는 PORT가 없으면 3000 사용.
 */
const { spawnSync } = require("child_process");
const port = process.env.PORT || "3000";
const result = spawnSync(
  "npx",
  ["next", "start", "-p", port],
  { stdio: "inherit", env: process.env }
);
process.exit(result.status || 0);
