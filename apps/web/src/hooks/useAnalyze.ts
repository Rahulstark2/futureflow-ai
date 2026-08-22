import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "../api/client";

export type PipelineStep = {
  step: number;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
};

const PIPELINE_STEPS: PipelineStep[] = [
  { step: 1, name: "Extracting Activities", status: "pending" },
  { step: 2, name: "Identifying Problems", status: "pending" },
  { step: 3, name: "Generating AI Opportunities", status: "pending" },
  { step: 4, name: "Designing Future Process", status: "pending" },
  { step: 5, name: "Computing Benefits", status: "pending" },
];

export function useAnalyze() {
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [stepsMap, setStepsMap] = useState<Record<string, PipelineStep[]>>({});
  const [errorsMap, setErrorsMap] = useState<Record<string, string>>({});
  const highestStepRef = useRef<Record<string, number>>({});
  const completionCallbacksRef = useRef<Record<string, () => void>>({});
  const pollingIntervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Helper to build step array based on currentStep (strictly forward only)
  const buildSteps = (currentStep: number, isFailed?: boolean): PipelineStep[] => {
    return PIPELINE_STEPS.map((s): PipelineStep => {
      if (isFailed && s.step === currentStep) return { ...s, status: "failed" };
      if (s.step < currentStep) return { ...s, status: "completed" };
      if (s.step === currentStep) return { ...s, status: "running" };
      return { ...s, status: "pending" };
    });
  };

  const updateStepMonotonic = useCallback((processId: string, newStep: number, isFailed?: boolean) => {
    const currentHighest = highestStepRef.current[processId] || 1;
    const targetStep = Math.max(currentHighest, newStep);
    highestStepRef.current[processId] = targetStep;

    setStepsMap((prev) => ({
      ...prev,
      [processId]: buildSteps(targetStep, isFailed),
    }));
  }, []);

  const stopPolling = useCallback((processId: string) => {
    if (pollingIntervalsRef.current[processId]) {
      clearInterval(pollingIntervalsRef.current[processId]);
      delete pollingIntervalsRef.current[processId];
    }
  }, []);

  const startPolling = useCallback(
    (processId: string) => {
      stopPolling(processId);

      const poll = async () => {
        try {
          const statusRes = await api.getAnalysisStatus(processId);
          if (statusRes.isAnalyzing) {
            setAnalyzingIds((prev) => new Set(prev).add(processId));
            if (statusRes.currentStep > 0) {
              updateStepMonotonic(processId, statusRes.currentStep);
            }
          } else if (statusRes.status === "completed") {
            stopPolling(processId);
            highestStepRef.current[processId] = 5;
            setAnalyzingIds((prev) => {
              const next = new Set(prev);
              next.delete(processId);
              return next;
            });
            setStepsMap((prev) => ({
              ...prev,
              [processId]: PIPELINE_STEPS.map((s) => ({ ...s, status: "completed" })),
            }));
            if (completionCallbacksRef.current[processId]) {
              completionCallbacksRef.current[processId]();
            }
          } else if (statusRes.status === "failed") {
            stopPolling(processId);
            const err = statusRes.error || "Analysis failed";
            setErrorsMap((prev) => ({ ...prev, [processId]: err }));
            setAnalyzingIds((prev) => {
              const next = new Set(prev);
              next.delete(processId);
              return next;
            });
            updateStepMonotonic(processId, statusRes.currentStep || 1, true);
          }
        } catch {
          // Ignore network blips
        }
      };

      pollingIntervalsRef.current[processId] = setInterval(poll, 1500);
    },
    [stopPolling, updateStepMonotonic]
  );

  const analyze = useCallback(
    async (processId: string, onComplete?: () => void) => {
      if (onComplete) {
        completionCallbacksRef.current[processId] = onComplete;
      }

      // Initialize strictly at Step 1
      highestStepRef.current[processId] = 1;
      setAnalyzingIds((prev) => new Set(prev).add(processId));
      setErrorsMap((prev) => {
        const next = { ...prev };
        delete next[processId];
        return next;
      });
      setStepsMap((prev) => ({
        ...prev,
        [processId]: buildSteps(1),
      }));

      startPolling(processId);

      try {
        await api.analyzeProcess(processId);

        stopPolling(processId);
        highestStepRef.current[processId] = 5;
        setAnalyzingIds((prev) => {
          const next = new Set(prev);
          next.delete(processId);
          return next;
        });
        setStepsMap((prev) => ({
          ...prev,
          [processId]: PIPELINE_STEPS.map((s) => ({ ...s, status: "completed" })),
        }));

        if (onComplete) {
          onComplete();
        }
      } catch (err) {
        const errorMsg = (err as Error).message;
        setErrorsMap((prev) => ({ ...prev, [processId]: errorMsg }));
        stopPolling(processId);
        setAnalyzingIds((prev) => {
          const next = new Set(prev);
          next.delete(processId);
          return next;
        });
        updateStepMonotonic(processId, highestStepRef.current[processId] || 1, true);
      }
    },
    [startPolling, stopPolling, updateStepMonotonic]
  );

  const checkStatus = useCallback(
    async (processId: string, onComplete?: () => void) => {
      if (onComplete) {
        completionCallbacksRef.current[processId] = onComplete;
      }
      try {
        const statusRes = await api.getAnalysisStatus(processId);
        if (statusRes.isAnalyzing) {
          setAnalyzingIds((prev) => new Set(prev).add(processId));
          updateStepMonotonic(processId, statusRes.currentStep || 1);
          startPolling(processId);
        } else if (statusRes.status === "completed") {
          highestStepRef.current[processId] = 5;
          setAnalyzingIds((prev) => {
            const next = new Set(prev);
            next.delete(processId);
            return next;
          });
          setStepsMap((prev) => ({
            ...prev,
            [processId]: PIPELINE_STEPS.map((s) => ({ ...s, status: "completed" })),
          }));
        }
      } catch {
        // Ignore
      }
    },
    [startPolling, updateStepMonotonic]
  );

  const isAnalyzing = useCallback(
    (processId?: string | null) => {
      if (!processId) return false;
      return analyzingIds.has(processId);
    },
    [analyzingIds]
  );

  const getSteps = useCallback(
    (processId?: string | null) => {
      if (!processId || !stepsMap[processId]) return PIPELINE_STEPS;
      return stepsMap[processId];
    },
    [stepsMap]
  );

  const getError = useCallback(
    (processId?: string | null) => {
      if (!processId) return null;
      return errorsMap[processId] || null;
    },
    [errorsMap]
  );

  useEffect(() => {
    return () => {
      Object.values(pollingIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  return {
    analyzingIds,
    isAnalyzing,
    getSteps,
    getError,
    analyze,
    checkStatus,
  };
}
