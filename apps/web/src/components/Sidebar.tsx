import { useState } from "react";
import { ProcessSummary } from "../api/client";

interface SidebarProps {
  processes: ProcessSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onDelete?: (id: string) => void;
  loading: boolean;
}

export function Sidebar({ processes, selectedId, onSelect, onAddNew, onDelete, loading }: SidebarProps) {
  const isNewSelected = selectedId === null;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className="w-80 h-screen flex flex-col border-r border-white/[0.06] bg-[#09090A]">

      {/* Add New */}
      <div className="p-3 pt-8">
        <button
          onClick={onAddNew}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors group text-left ${isNewSelected
            ? "bg-[#232325] text-white"
            : "text-slate-300 hover:text-white hover:bg-[#18181A]"
            }`}
        >
          <svg
            className={`w-[18px] h-[18px] transition-colors flex-shrink-0 ${isNewSelected ? "text-slate-200" : "text-slate-400 group-hover:text-slate-200"
              }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span className="flex-1">New Process</span>
          <svg
            className={`w-4 h-4 transition-colors flex-shrink-0 ${isNewSelected ? "text-slate-300" : "text-slate-400 group-hover:text-white"
              }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Process List Section */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {/* Section Header: Your Processes with toggle, hover effect and right-to-down arrow */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-2.5 py-2 mt-2 mb-1 flex items-center justify-between rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-[#18181A] transition-colors text-left group select-none"
        >
          <span>Your Processes</span>
          <svg
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ease-out transform ${isOpen ? "rotate-90" : "rotate-0"
              }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Expandable Container with pure vertical height animation */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
            }`}
        >
          <div className="overflow-hidden">
            {loading ? (
              <div className="space-y-2 mt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg shimmer-bg animate-pulse" />
                ))}
              </div>
            ) : processes.length === 0 ? (
              <div className="text-center mt-12 px-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 font-medium">No processes yet</p>
                <p className="text-xs text-slate-600 mt-1">Add your first process to begin</p>
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {processes.map((p, index) => (
                  <div
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group animate-slide-up flex items-center justify-between cursor-pointer ${selectedId === p.id
                      ? "bg-[#232325] text-white"
                      : "hover:bg-[#18181A] text-slate-300 hover:text-white"
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-sm font-medium truncate ${selectedId === p.id ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{p.industry}</p>
                    </div>

                    {onDelete && (
                      <button
                        type="button"
                        title="Delete process"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(p.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-white/[0.08] text-slate-400 hover:text-red-400 transition-all flex-shrink-0 group/btn"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          role="img"
                          focusable="false"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          className="opacity-70 group-hover/btn:opacity-100 transition-opacity"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="m2 3 1.652 9.911A2.5 2.5 0 0 0 6.118 15h3.764a2.5 2.5 0 0 0 2.466-2.089L14 3H2Zm1.77 1.5 1.361 8.164a1 1 0 0 0 .987.836h3.764a1 1 0 0 0 .987-.836l1.36-8.164H3.771Z" clipRule="evenodd" />
                          <path d="M5.5 2.5A1.5 1.5 0 0 1 7 1h2a1.5 1.5 0 0 1 1.5 1.5v1h-5v-1Z" />
                          <path d="M1 3.75A.75.75 0 0 1 1.75 3h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 3.75Z" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
