"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/hud/BottomSheet";
import MobileMenu from "@/components/hud/mobile/MobileMenu";
import { PAGES_NAV } from "@/lib/menu/menu";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSatMapStore } from "@/store/satmapStore";

export function PagesHeader() {
  const pathname = usePathname();
  const menuOpen = useSatMapStore((s) => s.menuOpen);
  const setMenuOpen = useSatMapStore((s) => s.setMenuOpen);

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background:
              "linear-gradient(to bottom, rgba(2,4,8,0.95) 0%, transparent 100%)",
          }}
        >
          {/* Logo */}
          <div className="pointer-events-none select-none">
            <span
              className="font-display font-black text-2xl tracking-[0.35em] text-accent-cyan"
              style={{ textShadow: "0 0 24px rgba(0,200,255,0.5)" }}
            >
              SATMAP<span className="text-[#00c8ff]/80">7</span>
            </span>
            <span className="block text-white/30 text-[10px] tracking-[0.2em] uppercase -mt-0.5">
              Live Satellite Tracker
            </span>
          </div>

          {/* Page Links Desktop */}
          <div className="hidden md:flex items-center gap-2 pointer-events-auto">
            {PAGES_NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={` transition-colors text-[10px] tracking-[0.2em] uppercase ${
                  pathname === href
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                [{label}]
              </Link>
            ))}
          </div>

          {/* Page Links Mobile */}
          <div className="flex md:hidden items-center gap-4 pointer-events-auto">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      <BottomSheet
        open={menuOpen === true}
        onClose={() => setMenuOpen(false)}
        title={"Menu"}
      >
        <MobileMenu
          isTrackerClient={false}
          onClose={() => setMenuOpen(false)}
        />
      </BottomSheet>
    </>
  );
}
