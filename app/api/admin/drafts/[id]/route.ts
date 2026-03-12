import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkAdminSecret } from "@/lib/admin-auth";
import { getDraft, updateDraft, deleteDraft } from "@/lib/draft-store";
import { saveCustomReferenceAnswer } from "@/lib/reference-answers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = checkAdminSecret(req);
  if (authErr) return authErr;

  const { id } = await params;
  const draft = getDraft(id);
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(draft);
}

/** Approve → auto-promote: write challenge markdown + reference answer */
function promoteToLive(draft: {
  scenarioId: string;
  markdown: string;
  markdownKo?: string;
  referenceAnswer: Parameters<typeof saveCustomReferenceAnswer>[1];
}) {
  const challengesDir = path.join(process.cwd(), "challenges");
  const filePath = path.join(challengesDir, `${draft.scenarioId}.md`);

  if (fs.existsSync(filePath)) {
    return { ok: false, error: `${draft.scenarioId}.md already exists` };
  }

  fs.writeFileSync(filePath, draft.markdown, "utf-8");

  if (draft.markdownKo) {
    const koDir = path.join(challengesDir, "ko");
    if (!fs.existsSync(koDir)) fs.mkdirSync(koDir, { recursive: true });
    fs.writeFileSync(path.join(koDir, `${draft.scenarioId}.md`), draft.markdownKo, "utf-8");
  }

  saveCustomReferenceAnswer(draft.scenarioId, draft.referenceAnswer);
  return { ok: true };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = checkAdminSecret(req);
  if (authErr) return authErr;

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  // Auto-promote when approving
  if (body.status === "approved") {
    const draft = getDraft(id);
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = promoteToLive(draft);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const updated = updateDraft(id, {
      status: "approved",
      reviewedAt: new Date().toISOString(),
      generationNotes: `Auto-promoted at ${new Date().toISOString()}`,
    });
    return NextResponse.json({ ...updated, promoted: true });
  }

  const patch = { ...body, reviewedAt: new Date().toISOString() };
  const updated = updateDraft(id, patch);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = checkAdminSecret(req);
  if (authErr) return authErr;

  const { id } = await params;
  const ok = deleteDraft(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
