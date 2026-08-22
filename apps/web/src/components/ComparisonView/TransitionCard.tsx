import { OpportunityData } from "../../api/client";
import { ResponsibilityBadge } from "./ResponsibilityBadge";

interface TransitionCardProps {
  opportunities: OpportunityData[];
  transitionType: "normal" | "eliminated" | "new";
}

function classifyTransition(opp: OpportunityData): string {
  const tech = (opp.technology || "").toLowerCase();
  const desc = (opp.opportunity || "").toLowerCase();
  const combined = `${tech} ${desc}`;

  if (combined.includes("eliminate") || combined.includes("removal") || combined.includes("remove"))
    return "Eliminated";
  if (combined.includes("consolidat") || combined.includes("merge") || combined.includes("combin"))
    return "Consolidated";
  if (combined.includes("shift-left") || combined.includes("governance") || combined.includes("approval"))
    return "Human shifted";

  const potential = (opp.automationPotential || "").toLowerCase();
  if (potential.includes("ai") || tech.includes("ai") || tech.includes("machine learning") || tech.includes("computer vision") || tech.includes("nlp") || tech.includes("genai"))
    return "AI introduced";

  return "Automated";
}

export function TransitionCard({ opportunities, transitionType }: TransitionCardProps) {
  /* Eliminated activity — no opportunities */
  if (transitionType === "eliminated") {
    return (
      <div className="flex flex-col justify-center min-h-[52px] py-1">
        <p className="text-[12px] text-rose-400/80 font-medium">Step eliminated</p>
        <ResponsibilityBadge role="eliminated" className="mt-1.5 self-start" />
      </div>
    );
  }

  /* New activity — no prior context */
  if (transitionType === "new") {
    return (
      <div className="flex flex-col justify-center min-h-[52px] py-1">
        <p className="text-[12px] text-violet-400/80 font-medium">New capability introduced</p>
        <ResponsibilityBadge role="new" className="mt-1.5 self-start" />
      </div>
    );
  }

  /* No opportunities mapped — pass-through */
  if (opportunities.length === 0) {
    return (
      <div className="flex items-center min-h-[52px] py-1">
        <span className="text-[11px] text-slate-600 italic">No change</span>
      </div>
    );
  }

  /* Normal transition — show first opportunity (primary transformation) */
  const primary = opportunities[0];
  const classification = classifyTransition(primary);

  return (
    <div className="flex flex-col justify-center min-h-[52px] py-1 gap-1">
      {/* Transformation description */}
      <p className="text-[12px] text-slate-300 leading-snug">
        {primary.opportunity}
      </p>

      {/* Classification + technology badges */}
      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
        <span className="text-[10px] font-medium text-slate-500">
          {classification}
        </span>
        {primary.technology && (
          <span className="text-[10px] text-slate-600">
            · {primary.technology}
          </span>
        )}
      </div>

      {/* Additional opportunities indicator */}
      {opportunities.length > 1 && (
        <span className="text-[10px] text-slate-600 mt-0.5">
          +{opportunities.length - 1} more lever{opportunities.length > 2 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
