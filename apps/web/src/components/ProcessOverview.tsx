import React, { useState, useEffect, useRef, useCallback } from "react";
import { ProcessSummary } from "../api/client";

interface ProcessOverviewProps {
  process: ProcessSummary;
  analyzing: boolean;
  onAnalyze: () => void;
  onUpdate?: (id: string, data: Partial<{ name: string; industry: string; description: string }>) => Promise<void>;
}

export function ProcessOverview({
  process,
  analyzing,
  onAnalyze,
  onUpdate,
}: ProcessOverviewProps) {
  const [name, setName] = useState(process.name);
  const [industry, setIndustry] = useState(process.industry);
  const [description, setDescription] = useState(process.description);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 40)}px`;
    }
  }, []);

  // Sync state when selected process changes
  useEffect(() => {
    setName(process.name);
    setIndustry(process.industry);
    setDescription(process.description);
  }, [process.id, process.name, process.industry, process.description]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [description, adjustTextareaHeight]);

  // Save ONLY when clicking outside (onBlur)
  const handleBlur = () => {
    if (!onUpdate) return;
    const payload: Partial<{ name: string; industry: string; description: string }> = {};

    const trimmedName = name.trim();
    const trimmedIndustry = industry.trim();
    const trimmedDesc = description.trim();

    if (trimmedName && trimmedName !== process.name) payload.name = trimmedName;
    if (trimmedIndustry && trimmedIndustry !== process.industry) payload.industry = trimmedIndustry;
    if (trimmedDesc && trimmedDesc !== process.description) payload.description = trimmedDesc;

    if (Object.keys(payload).length > 0) {
      onUpdate(process.id, payload);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIndustry(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    adjustTextareaHeight();
  };

  return (
    <div className="max-w-4xl animate-fade-in text-left space-y-6">
      {/* Golden Isometric Cube Icon Badge */}
      <div className="w-10 h-10 rounded-lg bg-[#2D2817] border border-[#4D421F] flex items-center justify-center shadow-inner">
        <svg
          className="w-5 h-5 text-[#F5B800]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>

      {/* Editable Title & Subtitle */}
      <div>
        <input
          type="text"
          value={name}
          disabled={analyzing}
          onChange={handleNameChange}
          onBlur={handleBlur}
          className="w-full bg-transparent text-2xl font-bold text-white tracking-tight border-none outline-none focus:outline-none focus:ring-0 p-0 placeholder:text-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="Process Name"
        />
        <input
          type="text"
          value={industry}
          disabled={analyzing}
          onChange={handleIndustryChange}
          onBlur={handleBlur}
          className="w-full bg-transparent text-sm text-slate-400 mt-2.5 border-none outline-none focus:outline-none focus:ring-0 p-0 placeholder:text-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="Industry"
        />
      </div>

      {/* Centered Outline Action Card */}
      <div className="w-full border border-white/[0.08] rounded-xl p-5 flex items-center justify-center my-6">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={analyzing}
          className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-[#232424] transition-colors flex items-center gap-2 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-300"
        >
          {analyzing ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              <span>Running AI reasoning pipeline...</span>
            </>
          ) : (
            <>
              <span>Run AI Analysis</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                role="img"
                focusable="false"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0"
                fill="currentColor"
              >
                <path d="M4.07132 3.8283C4.04394 3.81721 4.01406 3.81379 3.98488 3.8184C3.95566 3.82301 3.92826 3.83551 3.90561 3.85453C3.88297 3.87356 3.86594 3.8984 3.85636 3.92639C3.84678 3.95437 3.84501 3.98443 3.85124 4.01335L5.80802 13.1405C5.81898 13.1915 5.83884 13.2155 5.85542 13.2298C5.87605 13.2476 5.9078 13.2631 5.94754 13.268C5.98728 13.2729 6.0217 13.2654 6.04578 13.2532C6.06507 13.2434 6.08993 13.2252 6.11273 13.1784L7.83779 9.64746C8.05513 9.20258 8.45077 8.87059 8.92663 8.73378L12.7035 7.64791C12.7535 7.63353 12.776 7.61215 12.789 7.59475C12.8052 7.57307 12.8186 7.54044 12.8207 7.50049C12.8228 7.46054 12.813 7.42669 12.7992 7.40342C12.788 7.38476 12.7681 7.36116 12.7199 7.34158L4.07132 3.8283C4.07129 3.82829 4.07135 3.82832 4.07132 3.8283ZM3.75083 2.33677C4.04945 2.2896 4.35527 2.32474 4.63541 2.43841L13.2843 5.95183C13.2843 5.95184 13.2843 5.95183 13.2843 5.95183C14.747 6.54596 14.6351 8.65343 13.1179 9.08953L9.34109 10.1754C9.27311 10.1949 9.21659 10.2424 9.18554 10.3059L7.46077 13.8363C7.46072 13.8364 7.46082 13.8362 7.46077 13.8363C6.76755 15.2562 4.67275 14.9979 4.34147 13.4555L2.38492 4.3294C2.38489 4.32925 2.38495 4.32956 2.38492 4.3294C2.32134 4.03401 2.33935 3.72642 2.43722 3.44054C2.53514 3.15452 2.70919 2.90061 2.94065 2.70612C3.17211 2.51164 3.45221 2.38394 3.75083 2.33677Z" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Editable Description Section (Auto-growing full text, zero scroll) */}
      <div className="pt-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Description
        </h2>
        <textarea
          ref={textareaRef}
          value={description}
          disabled={analyzing}
          onChange={handleDescriptionChange}
          onBlur={handleBlur}
          className="w-full bg-transparent text-sm text-slate-300 leading-relaxed max-w-2xl border-none outline-none focus:outline-none focus:ring-0 p-0 resize-none overflow-hidden placeholder:text-slate-600 block disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="Describe current workflow in detail..."
        />
      </div>
    </div>
  );
}
