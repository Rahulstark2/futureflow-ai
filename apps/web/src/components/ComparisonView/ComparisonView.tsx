import { useState, useMemo } from "react";
import { CompareResponse } from "../../api/client";
import { ComparisonHeader } from "./ComparisonHeader";
import { ComparisonMetrics } from "./ComparisonMetrics";
import { TransitionRow, TransitionRowData } from "./TransitionRow";
import { ActivityDetailDrawer } from "./ActivityDetailDrawer";
import { TransformationSummary } from "./TransformationSummary";

interface ComparisonViewProps {
  data: CompareResponse;
  analyzing: boolean;
  onReanalyze: () => void;
}

/**
 * Row-building algorithm:
 *
 * 1. For each currentActivity:
 *    - Find futureActivities where activityIdRef matches currentActivity.id
 *    - Find problems/opportunities where activityId matches
 *    - If future match exists → Normal row
 *    - If no future match → Eliminated row
 *
 * 2. For each futureActivity where activityIdRef is null:
 *    - New Activity row (current = null)
 *
 * 3. Sort: normal rows by current sequence, then eliminated, then new at end
 */
function buildTransitionRows(data: CompareResponse): TransitionRowData[] {
  const { currentActivities, futureActivities, problems, opportunities } = data;

  const rows: TransitionRowData[] = [];
  const matchedFutureIds = new Set<string>();

  /* Pass 1: Walk current activities, find matching future */
  for (const current of currentActivities) {
    const matchingFuture = futureActivities.find(
      (f) => f.activityIdRef === current.id
    );

    /* Problems linked to this activity */
    const activityProblems = problems.filter(
      (p) => (p as any).activityId === current.id
    );

    /* Opportunities linked to this activity */
    const activityOpps = opportunities.filter(
      (o) => o.activityId === current.id
    );

    if (matchingFuture) {
      matchedFutureIds.add(matchingFuture.id);
      rows.push({
        currentActivity: current,
        futureActivity: matchingFuture,
        problems: activityProblems,
        opportunities: activityOpps,
        type: "normal",
      });
    } else {
      rows.push({
        currentActivity: current,
        futureActivity: null,
        problems: activityProblems,
        opportunities: activityOpps,
        type: "eliminated",
      });
    }
  }

  /* Pass 2: Find future activities with no current match (new capabilities) */
  for (const future of futureActivities) {
    if (!future.activityIdRef && !matchedFutureIds.has(future.id)) {
      rows.push({
        currentActivity: null,
        futureActivity: future,
        problems: [],
        opportunities: [],
        type: "new",
      });
    }
  }

  return rows;
}

export function ComparisonView({ data, analyzing, onReanalyze }: ComparisonViewProps) {
  const [selectedRow, setSelectedRow] = useState<TransitionRowData | null>(null);

  const rows = useMemo(() => buildTransitionRows(data), [data]);

  const eliminatedCount = rows.filter((r) => r.type === "eliminated").length;
  const newCount = rows.filter((r) => r.type === "new").length;

  return (
    <div className="space-y-6">
      {/* Compact KPI metrics */}
      <ComparisonMetrics
        metrics={data.summaryMetrics}
        opportunitiesCount={data.opportunities.length}
      />

      {/* Column headers */}
      <div className="glass-panel overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr_auto_1fr] px-4 py-3 border-b border-white/[0.06]">
          <div className="px-2">
            <p className="column-header">Current</p>
            <p className="column-subheader">What happens today</p>
          </div>
          <div className="w-[44px]" /> {/* Arrow spacer */}
          <div className="px-3">
            <p className="column-header">Transition</p>
            <p className="column-subheader">What changes</p>
          </div>
          <div className="w-[44px]" /> {/* Arrow spacer */}
          <div className="px-2">
            <p className="column-header">Future</p>
            <p className="column-subheader">Redesigned state</p>
          </div>
        </div>

        {/* Mobile column header */}
        <div className="lg:hidden px-4 py-3 border-b border-white/[0.06]">
          <p className="column-header">Process Transformation</p>
          <p className="column-subheader">Current → Transition → Future</p>
        </div>

        {/* Transition rows */}
        <div className="px-2">
          {rows.map((row, index) => (
            <TransitionRow
              key={
                (row.currentActivity?.id || "new") +
                "-" +
                (row.futureActivity?.id || "elim") +
                "-" +
                index
              }
              row={row}
              index={index}
              onClick={() => setSelectedRow(row)}
            />
          ))}
        </div>
      </div>

      {/* Transformation summary + benefits */}
      <TransformationSummary
        futureActivities={data.futureActivities}
        benefits={data.benefits}
        eliminatedCount={eliminatedCount}
        newCount={newCount}
      />

      {/* Detail drawer */}
      <ActivityDetailDrawer
        data={selectedRow}
        onClose={() => setSelectedRow(null)}
      />
    </div>
  );
}
