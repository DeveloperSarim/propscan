import { DISTRICTS, EXCLUSIVE, NOTIFS, PLATFORMS, REASONS, REQUIREMENTS, SAVED_SEARCHES, TEAM, TYPES } from "./properties";
import { KSA_CITIES, KSA_DISTRICTS, KSA_DISTRICTS_DEFAULT } from "./ksa";
import type { Property } from "./types";

// ---- platform name mapping ------------------------------------------------

const PLATFORM_TO_ID: Record<string, string> = {
  Bayut: "bayut",
  Wasalt: "wasalt",
  Aqar: "aqar",
  "Property Finder": "property_finder",
};

const ID_TO_PLATFORM: Record<string, string> = {
  bayut: "Bayut",
  wasalt: "Wasalt",
  aqar: "Aqar",
  property_finder: "Property Finder",
};

// ---- formatting helpers ---------------------------------------------------

function formatPriceLabel(price: number, purpose: "Sale" | "Rent"): string {
  const suffix = purpose === "Rent" ? "/yr" : "";
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M" + suffix;
  if (price >= 1_000) return Math.round(price / 1_000) + "K" + suffix;
  return String(Math.round(price)) + suffix;
}

function formatPinLabel(price: number): string {
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (price >= 1_000) return Math.round(price / 1_000) + "K";
  return String(Math.round(price));
}

function postedLabel(listedAt: string | null | undefined): string {
  if (!listedAt) return "Recently";
  try {
    const d = new Date(listedAt);
    if (isNaN(d.getTime())) return String(listedAt);
    const diffMs = Date.now() - d.getTime();
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 1) return "Just now";
    if (hours < 24) return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
    const days = Math.floor(hours / 24);
    if (days === 1) return "1 day ago";
    if (days < 7) return days + " days ago";
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return "1 week ago";
    if (weeks < 4) return weeks + " weeks ago";
    const months = Math.floor(days / 30);
    if (months === 1) return "1 month ago";
    return months + " months ago";
  } catch {
    return String(listedAt);
  }
}

function capitalizeCity(city: string): string {
  if (!city) return "";
  return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
}

function normalizeType(t: string | null | undefined): string {
  if (!t) return "Apartment";
  const l = t.toLowerCase();
  if (l.includes("villa") || l.includes("فيلا")) return "Villa";
  if (l.includes("townhouse") || l.includes("تاون")) return "Townhouse";
  if (l.includes("office") || l.includes("مكتب")) return "Office";
  if (l.includes("land") || l.includes("أرض") || l.includes("ارض")) return "Land";
  if (l.includes("apart") || l.includes("شقة") || l.includes("شقق")) return "Apartment";
  return t;
}

// ---- types ----------------------------------------------------------------

export interface SearchParams {
  purpose: "for-sale" | "for-rent";
  city: string;
  platforms: string[];  // display names, e.g. ["Bayut", "Wasalt"]
  types: string[];
  minPrice: string;
  maxPrice: string;
  beds: string;
  baths: string;
  areaMin: string;
  areaMax: string;
  district: string;
}

interface BackendBroker {
  name?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  agency?: string | null;
}

interface BackendProperty {
  id?: string | null;
  platform: string;
  title?: string | null;
  description?: string | null;
  property_type?: string | null;
  purpose: string;
  price?: number | null;
  size_sqm?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  city?: string | null;
  area?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  broker?: BackendBroker | null;
  listing_url?: string | null;
  listed_at?: string | null;
  amenities?: string[];
  images?: string[];
  rega_verified?: boolean;
  fal_license?: string | null;
  ad_license?: string | null;
  ad_license_expiry?: number | null;
  rega_street?: string | null;
  furnishing?: string | null;
  completion_status?: string | null;
}

interface BackendSearchResult {
  total_found: number;
  unified: BackendProperty[];
}

// ---- mapping --------------------------------------------------------------

