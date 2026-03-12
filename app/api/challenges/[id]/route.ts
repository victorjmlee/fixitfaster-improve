import { NextResponse } from "next/server";
import { getChallengeAsync, type ChallengeLocale } from "@/lib/challenges";
import { getAllReferenceAnswers } from "@/lib/reference-answers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get("locale") === "ko" ? "ko" : "en") as ChallengeLocale;
  const challenge = await getChallengeAsync(id, locale);
  if (!challenge) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const refs = await getAllReferenceAnswers();
  const ref = refs[id];
  const scoreGuide = ref?.scoreGuide ? ref.scoreGuide[locale] ?? ref.scoreGuide.ko : undefined;
  const artifactScore = ref?.artifactScore;
  return NextResponse.json({
    ...challenge,
    scoreGuide,
    artifactScore,
  });
}
