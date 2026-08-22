import { useState, useEffect } from "react";
import { ProcessSummary } from "../api/client";

interface DeleteModalProps {
  process: ProcessSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteModal({
  process,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: DeleteModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      timer = setTimeout(() => {
        setIsMounted(false);
      }, 200);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isMounted || !process) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
      {/* Translucent Dimming Backdrop */}
      <div
        className={`absolute inset-0 bg-black/25 backdrop-blur-[1px] transition-opacity duration-200 ease-out ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        style={{
          transitionTimingFunction: isVisible
            ? "cubic-bezier(0.16, 1, 0.3, 1)"
            : "cubic-bezier(0.4, 0, 1, 1)",
        }}
        className={`relative w-full max-w-md bg-[#18191B] border border-white/[0.08] rounded-2xl p-6 shadow-[0_24px_70px_rgba(0,0,0,0.85)] flex flex-col space-y-4 transition-all duration-200 transform ${
          isVisible
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-[0.97] pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h3 className="text-base font-semibold text-white tracking-tight">
          Delete "{process.name}"?
        </h3>

        {/* Description body */}
        <div className="text-sm text-[#8A8F98] leading-relaxed">
          <p>
            This process and all associated AI analysis pipeline data will be permanently deleted. This action cannot be undone.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#232325] hover:bg-[#2c2d30] text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E5484D] hover:bg-[#F2555A] text-white transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
