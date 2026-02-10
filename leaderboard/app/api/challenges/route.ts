import { NextResponse } from "next/server";
import { listChallenges } from "@/lib/challenges";

export async function GET() {
  const list = listChallenges();
  return NextResponse.json(list);
}
