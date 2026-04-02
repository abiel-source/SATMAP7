//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - AUTHOR NOTES - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// 1) distinguish data API satellite fetches & visibility by CategoryState
// 2) propagated positions & selected satellited avoids prop drilling
// 3) accessible search data is semi sketchy but not a serious vulnerability
// 4) accessible sidebar UI is intentional
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  SatelliteRecord,
  SatelliteCategory,
  PropagatedSatellite,
  TrailMode,
} from "@/types/satellite";

export interface CategoryState {
  records: SatelliteRecord[];
  visible: boolean;
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

export interface SatMapStore {
  // ------------------------------------------------------------------------------
  // Category data ----------------------------------------------------------------
  // ------------------------------------------------------------------------------
  categories: Record<SatelliteCategory, CategoryState>;
  loadCategory: (cat: SatelliteCategory) => Promise<void>;
  toggleCategoryVisibility: (cat: SatelliteCategory) => void;

  // ------------------------------------------------------------------------------
  // Propagated positions (updated each tick) -------------------------------------
  // ------------------------------------------------------------------------------
  propagated: Map<number, PropagatedSatellite>;
  setPropagated: (map: Map<number, PropagatedSatellite>) => void;

  // ------------------------------------------------------------------------------
  // Selected / hovered -----------------------------------------------------------
  // ------------------------------------------------------------------------------
  selectedSatellite: SatelliteRecord | null;
  hoveredSatellite: SatelliteRecord | null;
  setSelected: (sat: SatelliteRecord | null) => void;
  setHovered: (sat: SatelliteRecord | null) => void;

  // ------------------------------------------------------------------------------
  // Trail mode -------------------------------------------------------------------
  // ------------------------------------------------------------------------------
  trailMode: TrailMode;
  setTrailMode: (mode: TrailMode) => void;

  // ------------------------------------------------------------------------------
  // Search -----------------------------------------------------------------------
  // ------------------------------------------------------------------------------
  searchQuery: string;
  searchResults: SatelliteRecord[];
  searchLoading: boolean;
  setSearchQuery: (q: string) => void;
  setSearchResults: (results: SatelliteRecord[], loading: boolean) => void;

  // ------------------------------------------------------------------------------
  // UI state ---------------------------------------------------------------------
  // ------------------------------------------------------------------------------
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;

  // ------------------------------------------------------------------------------
  // Stats ------------------------------------------------------------------------
  // ------------------------------------------------------------------------------
  totalVisible: number;
  recomputeTotal: () => void;
}

const defaultCategoryState = (): CategoryState => ({
  records: [],
  visible: true,
  loaded: false,
  loading: false,
  error: null,
});

const CATEGORIES: SatelliteCategory[] = [
  "starlink",
  "oneweb",
  "stations",
  "weather",
  "navigation",
  "debris",
  "other",
];

export const useSatMapStore = create<SatMapStore>()(
  subscribeWithSelector((set, get) => ({
    // ------------------------------------------------------------------------------
    // Category data ----------------------------------------------------------------
    // ------------------------------------------------------------------------------
    categories: Object.fromEntries(
      CATEGORIES.map((c) => [c, defaultCategoryState()])
    ) as Record<SatelliteCategory, CategoryState>,

    loadCategory: async (cat) => {
      const { categories } = get();
      if (categories[cat].loaded || categories[cat].loading) return;

      set((s) => ({
        categories: {
          ...s.categories,
          [cat]: { ...s.categories[cat], loading: true, error: null },
        },
      }));

      try {
        const res = await fetch(`/api/satellites?category=${cat}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        set((s) => ({
          categories: {
            ...s.categories,
            [cat]: {
              ...s.categories[cat],
              records: data.satellites,
              loaded: true,
              loading: false,
            },
          },
        }));

        get().recomputeTotal();
      } catch (e) {
        set((s) => ({
          categories: {
            ...s.categories,
            [cat]: {
              ...s.categories[cat],
              loading: false,
              error: e instanceof Error ? e.message : "Unknown error",
            },
          },
        }));
      }
    },

    toggleCategoryVisibility: (cat) => {
      set((s) => ({
        categories: {
          ...s.categories,
          [cat]: { ...s.categories[cat], visible: !s.categories[cat].visible },
        },
      }));
      get().recomputeTotal();
    },

    // ------------------------------------------------------------------------------
    // Propagated positions (updated each tick) -------------------------------------
    // ------------------------------------------------------------------------------
    propagated: new Map(),
    setPropagated: (map) => set({ propagated: map }),

    // ------------------------------------------------------------------------------
    // Selected / hovered -----------------------------------------------------------
    // ------------------------------------------------------------------------------
    selectedSatellite: null,
    hoveredSatellite: null,
    setSelected: (sat) => set({ selectedSatellite: sat }),
    setHovered: (sat) => set({ hoveredSatellite: sat }),

    // ------------------------------------------------------------------------------
    // Trail mode -------------------------------------------------------------------
    // ------------------------------------------------------------------------------
    trailMode: "history",
    setTrailMode: (mode) => set({ trailMode: mode }),

    // ------------------------------------------------------------------------------
    // Search -----------------------------------------------------------------------
    // ------------------------------------------------------------------------------
    // technically any component could access the search feature...
    // but only the search bar does
    searchQuery: "",
    searchResults: [],
    searchLoading: false,
    setSearchQuery: (q) => set({ searchQuery: q }),
    setSearchResults: (results, loading) =>
      set({ searchResults: results, searchLoading: loading }),

    // ------------------------------------------------------------------------------
    // UI state ---------------------------------------------------------------------
    // ------------------------------------------------------------------------------
    // add sidebar control in store for nice UX patterns
    // e.g., store easily allows clicking a satellite on mobile --> auto-close side bar
    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    menuOpen: false,
    setMenuOpen: (open) => set({ menuOpen: open }),

    // ------------------------------------------------------------------------------
    // Stats ------------------------------------------------------------------------
    // ------------------------------------------------------------------------------
    totalVisible: 0,
    recomputeTotal: () => {
      const { categories } = get();
      const total = CATEGORIES.filter((c) => categories[c].visible).reduce(
        (sum, c) => sum + categories[c].records.length,
        0
      );
      set({ totalVisible: total });
    },
  }))
);
