import { NextResponse } from "next/server";
import { getSubmissionChallengeIdsByParticipant } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const participantName = searchParams.get("participantName")?.trim();
  if (!participantName) {
    return NextResponse.json({ challengeIds: [] });
  }
  const challengeIds = getSubmissionChallengeIdsByParticipant(participantName);
  return NextResponse.json({ challengeIds });
}
