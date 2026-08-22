import { z } from "zod";
import { LLMProvider } from "../llm";

function normalizeSeverity(val: string): "low" | "medium" | "high" | "critical" {
  const lower = (val || "").toLowerCase().trim();
  if (lower.includes("crit")) return "critical";
  if (lower.includes("high")) return "high";
  if (lower.includes("med")) return "medium";
  return "low";
}

export const IdentifiedProblemsSchema = z.object({
  problems: z.array(
    z.object({
      description: z.string().optional(),
      problem: z.string().optional(),
      issue: z.string().optional(),
      severity: z.string().transform(normalizeSeverity),
    })
  ),
});

export interface IdentifiedProblem {
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

function getSignificantTokens(text: string): Set<string> {
  const stopWords = new Set([
    "and", "the", "for", "with", "from", "that", "this", "into", "over", "each", "all",
    "due", "causing", "risk", "leads", "lead", "resulting"
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  return new Set(words);
}

function computeSimilarity(tokensA: Set<string>, tokensB: Set<string>): number {
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }
  const union = tokensA.size + tokensB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export async function identifyProblems(
  llm: LLMProvider,
  processName: string,
  industry: string,
  activities: { id: string; sequence: number; name: string }[]
): Promise<IdentifiedProblem[]> {
  const activityListStr = activities
    .map((a) => `${a.sequence}. ${a.name}`)
    .join("\n");

  const prompt = `Given the following workflow activities in ${industry} for process "${processName}":

Activities:
${activityListStr}

Identify the key operational bottlenecks, error sources, manual delays, quality risks, and compliance pain points in this current process.

Return JSON with "problems" array. Each item must have:
- "description": precise explanation of problem
- "severity": one of "low", "medium", "high", "critical"`;

  const result = await llm.generateStructured(
    prompt,
    IdentifiedProblemsSchema,
    "You are an enterprise process auditor and quality engineering specialist. Pinpoint exact vulnerabilities and bottlenecks without duplicate entries."
  );

  const seenTokenSets: Set<string>[] = [];
  const deduplicated: IdentifiedProblem[] = [];

  for (const prob of result.problems) {
    const desc = prob.description || prob.problem || prob.issue || "Unspecified operational bottleneck";
    const tokens = getSignificantTokens(desc);

    let isDuplicate = false;
    for (const existingTokens of seenTokenSets) {
      if (computeSimilarity(tokens, existingTokens) >= 0.60) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      seenTokenSets.push(tokens);
      deduplicated.push({
        description: desc,
        severity: prob.severity as "low" | "medium" | "high" | "critical",
      });
    }
  }

  return deduplicated;
}
