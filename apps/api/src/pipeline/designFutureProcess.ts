import { z } from "zod";
import { LLMProvider } from "../llm";
import { GeneratedOpportunity } from "./generateOpportunities";

function normalizeRole(val: string): "human" | "ai" | "automation" | "robotics" | "hybrid" {
  const lower = (val || "").toLowerCase().trim();
  if (lower.includes("robot")) return "robotics";
  if (lower.includes("hybrid") || lower.includes("assist") || lower.includes("human-in-the-loop") || lower.includes("copilot") || lower.includes("guided")) return "hybrid";
  if (lower === "ai" || lower.startsWith("ai ") || lower.endsWith(" ai") || lower.includes("computer vision") || lower.includes("machine learning") || lower.includes("genai") || lower.includes("llm") || lower.includes("neural") || lower.includes("predictive")) return "ai";
  if (lower.includes("auto") || lower.includes("rpa") || lower.includes("system") || lower.includes("erp") || lower.includes("rule") || lower.includes("scan") || lower.includes("database") || lower.includes("digital")) return "automation";
  if (lower.includes("human") || lower.includes("manual") || lower.includes("manager") || lower.includes("personnel") || lower.includes("operator")) return "human";
  return "automation";
}

export const FutureProcessSchema = z.object({
  futureActivities: z.array(
    z.object({
      sequence: z.number().int().positive().optional().default(1),
      newActivityName: z.string().optional(),
      activityName: z.string().optional(),
      name: z.string().optional(),
      roleResponsibility: z.string().transform(normalizeRole),
      activityIdRef: z.union([z.string(), z.array(z.string())]).nullable().optional(),
    })
  ),
});

export interface FutureActivityOutput {
  sequence: number;
  newActivityName: string;
  roleResponsibility: "human" | "ai" | "automation" | "robotics" | "hybrid";
  activityIdRef?: string | null;
}

export async function designFutureProcess(
  llm: LLMProvider,
  processName: string,
  industry: string,
  currentActivities: { id: string; sequence: number; name: string }[],
  opportunities: GeneratedOpportunity[]
): Promise<FutureActivityOutput[]> {
  const currentFormatted = currentActivities
    .map((a) => `Activity ID: "${a.id}" | Sequence ${a.sequence}: ${a.name}`)
    .join("\n");

  const opportunitiesFormatted = opportunities
    .map((o) => `- For Activity "${o.activityId}": ${o.opportunity} (Mechanism: ${o.technology}, Level: ${o.automationPotential})`)
    .join("\n");

  const prompt = `Redesign the target "Future State" process for "${processName}" in ${industry}.

Current Activities:
${currentFormatted}

Re-engineering & Technology Opportunities:
${opportunitiesFormatted}

Construct the streamlined future sequence of activities applying Business Process Reengineering (BPR):
- ELIMINATE wasteful/duplicate steps completely.
- CONSOLIDATE fragmented sub-steps.
- PARALLELIZE independent checks.

STRICT RESPONSIBILITY TAXONOMY (CRITICAL FOR ENTERPRISE AUDIT INTEGRITY):
Classify "roleResponsibility" into EXACTLY ONE of the following 5 categories based on the true underlying mechanism:

1. "ai": Use ONLY when the core task performs probabilistic inference, computer vision defect inspection, generative language synthesis, or machine learning anomaly detection.
   - Example AI: "Computer Vision automated solder joint inspection", "GenAI drafting non-conformance root cause report".

2. "automation": Use for deterministic software execution, standard database updates, barcode/RFID scanning, rule-based range comparisons, ERP sync, or API webhooks.
   - Example Automation: "Automated inventory update in ERP", "Rule-based specification pass/fail check", "Barcode scan and quantity reconciliation".
   - Note: Guided tablet screens, electronic data logging, and digital checklists are AUTOMATION or HYBRID, NOT AI!

3. "robotics": Use for automated physical hardware movement and material handling.
   - Example Robotics: "AGV physical transfer to quarantine", "Robotic pick-and-place staging".

4. "hybrid": Use when humans execute a task augmented by digital systems or when humans review AI exceptions.
   - Example Hybrid: "Inspector performing guided physical sampling on tablet", "Quality Manager reviewing flagged borderline deviations".

5. "human": Use for high-discretion executive decisions, formal regulatory release sign-offs, or physical manual tasks without automation.
   - Example Human: "Final Regulatory Batch Release Sign-Off", "Discretionary MRB Disposition Decision".

Return JSON with "futureActivities" array sorted by "sequence" (1, 2, 3...).
Each item must have:
- "sequence": integer step number
- "newActivityName": crisp descriptive title of future activity
- "roleResponsibility": one of "ai", "automation", "robotics", "hybrid", "human"
- "activityIdRef": referenced original Activity ID (or null)`;

  const result = await llm.generateStructured(
    prompt,
    FutureProcessSchema,
    "You are a principal enterprise process re-engineering and automation architect. You apply strict technological rigor and never mislabel deterministic workflow automation as AI."
  );

  return result.futureActivities
    .map((f, idx) => ({
      sequence: f.sequence || idx + 1,
      newActivityName: f.newActivityName || f.activityName || f.name || `Activity ${idx + 1}`,
      roleResponsibility: f.roleResponsibility as "human" | "ai" | "automation" | "robotics" | "hybrid",
      activityIdRef: Array.isArray(f.activityIdRef)
        ? f.activityIdRef.join(",")
        : f.activityIdRef || null,
    }))
    .sort((a, b) => a.sequence - b.sequence);
}
