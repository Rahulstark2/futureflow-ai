import { useState, useEffect, useCallback } from "react";
import { api, ProcessSummary } from "../api/client";

export function useProcesses() {
  const [processes, setProcesses] = useState<ProcessSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProcesses();
      setProcesses(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProcess = useCallback(async (id: string, data: Partial<{ name: string; industry: string; description: string }>) => {
    try {
      const updated = await api.updateProcess(id, data);
      setProcesses((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, []);

  const deleteProcess = useCallback(async (id: string) => {
    try {
      await api.deleteProcess(id);
      setProcesses((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { processes, loading, error, refresh, updateProcess, deleteProcess };
}
