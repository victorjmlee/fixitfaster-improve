import { NextResponse } from "next/server";
import { validateDatadogKeys, getDatadogConfig } from "@/lib/datadog";

export async function GET() {
  const { apiKey, appKey, site } = getDatadogConfig();
  if (!apiKey) {
    return NextResponse.json(
      { valid: false, error: "DATADOG_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요." },
      { status: 400 }
    );
  }
  const result = await validateDatadogKeys(apiKey, appKey || undefined, site);
  return NextResponse.json(result);
}
