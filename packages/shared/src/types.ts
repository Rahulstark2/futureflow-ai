import { z } from "zod";
import * as schemas from "./schemas";

export type Process = z.infer<typeof schemas.ProcessSchema>;
export type Activity = z.infer<typeof schemas.ActivitySchema>;
export type Problem = z.infer<typeof schemas.ProblemSchema>;
export type Opportunity = z.infer<typeof schemas.OpportunitySchema>;
export type FutureActivity = z.infer<typeof schemas.FutureActivitySchema>;
export type Benefit = z.infer<typeof schemas.BenefitSchema>;
export type ProcessComparisonCache = z.infer<typeof schemas.ProcessComparisonCacheSchema>;
