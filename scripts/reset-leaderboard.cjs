const fs = require("fs");
const path = require("path");
const dataDir = path.join(process.cwd(), "data");
const file = path.join(dataDir, "submissions.json");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(file, "[]", "utf-8");
console.log("리더보드 초기화됨:", file);
