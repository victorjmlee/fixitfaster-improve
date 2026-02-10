import fs from "fs";
import path from "path";

export type ChallengeMeta = {
  id: string;
  title: string;
  difficulty: string;
  estimatedMinutes: string;
  products: string;
};

export type Challenge = ChallengeMeta & {
  body: string;
  symptomSummary: string;
  environment: string;
  steps: string;
  allowedResources: string;
};

const CHALLENGES_DIR = path.join(process.cwd(), "challenges");

function extractSection(content: string, title: string): string {
  const regex = new RegExp(`## ${title}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "i");
  const m = content.match(regex);
  return m ? m[1].trim() : "";
}

function parseChallenge(id: string, raw: string): Challenge {
  const body = raw;
  const titleMatch = raw.match(/^#\s+(.+?)(?:\n|$)/);
  const title = titleMatch ? titleMatch[1].trim() : id;
  const metaBlock = raw.match(/\*\*난이도:\*\*\s*(.+?)(?:\n|$)/);
  const difficulty = metaBlock ? metaBlock[1].trim() : "";
  const estMatch = raw.match(/\*\*예상 소요 시간:\*\*\s*(.+?)(?:\n|$)/);
  const estimatedMinutes = estMatch ? estMatch[1].trim() : "";
  const prodMatch = raw.match(/\*\*관련 Datadog 제품:\*\*\s*(.+?)(?:\n|$)/);
  const products = prodMatch ? prodMatch[1].trim() : "";
  const symptomSummary = extractSection(raw, "증상 요약");
  const environment = extractSection(raw, "환경");
  const steps = extractSection(raw, "재현 단계 / 관찰 가능한 현상");
  const allowedResources = extractSection(raw, "허용 리소스");
  return {
    id,
    title,
    difficulty,
    estimatedMinutes,
    products,
    body,
    symptomSummary,
    environment,
    steps,
    allowedResources,
  };
}

export function listChallenges(): ChallengeMeta[] {
  if (!fs.existsSync(CHALLENGES_DIR)) return [];
  let files: string[];
  try {
    if (!fs.existsSync(CHALLENGES_DIR)) return [];
    files = fs.readdirSync(CHALLENGES_DIR);
  } catch {
    return [];
  }
  const list: ChallengeMeta[] = [];
  for (const f of files) {
    if (!f.endsWith(".md") || f.startsWith("_")) continue;
    const id = f.replace(/\.md$/, "");
    try {
      const raw = fs.readFileSync(path.join(CHALLENGES_DIR, f), "utf-8");
      const c = parseChallenge(id, raw);
      list.push({
        id: c.id,
        title: c.title,
        difficulty: c.difficulty,
        estimatedMinutes: c.estimatedMinutes,
        products: c.products,
      });
    } catch {
      // skip invalid
    }
  }
  return list;
}

export function getChallenge(id: string): Challenge | null {
  const safeId = path.basename(id).replace(/\.md$/, "");
  const filePath = path.join(CHALLENGES_DIR, `${safeId}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return parseChallenge(safeId, raw);
}
