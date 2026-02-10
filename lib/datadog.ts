const DD_API_BASE = "https://api.datadoghq.com";

export type ValidateResult = { valid: boolean; error?: string };

export async function validateDatadogKeys(
  apiKey: string,
  appKey?: string,
  site: string = "datadoghq.com"
): Promise<ValidateResult> {
  const base = site === "datadoghq.com" ? "https://api.datadoghq.com" : `https://api.${site}`;
  try {
    const res = await fetch(`${base}/api/v1/validate`, {
      headers: {
        "DD-API-KEY": apiKey,
        ...(appKey ? { "DD-APPLICATION-KEY": appKey } : {}),
      },
    });
    if (res.ok) {
      const data = (await res.json()) as { valid?: boolean };
      return { valid: data.valid !== false };
    }
    const text = await res.text();
    return { valid: false, error: text || `HTTP ${res.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { valid: false, error: msg };
  }
}

export function getDatadogConfig() {
  return {
    apiKey: process.env.DATADOG_API_KEY || "",
    appKey: process.env.DATADOG_APP_KEY || "",
    site: process.env.DATADOG_SITE || "datadoghq.com",
  };
}
