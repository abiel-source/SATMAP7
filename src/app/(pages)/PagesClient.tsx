"use client";

import dynamic from "next/dynamic";
import { PagesHeader } from "@/components/hud/PagesHeader";
import { GlobeLoader } from "@/components/globe/GlobeLoader";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSatMapStore } from "@/store/satmapStore";

const GlobeBackground = dynamic(
  () =>
    import("@/components/globe/GlobeBackground").then((m) => m.GlobeBackground),
  { ssr: false, loading: () => <GlobeLoader /> }
);

export function PagesClient({ children }: { children: React.ReactNode }) {
  const [globeReady, setGlobeReady] = useState(false);

  const pathname = usePathname();
  const backgroundConfig =
    pathname === "/about" ? "far" : pathname === "/docs" ? "close" : "medium";

  // found an edge case:
  // If you go to any of the pages, make browser viewport small (sm width),
  // click the hamburger menu to make the content invisible, then restretch
  // the browser size back to a larger viewport, you can make all the pages have no content.
  // The only way to make the content back to being visible is going back to
  // mobile layout where the MobileMenu will be visible again and closing it.
  //
  // simple solution:
  // the mobile menu only exists in for sm breakpoint.
  // leaving that sm breakpoint should set zustand menuOpen back to default state
  // and prevent any leftover state from leaking into md breakpoint behaviours.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        useSatMapStore.getState().setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-950">
      {/* Full-screen 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <GlobeBackground
          key={backgroundConfig}
          onReady={() => setGlobeReady(true)}
          backgroundConfig={backgroundConfig}
        />
      </div>

      {/* HUD layer: All absolute positioned over the Canvas */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <PagesHeader />
        {/* not sure if we can wrap our HUD-children in a main tag */}
        <main
          className={`pointer-events-auto w-full h-full ${
            !globeReady ? "hidden" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
