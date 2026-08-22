const severityDot: Record<string, string> = {
  critical: "bg-red-400",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-blue-400",
};

const severityText: Record<string, string> = {
  critical: "text-red-400/70",
  high: "text-orange-400/70",
  medium: "text-yellow-400/70",
  low: "text-blue-400/70",
};

interface ProblemBadgeProps {
  severity: string;
  label?: string;
  className?: string;
}

export function ProblemBadge({ severity, label, className = "" }: ProblemBadgeProps) {
  const key = severity.toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${severityDot[key] || "bg-slate-400"}`} />
      <span className={`text-[10px] font-medium ${severityText[key] || "text-slate-500"}`}>
        {label || severity}
      </span>
    </span>
  );
}
