import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { NewProcessView } from "./components/NewProcessView";
import { ProcessOverview } from "./components/ProcessOverview";
import { PipelineStatus } from "./components/PipelineStatus";
import { ComparisonView } from "./components/ComparisonView/ComparisonView";
import { DeleteModal } from "./components/DeleteModal";
import { Toast, ToastData } from "./components/Toast";
import { ProcessSummary } from "./api/client";
import { useProcesses } from "./hooks/useProcesses";
import { useProcessDetail } from "./hooks/useProcessDetail";
import { useAnalyze } from "./hooks/useAnalyze";

export default function App() {
  const { processes, loading: listLoading, refresh, updateProcess, deleteProcess } = useProcesses();
  const { data: compareData, loading: compareLoading, fetchComparison } = useProcessDetail();
  const { isAnalyzing, getSteps, getError, analyze, checkStatus } = useAnalyze();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [processToDelete, setProcessToDelete] = useState<ProcessSummary | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const selectedProcess = processes.find((p) => p.id === selectedId);
  const isCurrentProcessAnalyzing = isAnalyzing(selectedId) || Boolean(compareData?.isAnalyzing);
  const currentSteps = getSteps(selectedId);
  const currentAnalyzeError = getError(selectedId);

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    await fetchComparison(id);
    checkStatus(id, async () => {
      await fetchComparison(id);
    });
  };

  // Sync with background server pipeline on mount / select
  useEffect(() => {
    if (selectedId) {
      checkStatus(selectedId, async () => {
        await fetchComparison(selectedId);
      });
    }
  }, [selectedId, checkStatus, fetchComparison]);

  const handleAddNew = () => {
    setSelectedId(null);
  };

  const handleUpdateProcess = async (
    id: string,
    data: Partial<{ name: string; industry: string; description: string }>
  ) => {
    await updateProcess(id, data);
  };

  const handleDeleteRequest = (id: string) => {
    const target = processes.find((p) => p.id === id);
    if (target) {
      setProcessToDelete(target);
    }
  };

  const handleConfirmDelete = async () => {
    if (!processToDelete) return;
    setDeleteLoading(true);
    const deletedId = processToDelete.id;
    const deletedName = processToDelete.name;
    const success = await deleteProcess(deletedId);
    setDeleteLoading(false);
    setProcessToDelete(null);

    if (success) {
      if (selectedId === deletedId) {
        setSelectedId(null);
      }
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Process deleted",
        subtitle: deletedName,
      });
    }
  };

  const handleCreated = async (newProcessId?: string, processName?: string) => {
    await refresh();
    if (newProcessId) {
      handleSelect(newProcessId);
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Process created",
        subtitle: processName,
        processId: newProcessId,
      });
    }
  };

  const handleErrorToast = (title: string, subtitle: string) => {
    setToast({
      id: Date.now().toString(),
      type: "error",
      title,
      subtitle,
    });
  };

  const handleAnalyze = async () => {
    if (!selectedId) return;
    const targetId = selectedId;
    const targetName = selectedProcess?.name;

    analyze(targetId, async () => {
      await fetchComparison(targetId);
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "AI Analysis complete",
        subtitle: targetName,
        processId: targetId,
      });
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        processes={processes}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAddNew={handleAddNew}
        onDelete={handleDeleteRequest}
        loading={listLoading}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#121213]">
        {!selectedId ? (
          /* Empty / New Process View */
          <NewProcessView onCreated={handleCreated} onErrorToast={handleErrorToast} />
        ) : (
          /* Process Detail View */
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Linear Project Page View (Always kept at top, editable & unlockable) */}
            {selectedProcess && (
              <ProcessOverview
                process={selectedProcess}
                analyzing={isCurrentProcessAnalyzing}
                onAnalyze={handleAnalyze}
                onUpdate={handleUpdateProcess}
              />
            )}

            {/* Pipeline Progress */}
            <PipelineStatus steps={currentSteps} analyzing={isCurrentProcessAnalyzing} error={currentAnalyzeError} />

            {/* Results */}
            {compareLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-2xl shimmer-bg animate-pulse" />
                ))}
              </div>
            ) : compareData && compareData.currentActivities.length > 0 ? (
              /* Full comparison view — header, metrics, rows, summary, benefits all inside */
              <ComparisonView
                data={compareData}
                analyzing={isCurrentProcessAnalyzing}
                onReanalyze={handleAnalyze}
              />
            ) : null}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        process={processToDelete}
        isOpen={!!processToDelete}
        onClose={() => setProcessToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {/* Toast Notification */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
        onView={(id) => handleSelect(id)}
      />
    </div>
  );
}
