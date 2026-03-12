import { NextRequest, NextResponse } from "next/server";
import { checkAdminSecret } from "@/lib/admin-auth";
import { getDraft, updateDraft, deleteDraft } from "@/lib/draft-store";
import { saveCustomReferenceAnswer } from "@/lib/reference-answers";
import { saveChallengeMd, getChallengeAsync } from "@/lib/challenges";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = checkAdminSecret(req);
  if (authErr) return authErr;

  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(draft);
}

/** Approve → auto-promote: save challenge markdown + reference answer to KV */
async function promoteToLive(draft: {
  scenarioId: string;
  markdown: string;
  markdownKo?: string;
  referenceAnswer: Parameters<typeof saveCustomReferenceAnswer>[1];
}) {
  // Check if challenge already exists (filesystem or KV)
  const existing = await getChallengeAsync(draft.scenarioId);
  if (existing) {
    return { ok: false, error: `${draft.scenarioId} already exists` };
  }

  await saveChallengeMd(draft.scenarioId, draft.markdown);
  if (draft.markdownKo) {
    await saveChallengeMd(draft.scenarioId, draft.markdownKo, "ko");
  }
  await saveCustomReferenceAnswer(draft.scenarioId, draft.referenceAnswer);
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
    const draft = await getDraft(id);
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await promoteToLive(draft);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const updated = await updateDraft(id, {
      status: "approved",
      reviewedAt: new Date().toISOString(),
      generationNotes: `Auto-promoted at ${new Date().toISOString()}`,
    });
    return NextResponse.json({ ...updated, promoted: true });
  }

  const patch = { ...body, reviewedAt: new Date().toISOString() };
  const updated = await updateDraft(id, patch);
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
  const ok = await deleteDraft(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
