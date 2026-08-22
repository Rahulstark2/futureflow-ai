const badgeClass: Record<string, string> = {
  ai: "badge-ai",
  automation: "badge-automation",
  robotics: "badge-robotics",
  hybrid: "badge-hybrid",
  human: "badge-human",
  eliminated: "badge-eliminated",
  consolidated: "badge-consolidated",
  new: "badge-new",
};

const badgeLabel: Record<string, string> = {
  ai: "AI",
  automation: "Automation",
  robotics: "Robotics",
  hybrid: "Hybrid",
  human: "Human",
  eliminated: "Eliminated",
  consolidated: "Consolidated",
  new: "New",
};

interface ResponsibilityBadgeProps {
  role: string;
  className?: string;
}

export function ResponsibilityBadge({ role, className = "" }: ResponsibilityBadgeProps) {
  const key = role.toLowerCase();
  return (
    <span className={`${badgeClass[key] || "badge-human"} ${className}`}>
      {badgeLabel[key] || role}
    </span>
  );
}
