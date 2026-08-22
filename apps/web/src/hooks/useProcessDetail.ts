import { useState, useCallback } from "react";
import { api, CompareResponse } from "../api/client";

export function useProcessDetail() {
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async (processId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getComparison(processId);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetchComparison, clear };
}
