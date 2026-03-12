import fs from "fs";
import path from "path";

export type ChallengeDraft = {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  scenarioId: string;
  markdown: string;
  markdownKo?: string;
  referenceAnswer: {
    rootCause: string;
    resolution: string;
    expectedChange: string;
    artifactCheck: string[][];
    artifactScore: number;
    solutionMaxPoints?: number;
    scoreGuide: { ko: string; en: string };
  };
  topic?: string;
  generationNotes?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DRAFTS_FILE = path.join(DATA_DIR, "drafts.json");

let memoryFallback: ChallengeDraft[] | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    memoryFallback = memoryFallback ?? [];
  }
}

function readDrafts(): ChallengeDraft[] {
  if (memoryFallback !== null) return memoryFallback;
  ensureDataDir();
  if (!fs.existsSync(DRAFTS_FILE)) return [];
  try {
    const raw = fs.readFileSync(DRAFTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeDrafts(list: ChallengeDraft[]) {
  if (memoryFallback !== null) {
    memoryFallback = list;
    return;
  }
  try {
    ensureDataDir();
    fs.writeFileSync(DRAFTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch {
    memoryFallback = list;
  }
}

export function listDrafts(status?: string): ChallengeDraft[] {
  const all = readDrafts();
  if (!status) return all;
  return all.filter((d) => d.status === status);
}

export function getDraft(id: string): ChallengeDraft | null {
  return readDrafts().find((d) => d.id === id) ?? null;
}

export function addDraft(
  draft: Omit<ChallengeDraft, "id" | "createdAt">
): ChallengeDraft {
  const list = readDrafts();
  const entry: ChallengeDraft = {
    ...draft,
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(entry);
  writeDrafts(list);
  return entry;
}

export function updateDraft(
  id: string,
  patch: Partial<ChallengeDraft>
): ChallengeDraft | null {
  const list = readDrafts();
  const i = list.findIndex((d) => d.id === id);
  if (i < 0) return null;
  list[i] = { ...list[i], ...patch };
  writeDrafts(list);
  return list[i];
}

export function deleteDraft(id: string): boolean {
  const list = readDrafts();
  const i = list.findIndex((d) => d.id === id);
  if (i < 0) return false;
  list.splice(i, 1);
  writeDrafts(list);
  return true;
}
