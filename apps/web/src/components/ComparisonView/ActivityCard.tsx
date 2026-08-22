import { ActivityData, FutureActivityData, ProblemData } from "../../api/client";
import { ResponsibilityBadge } from "./ResponsibilityBadge";
import { ProblemBadge } from "./ProblemBadge";

interface ActivityCardProps {
  activity: ActivityData | FutureActivityData | null;
  variant: "current" | "future";
  problems?: ProblemData[];
  isNew?: boolean;
  isEliminated?: boolean;
}

function isCurrentActivity(a: ActivityData | FutureActivityData): a is ActivityData {
  return "name" in a && !("newActivityName" in a);
}

export function ActivityCard({
  activity,
  variant,
  problems = [],
  isNew = false,
  isEliminated = false,
}: ActivityCardProps) {
  /* Empty cell — eliminated future or new current */
  if (!activity) {
    return (
      <div className="cell-empty min-h-[52px]">
        <span className="text-slate-700">—</span>
      </div>
    );
  }

  const name = isCurrentActivity(activity) ? activity.name : activity.newActivityName;
  const seq = activity.sequence;
  const role = !isCurrentActivity(activity) ? activity.roleResponsibility : null;

  return (
    <div className="flex items-start gap-2.5 py-1 min-h-[52px]">
      {/* Step number */}
      <span className="text-[11px] font-semibold text-slate-600 tabular-nums leading-none mt-0.5 w-5 text-right flex-shrink-0">
        {String(seq).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1">
        {/* Activity name */}
        <p className="text-[13px] font-medium text-slate-200 leading-snug">
          {name}
        </p>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {/* Responsibility badge on future cards */}
          {variant === "future" && role && (
            <ResponsibilityBadge role={role} />
          )}

          {/* New badge */}
          {isNew && <ResponsibilityBadge role="new" />}

          {/* Problem indicators on current cards */}
          {variant === "current" && problems.map((p) => (
            <ProblemBadge
              key={p.id}
              severity={p.severity}
              label={p.severity}
            />
          ))}

          {/* Eliminated indicator */}
          {isEliminated && variant === "current" && (
            <ResponsibilityBadge role="eliminated" />
          )}
        </div>
      </div>
    </div>
  );
}
