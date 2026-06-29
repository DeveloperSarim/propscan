import { create } from "zustand";
import { keyT } from "./logic";
import type { Property } from "../data/types";
import { propertyService, getCachedPlatform } from "../data/propertyService";

export type Screen =
  | "home" | "results" | "detail" | "map" | "post" | "dashboard" | "compare"
  | "about" | "contact" | "calc" | "login" | "broker" | "area" | "market"
  | "shortlist" | "legal";

export type View = "cards" | "split" | "map" | "list" | "grid" | "sheet" | "stats";

export interface State {
  screen: Screen;
  view: View;
  selectedId: string | null;
  purpose: "Buy" | "Rent";
  city: string;
  district: string;
  status: string;
  tab: string;
  lang: string;
  searchWithin: string;
  minPrice: string;
  maxPrice: string;
  beds: string;
  types: Record<string, boolean>;
  platforms: Record<string, boolean>;
  // extended
  dashTab: string;
  detailTab: string;
  calcTab: string;
  mort: { price: string; down: string; rate: string; term: string };
  yld: { price: string; rent: string };
  onbStep: number;
  modal: "report" | "onboarding" | null;
  reportReason: string;
  reportDone: boolean;
  sharePropId: string | null;
  rvOpen: boolean;
  toast: boolean;
  savedIds: string[];
  compareIds: string[];
  authMode: "login" | "signup";
  brokerName: string | null;
  mapPin: string | null;
  mapMove: boolean;
  pinMode: boolean;
  searchPin: { x: string; y: string; lat: string; lng: string; current?: boolean } | null;
  pinPopOpen: boolean;
  pinRadius: number;
  pinSearched: boolean;
  baths: string;
  areaMin: string;
  areaMax: string;
  propTypeTab: string;
  rentPeriod: string;
  pop: string | null;
  guests: { adults: number; children: number };
  dailyPrice: { min: string; max: string };
  checkIn: string | null;
  checkOut: string | null;
  npTypeTab: string;
  npType: string | null;
  handover: string | null;
  completion: string | null;
  payPlan: number;
  payPlanTouched: boolean;
  // live search results
  liveProps: Property[];
  searchTotal: number;
  isSearching: boolean;
  displayCount: number;
  platformStatus: Record<string, "loading" | "done" | "error">;
  platformCounts: Record<string, number>;
  // api-loaded reference data
  apiCities: string[];
  apiAreas: Record<string, string[]>;
  apiTypes: string[];
  prevScreen: Screen;
  // late-added flags
  mapCardsOpen: boolean;
  mapSat: boolean;
  viewedIds: string[];
  sortBy: string;
  savedOnly: boolean;
  mapExportOpen: boolean;
  clientExportOpen: boolean;
  detailExportOpen: boolean;
  legalDoc: string;
  aiQuery: string;
  aiMode: boolean;
  districtQuery: string;
  cookieAccepted: boolean;
}

export interface Actions {
  loadMore: () => void;
  setState: (partial: Partial<State>) => void;
  toggleKey: (group: "types" | "platforms", key: string) => void;
  go: (screen: Screen) => void;
  setView: (v: string) => void;
  openDetail: (id: string) => void;
  setMort: (k: keyof State["mort"], v: string) => void;
  setYld: (k: keyof State["yld"], v: string) => void;
  openModal: (m: "report" | "onboarding") => void;
  closeModal: () => void;
  pickDate: (k: string) => void;
  onPinDrop: (lat: number, lng: number) => void;
  runSearch: () => Promise<void>;
  fetchCities: () => Promise<void>;
  fetchAreas: (city: string) => Promise<void>;
  fetchPropertyTypes: () => Promise<void>;
}

export type Store = State & Actions;

