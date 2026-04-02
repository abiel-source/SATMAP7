"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  // required
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/33 transition-opacity duration-300 lg:hidden pointer-events-auto ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sheet: default behaviour is 1) setting max height in outer divm then 2) making the inner div flex-1 and y-scrollable. max height is not for component scrollability. Making the inner div scrollable is purely set as a fallback. The burden of content scrolling should be placed in the rendered children. */}
      <div
        className={`fixed z-50 lg:hidden top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 max-h-[80vh] transition-all duration-300 ease-out flex flex-col gap-2.5 ${
          open
            ? "pointer-events-auto opacity-100 scale-100"
            : "pointer-events-none opacity-0 scale-95"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-space-900/90 backdrop-blur-sm border border-white/10 shrink-0">
          {title && (
            <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase">
              {title}
            </span>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-white/30 hover:text-white/70 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </>
  );
}
