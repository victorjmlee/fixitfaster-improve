import { NextRequest, NextResponse } from "next/server";
import { checkAdminSecret } from "@/lib/admin-auth";
import { listDrafts } from "@/lib/draft-store";

export async function GET(req: NextRequest) {
  const authErr = checkAdminSecret(req);
  if (authErr) return authErr;

  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  return NextResponse.json(await listDrafts(status));
}
