import type { Property } from "../data/types";
import type { State } from "./useStore";

const LRM = "‎"; // left-to-right mark, keeps "SAR" beside Western numerals

// ---- formatting ----------------------------------------------------------
export function shortMoney(n: number): string {
  if (n >= 1e6) return "SAR " + LRM + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "SAR " + LRM + Math.round(n / 1e3) + "K";
  return "SAR " + LRM + Math.round(n);
}

export function shortNum(v: string | number): string {
  const n = parseFloat(String(v).replace(/,/g, ""));
  if (isNaN(n)) return String(v);
  if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "K";
  return String(n);
}

export function specsOf(p: Property): string {
  if (p.type === "Land") return p.area + " m²";
  if (p.type === "Office") return p.baths + " ba · " + p.area + " m²";
  if (p.beds === 0) return "Studio · " + p.baths + " ba · " + p.area + " m²";
  return p.beds + " bd · " + p.baths + " ba · " + p.area + " m²";
}

export function freshDays(p: Property): number {
  if (!p.posted) return 7;
  const posted = p.posted.toLowerCase();
  const hourMatch = posted.match(/^(\d+)\s*hour/);
  if (hourMatch) return 0;
  const dayMatch = posted.match(/^(\d+)\s*day/);
  if (dayMatch) return parseInt(dayMatch[1]);
  const weekMatch = posted.match(/^(\d+)\s*week/);
  if (weekMatch) return parseInt(weekMatch[1]) * 7;
  const monthMatch = posted.match(/^(\d+)\s*month/);
  if (monthMatch) return parseInt(monthMatch[1]) * 30;
  if (posted.includes("just now") || posted.includes("today") || posted.includes("recently")) return 0;
  return 7;
}

export function freshOf(p: Property): { label: string; style: string; new: boolean } {
  const days = freshDays(p);
  if (days <= 0) return { label: "New", style: "background:#16A34A;color:#fff;", new: true };
  if (days <= 2) return { label: days + "d ago", style: "background:#F0FDF4;color:#15803D;border:1px solid #BBF7D0;", new: false };
  return { label: days + "d ago", style: "background:rgba(255,255,255,.92);color:#6B7280;border:1px solid #E5E7EB;", new: false };
}

const SOURCE_DOMAINS: Record<string, string> = {
  Bayut: "bayut.sa",
  Wasalt: "wasalt.com",
  Aqar: "aqar.fm",
  "Property Finder": "propertyfinder.sa",
  Sakani: "sakani.sa",
  Haraj: "haraj.com.sa",
  OpenSooq: "sa.opensooq.com",
  DealApp: "dealapp.sa",
};

