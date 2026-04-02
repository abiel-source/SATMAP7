"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSatMapStore } from "@/store/satmapStore";
import { CATEGORY_META } from "@/types/satellite";
import type { SatelliteRecord } from "@/types/satellite";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchOpen: boolean;
}

export function SearchBar({ searchOpen }: SearchBarProps) {
  const searchQuery = useSatMapStore((s) => s.searchQuery);
  const searchResults = useSatMapStore((s) => s.searchResults);
  const searchLoading = useSatMapStore((s) => s.searchLoading);
  const setSearchQuery = useSatMapStore((s) => s.setSearchQuery);
  const setSearchResults = useSatMapStore((s) => s.setSearchResults);
  const setSelected = useSatMapStore((s) => s.setSelected);

  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setSearchResults([], false);
        return;
      }
      setSearchResults([], true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSearchResults(data.results ?? [], false);
      } catch {
        setSearchResults([], false);
      }
    },
    [setSearchResults]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(searchQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, doSearch]);

  // auto-focus search bar, meant for mobile search icon tap only
  // auto-focus persists if searchOpen for tablet/desktop view, but this behaviour poses no threat
  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  const handleSelect = (sat: SatelliteRecord) => {
    setSelected(sat);
    setSearchQuery("");
    setSearchResults([], false);
    setOpen(false);
  };

  const showDropdown = open && searchQuery.length >= 2;

  return (
    // shown on md || (mobile && active search)
    // hidden on mobile && not active search
    <div
      className={`relative pointer-events-auto ${
        searchOpen ? "block w-full md:w-auto" : "hidden md:block"
      }`}
    >
      {/* full width on mobile && active search w-64 otherwise */}
      <div
        className={`flex items-center bg-space-900/90 backdrop-blur-sm border border-white/10 px-3 h-9 ${
          searchOpen ? "w-full md:w-64" : "w-64"
        }`}
      >
        {/* Search icon */}
        <Search className="w-3.5 h-3.5 text-white/30 mr-2 shrink-0" />
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search satellite name or NORAD ID..."
          className="bg-transparent text-white/80 text-xs placeholder-white/25 outline-none w-full tracking-wide"
          spellCheck={false}
        />
        {searchLoading && (
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse-slow shrink-0" />
        )}
        {searchQuery && !searchLoading && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchResults([], false);
            }}
            className="text-white/30 hover:text-white/70 transition-colors text-base leading-none shrink-0"
          >
            ×
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-space-950/98 border border-white/10 max-h-80 overflow-y-auto z-50 animate-fade-in">
          {searchResults.length === 0 && !searchLoading && (
            <p className="px-4 py-3 text-xs text-white/30 tracking-wide">
              No results found
            </p>
          )}
          {searchResults.map((sat) => {
            const meta = CATEGORY_META[sat.category];
            return (
              <button
                key={sat.noradId}
                onMouseDown={() => handleSelect(sat)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: meta.color,
                    boxShadow: `0 0 4px ${meta.color}`,
                  }}
                />
                <div className="min-w-0">
                  <p className="text-white/80 text-xs truncate">{sat.name}</p>
                  <p className="text-white/30 text-[10px] tracking-wide mt-0.5">
                    {meta.label} · #{sat.noradId}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
