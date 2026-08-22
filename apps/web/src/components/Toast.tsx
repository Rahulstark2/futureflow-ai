import { useState, useEffect, useRef } from "react";

export interface ToastData {
  id: string;
  type?: "success" | "error";
  title: string;
  subtitle?: string;
  processId?: string;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
  onView?: (processId: string) => void;
}

export function Toast({ toast, onClose, onView }: ToastProps) {
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger exit animation then unmount
  const triggerClose = () => {
    setIsVisible(false);
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    exitTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (toast) {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);

      setActiveToast(toast);
      setIsVisible(false);

      // Trigger smooth upward slide on next animation frame
      const frameId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });

      // Auto-dismiss after 4.2s
      autoCloseTimeoutRef.current = setTimeout(() => {
        triggerClose();
      }, 4200);

      return () => cancelAnimationFrame(frameId);
    } else {
      setIsVisible(false);
      setActiveToast(null);
    }

    return () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);
    };
  }, [toast]);

  if (!activeToast) return null;

  const isError = activeToast.type === "error";

  return (
    <div
      role="status"
      style={{
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`fixed bottom-6 right-6 z-50 min-w-[320px] max-w-sm bg-[#1C1D1F] border border-white/[0.1] rounded-xl shadow-2xl p-3.5 flex items-start gap-3 transition-all duration-300 ease-out transform ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-[calc(100%+24px)] opacity-0 pointer-events-none"
      }`}
    >
      {/* Icon: Red Circle with X for Error, Green Circle with Check for Success */}
      {isError ? (
        <div className="w-5 h-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#22C55E]"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM11.7836 6.42901C12.0858 6.08709 12.0695 5.55006 11.7472 5.22952C11.4248 4.90897 10.9186 4.9263 10.6164 5.26821L7.14921 9.19122L5.3315 7.4773C5.00127 7.16593 4.49561 7.19748 4.20208 7.54777C3.90855 7.89806 3.93829 8.43445 4.26852 8.74581L6.28032 10.6427C6.82041 11.152 7.64463 11.1122 8.13886 10.553L11.7836 6.42901Z"
            />
          </svg>
        </div>
      )}

      {/* Center Body */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-white">{activeToast.title}</p>
        </div>

        {activeToast.subtitle && (
          <div className={`mt-0.5 text-xs truncate ${isError ? "text-slate-400 font-normal" : "text-slate-400"}`}>
            {!isError && (
              <svg
                className="w-3.5 h-3.5 text-slate-500 inline mr-1.5 -mt-0.5 flex-shrink-0"
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
            )}
            <span className={isError ? "text-slate-400" : "text-slate-300 font-medium"}>
              {activeToast.subtitle}
            </span>
          </div>
        )}

        {activeToast.processId && onView && !isError && (
          <button
            type="button"
            onClick={() => onView(activeToast.processId!)}
            className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors block"
          >
            View process
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={triggerClose}
        className="w-5 h-5 rounded hover:bg-white/[0.08] text-slate-500 hover:text-slate-300 flex items-center justify-center transition-colors flex-shrink-0 -mr-1 -mt-0.5"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.96967 2.96967C3.26256 2.67678 3.73744 2.67678 4.03033 2.96967L8 6.939L11.9697 2.96967C12.2626 2.67678 12.7374 2.67678 13.0303 2.96967C13.3232 3.26256 13.3232 3.73744 13.0303 4.03033L9.061 8L13.0303 11.9697C13.2966 12.2359 13.3208 12.6526 13.1029 12.9462L13.0303 13.0303C12.7374 13.3232 12.2626 13.3232 11.9697 13.0303L8 9.061L4.03033 13.0303C3.73744 13.3232 3.26256 13.3232 2.96967 13.0303C2.67678 12.7374 2.67678 12.2626 2.96967 11.9697L6.939 8L2.96967 4.03033C2.7034 3.76406 2.6792 3.3474 2.89705 3.05379L2.96967 2.96967Z" />
        </svg>
      </button>
    </div>
  );
}
