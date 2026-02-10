import { NextResponse } from "next/server";
import { getChallenge } from "@/lib/challenges";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const challenge = getChallenge(id);
  if (!challenge) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(challenge);
}
