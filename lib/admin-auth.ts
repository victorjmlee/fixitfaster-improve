import { NextRequest, NextResponse } from "next/server";

export function checkAdminSecret(req: NextRequest): NextResponse | null {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return null; // no secret configured = open access (dev mode)
  const provided =
    req.headers.get("x-admin-secret") ??
    new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
