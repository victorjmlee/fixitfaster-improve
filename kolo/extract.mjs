#!/usr/bin/env node
/**
 * PDF에서 키워드(연구, 용역, 원가)에 해당하는 내용만 추출해 견적 형태로 출력
 * 사용법: node extract.mjs [PDF경로]
 * PDF 경로 생략 시 ./sample.pdf 사용
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const KEYWORDS = ["연구", "용역", "원가"];

function findPdfPath() {
  const arg = process.argv[2];
  if (arg) return path.resolve(arg);
  const defaults = [
    path.join(__dirname, "sample.pdf"),
    path.join(__dirname, "upload.pdf"),
  ];
  for (const p of defaults) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(__dirname, "sample.pdf");
}

/**
 * 전체 텍스트를 문단/문장 단위로 나누고, 키워드가 포함된 블록만 수집
 * 각 블록에 매칭된 키워드 태그를 붙임
 */
function extractByKeywords(fullText) {
  const normalized = fullText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = [];
  const seen = new Set();

  // 1) 줄 단위로 나누고, 키워드가 있는 줄과 앞뒤 문맥 수집
  const lines = normalized.split("\n").map((s) => s.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matchedKeywords = KEYWORDS.filter((kw) => line.includes(kw));
    if (matchedKeywords.length === 0) continue;

    const prev = i > 0 ? lines[i - 1] : "";
    const next = i < lines.length - 1 ? lines[i + 1] : "";
    const block = [prev, line, next].filter(Boolean).join(" ").trim();
    const key = block.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    blocks.push({ keywords: matchedKeywords, text: block });
  }

  // 2) 문단 단위 (빈 줄로 구분)에서 키워드 포함 문단 수집
  const paragraphs = normalized.split(/\n\s*\n/).map((s) => s.replace(/\n/g, " ").trim()).filter(Boolean);
  for (const para of paragraphs) {
    const matched = KEYWORDS.filter((kw) => para.includes(kw));
    if (matched.length === 0) continue;
    const key = para.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    blocks.push({ keywords: matched, text: para });
  }

  return blocks;
}

function formatAsQuote(blocks) {
  const byKeyword = {};
  for (const kw of KEYWORDS) byKeyword[kw] = [];

  for (const { keywords, text } of blocks) {
    for (const kw of keywords) {
      if (!byKeyword[kw].includes(text)) byKeyword[kw].push(text);
    }
  }

  const lines = [];
  lines.push("════════════════════════════════════════");
  lines.push("  키워드별 추출 내용 (견적용)");
  lines.push("════════════════════════════════════════");
  lines.push("");

  for (const kw of KEYWORDS) {
    const items = byKeyword[kw];
    lines.push(`■ ${kw}`);
    lines.push("────────────────────────────────────────");
    if (items.length === 0) {
      lines.push("  (해당 키워드 내용 없음)");
    } else {
      items.forEach((text, i) => {
        lines.push(`  ${i + 1}. ${text}`);
      });
    }
    lines.push("");
  }

  lines.push("════════════════════════════════════════");
  return lines.join("\n");
}

async function main() {
  const pdfPath = findPdfPath();
  if (!fs.existsSync(pdfPath)) {
    console.error("PDF 파일을 찾을 수 없습니다:", pdfPath);
    console.error("사용법: node extract.mjs [PDF경로]");
    console.error("또는 kolo 폴더에 sample.pdf / upload.pdf 를 넣어주세요.");
    process.exit(1);
  }

  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text || "";
  const numPages = data.numpages || 0;

  if (!text.trim()) {
    console.error("PDF에서 텍스트를 추출할 수 없습니다 (이미지 전용 PDF일 수 있음).");
    process.exit(1);
  }

  const blocks = extractByKeywords(text);
  const output = formatAsQuote(blocks);

  console.log(`[PDF] ${path.basename(pdfPath)} (${numPages}페이지)\n`);
  console.log(output);
  console.log(`\n총 ${blocks.length}개 블록 추출 (키워드: ${KEYWORDS.join(", ")})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
