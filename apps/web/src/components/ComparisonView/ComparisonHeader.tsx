interface ComparisonHeaderProps {
  processName: string;
  industry: string;
  analyzing: boolean;
  onReanalyze: () => void;
}

export function ComparisonHeader({
  processName,
  industry,
  analyzing,
  onReanalyze,
}: ComparisonHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white leading-tight">{processName}</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">{industry}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onReanalyze}
          disabled={analyzing}
          className="btn-ghost text-[13px] flex items-center gap-1.5 disabled:opacity-40"
        >
          {analyzing ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Re-analyze
            </>
          )}
        </button>
      </div>
    </div>
  );
}
