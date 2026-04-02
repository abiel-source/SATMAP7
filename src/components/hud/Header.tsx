"use client";

import { useState } from "react";
import { SearchBar } from "@/components/hud/SearchBar";
import { BottomSheet } from "@/components/hud/BottomSheet";
import MobileMenu from "@/components/hud/mobile/MobileMenu";
import { NAV } from "@/lib/menu/menu";
import { Search, Menu, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          {/* hidden when mobile && active search */}
          <div
            className={`pointer-events-none select-none ${
              searchOpen ? "hidden md:block" : "block"
            }`}
          >
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

          {/* Arrow icon shown when mobile && active search */}
          <div
            className={`${
              searchOpen
                ? "flex md:hidden items-center pointer-events-auto mr-2"
                : "hidden"
            }`}
          >
            <button
              onClick={() => setSearchOpen(false)}
              className={`text-white/50 hover:text-white transition-colors shrink-0`}
            >
              <ArrowLeft size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <SearchBar searchOpen={searchOpen} />

          {/* Page Links */}
          <div className="hidden md:flex items-center gap-2 pointer-events-auto">
            {NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-white/70 hover:text-white transition-colors text-[10px] tracking-[0.2em] uppercase"
              >
                [{label}]
              </Link>
            ))}
          </div>

          {/* Mobile */}
          {/* hidden for md || (mobile && active search) */}
          <div
            className={`${
              searchOpen
                ? "hidden"
                : "flex md:hidden items-center gap-4 pointer-events-auto"
            }`}
          >
            <button
              onClick={() => setSearchOpen(true)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <Search size={18} />
            </button>

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
        <MobileMenu isTrackerClient={true} onClose={() => setMenuOpen(false)} />
      </BottomSheet>
    </>
  );
}
