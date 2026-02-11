import { NextResponse } from "next/server";

/**
 * GET /api/debug-grading
 * Check if GEMINI_API_KEY is set (for debugging). Remove or restrict in production.
 */
export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY?.trim();
  const keyPrefix = process.env.GEMINI_API_KEY?.slice(0, 8) ?? "";
  return NextResponse.json({
    hasKey,
    keyPrefix: hasKey ? `${keyPrefix}...` : "(not set)",
  });
}
