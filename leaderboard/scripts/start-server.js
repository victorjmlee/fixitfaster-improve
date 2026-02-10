#!/usr/bin/env node
const { spawnSync } = require("child_process");
// EB proxy forwards to 5000 by default; local dev typically uses 3000
const port = process.env.PORT || "3000";
const env = { ...process.env, NODE_ENV: "production" };
const result = spawnSync(
  "npx",
  ["next", "start", "-p", port, "-H", "0.0.0.0"],
  { stdio: "inherit", env, cwd: process.cwd() }
);
process.exit(result.status ?? 1);
