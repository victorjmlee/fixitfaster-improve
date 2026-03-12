import fs from "fs";
import path from "path";
import { getKv } from "./kv";

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

const KV_KEY = "admin:drafts";

// --- File fallback (local dev) ---
const DATA_DIR = path.join(process.cwd(), "data");
const DRAFTS_FILE = path.join(DATA_DIR, "drafts.json");

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch { /* ignore */ }
}

function readDraftsFile(): ChallengeDraft[] {
  ensureDataDir();
  if (!fs.existsSync(DRAFTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DRAFTS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeDraftsFile(list: ChallengeDraft[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(DRAFTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch { /* ignore */ }
}

// --- KV-first CRUD (async) ---

async function readDrafts(): Promise<ChallengeDraft[]> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(KV_KEY);
    if (!raw) return [];
    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw as ChallengeDraft[];
    } catch {
      return [];
    }
  }
  return readDraftsFile();
}

async function writeDrafts(list: ChallengeDraft[]) {
  const kv = await getKv();
  if (kv) {
    await kv.set(KV_KEY, JSON.stringify(list));
    return;
  }
  writeDraftsFile(list);
}

export async function listDrafts(status?: string): Promise<ChallengeDraft[]> {
  const all = await readDrafts();
  if (!status) return all;
  return all.filter((d) => d.status === status);
}

export async function getDraft(id: string): Promise<ChallengeDraft | null> {
  const all = await readDrafts();
  return all.find((d) => d.id === id) ?? null;
}

export async function addDraft(
  draft: Omit<ChallengeDraft, "id" | "createdAt">
): Promise<ChallengeDraft> {
  const list = await readDrafts();
  const entry: ChallengeDraft = {
    ...draft,
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(entry);
  await writeDrafts(list);
  return entry;
}

export async function updateDraft(
  id: string,
  patch: Partial<ChallengeDraft>
): Promise<ChallengeDraft | null> {
  const list = await readDrafts();
  const i = list.findIndex((d) => d.id === id);
  if (i < 0) return null;
  list[i] = { ...list[i], ...patch };
  await writeDrafts(list);
  return list[i];
}

export async function deleteDraft(id: string): Promise<boolean> {
  const list = await readDrafts();
  const i = list.findIndex((d) => d.id === id);
  if (i < 0) return false;
  list.splice(i, 1);
  await writeDrafts(list);
  return true;
}
