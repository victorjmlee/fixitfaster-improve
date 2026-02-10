import fs from "fs";
import path from "path";

export type Submission = {
  id: string;
  challengeId: string;
  participantName: string;
  causeSummary: string;
  steps: string;
  docLinks: string;
  elapsedSeconds: number;
  submittedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");

// Vercel 등 서버리스에서는 파일 쓰기 불가 → 메모리 폴백 (인스턴스 재시작 시 초기화됨)
let memoryFallback: Submission[] | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    memoryFallback = memoryFallback ?? [];
  }
}

function readSubmissions(): Submission[] {
  if (memoryFallback !== null) return memoryFallback;
  ensureDataDir();
  if (!fs.existsSync(SUBMISSIONS_FILE)) return [];
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeSubmissions(list: Submission[]) {
  if (memoryFallback !== null) {
    memoryFallback = list;
    return;
  }
  try {
    ensureDataDir();
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch {
    memoryFallback = list;
  }
}

export function addSubmission(s: Omit<Submission, "id" | "submittedAt">): Submission {
  const list = readSubmissions();
  const submission: Submission = {
    ...s,
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    submittedAt: new Date().toISOString(),
  };
  list.push(submission);
  writeSubmissions(list);
  return submission;
}

export function getSubmissionsByChallenge(challengeId: string): Submission[] {
  return readSubmissions().filter((s) => s.challengeId === challengeId);
}

export function getLeaderboard(challengeId?: string): Submission[] {
  let list = readSubmissions();
  if (challengeId) list = list.filter((s) => s.challengeId === challengeId);
  return list.sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);
}

export function clearSubmissions(): void {
  const empty: Submission[] = [];
  if (memoryFallback !== null) {
    memoryFallback = empty;
    return;
  }
  ensureDataDir();
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, "[]", "utf-8");
  } catch {
    memoryFallback = empty;
  }
}
