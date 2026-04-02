"use client";

import { HeaderBlock } from "@/components/hud/pages/HeaderBlock";
import { TextBlock } from "@/components/hud/pages/TextBlock";
import { SuccessBlock } from "@/components/hud/pages/SuccessBlock";
import { CautionBlock } from "@/components/hud/pages/CautionBlock";
import { CodeBlock } from "@/components/hud/pages/CodeBlock";
import { useSatMapStore } from "@/store/satmapStore";

const LogsPage = () => {
  const menuOpen = useSatMapStore((s) => s.menuOpen);

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 pointer-events-auto w-3/4 md:w-[60%] lg:w-1/2 max-h-3/4 ${
        menuOpen ? "invisible" : "visible"
      }`}
    >
      <HeaderBlock header="Mission Logs" />

      <div className="overflow-y-auto flex flex-col gap-2.5">
        <TextBlock eyebrow={"v1.1 TBD"}>
          SATMAP7 version 1.1 coming soon. V1.1 will focus on patching
          non-blockers, data processing robustness (Zustand record alignment),
          data scalability (reach 10k+ satellites), and more complex graphics
          optimizations (most prominently the optimization of the animation
          loop). More specifically, in v1.1, satellite propagation animations
          will be reimplemented using a SATMAP7-original "Compute-Ahead-of-Time"
          double-map algorithm.
        </TextBlock>

        <TextBlock eyebrow="v1.0 2026/03/31">
          SATMAP7 version 1.0 is now ready for deploy. Foreseeable blockers are
          now resolved. Key implementations include: graphics optimizations
          (most prominently the boundary sphere compute), multi-layer caching
          (most prominently Redis/CelesTrak), Earth texture shaders, and the
          core engine + 2-mode HUD overlay. Key blockers now resolved include:
          satellite occlusion checks, empty pointer-raycast intersections, and
          high-frequency Zustand re-renders. Unremarkable patches include
          unpredictable state persistence, frame-agnostic propagation rate,
          frame-agnostic satellite selection interpolation, heavy code
          refactors.
        </TextBlock>
      </div>
    </div>
  );
};

export default LogsPage;
