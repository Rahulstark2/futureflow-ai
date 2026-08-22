import { z } from "zod";
import { LLMProvider } from "../llm";
import { FutureActivityOutput } from "./designFutureProcess";

function normalizeBenefitType(val: string): "cost" | "speed" | "quality" | "compliance" {
  const lower = (val || "").toLowerCase().trim();
  if (lower.includes("cost") || lower.includes("labor") || lower.includes("financ") || lower.includes("roi")) return "cost";
  if (lower.includes("speed") || lower.includes("time") || lower.includes("throughput") || lower.includes("cycle")) return "speed";
  if (lower.includes("comp") || lower.includes("regulat") || lower.includes("audit") || lower.includes("risk")) return "compliance";
  return "quality";
}

function normalizeConfidence(val: string): "low" | "medium" | "high" {
  const lower = (val || "").toLowerCase().trim();
  if (lower === "high") return "high";
  if (lower === "low") return "low";
  return "medium";
}

function normalizeAssumptions(val: unknown): string {
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === "string" ? item.trim() : JSON.stringify(item)))
      .filter(Boolean)
      .join("; ");
  }
  if (typeof val === "string") return val.trim();
  return "";
}

export const ComputedBenefitsSchema = z.object({
  benefits: z.array(
    z.object({
      benefitType: z.string().transform(normalizeBenefitType),
      description: z.string().optional(),
      benefit: z.string().optional(),
      summary: z.string().optional(),
      confidence: z.string().transform(normalizeConfidence),
      assumptions: z.unknown().transform(normalizeAssumptions),
      baselineRequired: z.unknown().transform(normalizeAssumptions),
    })
  ),
});

export interface ComputedBenefit {
  benefitType: "cost" | "speed" | "quality" | "compliance";
  description: string;
  confidence: "low" | "medium" | "high";
  assumptions: string;
}

export async function computeBenefits(
  llm: LLMProvider,
  processName: string,
  industry: string,
  currentActivities: { sequence: number; name: string }[],
  futureActivities: FutureActivityOutput[]
): Promise<ComputedBenefit[]> {
  const currentList = currentActivities.map((a) => `${a.sequence}. ${a.name}`).join("\n");
  const futureList = futureActivities
    .map((f) => `${f.sequence}. [${f.roleResponsibility.toUpperCase()}] ${f.newActivityName}`)
    .join("\n");

  const prompt = `Analyze the transformation between current state and proposed future state for "${processName}" (${industry}).

Current State Activities:
${currentList}

Future State Activities:
${futureList}

Formulate realistic, enterprise-grade expected benefits across the following dimensions:
- "cost" (e.g., labor reallocation, rework reduction)
- "speed" (e.g., cycle time reduction, elimination of wait times)
- "quality" (e.g., standardization, automated defect/error detection)
- "compliance" (e.g., automated audit trails, regulatory traceability)

CONSERVATIVE ENTERPRISE AUDIT & CONFIDENCE GUIDELINES:
1. NO FABRICATED STATISTICAL PRECISION: Do NOT invent arbitrary percentages (e.g. "45% reduction") without baseline data.
2. CONFIDENCE CALIBRATION (Be conservative and defensible):
   - "medium" (DEFAULT): Use for projected cycle time gains, labor hour savings, or defect reductions. (Reason: Directionally sound based on removing manual steps, but exact ROI requires baseline measurement).
   - "low": Use when benefit realization depends heavily on external supplier adoption, complex change management, or high behavioral variance.
   - "high": Reserve ONLY for direct structural guarantees (e.g. 100% elimination of paper forms by digitizing records).
3. ASSUMPTIONS: State explicitly what baseline data is needed for definitive quantification (e.g., "Requires baseline unit cycle times and hourly operator headcount").

Return JSON with "benefits" array containing "benefitType", "description", "confidence", and "assumptions".`;

  const result = await llm.generateStructured(
    prompt,
    ComputedBenefitsSchema,
    "You are an enterprise business case auditor. You provide realistic, rigorous, trustworthy benefit assessments and transparently state assumptions rather than fabricating precision."
  );

  return result.benefits.map((b) => ({
    benefitType: b.benefitType as "cost" | "speed" | "quality" | "compliance",
    description: b.description || b.benefit || b.summary || "Expected positive operational impact",
    confidence: b.confidence as "low" | "medium" | "high",
    assumptions:
      (b.assumptions as string) ||
      (b.baselineRequired as string) ||
      "Requires baseline enterprise operational data for quantitative ROI modeling.",
  }));
}
