import { NextResponse } from "next/server";
import { listChallengesAsync } from "@/lib/challenges";

export async function GET() {
  const list = await listChallengesAsync();
  return NextResponse.json(list);
}
