import { useEffect, useCallback } from "react";
import { ActivityData, FutureActivityData, OpportunityData, ProblemData } from "../../api/client";
import { ResponsibilityBadge } from "./ResponsibilityBadge";
import { ProblemBadge } from "./ProblemBadge";

interface DrawerData {
  currentActivity: ActivityData | null;
  futureActivity: FutureActivityData | null;
  problems: ProblemData[];
  opportunities: OpportunityData[];
  type: "normal" | "eliminated" | "new";
}

interface ActivityDetailDrawerProps {
  data: DrawerData | null;
  onClose: () => void;
}

export function ActivityDetailDrawer({ data, onClose }: ActivityDetailDrawerProps) {
  /* Close on Escape */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (data) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [data, handleKeyDown]);

  if (!data) return null;

  const { currentActivity, futureActivity, problems, opportunities, type } = data;

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="drawer-panel">
        <div className="p-6 space-y-6">
          {/* Close button */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Activity Details
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.1] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── CURRENT ACTIVITY ──────────────── */}
          {currentActivity && (
            <section>
              <label className="column-header">Current</label>
              <div className="mt-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                    {String(currentActivity.sequence).padStart(2, "0")}
                  </span>
                  <p className="text-[14px] font-medium text-slate-200">
                    {currentActivity.name}
                  </p>
                </div>
                {type === "eliminated" && (
                  <div className="mt-2">
                    <ResponsibilityBadge role="eliminated" />
                  </div>
                )}
              </div>
            </section>
          )}

          {type === "new" && !currentActivity && (
            <section>
              <label className="column-header">Current</label>
              <div className="mt-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[13px] text-slate-600 italic">No prior activity</p>
              </div>
            </section>
          )}

          {/* ── PROBLEMS ─────────────────────── */}
          {problems.length > 0 && (
            <section>
              <label className="column-header">Problems</label>
              <div className="mt-2 space-y-2">
                {problems.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                  >
                    <p className="text-[13px] text-slate-300 leading-snug">{p.description}</p>
                    <ProblemBadge severity={p.severity} className="mt-2" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── TRANSITION ────────────────────── */}
          {opportunities.length > 0 && (
            <section>
              <label className="column-header">Transition</label>
              <div className="mt-2 space-y-2">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                  >
                    <p className="text-[13px] text-slate-200 leading-snug font-medium">
                      {opp.opportunity}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {opp.technology && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {opp.technology}
                        </span>
                      )}
                      {opp.automationPotential && (
                        <ResponsibilityBadge role={opp.automationPotential} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {type === "eliminated" && opportunities.length === 0 && (
            <section>
              <label className="column-header">Transition</label>
              <div className="mt-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[13px] text-rose-400/80">Step eliminated from future process</p>
              </div>
            </section>
          )}

          {type === "new" && (
            <section>
              <label className="column-header">Transition</label>
              <div className="mt-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[13px] text-violet-400/80">New capability introduced</p>
              </div>
            </section>
          )}

          {/* ── FUTURE ACTIVITY ───────────────── */}
          {futureActivity && (
            <section>
              <label className="column-header">Future</label>
              <div className="mt-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                    {String(futureActivity.sequence).padStart(2, "0")}
                  </span>
                  <p className="text-[14px] font-medium text-slate-200">
                    {futureActivity.newActivityName}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-[10px] text-slate-600 uppercase tracking-wider">Responsibility</label>
                  <ResponsibilityBadge role={futureActivity.roleResponsibility} />
                </div>
              </div>
            </section>
          )}

          {type === "eliminated" && !futureActivity && (
            <section>
              <label className="column-header">Future</label>
              <div className="mt-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[13px] text-slate-600 italic">Activity removed</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