function mapBackendProperty(p: BackendProperty): Property {
  const price = p.price ?? 0;
  const purpose: "Sale" | "Rent" = p.purpose === "for-sale" ? "Sale" : "Rent";
  const sourceName = ID_TO_PLATFORM[p.platform] || p.platform;
  const id = String(p.id || Math.random().toString(36).slice(2));

  return {
    id,
    num: "#" + id,
    title: p.title || "Property",
    type: normalizeType(p.property_type),
    purpose,
    source: sourceName,
    price,
    priceLabel: formatPriceLabel(price, purpose),
    priceFull: price.toLocaleString("en-US"),
    pinLabel: formatPinLabel(price),
    beds: p.rooms ?? 0,
    baths: p.bathrooms ?? 0,
    area: p.size_sqm ?? 0,
    district: p.area || p.location || p.city || "",
    city: capitalizeCity(p.city || ""),
    status: "Ready",
    posted: postedLabel(p.listed_at),
    furnishing: "—",
    x: "50%",
    y: "50%",
    lat: p.latitude ?? undefined,
    lng: p.longitude ?? undefined,
    images: p.images || [],
    listingUrl: p.listing_url || undefined,
    broker: {
      name: p.broker?.name || "Agent",
      agency: p.broker?.agency || sourceName,
      phone: p.broker?.phone || p.broker?.whatsapp || "",
      listings: 0,
    },
    amenities: p.amenities || [],
    desc: p.description || "",
    regaVerified: p.rega_verified || false,
    falLicense: p.fal_license || undefined,
    adLicense: p.ad_license || undefined,
    adLicenseExpiry: p.ad_license_expiry || undefined,
    regaStreet: p.rega_street || undefined,
    completionStatus: p.completion_status || undefined,
  };
}

// ---- service --------------------------------------------------------------

// ---- search result cache (localStorage, 1-hour TTL) ----------------------

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const CACHE_VERSION = "v2";

interface CacheEntry {
  ts: number;
  total: number;
  props: Property[];
}

function _cacheKey(platform: string, city: string, purpose: string): string {
  return `propscan_${CACHE_VERSION}_${platform}_${city.toLowerCase()}_${purpose}`;
}

export function getCachedPlatform(platform: string, city: string, purpose: string): { properties: Property[]; total: number } | null {
  try {
    const raw = localStorage.getItem(_cacheKey(platform, city, purpose));
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL) { localStorage.removeItem(_cacheKey(platform, city, purpose)); return null; }
    return { properties: entry.props, total: entry.total };
  } catch { return null; }
}

function _setCachedPlatform(platform: string, city: string, purpose: string, result: { properties: Property[]; total: number }): void {
  try {
    const entry: CacheEntry = { ts: Date.now(), total: result.total, props: result.properties.slice(0, 600) };
    localStorage.setItem(_cacheKey(platform, city, purpose), JSON.stringify(entry));
  } catch { /* storage full — ignore */ }
}