const initialState: State = {
  screen: "home",
  view: "split",
  selectedId: null,
  purpose: "Buy",
  city: "Jeddah",
  district: "",
  status: "All",
  tab: "Properties",
  lang: "EN",
  searchWithin: "",
  minPrice: "",
  maxPrice: "",
  beds: "Any",
  types: {},
  platforms: {},
  dashTab: "saved",
  detailTab: "overview",
  calcTab: "mortgage",
  mort: { price: "1450000", down: "20", rate: "5.5", term: "25" },
  yld: { price: "1450000", rent: "7000" },
  onbStep: 1,
  modal: null,
  reportReason: "Fake or fraudulent listing",
  reportDone: false,
  sharePropId: null,
  rvOpen: false,
  toast: true,
  savedIds: [],
  compareIds: [],
  authMode: "login",
  brokerName: null,
  mapPin: null,
  mapMove: true,
  pinMode: false,
  searchPin: null,
  pinPopOpen: false,
  pinRadius: 5,
  pinSearched: false,
  baths: "Any",
  areaMin: "",
  areaMax: "",
  propTypeTab: "Residential",
  rentPeriod: "Any",
  pop: null,
  guests: { adults: 1, children: 0 },
  dailyPrice: { min: "", max: "" },
  checkIn: null,
  checkOut: null,
  npTypeTab: "Residential",
  npType: null,
  handover: null,
  completion: null,
  payPlan: 50,
  payPlanTouched: false,
  liveProps: [],
  searchTotal: 0,
  isSearching: false,
  displayCount: 50,
  platformStatus: {},
  platformCounts: {},
  apiCities: [],
  apiAreas: {},
  apiTypes: [],
  prevScreen: "map",
  mapCardsOpen: true,
  mapSat: false,
  viewedIds: [],
  sortBy: "relevance",
  savedOnly: false,
  mapExportOpen: false,
  clientExportOpen: false,
  detailExportOpen: false,
  legalDoc: "privacy",
  aiQuery: "",
  aiMode: false,
  districtQuery: "",
  cookieAccepted: false,
};

