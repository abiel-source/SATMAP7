"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/hud/Header";
import { StatsBar } from "@/components/hud/StatsBar";
import { CategorySidebar } from "@/components/hud/CategorySidebar";
import { SatelliteInfoPanel } from "@/components/hud/SatelliteInfoPanel";
import { SatelliteMediaPanel } from "@/components/hud/SatelliteMediaPanel";
import { BottomBar } from "@/components/hud/BottomBar";
import { Toolbox } from "@/components/hud/Toolbox";
import { DeselectionChip } from "@/components/hud/DeselectionChip";
import { GlobeLoader } from "@/components/globe/GlobeLoader";

// Dynamically import the 3D scene (no SSR — WebGL is browser-only)
const GlobeScene = dynamic(
  () => import("@/components/globe/GlobeScene").then((m) => m.GlobeScene),
  {
    ssr: false,
    loading: () => <GlobeLoader />,
  }
);

export function TrackerClient() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-950">
      {/* Full-screen 3D canvas */}
      <div className="absolute inset-0 z-0">
        <GlobeScene />
      </div>

      {/* HUD layer — all positioned absolute over the canvas */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Header />

        {/* Default HUD Mode */}
        <StatsBar />
        <CategorySidebar />

        {/* Satellite Selection HUD Mode */}
        <SatelliteInfoPanel />
        <SatelliteMediaPanel />
        <DeselectionChip />

        {/* Mobile/Tablet HUD */}
        <Toolbox />

        <BottomBar />
      </div>
    </div>
  );
}
