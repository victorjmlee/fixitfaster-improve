import fs from "fs";
import path from "path";
import { getKv } from "./kv";

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

const CHALLENGE_ORDER = [
  "scenario-infra",
  "scenario-autodiscovery",
  "scenario-apm",
  "scenario-correlation",
  "scenario-custom-metrics",
  "scenario-log-timezone",
];

const KV_CHALLENGE_PREFIX = "challenge:md:";

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
    id, title, difficulty, estimatedMinutes, products,
    body, symptomSummary, environment, steps, allowedResources, helpfulCommands,
  };
}

/** Save promoted challenge markdown to KV */
export async function saveChallengeMd(scenarioId: string, markdown: string, locale: "en" | "ko" = "en") {
  const kv = await getKv();
  if (kv) {
    const suffix = locale === "ko" ? `:${locale}` : "";
    await kv.set(`${KV_CHALLENGE_PREFIX}${scenarioId}${suffix}`, markdown);
    // Also save to index so we can list them
    const indexRaw = await kv.get("admin:challenge-index");
    const index: string[] = indexRaw
      ? (typeof indexRaw === "string" ? JSON.parse(indexRaw) : indexRaw as string[])
      : [];
    if (!index.includes(scenarioId)) {
      index.push(scenarioId);
      await kv.set("admin:challenge-index", JSON.stringify(index));
    }
    return;
  }
  // File fallback
  const dir = locale === "ko" ? path.join(CHALLENGES_DIR, "ko") : CHALLENGES_DIR;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${scenarioId}.md`), markdown, "utf-8");
}

/** List challenges: filesystem + KV promoted ones */
export async function listChallengesAsync(): Promise<ChallengeMeta[]> {
  const list = listChallengesFromFiles();

  // Also load KV-stored challenges
  const kv = await getKv();
  if (kv) {
    const indexRaw = await kv.get("admin:challenge-index");
    const index: string[] = indexRaw
      ? (typeof indexRaw === "string" ? JSON.parse(indexRaw) : indexRaw as string[])
      : [];
    const knownIds = new Set(list.map((c) => c.id));
    for (const id of index) {
      if (knownIds.has(id)) continue;
      const raw = await kv.get(`${KV_CHALLENGE_PREFIX}${id}`);
      if (!raw || typeof raw !== "string") continue;
      try {
        const c = parseChallenge(id, raw);
        list.push({ id: c.id, title: c.title, difficulty: c.difficulty, estimatedMinutes: c.estimatedMinutes, products: c.products });
      } catch { /* skip */ }
    }
  }

  return list;
}

/** Sync version: only reads filesystem (used by generate-challenge for examples) */
export function listChallenges(): ChallengeMeta[] {
  return listChallengesFromFiles();
}

function listChallengesFromFiles(): ChallengeMeta[] {
  if (!fs.existsSync(CHALLENGES_DIR)) return [];
  let files: string[];
  try {
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
      list.push({ id: c.id, title: c.title, difficulty: c.difficulty, estimatedMinutes: c.estimatedMinutes, products: c.products });
    } catch { /* skip */ }
  }
  const ordered = list.filter((c) => CHALLENGE_ORDER.includes(c.id));
  ordered.sort((a, b) => CHALLENGE_ORDER.indexOf(a.id) - CHALLENGE_ORDER.indexOf(b.id));
  const extra = list.filter((c) => !CHALLENGE_ORDER.includes(c.id));
  return [...ordered, ...extra];
}

export type ChallengeLocale = "en" | "ko";

/** Get a single challenge by id (filesystem + KV fallback) */
export async function getChallengeAsync(id: string, locale: ChallengeLocale = "en"): Promise<Challenge | null> {
  // Try filesystem first
  const fromFile = getChallenge(id, locale);
  if (fromFile) return fromFile;

  // Fallback to KV
  const kv = await getKv();
  if (!kv) return null;
  const safeId = path.basename(id).replace(/\.md$/, "");
  let raw: string | null = null;
  if (locale === "ko") {
    raw = await kv.get(`${KV_CHALLENGE_PREFIX}${safeId}:ko`);
  }
  if (!raw) {
    raw = await kv.get(`${KV_CHALLENGE_PREFIX}${safeId}`);
  }
  if (!raw || typeof raw !== "string") return null;
  return parseChallenge(safeId, raw);
}

/** Sync version: filesystem only */
export function getChallenge(id: string, locale: ChallengeLocale = "en"): Challenge | null {
  const safeId = path.basename(id).replace(/\.md$/, "");
  let filePath = path.join(CHALLENGES_DIR, `${safeId}.md`);
  if (locale === "ko") {
    const koPath = path.join(CHALLENGES_DIR, "ko", `${safeId}.md`);
    if (fs.existsSync(koPath)) filePath = koPath;
  }
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return parseChallenge(safeId, raw);
}
