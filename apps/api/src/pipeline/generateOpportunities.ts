import { z } from "zod";
import { LLMProvider } from "../llm";

export const GeneratedOpportunitiesSchema = z.object({
  opportunities: z.array(
    z.object({
      activityId: z.union([z.string(), z.array(z.string())]),
      opportunity: z.string().optional(),
      title: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      technology: z.string().optional(),
      tech: z.string().optional(),
      mechanism: z.string().optional(),
      automationPotential: z.string().optional(),
      potential: z.string().optional(),
      level: z.string().optional(),
    })
  ),
});

export interface GeneratedOpportunity {
  activityId: string;
  opportunity: string;
  technology: string;
  automationPotential: string;
}

/**
 * Extracts meaningful tokens for fuzzy semantic similarity check.
 */
function getSignificantTokens(text: string): Set<string> {
  const stopWords = new Set([
    "and", "the", "for", "with", "from", "that", "this", "into", "over", "each", "all",
    "will", "can", "are", "via", "using", "automated", "automation", "system", "process"
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  return new Set(words);
}

/**
 * Computes Jaccard token overlap between two strings (0.0 to 1.0).
 */
function computeSimilarity(tokensA: Set<string>, tokensB: Set<string>): number {
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }
  const union = tokensA.size + tokensB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export async function generateOpportunities(
  llm: LLMProvider,
  processName: string,
  industry: string,
  activities: { id: string; sequence: number; name: string }[],
  problems: { description: string; severity: string }[]
): Promise<GeneratedOpportunity[]> {
  const activitiesFormatted = activities
    .map((a) => `ID: "${a.id}" | Step ${a.sequence}: ${a.name}`)
    .join("\n");

  const problemsFormatted = problems
    .map((p) => `- [${p.severity.toUpperCase()}] ${p.description}`)
    .join("\n");

  const prompt = `Process: "${processName}" (${industry})

Current Activities:
${activitiesFormatted}

Identified Problems:
${problemsFormatted}

As a Principal Process Reengineering & Enterprise AI Architect, formulate 5 to 10 HIGH-IMPACT, MUTUALLY EXCLUSIVE opportunities to overhaul this workflow.

Evaluate all of the following levers:
1. ELIMINATE / LEAN WASTE REDUCTION: Eliminate redundant verification, duplicate data entry, or manual handoffs.
2. CONSOLIDATE & PARALLELIZE: Merge sequential dependencies into unified actions or run parallel async processing.
3. GOVERNANCE & APPROVAL STREAMLINING: Replace multi-tiered manual sign-offs with exception-based routing or shift-left authority.
4. STANDARDIZATION & ERROR-PROOFING (Poka-Yoke): Simplify policies and introduce guided digital guardrails.
5. AI & INTELLIGENT AUTOMATION: Deploy Computer Vision, GenAI extraction, Autonomous Agents, or Predictive Analytics where cognitive workload or inspection speed is the bottleneck.

CRITICAL INSTRUCTIONS:
- For "activityId": Reference the primary Activity ID that is transformed. If an opportunity consolidates multiple steps, provide the first primary activity ID or an array.
- "opportunity": Distinct summary of the transformation opportunity.
- "technology": Mechanism used (e.g., "Lean Step Elimination", "Approval Streamlining (Shift-Left)", "Step Consolidation", "Computer Vision Inspection", "GenAI Extraction & Auto-DHR").
- "automationPotential": Level/potential (e.g., "Step Eliminated", "Consolidated", "Exception-Only (95% Bypass)", "Autonomous AI", "Hybrid Assisted").

Return JSON with "opportunities" array.`;

  const result = await llm.generateStructured(
    prompt,
    GeneratedOpportunitiesSchema,
    "You are a master process re-engineering and AI transformation consultant. You deliver a clean, concise, non-redundant set of enterprise recommendations."
  );

  const validActivityIds = new Set(activities.map((a) => a.id));
  const seenTokenSets: Set<string>[] = [];
  const deduplicated: GeneratedOpportunity[] = [];

  for (const opp of result.opportunities) {
    // Determine the primary valid activity ID
    const targetActivityId = Array.isArray(opp.activityId)
      ? opp.activityId.find((id) => validActivityIds.has(id))
      : validActivityIds.has(opp.activityId)
      ? opp.activityId
      : null;

    if (!targetActivityId) {
      continue;
    }

    const opportunityText = opp.opportunity || opp.title || opp.name || opp.description || "Process Reengineering Lever";
    const technologyText = opp.technology || opp.tech || opp.mechanism || "Digital Workflow & Automation";
    const potentialText = opp.automationPotential || opp.potential || opp.level || "Autonomous AI";

    const currentTokens = getSignificantTokens(opportunityText);

    // Check if this opportunity is semantically redundant with an already accepted opportunity
    let isDuplicate = false;
    for (const existingTokens of seenTokenSets) {
      const sim = computeSimilarity(currentTokens, existingTokens);
      if (sim >= 0.55) {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate) {
      continue;
    }

    seenTokenSets.push(currentTokens);
    deduplicated.push({
      activityId: targetActivityId,
      opportunity: opportunityText,
      technology: technologyText,
      automationPotential: potentialText,
    });
  }

  return deduplicated;
}
