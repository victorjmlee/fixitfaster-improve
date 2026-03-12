import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkAdminSecret } from "@/lib/admin-auth";
import { getDraft, updateDraft } from "@/lib/draft-store";
import { saveCustomReferenceAnswer } from "@/lib/reference-answers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = checkAdminSecret(req);
  if (authErr) return authErr;

  const { id } = await params;
  const draft = getDraft(id);
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (draft.status !== "approved") {
    return NextResponse.json(
      { error: "Draft must be approved before promoting" },
      { status: 400 }
    );
  }

  const challengesDir = path.join(process.cwd(), "challenges");
  const filePath = path.join(challengesDir, `${draft.scenarioId}.md`);

  if (fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: `Challenge file ${draft.scenarioId}.md already exists` },
      { status: 409 }
    );
  }

  // Write challenge markdown
  fs.writeFileSync(filePath, draft.markdown, "utf-8");

  // Write Korean version if available
  if (draft.markdownKo) {
    const koDir = path.join(challengesDir, "ko");
    if (!fs.existsSync(koDir)) fs.mkdirSync(koDir, { recursive: true });
    fs.writeFileSync(
      path.join(koDir, `${draft.scenarioId}.md`),
      draft.markdownKo,
      "utf-8"
    );
  }

  // Save reference answer to custom-reference-answers.json
  saveCustomReferenceAnswer(draft.scenarioId, draft.referenceAnswer);

  // Mark draft as promoted
  updateDraft(id, {
    status: "approved",
    generationNotes: `Promoted at ${new Date().toISOString()}`,
  });

  return NextResponse.json({
    success: true,
    scenarioId: draft.scenarioId,
    challengePath: filePath,
  });
}
