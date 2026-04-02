"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const TextBlock = ({
  eyebrow,
  children,
}: {
  eyebrow: string | null;
  children: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-space-900/85 backdrop-blur-sm border border-white/10 px-4 py-3 w-full cursor-pointer select-none"
      onClick={() => setExpanded((prev) => !prev)}
    >
      <div className="flex items-center justify-between">
        {eyebrow && (
          <p className="text-[10px] tracking-widest font-mono uppercase">
            {eyebrow}
          </p>
        )}
        <ChevronDown
          size={13}
          className={`text-white/30 shrink-0 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      <div
        className={`text-white/80 text-[12px] leading-relaxed font-mono mt-2 ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {children}
      </div>
    </div>
  );
};