export const useStore = create<Store>((set, get) => ({
  ...initialState,

  setState: (partial) => set(partial as Partial<Store>),

  toggleKey: (group, key) =>
    set((s) => ({ [group]: { ...s[group], [key]: !s[group][key] } }) as Partial<Store>),

  go: (screen) => set({ screen }),

  setView: (v) => {
    if (v === "Map") set({ screen: "map", mapCardsOpen: false });
    else if (v === "Split") set({ screen: "map", mapCardsOpen: true });
    else set({ screen: "results", view: v.toLowerCase() as View });
  },

  openDetail: (id) => {
    const s = get();
    const rv = [id, ...(s.viewedIds || []).filter((x) => x !== id)].slice(0, 8);
    set({ screen: "detail", selectedId: id, viewedIds: rv, prevScreen: s.screen });
  },

  setMort: (k, v) => set((s) => ({ mort: { ...s.mort, [k]: v } })),
  setYld: (k, v) => set((s) => ({ yld: { ...s.yld, [k]: v } })),

  openModal: (m) => set({ modal: m, reportDone: false, onbStep: 1 }),
  closeModal: () => set({ modal: null }),

  pickDate: (k) => {
    const { checkIn, checkOut } = get();
    if (!checkIn || checkOut) set({ checkIn: k, checkOut: null });
    else if (keyT(k) > keyT(checkIn)) set({ checkOut: k });
    else set({ checkIn: k, checkOut: null });
  },

  onPinDrop: (lat: number, lng: number) => {
    set({
      searchPin: { x: "50%", y: "50%", lat: lat.toFixed(4), lng: lng.toFixed(4) },
      pinMode: false,
      pinPopOpen: true,
      pinSearched: false,
    });
  },

  runSearch: async () => {
    const s = get();
    const initStatus = Object.fromEntries(
      (Object.keys(s.platforms).filter((k) => s.platforms[k]).length > 0
        ? Object.keys(s.platforms).filter((k) => s.platforms[k])
        : ["Bayut", "Wasalt", "Aqar", "Property Finder"]
      ).map((p) => [p, "loading" as const])
    );
    // Load cached results immediately before API calls start
    const selectedPlatforms = Object.keys(s.platforms).filter((k) => s.platforms[k]);
    const platformsToSearch = selectedPlatforms.length > 0
      ? selectedPlatforms
      : ["Bayut", "Wasalt", "Aqar", "Property Finder"];

    const purpose = (s.purpose === "Buy" ? "for-sale" : "for-rent") as "for-sale" | "for-rent";

    const cachedProps: Property[] = [];
    const cachedCounts: Record<string, number> = {};
    let cachedTotal = 0;
    for (const pName of platformsToSearch) {
      const hit = getCachedPlatform(pName, s.city, purpose);
      if (hit) {
        cachedProps.push(...hit.properties);
        cachedCounts[pName] = hit.properties.length;
        cachedTotal += hit.total;
      }
    }
    const hasCached = cachedProps.length > 0;
    const cachedSorted = cachedProps.sort((a, b) => (a.price || 0) - (b.price || 0));

    set({
      isSearching: true,
      liveProps: cachedSorted,
      searchTotal: cachedTotal,
      displayCount: 50,
      platformStatus: initStatus,
      platformCounts: hasCached ? cachedCounts : {},
      mapPin: null,
      searchPin: null,
      pinSearched: false,
      pinPopOpen: false,
    });

    // Kick off area fetch for current city in the background
    get().fetchAreas(s.city);

    const baseParams = {
      purpose,
      city: s.city,
      types: Object.keys(s.types).filter((k) => s.types[k]),
      minPrice: s.minPrice,
      maxPrice: s.maxPrice,
      beds: s.beds,
      baths: s.baths,
      areaMin: s.areaMin,
      areaMax: s.areaMax,
      district: s.district,
    };

    const nonAqar = platformsToSearch.filter((p) => p !== "Aqar");
    const includesAqar = platformsToSearch.includes("Aqar");

    // Non-Aqar: fetch each platform independently, update UI as each resolves
    const nonAqarPromise = Promise.allSettled(
      nonAqar.map(async (platformName) => {
        try {
          const result = await propertyService.searchProperties({
            ...baseParams,
            platforms: [platformName],
          });
          set((s) => {
            const others = s.liveProps.filter((p) => p.source !== platformName);
            const merged = [...others, ...result.properties].sort(
              (a, b) => (a.price || 0) - (b.price || 0)
            );
            const counts = { ...s.platformCounts, [platformName]: result.properties.length };
            const total  = Object.values(counts).reduce((a, b) => a + b, 0);
            return {
              liveProps: merged,
              searchTotal: total,
              platformStatus: { ...s.platformStatus, [platformName]: "done" },
              platformCounts: counts,
            };
          });
        } catch (e) {
          console.error(`[search] ${platformName} failed:`, e);
          set((s) => ({ platformStatus: { ...s.platformStatus, [platformName]: "error" } }));
        }
      })
    );

    // Aqar: streaming — properties appear progressively as pages are fetched
    const aqarPromise = includesAqar
      ? new Promise<void>((resolve) => {
          propertyService.streamAqar(
            { ...baseParams, platforms: ["Aqar"] },
            (batch) => {
              set((s) => {
                const aqarExisting = s.liveProps.filter((p) => p.source === "Aqar");
                const others       = s.liveProps.filter((p) => p.source !== "Aqar");
                const merged = [...others, ...aqarExisting, ...batch].sort(
                  (a, b) => (a.price || 0) - (b.price || 0)
                );
                const newCount = (s.platformCounts["Aqar"] || 0) + batch.length;
                const counts   = { ...s.platformCounts, Aqar: newCount };
                return {
                  liveProps: merged,
                  searchTotal: Object.values(counts).reduce((a, b) => a + b, 0),
                  platformCounts: counts,
                };
              });
            },
            (_total) => {
              set((s) => ({ platformStatus: { ...s.platformStatus, Aqar: "done" } }));
              resolve();
            },
            (err) => {
              console.error("[stream] Aqar error:", err);
              set((s) => ({ platformStatus: { ...s.platformStatus, Aqar: "error" } }));
              resolve();
            },
          );
        })
      : Promise.resolve();

    await Promise.all([nonAqarPromise, aqarPromise]);

    set({ isSearching: false });
  },

  loadMore: () => set((s) => ({ displayCount: s.displayCount + 50 })),

  fetchCities: async () => {
    try {
      const cities = await propertyService.fetchCities();
      if (cities.length > 0) set({ apiCities: cities });
    } catch { /* silent — static KSA_CITIES list is the fallback */ }
  },

  fetchAreas: async (city: string) => {
    if (get().apiAreas[city]?.length) return; // already loaded
    try {
      const areas = await propertyService.fetchAreas(city);
      if (areas.length > 0) {
        set((st) => ({ apiAreas: { ...st.apiAreas, [city]: areas } }));
      }
    } catch { /* silent */ }
  },

  fetchPropertyTypes: async () => {
    try {
      const types = await propertyService.fetchPropertyTypes();
      if (types.length > 0) set({ apiTypes: types });
    } catch { /* silent */ }
  },
}));
