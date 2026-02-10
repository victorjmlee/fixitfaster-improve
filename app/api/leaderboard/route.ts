import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const challengeId = searchParams.get("challengeId") || undefined;
  const list = getLeaderboard(challengeId);
  return NextResponse.json(list);
}
