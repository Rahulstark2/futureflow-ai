import { BenefitData, FutureActivityData } from "../../api/client";

interface TransformationSummaryProps {
  futureActivities: FutureActivityData[];
  benefits: BenefitData[];
  eliminatedCount: number;
  newCount: number;
}

const confidenceConfig: Record<string, { label: string; className: string }> = {
  high: { label: "High Confidence", className: "confidence-high" },
  medium: { label: "Medium Confidence", className: "confidence-medium" },
  low: { label: "Directional Estimate", className: "confidence-low" },
};

const benefitIcon: Record<string, string> = {
  cost: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  speed: "M13 10V3L4 14h7v7l9-11h-7z",
  quality: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  compliance: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
};

const benefitColor: Record<string, string> = {
  cost: "text-emerald-400",
  speed: "text-blue-400",
  quality: "text-violet-400",
  compliance: "text-amber-400",
};

export function TransformationSummary({
  futureActivities,
  benefits,
  eliminatedCount,
  newCount,
}: TransformationSummaryProps) {
  const aiCount = futureActivities.filter((a) => a.roleResponsibility === "ai").length;
  const automationCount = futureActivities.filter((a) => a.roleResponsibility === "automation").length;
  const roboticsCount = futureActivities.filter((a) => a.roleResponsibility === "robotics").length;
  const hybridCount = futureActivities.filter((a) => a.roleResponsibility === "hybrid").length;
  const humanCount = futureActivities.filter((a) => a.roleResponsibility === "human").length;

  const summaryItems = [
    { label: "Eliminated", value: eliminatedCount, color: "text-rose-400" },
    { label: "AI", value: aiCount, color: "text-emerald-400" },
    { label: "Automated", value: automationCount, color: "text-cyan-400" },
    { label: "Robotics", value: roboticsCount, color: "text-indigo-400" },
    { label: "Hybrid", value: hybridCount, color: "text-amber-400" },
    { label: "Human", value: humanCount, color: "text-slate-400" },
    { label: "New", value: newCount, color: "text-violet-400" },
  ].filter((s) => s.value > 0);

  return (
    <div className="mt-8 animate-fade-in">
      {/* ── Transformation counts ────────── */}
      <div className="mb-6">
        <h3 className="column-header mb-3">Transformation Summary</h3>
        <div className="flex items-center gap-5 flex-wrap">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`text-sm font-bold tabular-nums ${item.color}`}>{item.value}</span>
              <span className="text-[11px] text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Benefits ─────────────────────── */}
      {benefits.length > 0 && (
        <div>
          <h3 className="column-header mb-3">Projected Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {benefits.map((benefit, index) => {
              const conf = confidenceConfig[benefit.confidence] || confidenceConfig.medium;
              const icon = benefitIcon[benefit.benefitType] || benefitIcon.quality;
              const color = benefitColor[benefit.benefitType] || "text-violet-400";

              return (
                <div
                  key={benefit.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-fade-in hover:border-white/[0.08] transition-colors"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* Type + confidence */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className={`w-3.5 h-3.5 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                      </svg>
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${color}`}>
                        {benefit.benefitType}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${conf.className}`}>
                      {conf.label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[12px] text-slate-300 leading-relaxed">{benefit.description}</p>

                  {/* Baseline callout */}
                  {benefit.assumptions && (
                    <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-start gap-1.5">
                      <svg className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] text-slate-500 leading-snug">
                        <strong className="font-medium text-slate-400">Baseline Required: </strong>
                        {benefit.assumptions}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