export const propertyService = {
  // --- live search via FastAPI backend ------------------------------------
  async searchProperties(params: SearchParams): Promise<{ properties: Property[]; total: number }> {
    const backendPlatforms = params.platforms
      .map((name) => PLATFORM_TO_ID[name])
      .filter(Boolean) as string[];

    const isAqar = backendPlatforms.length === 1 && backendPlatforms[0] === "aqar";
    const isPF = backendPlatforms.length === 1 && backendPlatforms[0] === "property_finder";
    const isWasalt = backendPlatforms.length === 1 && backendPlatforms[0] === "wasalt";
    const maxPages = isAqar ? 9999 : isPF ? 145 : isWasalt ? 340 : 200;
    const body: Record<string, unknown> = {
      platforms: backendPlatforms.length > 0
        ? backendPlatforms
        : ["bayut", "wasalt", "aqar", "property_finder"],
      purpose: params.purpose,
      city: params.city.toLowerCase(),
      max_pages: maxPages,
    };

    if (params.district) body.area = params.district;
    if (params.types.length === 1) body.property_type = params.types[0];
    if (params.minPrice) body.price_min = parseFloat(params.minPrice);
    if (params.maxPrice) body.price_max = parseFloat(params.maxPrice);
    if (params.areaMin) body.size_min = parseFloat(params.areaMin);
    if (params.areaMax) body.size_max = parseFloat(params.areaMax);
    if (params.beds === "Studio") {
      body.rooms = 0;
    } else if (params.beds && params.beds !== "Any") {
      const n = parseInt(params.beds);
      if (!isNaN(n)) body.rooms = n;
    }
    if (params.baths && params.baths !== "Any") {
      const n = parseInt(params.baths);
      if (!isNaN(n)) body.bathrooms = n;
    }

    const controller = new AbortController();
    // Aqar: 11 min (33k pages). Wasalt: 9 min — a full city is ~260 pages and,
    // when all platforms run in parallel, network contention pushes it to ~5 min
    // (it was hitting the old 5-min cap and showing as failed). Others: 5 min.
    const timeoutMs = isAqar ? 660_000 : isWasalt ? 540_000 : 300_000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new Error("Search failed: " + res.status);

    const data: BackendSearchResult = await res.json();
    const result = {
      properties: (data.unified || []).map(mapBackendProperty),
      total: data.total_found || 0,
    };
    // Save to cache per platform (only when searching a single platform)
    if (backendPlatforms.length === 1) {
      _setCachedPlatform(params.platforms[0], params.city, params.purpose, result);
    }
    return result;
  },

  // --- Aqar streaming (SSE) — calls onBatch as each page-batch arrives ---
  streamAqar(
    params: SearchParams,
    onBatch: (props: Property[]) => void,
    onDone: (total: number) => void,
    onError: (err: string) => void,
  ): AbortController {
    const controller = new AbortController();

    const body: Record<string, unknown> = {
      platforms: ["aqar"],
      purpose: params.purpose,
      city: params.city.toLowerCase(),
      max_pages: 9999,
    };
    if (params.district)  body.area          = params.district;
    if (params.types.length === 1) body.property_type = params.types[0];
    if (params.minPrice)  body.price_min     = parseFloat(params.minPrice);
    if (params.maxPrice)  body.price_max     = parseFloat(params.maxPrice);
    if (params.areaMin)   body.size_min      = parseFloat(params.areaMin);
    if (params.areaMax)   body.size_max      = parseFloat(params.areaMax);
    if (params.beds === "Studio") {
      body.rooms = 0;
    } else if (params.beds && params.beds !== "Any") {
      const n = parseInt(params.beds); if (!isNaN(n)) body.rooms = n;
    }
    if (params.baths && params.baths !== "Any") {
      const n = parseInt(params.baths); if (!isNaN(n)) body.bathrooms = n;
    }

    (async () => {
      let total = 0;
      try {
        const res = await fetch("/search/stream-aqar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) { onError("stream failed: " + res.status); return; }

        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data: ")) continue;
            try {
              const msg = JSON.parse(line.slice(6));
              if (msg.event === "batch") {
                const props = (msg.properties || []).map(mapBackendProperty);
                total += props.length;
                onBatch(props);
              } else if (msg.event === "done") {
                onDone(total);
                return;
              } else if (msg.event === "error") {
                onError(msg.error || "unknown error");
                return;
              }
            } catch { /* skip malformed event */ }
          }
        }
        onDone(total);
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") onError(String(err));
      }
    })();

    return controller;
  },

  // --- reference data from API (async, with static fallbacks) -----------
  async fetchCities(): Promise<string[]> {
    const res = await fetch("/cities/bayut");
    if (!res.ok) return [];
    const data: { cities?: Array<{ name: string }> } = await res.json();
    return (data.cities || []).map((c) => c.name).filter(Boolean);
  },

  async fetchAreas(city: string): Promise<string[]> {
    const res = await fetch(`/areas?city=${encodeURIComponent(city)}&platform=bayut`);
    if (!res.ok) return [];
    const data: { platforms?: { bayut?: Array<{ name: string }> } } = await res.json();
    return (data.platforms?.bayut || []).map((a) => a.name).filter(Boolean);
  },

  async fetchPropertyTypes(): Promise<string[]> {
    const res = await fetch("/property-types/bayut");
    if (!res.ok) return [];
    const data: { property_types?: Array<{ name: string }> } = await res.json();
    return (data.property_types || []).map((t) => t.name).filter(Boolean);
  },

  // --- reference data (static fallbacks) ---------------------------------
  listCities(): string[] {
    return KSA_CITIES;
  },
  listDistricts(city: string): string[] {
    return KSA_DISTRICTS[city] ?? DISTRICTS[city] ?? KSA_DISTRICTS_DEFAULT;
  },
  listPlatforms(): string[] {
    return PLATFORMS;
  },
  listTypes(): string[] {
    return TYPES;
  },

  // --- supporting content ------------------------------------------------
  exclusiveProjects: () => EXCLUSIVE,
  team: () => TEAM,
  notifications: () => NOTIFS,
  savedSearches: () => SAVED_SEARCHES,
  requirements: () => REQUIREMENTS,
  reportReasons: () => REASONS,
};
