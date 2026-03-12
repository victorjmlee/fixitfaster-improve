import { NextRequest, NextResponse } from "next/server";
import { checkAdminSecret } from "@/lib/admin-auth";
import { generateChallengeDraft } from "@/lib/generate-challenge";
import { addDraft } from "@/lib/draft-store";

export async function POST(req: NextRequest) {
  const authErr = checkAdminSecret(req);
  if (authErr) return authErr;

  try {
    const body = await req.json().catch(() => ({}));
    const topic = (body as { topic?: string }).topic?.trim() || undefined;

    const result = await generateChallengeDraft(topic);

    const draft = await addDraft({
      status: "pending",
      scenarioId: result.scenarioId,
      markdown: result.markdown,
      referenceAnswer: result.referenceAnswer,
      topic,
    });

    return NextResponse.json(draft, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin/generate-draft]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
