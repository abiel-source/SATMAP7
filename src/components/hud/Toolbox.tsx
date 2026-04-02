"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  Activity,
  HelpCircle,
  Radio,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import { useSatMapStore } from "@/store/satmapStore";
import { BottomSheet } from "@/components/hud/BottomSheet";

import { MobileCategorySidebar } from "@/components/hud/mobile/MobileCategorySidebar";
import { MobileStatsBar } from "@/components/hud/mobile/MobileStatsBar";
import { MobileSatelliteInfoPanel } from "@/components/hud/mobile/MobileSatelliteInfoPanel";
import { MobileSatelliteMediaPanel } from "@/components/hud/mobile/MobileSatelliteMediaPanel";
import { MobileControlHints } from "@/components/hud/mobile/MobileControlHints";

type PanelId = "categories" | "stats" | "controls" | "satinfo" | "satmedia";

interface ToolIcon {
  id: PanelId;
  icon: LucideIcon;
  label: string;
  component: React.ReactNode;
}

const DEFAULT_TOOLS: ToolIcon[] = [
  {
    id: "stats",
    icon: Activity,
    label: "Stats",
    component: <MobileStatsBar />,
  },
  {
    id: "categories",
    icon: Layers,
    label: "Categories",
    component: <MobileCategorySidebar />,
  },
  {
    id: "controls",
    icon: HelpCircle,
    label: "Controls",
    component: <MobileControlHints />,
  },
];

const SELECTION_TOOLS: ToolIcon[] = [
  {
    id: "satinfo",
    icon: Radio,
    label: "Satellite",
    component: <MobileSatelliteInfoPanel />,
  },
  {
    id: "satmedia",
    icon: Newspaper,
    label: "Media",
    component: <MobileSatelliteMediaPanel />,
  },
  {
    id: "categories",
    icon: Layers,
    label: "Categories",
    component: <MobileCategorySidebar />,
  },
  {
    id: "controls",
    icon: HelpCircle,
    label: "Controls",
    component: <MobileControlHints />,
  },
];

export function Toolbox() {
  const selectedSatellite = useSatMapStore((s) => s.selectedSatellite);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);

  // Automatically close satellite-selection panels in default HUD
  useEffect(() => {
    if (
      !selectedSatellite &&
      (activePanel === "satinfo" || activePanel === "satmedia")
    ) {
      setActivePanel(null);
    }
  }, [selectedSatellite, activePanel]);

  const tools = selectedSatellite ? SELECTION_TOOLS : DEFAULT_TOOLS;
  const activeTitle = tools.find((t) => t.id === activePanel)?.label;
  const activeComponent = tools.find((t) => t.id === activePanel)?.component;

  const toggle = (id: PanelId) =>
    setActivePanel((prev) => (prev === id ? null : id));

  return (
    <>
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-20 lg:hidden flex flex-col gap-2.5 pointer-events-auto">
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            title={label}
            className={`w-11 h-11 flex items-center justify-center bg-space-900/80 backdrop-blur-sm border transition-colors ${
              activePanel === id
                ? "border-accent-cyan/50 text-accent-cyan"
                : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
            }`}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      <BottomSheet
        open={activePanel !== null}
        onClose={() => setActivePanel(null)}
        title={activeTitle}
      >
        {activeComponent}
      </BottomSheet>
    </>
  );
}
