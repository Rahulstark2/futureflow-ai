const BASE_URL = "/api";

export interface ProcessSummary {
  id: string;
  name: string;
  industry: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityData {
  id: string;
  processId: string;
  name: string;
  sequence: number;
  type: string;
}

export interface ProblemData {
  id: string;
  processId: string;
  description: string;
  severity: string;
}

export interface OpportunityData {
  id: string;
  processId: string;
  activityId: string;
  opportunity: string;
  technology: string;
  automationPotential: string;
  activity?: ActivityData;
}

export interface FutureActivityData {
  id: string;
  processId: string;
  activityIdRef: string | null;
  newActivityName: string;
  roleResponsibility: string;
  sequence: number;
}

export interface BenefitData {
  id: string;
  processId: string;
  benefitType: string;
  description: string;
  confidence: "low" | "medium" | "high";
  assumptions: string;
}

export interface CompareResponse {
  process: ProcessSummary;
  isAnalyzing?: boolean;
  status?: string;
  currentStep?: number;
  stepName?: string;
  error?: string;
  currentActivities: ActivityData[];
  problems: ProblemData[];
  opportunities: OpportunityData[];
  futureActivities: FutureActivityData[];
  benefits: BenefitData[];
  summaryMetrics: {
    currentActivitiesCount: number;
    futureActivitiesCount: number;
    aiLedCount: number;
    automationCount: number;
    roboticsCount: number;
    hybridCount: number;
    humanCount: number;
    automationPercentage: number;
  };
}

export interface AnalysisStatusResponse {
  isAnalyzing: boolean;
  status: string;
  currentStep: number;
  stepName: string;
  error?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || "Request failed");
  }

  return json.data as T;
}

export const api = {
  getProcesses: () => request<ProcessSummary[]>("/processes"),

  getProcess: (id: string) => request<ProcessSummary>(`/processes/${id}`),

  createProcess: (data: { name: string; industry: string; description: string }) =>
    request<ProcessSummary>("/processes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProcess: (id: string, data: Partial<{ name: string; industry: string; description: string }>) =>
    request<ProcessSummary>(`/processes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteProcess: (id: string) =>
    request<void>(`/processes/${id}`, { method: "DELETE" }),

  analyzeProcess: (id: string) =>
    request<any>(`/processes/${id}/analyze`, { method: "POST" }),

  getAnalysisStatus: (id: string) =>
    request<AnalysisStatusResponse>(`/processes/${id}/status`),

  getComparison: (id: string) => request<CompareResponse>(`/processes/${id}/compare`),
};