export function sourceUrl(p: Property): string {
  const slug = (p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const dom = SOURCE_DOMAINS[p.source] || "bayut.sa";
  return "https://" + dom + "/property/" + slug + "-" + (p.id || "");
}

export function deco(p: Property) {
  return {
    ...p,
    specs: specsOf(p),
    location: p.district + ", " + p.city,
    isOffPlan: p.status === "Off-Plan",
  };
}

// ---- reusable style strings (mirror the design's helper methods) ---------
export const chipStyle = (active: boolean) =>
  "padding: 5px 12px; font-size: 12px; border-radius: 6px; cursor: pointer; border: 1px solid " + (active ? "#0A0A0A" : "#E5E7EB") + "; background: " + (active ? "#0A0A0A" : "#fff") + "; color: " + (active ? "#fff" : "#374151") + "; font-weight: " + (active ? "500" : "400") + ";";

export const dashNavStyle = (active: boolean) =>
  "display: flex; align-items: center; gap: 9px; height: 38px; padding: 0 10px; border-radius: 7px; font-size: 13px; cursor: pointer; color: " + (active ? "#0A0A0A" : "#6B7280") + "; background: " + (active ? "#F3F4F6" : "transparent") + "; font-weight: " + (active ? "500" : "400") + ";";

export const tabNavStyle = (active: boolean) =>
  "padding: 10px 0; font-size: 14px; cursor: pointer; color: " + (active ? "#0A0A0A" : "#9CA3AF") + "; font-weight: " + (active ? "500" : "400") + "; border-bottom: 2px solid " + (active ? "#0A0A0A" : "transparent") + "; margin-bottom: -1px;";

export const tabStyle = (active: boolean) =>
  "padding: 12px 0; font-size: 13px; cursor: pointer; color: " + (active ? "#0A0A0A" : "#9CA3AF") + "; font-weight: " + (active ? "500" : "400") + "; border-bottom: 2px solid " + (active ? "#0A0A0A" : "transparent") + "; margin-bottom: -1px;";

export const segStyle = (active: boolean) =>
  "display: flex; align-items: center; justify-content: center; padding: 0 12px; font-size: 13px; cursor: pointer; white-space: nowrap; background: " + (active ? "#0A0A0A" : "#fff") + "; color: " + (active ? "#fff" : "#374151") + ";";

export const langStyle = (active: boolean) =>
  "padding: 5px 11px; font-size: 12px; cursor: pointer; font-weight: " + (active ? "600" : "500") + "; background: " + (active ? "#0A0A0A" : "#fff") + "; color: " + (active ? "#fff" : "#6B7280") + ";";

export const boxStyle = (checked: boolean) =>
  "width: 15px; height: 15px; min-width: 15px; border-radius: 4px; border: 1px solid " + (checked ? "#16A34A" : "#D1D5DB") + "; background: " + (checked ? "#16A34A" : "#fff") + "; display: flex; align-items: center; justify-content: center;";

export const npTabStyle = (active: boolean) =>
  "flex:1;text-align:center;padding:8px 0;font-size:13px;cursor:pointer;color:" + (active ? "#16A34A" : "#9CA3AF") + ";font-weight:" + (active ? "600" : "400") + ";border-bottom:2px solid " + (active ? "#16A34A" : "transparent") + ";margin-bottom:-1px;";

export const menuItemStyle = (active: boolean) =>
  "padding:9px 12px;font-size:13px;border-radius:7px;cursor:pointer;color:" + (active ? "#16A34A" : "#374151") + ";font-weight:" + (active ? "600" : "400") + ";background:" + (active ? "#F0FDF4" : "transparent") + ";";

export const pillStyle = (active: boolean) =>
  "min-width:44px;text-align:center;padding:7px 14px;border-radius:999px;font-size:13px;cursor:pointer;border:1px solid " + (active ? "#16A34A" : "#E5E7EB") + ";background:" + (active ? "#F0FDF4" : "#fff") + ";color:" + (active ? "#15803D" : "#374151") + ";";

// ---- filtering + sorting -------------------------------------------------
// Haversine distance in km between two lat/lng points
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function filtered(s: State): Property[] {
  // liveProps is already filtered by city/purpose by the backend; apply
  // client-side filters for instant responsiveness on filter changes
  let list = (s.liveProps || []).slice();
  const tk = Object.keys(s.types).filter((k) => s.types[k]);
  if (tk.length) list = list.filter((p) => tk.includes(p.type));
  const pk = Object.keys(s.platforms).filter((k) => s.platforms[k]);
  if (pk.length) list = list.filter((p) => pk.includes(p.source));
  const mn = parseFloat(s.minPrice), mx = parseFloat(s.maxPrice);
  if (!isNaN(mn)) list = list.filter((p) => p.price >= mn);
  if (!isNaN(mx)) list = list.filter((p) => p.price <= mx);
  if (s.beds !== "Any") {
    if (s.beds === "Studio") list = list.filter((p) => p.beds === 0);
    else {
      const n = parseInt(s.beds);
      list = list.filter((p) => p.beds >= n);
    }
  }
  if (s.baths && s.baths !== "Any") {
    const nb = parseInt(s.baths);
    list = list.filter((p) => p.baths >= nb);
  }
  const amn = parseFloat(s.areaMin), amx = parseFloat(s.areaMax);
  if (!isNaN(amn)) list = list.filter((p) => p.area >= amn);
  if (!isNaN(amx)) list = list.filter((p) => p.area <= amx);
  if (s.district) list = list.filter((p) => p.district === s.district);
  if (s.savedOnly) list = list.filter((p) => s.savedIds.includes(p.id));
  // Pin radius filter — only active after user taps "Search" in the pin popup
  if (s.pinSearched && s.searchPin && s.pinRadius < 100) {
    const pinLat = parseFloat(s.searchPin.lat);
    const pinLng = parseFloat(s.searchPin.lng);
    if (!isNaN(pinLat) && !isNaN(pinLng)) {
      list = list.filter((p) =>
        p.lat && p.lng && haversineKm(pinLat, pinLng, p.lat, p.lng) <= s.pinRadius
      );
    }
  }
  if (s.searchWithin.trim()) {
    const q = s.searchWithin.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q) || p.district.toLowerCase().includes(q) || p.source.toLowerCase().includes(q));
  }
  const sb = s.sortBy || "relevance";
  if (sb === "priceAsc") list = list.slice().sort((a, b) => a.price - b.price);
  else if (sb === "priceDesc") list = list.slice().sort((a, b) => b.price - a.price);
  else if (sb === "areaDesc") list = list.slice().sort((a, b) => b.area - a.area);
  else if (sb === "newest") list = list.slice().sort((a, b) => freshDays(a) - freshDays(b));
  return list;
}

// ---- calendar (Daily Rentals date picker) --------------------------------
export interface CalCell {
  blank: boolean;
  label: string;
  onClick: () => void;
  style: string;
}

export function keyT(k: string): number {
  const p = k.split("-").map(Number);
  return new Date(p[0], p[1], p[2]).getTime();
}

export function fmtDate(k: string): string {
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const p = k.split("-").map(Number);
  return M[p[1]] + " " + p[2];
}

export function buildMonth(s: State, y: number, m: number, onPick: (k: string) => void): CalCell[] {
  const today = new Date(2026, 5, 18).getTime();
  const ci = s.checkIn ? keyT(s.checkIn) : null;
  const co = s.checkOut ? keyT(s.checkOut) : null;
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells: CalCell[] = [];
  for (let i = 0; i < first; i++) cells.push({ blank: true, label: "", onClick: () => {}, style: "height:30px;" });
  for (let d = 1; d <= days; d++) {
    const k = y + "-" + m + "-" + d;
    const t = new Date(y, m, d).getTime();
    const dis = t < today;
    const sel = t === ci || t === co;
    const inR = !!ci && !!co && t > ci && t < co;
    let bg = "transparent", col = dis ? "#D1D5DB" : "#374151", fw = "400", dec = dis ? "line-through" : "none";
    if (inR) bg = "#F0FDF4";
    if (sel) { bg = "#16A34A"; col = "#fff"; fw = "700"; dec = "none"; }
    cells.push({
      blank: false,
      label: String(d),
      onClick: dis ? () => {} : () => onPick(k),
      style: "height:30px;display:flex;align-items:center;justify-content:center;font-size:12px;border-radius:6px;background:" + bg + ";color:" + col + ";font-weight:" + fw + ";text-decoration:" + dec + ";cursor:" + (dis ? "default" : "pointer") + ";",
    });
  }
  return cells;
}
