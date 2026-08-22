import { ActivityData, FutureActivityData, OpportunityData, ProblemData } from "../../api/client";
import { ActivityCard } from "./ActivityCard";
import { TransitionCard } from "./TransitionCard";

export interface TransitionRowData {
  currentActivity: ActivityData | null;
  futureActivity: FutureActivityData | null;
  problems: ProblemData[];
  opportunities: OpportunityData[];
  type: "normal" | "eliminated" | "new";
}

interface TransitionRowProps {
  row: TransitionRowData;
  onClick: () => void;
  index: number;
}

/** Subtle horizontal connecting arrow (desktop only) */
function ConnectArrow() {
  return (
    <div className="connect-arrow">
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
        <path
          d="M0 6h16m0 0l-4-4m4 4l-4 4"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** Vertical connecting arrow (mobile only) */
function ConnectArrowVertical() {
  return (
    <div className="connect-arrow-vertical">
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
        <path
          d="M6 0v12m0 0l-4-4m4 4l4-4"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function TransitionRow({ row, onClick, index }: TransitionRowProps) {
  return (
    <div
      className="transition-row animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      {/* Current activity cell */}
      <div className="px-2 py-1">
        <ActivityCard
          activity={row.currentActivity}
          variant="current"
          problems={row.problems}
          isEliminated={row.type === "eliminated"}
        />
      </div>

      {/* Arrow: current → transition (mobile: vertical) */}
      <ConnectArrowVertical />
      <ConnectArrow />

      {/* Transition cell */}
      <div className="px-3 py-1">
        <TransitionCard
          opportunities={row.opportunities}
          transitionType={row.type}
        />
      </div>

      {/* Arrow: transition → future (mobile: vertical) */}
      <ConnectArrowVertical />
      <ConnectArrow />

      {/* Future activity cell */}
      <div className="px-2 py-1">
        <ActivityCard
          activity={row.futureActivity}
          variant="future"
          isNew={row.type === "new"}
        />
      </div>
    </div>
  );
}
