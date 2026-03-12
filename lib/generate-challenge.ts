import { getChallenge } from "./challenges";
import { REFERENCE_ANSWERS } from "./reference-answers";

const EXAMPLE_SCENARIOS = ["scenario-apm", "scenario-correlation", "scenario-infra"];

function buildPrompt(topic?: string): string {
  const examples: string[] = [];
  for (const id of EXAMPLE_SCENARIOS) {
    const challenge = getChallenge(id, "en");
    if (!challenge) continue;
    const ref = REFERENCE_ANSWERS[id];
    examples.push(
      `--- Example: ${id} ---\n` +
        `[Markdown]\n${challenge.body}\n\n` +
        `[Reference Answer JSON]\n${JSON.stringify(ref, null, 2)}\n`
    );
  }

  const topicInstruction = topic
    ? `Generate a NEW Datadog troubleshooting challenge about: ${topic}`
    : `Generate a NEW Datadog troubleshooting challenge about a Datadog product area not already covered by the examples (e.g., Synthetics, RUM, Network Monitoring, Process Monitoring, RBAC, Containers, etc.)`;

  return `You are a Datadog expert creating troubleshooting competition challenges for "Fix It Faster" — a timed Datadog troubleshooting competition run in GitHub Codespaces with Docker Compose environments.

Here are examples of existing challenges and their reference answers:

${examples.join("\n\n")}

${topicInstruction}

Requirements:
1. The challenge must involve a realistic misconfiguration that participants debug in a Docker Compose environment with a Datadog Agent.
2. Follow the EXACT same markdown format as the examples (title, metadata, sections).
3. The difficulty should be ⭐⭐ to ⭐⭐⭐⭐.
4. The fix should be a concrete config/code change (not a Datadog UI change).
5. artifactCheck patterns should be lowercase keywords that would appear in a git diff when the fix is applied.
6. artifactScore should be 50-80 depending on difficulty.
7. scoreGuide should include both ko and en strings following the pattern in examples.

Output EXACTLY in this format (no extra text before or after):

---MARKDOWN---
(full challenge markdown here)
---REFERENCE_ANSWER---
(valid JSON object matching the reference answer structure)
---SCENARIO_ID---
(a kebab-case id like "scenario-network-check")`;
}

type GenerateResult = {
  markdown: string;
  referenceAnswer: {
    rootCause: string;
    resolution: string;
    expectedChange: string;
    artifactCheck: string[][];
    artifactScore: number;
    solutionMaxPoints?: number;
    scoreGuide: { ko: string; en: string };
  };
  scenarioId: string;
};

export async function generateChallengeDraft(
  topic?: string
): Promise<GenerateResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const prompt = buildPrompt(topic);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Empty response from Claude API");

  return parseGeneratedOutput(text);
}

function parseGeneratedOutput(text: string): GenerateResult {
  const mdMatch = text.match(
    /---MARKDOWN---\s*\n([\s\S]*?)\n---REFERENCE_ANSWER---/
  );
  const refMatch = text.match(
    /---REFERENCE_ANSWER---\s*\n([\s\S]*?)\n---SCENARIO_ID---/
  );
  const idMatch = text.match(/---SCENARIO_ID---\s*\n(.+)/);

  if (!mdMatch || !refMatch || !idMatch) {
    throw new Error(
      "Failed to parse Claude output. Expected ---MARKDOWN---, ---REFERENCE_ANSWER---, ---SCENARIO_ID--- sections."
    );
  }

  const markdown = mdMatch[1].trim();
  const referenceAnswer = JSON.parse(refMatch[1].trim());
  const scenarioId = idMatch[1].trim().replace(/[^a-z0-9-]/g, "");

  if (!referenceAnswer.rootCause || !referenceAnswer.artifactCheck) {
    throw new Error("Reference answer missing required fields");
  }

  return { markdown, referenceAnswer, scenarioId };
}
