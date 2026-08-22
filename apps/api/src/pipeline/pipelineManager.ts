export interface PipelineState {
  processId: string;
  status: "pending" | "running" | "completed" | "failed";
  currentStep: number;
  stepName: string;
  error?: string;
  startedAt: number;
  updatedAt: number;
}

class PipelineManager {
  private states = new Map<string, PipelineState>();

  start(processId: string) {
    const state: PipelineState = {
      processId,
      status: "running",
      currentStep: 1,
      stepName: "Extracting Activities",
      startedAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.states.set(processId, state);
    return state;
  }

  updateStep(processId: string, step: number, stepName: string) {
    const existing = this.states.get(processId);
    if (existing) {
      existing.currentStep = step;
      existing.stepName = stepName;
      existing.status = "running";
      existing.updatedAt = Date.now();
    }
  }

  complete(processId: string) {
    const existing = this.states.get(processId);
    if (existing) {
      existing.status = "completed";
      existing.currentStep = 5;
      existing.updatedAt = Date.now();
    }
  }

  fail(processId: string, error: string) {
    const existing = this.states.get(processId);
    if (existing) {
      existing.status = "failed";
      existing.error = error;
      existing.updatedAt = Date.now();
    } else {
      this.states.set(processId, {
        processId,
        status: "failed",
        currentStep: 1,
        stepName: "Failed",
        error,
        startedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  getStatus(processId: string): PipelineState | null {
    return this.states.get(processId) || null;
  }

  isRunning(processId: string): boolean {
    const state = this.states.get(processId);
    if (!state) return false;
    // Timeout safeguard: if running for > 5 minutes without update, assume finished/crashed
    if (state.status === "running" && Date.now() - state.updatedAt > 5 * 60 * 1000) {
      this.states.delete(processId);
      return false;
    }
    return state.status === "running";
  }
}

export const pipelineManager = new PipelineManager();
