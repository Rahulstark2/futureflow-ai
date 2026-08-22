interface ComparisonMetricsProps {
  metrics: {
    currentActivitiesCount: number;
    futureActivitiesCount: number;
    aiLedCount: number;
    automationCount: number;
    roboticsCount: number;
    hybridCount: number;
    humanCount: number;
    automationPercentage: number;
  };
  opportunitiesCount: number;
}

export function ComparisonMetrics({ metrics, opportunitiesCount }: ComparisonMetricsProps) {
  const items = [
    { value: metrics.currentActivitiesCount, label: "Current Steps" },
    { value: metrics.futureActivitiesCount, label: "Future Steps" },
    { value: opportunitiesCount, label: "Levers" },
    { value: `${metrics.automationPercentage}%`, label: "Automation Score" },
  ];

  return (
    <div className="flex items-center gap-8 mb-6 animate-fade-in">
      {items.map((item) => (
        <div key={item.label} className="metric-compact">
          <span className="metric-compact-value">{item.value}</span>
          <span className="metric-compact-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
