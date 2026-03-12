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
  helpfulCommands: string;
};

const CHALLENGES_DIR = path.join(process.cwd(), "challenges");
const EXTRA_CHALLENGES_DIR = process.env.VERCEL
  ? path.join("/tmp", "challenges")
  : null;

const CHALLENGE_ORDER = [
  "scenario-infra",
  "scenario-autodiscovery",
  "scenario-apm",
  "scenario-correlation",
  "scenario-custom-metrics",
  "scenario-log-timezone",
];

function extractSection(content: string, title: string): string {
  const regex = new RegExp(`## ${title}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "i");
  const m = content.match(regex);
  return m ? m[1].trim() : "";
}

function parseChallenge(id: string, raw: string): Challenge {
  const body = raw;
  const titleMatch = raw.match(/^#\s+(.+?)(?:\n|$)/);
  const title = titleMatch ? titleMatch[1].trim() : id;
  const metaBlock = raw.match(/\*\*Difficulty:\*\*\s*(.+?)(?:\n|$)/i);
  const difficulty = metaBlock ? metaBlock[1].trim() : "";
  const estMatch = raw.match(/\*\*Estimated time:\*\*\s*(.+?)(?:\n|$)/i);
  const estimatedMinutes = estMatch ? estMatch[1].trim() : "";
  const prodMatch = raw.match(/\*\*Related Datadog products:\*\*\s*(.+?)(?:\n|$)/i);
  const products = prodMatch ? prodMatch[1].trim() : "";
  const symptomSummary = extractSection(raw, "Symptom summary");
  const environment = extractSection(raw, "Environment");
  const steps = extractSection(raw, "Steps to reproduce / What to observe");
  const allowedResources = extractSection(raw, "Allowed resources");
  const helpfulCommands = extractSection(raw, "Helpful Commands");
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
    helpfulCommands,
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
  const ordered = list.filter((c) => CHALLENGE_ORDER.includes(c.id));
  ordered.sort((a, b) => {
    const ia = CHALLENGE_ORDER.indexOf(a.id);
    const ib = CHALLENGE_ORDER.indexOf(b.id);
    return ia - ib;
  });
  // Append AI-generated (non-ordered) challenges after the ordered ones
  const extra = list.filter((c) => !CHALLENGE_ORDER.includes(c.id));

  // On Vercel, also read challenges from /tmp/challenges (writable dir)
  if (EXTRA_CHALLENGES_DIR && fs.existsSync(EXTRA_CHALLENGES_DIR)) {
    try {
      const tmpFiles = fs.readdirSync(EXTRA_CHALLENGES_DIR);
      const knownIds = new Set([...ordered, ...extra].map((c) => c.id));
      for (const f of tmpFiles) {
        if (!f.endsWith(".md") || f.startsWith("_")) continue;
        const id = f.replace(/\.md$/, "");
        if (knownIds.has(id)) continue;
        try {
          const raw = fs.readFileSync(path.join(EXTRA_CHALLENGES_DIR, f), "utf-8");
          const c = parseChallenge(id, raw);
          extra.push({ id: c.id, title: c.title, difficulty: c.difficulty, estimatedMinutes: c.estimatedMinutes, products: c.products });
        } catch { /* skip */ }
      }
    } catch { /* skip */ }
  }

  return [...ordered, ...extra];
}

export type ChallengeLocale = "en" | "ko";

export function getChallenge(id: string, locale: ChallengeLocale = "en"): Challenge | null {
  const safeId = path.basename(id).replace(/\.md$/, "");
  let filePath = path.join(CHALLENGES_DIR, `${safeId}.md`);
  if (locale === "ko") {
    const koPath = path.join(CHALLENGES_DIR, "ko", `${safeId}.md`);
    if (fs.existsSync(koPath)) filePath = koPath;
  }
  // Fallback to /tmp/challenges on Vercel
  if (!fs.existsSync(filePath) && EXTRA_CHALLENGES_DIR) {
    const tmpPath = path.join(EXTRA_CHALLENGES_DIR, `${safeId}.md`);
    if (locale === "ko") {
      const tmpKo = path.join(EXTRA_CHALLENGES_DIR, "ko", `${safeId}.md`);
      if (fs.existsSync(tmpKo)) filePath = tmpKo;
      else if (fs.existsSync(tmpPath)) filePath = tmpPath;
    } else if (fs.existsSync(tmpPath)) {
      filePath = tmpPath;
    }
  }
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return parseChallenge(safeId, raw);
}
