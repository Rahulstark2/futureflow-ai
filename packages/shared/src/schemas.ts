import { z } from "zod";

export const ProcessSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string(),
  description: z.string(),
});

export const ActivitySchema = z.object({
  id: z.string(),
  processId: z.string(),
  name: z.string(),
  sequence: z.number(),
  type: z.enum(["current", "future"]),
});

export const ProblemSchema = z.object({
  id: z.string(),
  processId: z.string(),
  description: z.string(),
  severity: z.string(),
});

export const OpportunitySchema = z.object({
  id: z.string(),
  processId: z.string(),
  activityId: z.string(),
  opportunity: z.string(),
  technology: z.string(),
  automationPotential: z.string(),
});

export const FutureActivitySchema = z.object({
  id: z.string(),
  processId: z.string(),
  activityIdRef: z.string().optional(), // Reference to original activity if applicable
  newActivityName: z.string(),
  roleResponsibility: z.enum(["human", "ai", "automation", "robotics", "hybrid"]),
  sequence: z.number(),
});

export const BenefitSchema = z.object({
  id: z.string(),
  processId: z.string(),
  benefitType: z.enum(["cost", "speed", "quality", "compliance"]),
  description: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  assumptions: z.string(),
});

// Optional: for re-runs
export const ProcessComparisonCacheSchema = z.object({
  id: z.string(),
  processId: z.string(),
  generatedAt: z.date(),
});
