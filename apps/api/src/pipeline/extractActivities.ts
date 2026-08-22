import { z } from "zod";
import { LLMProvider } from "../llm";

export const ExtractedActivitySchema = z.object({
  activities: z.array(
    z.object({
      sequence: z.number().int().positive().optional().default(1),
      name: z.string().optional(),
      activityName: z.string().optional(),
      stepName: z.string().optional(),
    })
  ),
});

export interface ExtractedActivity {
  sequence: number;
  name: string;
}

export async function extractActivities(
  llm: LLMProvider,
  processName: string,
  industry: string,
  description: string
): Promise<ExtractedActivity[]> {
  const prompt = `Analyze the following operational process and extract the sequential list of current activities/steps.

Process Name: ${processName}
Industry: ${industry}
Description:
${description}

Return JSON with "activities" array, where each item has integer "sequence" (1-indexed) and clean descriptive "name".`;

  const result = await llm.generateStructured(
    prompt,
    ExtractedActivitySchema,
    "You are an expert enterprise business process engineer. Break down current workflows into structured, chronological activity steps."
  );

  return result.activities
    .map((a, idx) => ({
      sequence: a.sequence || idx + 1,
      name: a.name || a.activityName || a.stepName || `Activity ${idx + 1}`,
    }))
    .sort((a, b) => a.sequence - b.sequence);
}
