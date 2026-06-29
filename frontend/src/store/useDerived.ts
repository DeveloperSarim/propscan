import { useStore } from "./useStore";
import {
  DISTRICTS,
  EXCLUSIVE,
  NOTIFS,
  PLATFORMS,
  REASONS,
  REQUIREMENTS,
  SAVED_SEARCHES,
  TEAM,
  TYPES,
} from "../data/properties";
import { KSA_CITIES, KSA_DISTRICTS, KSA_DISTRICTS_DEFAULT } from "../data/ksa";
import type { Property } from "../data/types";
import { downloadListings, downloadListingsForClient } from "../lib/exporter";
import {
  boxStyle,
  buildMonth,
  chipStyle,
  dashNavStyle,
  deco,
  filtered,
  freshOf,
  langStyle,
  menuItemStyle,
  npTabStyle,
  pillStyle,
  segStyle,
  shortMoney,
  shortNum,
  sourceUrl,
  specsOf,
  tabNavStyle,
  tabStyle,
} from "./logic";

const LRM = "‎";

// Bounding boxes [south, west, north, east] — filters out-of-city coordinates
const CITY_BOUNDS: Record<string, [number, number, number, number]> = {
  Riyadh:  [24.2, 46.3, 25.2, 47.2],
  Jeddah:  [21.0, 38.8, 22.2, 39.7],
  Mecca:   [21.1, 39.4, 21.9, 40.3],
  Medina:  [24.2, 39.3, 24.9, 40.0],
  Dammam:  [26.0, 49.7, 26.8, 50.5],
  Khobar:  [26.0, 49.9, 26.6, 50.4],
  Taif:    [21.0, 40.2, 21.7, 40.9],
  Tabuk:   [28.1, 36.3, 28.7, 36.9],
  Abha:    [17.9, 42.3, 18.5, 42.9],
  Hail:    [27.3, 41.5, 28.0, 42.1],
};

/**
 * Computes every derived value the screens render — a direct port of the
 * design's renderVals(). Runs each render; the store is the single source of
 * truth so values stay consistent across screens.
 */
export function useDerived() {
  const store = useStore();
  const s = store;
  const setState = store.setState;

  const liveProps = s.liveProps || [];

  const EMPTY_PROPERTY: Property = {
    id: "", num: "", title: "No results yet", type: "Apartment", purpose: "Sale",
    source: "", price: 0, priceLabel: "—", priceFull: "—", pinLabel: "—",
    beds: 0, baths: 0, area: 0, district: "", city: "", status: "Ready", posted: "—",
    furnishing: "—", x: "50%", y: "50%",
    broker: { name: "—", agency: "—", phone: "—", listings: 0 },
    amenities: [], desc: "",
  };

  const allFiltered = filtered(s);
  const displayCount = s.displayCount || 50;
  const list = allFiltered.slice(0, displayCount);
  const detail = liveProps.find((p) => p.id === s.selectedId) || liveProps[0] || EMPTY_PROPERTY;

  const decoratedList = list.map((p) => ({
    ...p,
    specs: specsOf(p),
    location: p.district + ", " + p.city,
    isOffPlan: p.status === "Off-Plan",
    open: () => store.openDetail(p.id),
    bedsNum: p.beds === 0 ? "—" : p.beds,
    bathsNum: p.baths === 0 ? "—" : p.baths,
    cardTitle: (p.purpose === "Sale" ? "For sale" : "For rent") + ": " + p.type + " in " + p.district + ", " + p.city,
    ppsm: p.area && p.area > 0 && p.type !== "Land" ? "SAR " + LRM + Math.round(p.price / p.area).toLocaleString("en-US") + "/m²" : "",
    freshLabel: freshOf(p).label,
    freshStyle: freshOf(p).style,
    inCompare: s.compareIds.includes(p.id),
    toggleCompare: (e?: { stopPropagation?: () => void }) => {
      if (e && e.stopPropagation) e.stopPropagation();
      setState({ compareIds: s.compareIds.includes(p.id) ? s.compareIds.filter((x) => x !== p.id) : s.compareIds.length >= 3 ? s.compareIds : [...s.compareIds, p.id] });
    },
    selectPin: () => setState({ mapPin: p.id }),
    hoverPin: () => setState({ mapPin: p.id }),
    saved: s.savedIds.includes(p.id),
    toggleSave: (e?: { stopPropagation?: () => void }) => {
      if (e && e.stopPropagation) e.stopPropagation();
      setState({ savedIds: s.savedIds.includes(p.id) ? s.savedIds.filter((x) => x !== p.id) : [...s.savedIds, p.id] });
    },
    saveBox: "position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,.92); display: flex; align-items: center; justify-content: center; cursor: pointer; color: " + (s.savedIds.includes(p.id) ? "#16A34A" : "#6B7280") + ";",
    saveFill: s.savedIds.includes(p.id) ? "#16A34A" : "none",
    compareBox: "display: none;",
    image: (p.images?.[0]) || "",
    shareUrl: "https://wa.me/?text=" + encodeURIComponent(p.title + " — SAR " + p.priceLabel + " · " + p.district + ", " + p.city + " · " + sourceUrl(p)),
    rowStyle: "display: flex; gap: 10px; padding: 11px 14px; border-bottom: 1px solid #F3F4F6; cursor: pointer; " + (p.id === s.mapPin ? "background: #F0FDF4;" : ""),
    pinStyle: "position: absolute; left: " + p.x + "; top: " + p.y + "; transform: translate(-50%,-50%); background: " + (p.id === s.mapPin || p.id === s.selectedId ? "#16A34A" : "#fff") + "; color: " + (p.id === s.mapPin || p.id === s.selectedId ? "#fff" : "#0A0A0A") + "; border: 1px solid #16A34A; border-radius: 999px; padding: 4px 9px; font-size: 11px; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.18); cursor: pointer; white-space: nowrap; z-index: " + (p.id === s.mapPin ? "10" : "1") + ";",
  }));

  const typeCounts: Record<string, number> = {}, platCounts: Record<string, number> = {};
  liveProps.forEach((p) => {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
    platCounts[p.source] = (platCounts[p.source] || 0) + 1;
  });

  const bedsLabel = detail.beds === 0 ? (detail.type === "Land" || detail.type === "Office" ? "—" : "Studio") : detail.beds + " Beds";
  const bathsLabel = detail.baths === 0 ? "—" : detail.baths + " Baths";
  const initials = detail.broker.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  const detailRows = [
    { k: "Type", v: detail.type },
    { k: "Purpose", v: detail.purpose === "Sale" ? "For Sale" : "For Rent" },
    { k: "Status", v: detail.status },
    { k: "Furnishing", v: detail.furnishing },
    { k: "Area", v: detail.area + " m²" },
    { k: "Listed", v: detail.posted },
  ].map((r, i) => ({ ...r, style: "display: flex; justify-content: space-between; padding: 10px 12px;" + (i % 2 === 0 ? " border-right: 1px solid #F3F4F6;" : "") + (i < 4 ? " border-bottom: 1px solid #F3F4F6;" : "") }));

  const navLinks = [
    { label: "Buy", go: () => setState({ screen: "results", view: "split", purpose: "Buy" }) },
    { label: "Rent", go: () => setState({ screen: "results", view: "split", purpose: "Rent" }) },
    { label: "New Projects", go: () => setState({ screen: "results", view: "grid" }) },
    { label: "Compare", go: () => setState({ screen: "compare" }) },
    { label: "Calculators", go: () => setState({ screen: "calc" }) },
    { label: "About", go: () => setState({ screen: "about" }) },
    { label: "Contact", go: () => setState({ screen: "contact" }) },
  ].map((l) => ({ label: l.label, onClick: l.go, style: "font-size: 13px; color: #374151; cursor: pointer;" }));

  // mortgage
  const mo = s.mort;
  const Pp = parseFloat(mo.price) || 0;
  const dpAmt = (Pp * (parseFloat(mo.down) || 0)) / 100;
  const loanAmt = Pp - dpAmt;
  const rrate = (parseFloat(mo.rate) || 0) / 100 / 12;
  const nmon = (parseInt(mo.term) || 1) * 12;
  const monthly = rrate > 0 ? (loanAmt * rrate * Math.pow(1 + rrate, nmon)) / (Math.pow(1 + rrate, nmon) - 1) : loanAmt / nmon;
  const totPay = monthly * nmon, totInt = totPay - loanAmt;
  const termChips = ["10", "15", "20", "25", "30"].map((t) => ({ label: t + "yr", onClick: () => store.setMort("term", t), style: chipStyle(mo.term === t) }));

  // rental yield
  const yp = parseFloat(s.yld.price) || 0, yrent = parseFloat(s.yld.rent) || 0;
  const annInc = yrent * 12, yPct = yp > 0 ? (annInc / yp) * 100 : 0;

  // saved / recent / similar
  const find = (id: string) => liveProps.find((p) => p.id === id)!;
  const savedProps = s.savedIds.map(find).filter(Boolean).map((p) => ({ ...deco(p), open: () => store.openDetail(p.id), removeSave: () => setState({ savedIds: s.savedIds.filter((x) => x !== p.id) }) }));
  const recentProps = liveProps.slice(0, 8).map((p) => ({ ...deco(p), open: () => store.openDetail(p.id), viewed: "Viewed " + (["2h", "5h", "1d", "2d", "3d", "4d", "5d", "1w"][liveProps.indexOf(p)] || "1w") + " ago" }));
  const similarProps = liveProps.filter((p) => p.id !== detail.id && p.type === detail.type).slice(0, 6).map((p) => ({ ...deco(p), open: () => store.openDetail(p.id) }));
  if (similarProps.length < 4)
    liveProps.filter((p) => p.id !== detail.id).slice(0, 6).forEach((p) => {
      if (!similarProps.find((x) => x.id === p.id) && similarProps.length < 6) similarProps.push({ ...deco(p), open: () => store.openDetail(p.id) });
    });

  // compare
  const compareCols = s.compareIds.map(find).filter(Boolean).map((p) => ({ ...deco(p), removeCol: () => setState({ compareIds: s.compareIds.filter((x) => x !== p.id) }) }));
  const cfields: Array<[string, (p: Property) => string]> = [
    ["Price", (p) => "SAR " + LRM + p.priceLabel], ["Location", (p) => p.district + ", " + p.city], ["Type", (p) => p.type],
    ["Bedrooms", (p) => (p.beds === 0 ? "—" : String(p.beds))], ["Bathrooms", (p) => (p.baths === 0 ? "—" : String(p.baths))],
    ["Area", (p) => p.area + " m²"], ["Furnished", (p) => p.furnishing], ["Parking", (p) => (p.amenities.some((a) => a.toLowerCase().includes("parking")) ? "✓" : "—")],
    ["Air Conditioning", (p) => (p.amenities.some((a) => a.includes("A/C")) ? "✓" : "—")], ["Maid Room", (p) => (p.amenities.includes("Maid room") ? "✓" : "—")],
    ["Property Age", (p) => (p.status === "Off-Plan" ? "Off-plan" : "New")], ["REGA Verified", () => "✓"], ["Source Platform", (p) => p.source], ["Added", (p) => p.posted],
  ];
  const cgt = "160px repeat(" + Math.max(compareCols.length, 1) + ", 1fr)";
  const compareRows = cfields.map(([label, fn], i) => ({
    label,
    style: "display: grid; grid-template-columns: " + cgt + "; align-items: center; " + (i % 2 ? "background: #FAFAFA;" : "background: #fff;"),
    cells: compareCols.map((p) => {
      const t = fn(p);
      return { text: t, style: "padding: 13px 14px; font-size: 13px; border-left: 1px solid #F3F4F6; " + (t === "✓" ? "color: #16A34A; font-weight: 600;" : t === "—" ? "color: #D1D5DB;" : "color: #111827;") };
    }),
  }));

  const alerts = savedProps.map((p) => ({ ...p, current: "SAR " + LRM + p.priceLabel, target: shortMoney(p.price * 0.9) }));

  const dashNav = [
    { key: "saved", label: "Saved Properties", count: s.savedIds.length },
    { key: "searches", label: "Saved Searches", count: 3 },
    { key: "alerts", label: "Price Alerts", count: 2 },
    { key: "requirements", label: "My Requirements", count: 2 },
    { key: "recent", label: "Recently Viewed", count: 0 },
    { key: "notifs", label: "Notifications", count: 2 },
    { key: "settings", label: "Settings", count: 0 },
  ].map((n) => ({ ...n, active: s.dashTab === n.key, hasCount: n.count > 0, onClick: () => setState({ dashTab: n.key }), style: dashNavStyle(s.dashTab === n.key) }));
  const notifs = NOTIFS.map((n) => ({ ...n }));

  // stats
  const sale = liveProps.filter((p) => p.purpose === "Sale");
  const avgPrice = shortMoney(sale.reduce((a, x) => a + x.price, 0) / (sale.length || 1));
  const avgArea = liveProps.length ? Math.round(liveProps.reduce((a, x) => a + x.area, 0) / liveProps.length) + " m²" : "—";
  const buckets: Array<[string, number, number]> = [["<1M", 0, 1e6], ["1–2M", 1e6, 2e6], ["2–3M", 2e6, 3e6], ["3–5M", 3e6, 5e6], ["5M+", 5e6, 1e12]];
  const bc = buckets.map(([l, mn, mx]) => ({ l, n: sale.filter((p) => p.price >= mn && p.price < mx).length }));
  const bmax = Math.max(...bc.map((b) => b.n), 1);
  const priceBars = bc.map((b) => ({ label: b.l, n: b.n, barStyle: "width: 100%; background: #16A34A; border-radius: 4px 4px 0 0; height: " + Math.max(Math.round((b.n / bmax) * 150), 4) + "px;" }));
  const srcRaw = PLATFORMS.map((pl) => ({ label: pl, n: liveProps.filter((p) => p.source === pl).length }));
  const smax = Math.max(...srcRaw.map((x) => x.n), 1);
  const topSrc = srcRaw.slice().sort((a, b) => b.n - a.n)[0].label;
  const srcBars = srcRaw.map((x) => ({ label: x.label, n: x.n, barStyle: "height: 9px; border-radius: 5px; width: " + Math.max(Math.round((x.n / smax) * 100), 4) + "%; background: " + (x.label === topSrc ? "#16A34A" : "#D1D5DB") + ";" }));
  const byDist: Record<string, Property[]> = {};
  liveProps.forEach((p) => {
    (byDist[p.district] = byDist[p.district] || []).push(p);
  });
  const distRows = Object.keys(byDist).map((d, i) => {
    const arr = byDist[d];
    const tc: Record<string, number> = {};
    arr.forEach((x) => (tc[x.type] = (tc[x.type] || 0) + 1));
    const mct = Object.keys(tc).sort((a, b) => tc[b] - tc[a])[0];
    return { d, n: arr.length, avgP: shortMoney(arr.reduce((a, x) => a + x.price, 0) / arr.length), avgA: Math.round(arr.reduce((a, x) => a + x.area, 0) / arr.length) + " m²", mct, style: "display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1.2fr; align-items: center; padding: 11px 14px; font-size: 13px; " + (i % 2 ? "background: #FAFAFA;" : "") };
  }).slice(0, 8);

  // report
  const reasons = REASONS.map((r) => ({
    label: r,
    active: s.reportReason === r,
    onClick: () => setState({ reportReason: r }),
    style: "display: flex; align-items: center; gap: 10px; height: 42px; padding: 0 12px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #374151; border: 1px solid " + (s.reportReason === r ? "#16A34A" : "#E5E7EB") + "; background: " + (s.reportReason === r ? "#F0FDF4" : "#fff") + ";",
    dotStyle: "width: 15px; height: 15px; min-width: 15px; border-radius: 50%; border: 1px solid " + (s.reportReason === r ? "#16A34A" : "#D1D5DB") + "; display: flex; align-items: center; justify-content: center;",
  }));
  const shareProp = liveProps.find((p) => p.id === s.sharePropId);

  // broker profile
  const bName = s.brokerName || detail.broker.name;
  const bSource = liveProps.find((p) => p.broker.name === bName) || detail;
  const bListings = liveProps.filter((p) => p.broker.name === bName).map((p) => ({ ...deco(p), open: () => store.openDetail(p.id) }));
  const brokerView = {
    name: bName,
    agency: bSource.broker.agency,
    phone: bSource.broker.phone,
    city: bSource.city,
    initials: bName.split(" ").map((w) => w[0]).slice(0, 2).join(""),
    count: bListings.length,
    listings: bListings,
  };

  const mapPinRaw = s.mapPin
    ? (allFiltered.find((p) => p.id === s.mapPin) || liveProps.find((p) => p.id === s.mapPin) || null)
    : null;

  return {
    isHome: s.screen === "home", isResults: s.screen === "results", isDetail: s.screen === "detail", isMap: s.screen === "map",
    isPost: s.screen === "post", isDash: s.screen === "dashboard", isCompare: s.screen === "compare", isAbout: s.screen === "about", isContact: s.screen === "contact", isCalc: s.screen === "calc",
    isLogin: s.screen === "login", isBroker: s.screen === "broker", isArea: s.screen === "area",
    isMarket: s.screen === "market", isShortlist: s.screen === "shortlist", isLegal: s.screen === "legal",
    goMarket: () => setState({ screen: "market" }),
    goShortlist: () => setState({ screen: "shortlist" }),
    goPrivacy: () => setState({ screen: "legal", legalDoc: "privacy" }),
    goTerms: () => setState({ screen: "legal", legalDoc: "terms" }),
    showCookie: false,
    acceptCookie: () => setState({ cookieAccepted: true }),
    privacyTab: "font-size:13px;cursor:pointer;color:" + (s.legalDoc !== "terms" ? "#0A0A0A" : "#9CA3AF") + ";font-weight:" + (s.legalDoc !== "terms" ? "600" : "400") + ";",
    termsTab: "font-size:13px;cursor:pointer;color:" + (s.legalDoc === "terms" ? "#0A0A0A" : "#9CA3AF") + ";font-weight:" + (s.legalDoc === "terms" ? "600" : "400") + ";",
    legalTitle: s.legalDoc === "terms" ? "Terms of Service" : "Privacy Policy",
    legalNav: (s.legalDoc === "terms" ? ["Acceptance", "Use of Service", "Scraping Notice", "Intellectual Property", "Liability", "Governing Law", "Contact"] : ["Introduction", "Data We Collect", "How We Use Data", "Cookies", "Third Parties", "Your Rights", "Contact"]).map((l, i) => ({ label: l, style: "font-size:13px;padding:7px 0 7px 12px;cursor:pointer;border-left:2px solid " + (i === 0 ? "#16A34A" : "transparent") + ";color:" + (i === 0 ? "#0A0A0A" : "#6B7280") + ";font-weight:" + (i === 0 ? "600" : "400") + ";" })),
    legalSections: s.legalDoc === "terms" ? [
      { h: "Acceptance", body: "By accessing PropScan you agree to these Terms of Service. If you do not agree, please discontinue use of the platform." },
      { h: "Use of Service", body: "PropScan aggregates publicly listed real-estate data from third-party platforms to help you search across sources in one place. The service is provided for personal, non-commercial use." },
      { h: "Scraping Notice", body: "Listing data is collected from partner platforms and public sources, de-duplicated, and refreshed continuously. PropScan does not guarantee the accuracy, availability, or pricing of any aggregated listing." },
      { h: "Intellectual Property", body: "The PropScan name, interface, and original content are owned by PropScan. Source listings remain the property of their respective platforms and brokers." },
      { h: "Liability", body: "PropScan is an aggregator and is not a party to any transaction. We are not liable for dealings between users, brokers, or developers." },
      { h: "Governing Law", body: "These terms are governed by the laws of the Kingdom of Saudi Arabia. Listings comply with REGA advertising regulations." },
      { h: "Contact", body: "For questions about these terms, contact legal@propscan.sa." },
    ] : [
      { h: "Introduction", body: "This Privacy Policy explains how PropScan collects, uses, and protects your information when you use our property search platform." },
      { h: "Data We Collect", body: "We collect search queries, saved properties, requirements you post, and contact details you provide. We also collect basic device and usage analytics." },
      { h: "How We Use Data", body: "Your data is used to deliver search results, send price alerts you opt into, connect you with verified brokers, and improve the platform." },
      { h: "Cookies", body: "We use cookies to remember your preferences, keep you signed in, and measure traffic. You can manage cookies from the banner or your browser settings." },
      { h: "Third Parties", body: "Listing data originates from partner platforms. When you contact a broker, your details are shared only with that broker to fulfil your enquiry." },
      { h: "Your Rights", body: "You may access, correct, or delete your personal data at any time from your account settings, or by contacting us." },
      { h: "Contact", body: "For privacy enquiries, email privacy@propscan.sa." },
    ],
    reports: [
      { month: "MAY 2026", title: "Jeddah Market Report", sub: "Jeddah · May 2026" },
      { month: "MAY 2026", title: "Riyadh Market Report", sub: "Riyadh · May 2026" },
      { month: "APR 2026", title: "Dammam Market Report", sub: "Dammam · April 2026" },
      { month: "APR 2026", title: "Mecca Market Report", sub: "Mecca · April 2026" },
      { month: "MAR 2026", title: "Off-Plan Quarterly", sub: "Nationwide · Q1 2026" },
      { month: "MAR 2026", title: "Rental Index Report", sub: "Nationwide · Q1 2026" },
    ],
    reportCities: ["Jeddah", "Riyadh", "Dammam", "Mecca", "Medina", "Khobar", "+ more"],
    shortlist: liveProps.slice(0, 5).map((p) => ({ ...deco(p), open: () => store.openDetail(p.id) })),
    aiQuery: s.aiQuery || "",
    onAiQuery: (e: React.ChangeEvent<HTMLInputElement>) => setState({ aiQuery: e.target.value }),
    aiExamples: ["Apartment in Riyadh under 1M", "Family villa with pool, Jeddah", "Off-plan 2BR with payment plan"].map((t) => ({ text: t, onClick: () => setState({ aiQuery: t }) })),
    popularAreas: [
      { name: "Al Nakheel", landmark: "Corniche skyline", count: "1,247" },
      { name: "Al Olaya", landmark: "Kingdom Centre", count: "2,108" },
      { name: "Obhur", landmark: "North beach", count: "860" },
      { name: "Hittin", landmark: "villas district", count: "1,540" },
    ],
    togPlatform: () => setState({ pop: s.pop === "platform" ? null : "platform" }),
    popPlatform: s.pop === "platform",
    togCity: () => setState({ pop: s.pop === "pcity" ? null : "pcity" }),
    popCity: s.pop === "pcity",
    cityMenu: (s.apiCities.length > 0 ? s.apiCities : (KSA_CITIES || ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar"])).map((c) => ({ label: c, onClick: () => { setState({ city: c, district: "", pop: null, districtQuery: "" }); store.fetchAreas(c); }, style: menuItemStyle(s.city === c) })),
    togDistrict: () => { setState({ pop: s.pop === "pdistrict" ? null : "pdistrict", districtQuery: "" }); if (s.pop !== "pdistrict") store.fetchAreas(s.city); },
    popDistrict: s.pop === "pdistrict",
    districtLabel: s.district || "District",
    districtColor: s.district ? "color:#111827;" : "color:#6B7280;",
    districtQuery: s.districtQuery || "",
    onDistrictQuery: (e: React.ChangeEvent<HTMLInputElement>) => setState({ districtQuery: e.target.value }),
    districtMenu: (() => {
      const all = s.apiAreas[s.city] || (KSA_DISTRICTS && KSA_DISTRICTS[s.city]) || DISTRICTS[s.city] || KSA_DISTRICTS_DEFAULT || [];
      const q = (s.districtQuery || "").toLowerCase().trim();
      const filteredD = q ? all.filter((d) => d.toLowerCase().includes(q)) : all;
      return ["All districts", ...filteredD].map((d) => ({ label: d, onClick: () => setState({ district: d === "All districts" ? "" : d, pop: null, districtQuery: "" }), style: menuItemStyle(d === "All districts" ? !s.district : s.district === d) }));
    })(),
    districtCount: (s.apiAreas[s.city] || (KSA_DISTRICTS && KSA_DISTRICTS[s.city]) || DISTRICTS[s.city] || []).length,
    platformAll: () => setState({ platforms: {} }),
    platformAllOn: !Object.keys(s.platforms).some((k) => s.platforms[k]),
    platformAllBox: "width:17px;height:17px;min-width:17px;border-radius:4px;border:1px solid " + (!Object.keys(s.platforms).some((k) => s.platforms[k]) ? "#16A34A" : "#D1D5DB") + ";background:" + (!Object.keys(s.platforms).some((k) => s.platforms[k]) ? "#16A34A" : "#fff") + ";display:flex;align-items:center;justify-content:center;",
    platformLabel: (() => { const sel = Object.keys(s.platforms).filter((k) => s.platforms[k]); if (sel.length === 0) return "All Platforms"; if (sel.length <= 2) return sel.join(", "); return sel.length + " Platforms"; })(),
    platformColor: "color:#111827;",
    platformOpts: PLATFORMS.map((p) => ({ name: p, checked: !!s.platforms[p], onToggle: () => store.toggleKey("platforms", p), box: "width:17px;height:17px;min-width:17px;border-radius:4px;border:1px solid " + (s.platforms[p] ? "#16A34A" : "#D1D5DB") + ";background:" + (s.platforms[p] ? "#16A34A" : "#fff") + ";display:flex;align-items:center;justify-content:center;" })),
    dashSummary: [
      { label: "Saved Properties", value: String(s.savedIds.length), onClick: () => setState({ dashTab: "saved" }) },
      { label: "Active Alerts", value: "2", onClick: () => setState({ dashTab: "alerts" }) },
      { label: "My Requirements", value: "2", onClick: () => setState({ dashTab: "requirements" }) },
      { label: "Notifications", value: "2", onClick: () => setState({ dashTab: "notifs" }) },
    ],
    activityFeed: [
      { text: "Price dropped on Al Shati villa — now SAR 1.35M", time: "2h ago" },
      { text: "New property matching “Villas in Obhur”", time: "5h ago" },
      { text: "You saved Hittin Modern Villa", time: "1d ago" },
      { text: "Broker replied to your requirement", time: "2d ago" },
      { text: "3 new Off-Plan listings in Al Rawdah", time: "3d ago" },
    ],
    priceHistory: [
      { date: "Mar 2026", price: "1,500,000", change: "—", dir: "flat" },
      { date: "May 2026", price: "1,450,000", change: "▼ -3.3%", dir: "down" },
      { date: "Jun 2026", price: "1,450,000", change: "—", dir: "flat" },
    ].map((h) => ({ ...h, changeStyle: "font-size:12px;font-weight:600;color:" + (h.dir === "down" ? "#15803D" : "#9CA3AF") + ";" })),
    goArea: () => setState({ screen: "area" }),
    areaStats: [
      { label: "Avg Price / m²", value: "SAR 3,800" },
      { label: "Avg Villa Price", value: "SAR 2.1M" },
      { label: "Avg Apartment", value: "SAR 620K" },
      { label: "Active Listings", value: "1,247" },
    ],
    trendBars: ([["Jan", 58], ["Feb", 64], ["Mar", 60], ["Apr", 72], ["May", 80], ["Jun", 92]] as Array<[string, number]>).map((b) => ({ month: b[0], style: "width:100%;border-radius:5px 5px 0 0;height:" + b[1] + "%;background:" + (b[0] === "Jun" ? "#16A34A" : "#D1FAE5") + ";" })),
    nearbyCols: [
      { title: "Schools Nearby", items: [{ name: "Jeddah Knowledge Intl School", dist: "0.8 km" }, { name: "Al Nakheel Primary", dist: "1.2 km" }, { name: "Manarat Jeddah", dist: "2.1 km" }] },
      { title: "Hospitals Nearby", items: [{ name: "Dr. Soliman Fakeeh Hospital", dist: "1.5 km" }, { name: "Saudi German Hospital", dist: "2.3 km" }, { name: "Al Nakheel Medical Center", dist: "0.9 km" }] },
    ],
    nearbyMore: [
      { title: "Mosques", items: [{ name: "Al Rahmah Mosque", dist: "0.4 km" }, { name: "King Saud Mosque", dist: "1.1 km" }] },
      { title: "Malls", items: [{ name: "Red Sea Mall", dist: "2.0 km" }, { name: "Al Nakheel Plaza", dist: "0.7 km" }] },
      { title: "Transit", items: [{ name: "Corniche Bus Station", dist: "1.8 km" }, { name: "Al Nakheel Stop", dist: "0.6 km" }] },
    ],
    areaListings: liveProps.slice(0, 6).map((p) => ({ ...deco(p), open: () => store.openDetail(p.id) })),
    relatedAreas: ["Al Rawdah", "Al Nuzha", "Al Wurud", "Al Salamah"],
    goLogin: () => setState({ screen: "login" }),
    doLogin: () => setState({ screen: "dashboard" }),
    toggleAuth: () => setState({ authMode: s.authMode === "login" ? "signup" : "login" }),
    authIsLogin: s.authMode === "login", authIsSignup: s.authMode === "signup",
    authTitle: s.authMode === "login" ? "Welcome back" : "Create your account",
    authSubtitle: s.authMode === "login" ? "Sign in to your PropScan account." : "Start saving properties in seconds.",
    authCta: s.authMode === "login" ? "Sign in" : "Create account",
    authSwitchText: s.authMode === "login" ? "Don't have an account?" : "Already have an account?",
    authSwitchCta: s.authMode === "login" ? "Sign up" : "Sign in",
    loginPerks: ["Save & compare across all 8 platforms", "Real-time price-drop alerts", "Post requirements to verified brokers"],
    openBroker: () => setState({ screen: "broker", brokerName: detail.broker.name }),
    brokerView,
    isSearching: s.isSearching,
    noResults: allFiltered.length === 0 && !s.isSearching,
    clearFilters: () => setState({ types: {}, platforms: {}, minPrice: "", maxPrice: "", beds: "Any", searchWithin: "" }),
    mapTypeChips: ["All", ...TYPES].map((t) => {
      const active = t === "All" ? Object.keys(s.types).every((k) => !s.types[k]) : !!s.types[t];
      return { label: t, style: chipStyle(active), onClick: () => (t === "All" ? setState({ types: {} }) : store.toggleKey("types", t)) };
    }),
    mapSidebarOpen: false,
    mapSidebarClosed: false,
    toggleMapSidebar: () => setState({}),
    mapCardsOpen: s.mapCardsOpen !== false,
    mapCardsClosed: s.mapCardsOpen === false,
    toggleMapCards: () => setState({ mapCardsOpen: s.mapCardsOpen === false }),
    platformChips: PLATFORMS.map((p) => ({ label: p, onClick: () => store.toggleKey("platforms", p), style: chipStyle(!!s.platforms[p]) })),
    mapSat: s.mapSat === true,
    toggleSatellite: () => setState({ mapSat: !s.mapSat }),
    setMapPlain: () => setState({ mapSat: false }),
    setMapSat: () => setState({ mapSat: true }),
    mapBgStyle: s.mapSat
      ? "flex: 1; position: relative; background: #2E3D32; background-image: radial-gradient(circle at 30% 40%, #3a4d3e 0, #2a352c 40%), repeating-linear-gradient(50deg, rgba(120,140,110,.18) 0, rgba(120,140,110,.18) 2px, transparent 2px, transparent 22px), repeating-linear-gradient(140deg, rgba(90,110,90,.14) 0, rgba(90,110,90,.14) 2px, transparent 2px, transparent 28px);"
      : "flex: 1; position: relative; background: #EEF0F2; background-image: linear-gradient(#E4E7EB 1px, transparent 1px), linear-gradient(90deg, #E4E7EB 1px, transparent 1px); background-size: 72px 72px, 72px 72px;",
    mapGridOpacity: s.mapSat ? "0" : "1",
    mapModeStyle: "display: flex; align-items: center; gap: 5px; padding: 6px 11px; font-size: 12px; font-weight: 500; cursor: pointer; " + (!s.mapSat ? "background: #0A0A0A; color: #fff;" : "background: #fff; color: #374151;"),
    satModeStyle: "display: flex; align-items: center; gap: 5px; padding: 6px 11px; font-size: 12px; font-weight: 500; cursor: pointer; " + (s.mapSat ? "background: #0A0A0A; color: #fff;" : "background: #fff; color: #374151;"),
    railPinStyle: "width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-bottom: 1px solid #F3F4F6; " + (s.pinMode ? "background: #16A34A; color: #fff;" : "color: #374151;"),
    railSatStyle: "width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-bottom: 1px solid #F3F4F6; " + (s.mapSat ? "background: #16A34A; color: #fff;" : "color: #374151;"),
    mapMove: s.mapMove,
    toggleMapMove: () => setState({ mapMove: !s.mapMove }),
    mapMoveStyle: "display: flex; align-items: center; gap: 7px; background: #fff; border: 1px solid #E5E7EB; border-radius: 999px; padding: 7px 13px; font-size: 12px; color: #374151; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,.08);",
    mapMoveBox: "width: 15px; height: 15px; min-width: 15px; border-radius: 4px; border: 1px solid " + (s.mapMove ? "#16A34A" : "#D1D5DB") + "; background: " + (s.mapMove ? "#16A34A" : "#fff") + "; display: flex; align-items: center; justify-content: center;",
    mapPinOpen: !!s.mapPin && !!mapPinRaw,
    mapPinProp: mapPinRaw
      ? { ...mapPinRaw, image: (mapPinRaw.images?.[0]) || "", specs: specsOf(mapPinRaw), location: mapPinRaw.district + ", " + mapPinRaw.city, isOffPlan: mapPinRaw.status === "Off-Plan", open: () => store.openDetail(mapPinRaw.id) }
      : (decoratedList[0] || ({} as any)),
    closeMapPin: () => setState({ mapPin: null }),
    pinMode: s.pinMode,
    togPinMode: () => setState({ pinMode: !s.pinMode, pinPopOpen: false }),
    pinToolStyle: "display: flex; align-items: center; gap: 6px; border-radius: 999px; padding: 7px 13px; font-size: 12px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,.08); " + (s.pinMode ? "background: #16A34A; color: #fff;" : "background: #fff; border: 1px solid #E5E7EB; color: #374151;"),
    onPinDrop: store.onPinDrop,
    myLocation: () => setState({ searchPin: { x: "50%", y: "50%", lat: "21.5433", lng: "39.1728", current: true }, pinPopOpen: false, pinMode: false, pinSearched: true }),
    hasSearchPin: !!s.searchPin,
    searchPinForMap: s.searchPin ? {
      lat: s.searchPin.lat,
      lng: s.searchPin.lng,
      radius: s.pinRadius,
      label: s.pinSearched ? (allFiltered.length + (s.pinRadius >= 100 ? " homes in " + s.city : " homes within " + s.pinRadius + " km")) : undefined,
    } : null,
    pinPopOpen: s.pinPopOpen,
    pinCoords: s.searchPin ? s.searchPin.lat + "°N · " + s.searchPin.lng + "°E" : "",
    closePinPop: () => setState({ pinPopOpen: false, searchPin: null, pinSearched: false }),
    doPinSearch: () => setState({ pinPopOpen: false, pinSearched: true, mapCardsOpen: true }),
    pinRadius: s.pinRadius,
    pinRadiusLabel: s.pinRadius >= 100 ? "City-wide" : s.pinRadius + " km",
    onPinRadius: (e: React.ChangeEvent<HTMLInputElement>) => setState({ pinRadius: +e.target.value }),
    pinRadiusChips: [1, 5, 10, 20, 100].map((r) => ({ label: r >= 100 ? "City-wide" : r + " km", onClick: () => setState({ pinRadius: r }), style: "font-size: 12px; border-radius: 6px; padding: 5px 9px; cursor: pointer; white-space: nowrap; " + (s.pinRadius === r ? "background: #0A0A0A; color: #fff;" : "background: #fff; border: 1px solid #E5E7EB; color: #374151;") })),
    pinChips: TYPES.map((t) => ({ label: t, onClick: () => store.toggleKey("types", t), style: "font-size: 12px; border-radius: 6px; padding: 4px 10px; cursor: pointer; " + (s.types[t] ? "background: #F0FDF4; border: 1px solid #16A34A; color: #15803D;" : "background: #fff; border: 1px solid #E5E7EB; color: #374151;") })),
    pinBedChips: ["Any", "1", "2", "3", "4", "5+"].map((b) => { const val = b === "Any" ? "Any" : b === "5+" ? "5+" : b; const active = b === "Any" ? s.beds === "Any" : s.beds === val; return { label: b, onClick: () => setState({ beds: val }), style: "font-size: 12px; border-radius: 6px; padding: 4px 12px; cursor: pointer; " + (active ? "background: #F0FDF4; border: 1px solid #16A34A; color: #15803D;" : "background: #fff; border: 1px solid #E5E7EB; color: #374151;") }; }),
    platformNames: PLATFORMS,
    pinTypeVal: (() => { const sel = Object.keys(s.types).filter((k) => s.types[k]); return sel.length === 1 ? sel[0] : "All Types"; })(),
    onPinType: (e: React.ChangeEvent<HTMLSelectElement>) => setState({ types: e.target.value === "All Types" ? {} : { [e.target.value]: true } }),
    pinPlatformVal: (() => { const sel = Object.keys(s.platforms).filter((k) => s.platforms[k]); return sel.length === 1 ? sel[0] : "All Platforms"; })(),
    onPinPlatform: (e: React.ChangeEvent<HTMLSelectElement>) => setState({ platforms: e.target.value === "All Platforms" ? {} : { [e.target.value]: true } }),
    pinSearched: s.pinSearched,
    pinResultLabel: filtered(s).length + (s.pinRadius >= 100 ? " homes in " + s.city : " homes within " + s.pinRadius + " km"),
    showWidgets: false,
    navLinks,
    goPost: () => setState({ screen: "post" }), goDash: () => setState({ screen: "dashboard" }),
    openOnboarding: () => store.openModal("onboarding"),
    calcMortgage: s.calcTab === "mortgage", calcYield: s.calcTab === "yield",
    setCalcMort: () => setState({ calcTab: "mortgage" }), setCalcYield: () => setState({ calcTab: "yield" }),
    calcMortStyle: segStyle(s.calcTab === "mortgage"), calcYieldStyle: segStyle(s.calcTab === "yield"),
    mortPrice: mo.price, mortDown: mo.down, mortRate: mo.rate,
    onMortPrice: (e: React.ChangeEvent<HTMLInputElement>) => store.setMort("price", e.target.value), onMortDown: (e: React.ChangeEvent<HTMLInputElement>) => store.setMort("down", e.target.value), onMortRate: (e: React.ChangeEvent<HTMLInputElement>) => store.setMort("rate", e.target.value),
    termChips, mortDownAmt: "SAR " + LRM + dpAmt.toLocaleString("en-US"),
    mortMonthly: "SAR " + LRM + Math.round(monthly).toLocaleString("en-US"), mortLoan: "SAR " + LRM + Math.round(loanAmt).toLocaleString("en-US"),
    mortInt: "SAR " + LRM + Math.round(totInt).toLocaleString("en-US"), mortTotal: "SAR " + LRM + Math.round(totPay).toLocaleString("en-US"),
    yldPrice: s.yld.price, yldRent: s.yld.rent, onYldPrice: (e: React.ChangeEvent<HTMLInputElement>) => store.setYld("price", e.target.value), onYldRent: (e: React.ChangeEvent<HTMLInputElement>) => store.setYld("rent", e.target.value),
    yldPct: yPct.toFixed(1) + "%", yldAnnual: "SAR " + LRM + annInc.toLocaleString("en-US"), yldMonthly: "SAR " + LRM + yrent.toLocaleString("en-US"),
    dashNav, dashTab: s.dashTab, savedProps, savedCount: savedProps.length,
    dashSaved: s.dashTab === "saved", dashSearches: s.dashTab === "searches", dashAlerts: s.dashTab === "alerts", dashReq: s.dashTab === "requirements", dashRecent: s.dashTab === "recent", dashNotifs: s.dashTab === "notifs", dashSettings: s.dashTab === "settings",
    hasSaved: savedProps.length > 0,
    savedSearches: SAVED_SEARCHES, requirements: REQUIREMENTS, alerts, notifs, recentProps,
    compareCols, compareRows, compareGrid: "display: grid; grid-template-columns: " + cgt + ";",
    team: TEAM, platformsAll: PLATFORMS,
    detailTab: s.detailTab, dtOverview: s.detailTab === "overview", dtFeatures: s.detailTab === "features", dtLocation: s.detailTab === "location", dtRega: s.detailTab === "rega",
    detailTabs: ["Overview", "Features", "Location", "REGA Info"].map((t) => ({ label: t, onClick: () => setState({ detailTab: t.toLowerCase().split(" ")[0] }), style: tabNavStyle(s.detailTab === t.toLowerCase().split(" ")[0]) })),
    similarProps,
    statTotal: s.pinSearched ? allFiltered.length.toLocaleString("en-US") : (s.searchTotal > 0 ? s.searchTotal.toLocaleString("en-US") : allFiltered.length.toLocaleString("en-US")),
    statAvgPrice: avgPrice, statAvgArea: avgArea, statTopSource: topSrc,
    priceBars, srcBars, distRows,
    viewSheet: s.view === "sheet", viewStats: s.view === "stats",
    sheetRows: allFiltered.slice(0, displayCount).map((p) => ({ ...p, specs: specsOf(p), location: p.district + ", " + p.city, isOffPlan: p.status === "Off-Plan", open: () => store.openDetail(p.id) })),
    modalReport: s.modal === "report", modalOnboarding: s.modal === "onboarding",
    reportDone: s.reportDone, reasons, submitReport: () => setState({ reportDone: true }),
    onbStep: s.onbStep, onbStep1: s.onbStep === 1, onbStep2: s.onbStep === 2, onbStep3: s.onbStep === 3,
    onbNext: () => setState({ onbStep: Math.min(s.onbStep + 1, 3) }), onbBack: () => setState({ onbStep: Math.max(s.onbStep - 1, 1) }),
    onbDot1: "width:7px;height:7px;border-radius:50%;background:" + (s.onbStep >= 1 ? "#16A34A" : "#D1D5DB") + ";",
    onbDot2: "width:7px;height:7px;border-radius:50%;background:" + (s.onbStep >= 2 ? "#16A34A" : "#D1D5DB") + ";",
    onbDot3: "width:7px;height:7px;border-radius:50%;background:" + (s.onbStep >= 3 ? "#16A34A" : "#D1D5DB") + ";",
    closeModal: () => store.closeModal(),
    openReport: () => store.openModal("report"),
    shareOpen: !!s.sharePropId, shareProp, openShare: () => setState({ sharePropId: detail.id }), closeShare: () => setState({ sharePropId: null }),
    rvOpen: s.rvOpen, toggleRv: () => setState({ rvOpen: !s.rvOpen }),
    toast: s.toast, dismissToast: () => setState({ toast: false }),
    reportReason: s.reportReason,
    chipAny: chipStyle(true), chipOff: chipStyle(false),
    reportFormStyle: s.reportDone ? "display: none;" : "",
    onbNavStyle: s.onbStep === 3 ? "display: none;" : "margin-top: 8px;",
    city: s.city, district: s.district, searchWithin: s.searchWithin,
    minPrice: s.minPrice, maxPrice: s.maxPrice, beds: s.beds,
    list: decoratedList,
    listCount: decoratedList.length,
    hasMore: allFiltered.length > displayCount,
    loadMore: () => store.loadMore(),
    liveCount: s.searchTotal > 0 ? s.searchTotal.toLocaleString("en-US") : (liveProps.length > 0 ? liveProps.length.toLocaleString("en-US") : "47,293+"),
    selectedId: s.selectedId,
    platformStatus: s.platformStatus || {},
    platformCounts: s.platformCounts || {},
    mapPins: allFiltered.filter((p) => {
      if (!p.lat || !p.lng || p.lat === 0 || p.lng === 0) return false;
      const b = CITY_BOUNDS[s.city];
      return !b || (p.lat >= b[0] && p.lng >= b[1] && p.lat <= b[2] && p.lng <= b[3]);
    }).map((p) => ({ id: p.id, lat: p.lat!, lng: p.lng!, pinLabel: p.pinLabel, selected: p.id === s.mapPin || p.id === s.selectedId })),
    viewGrid: s.view === "grid",
    viewCards: s.view === "cards",
    locCounts: [
      { name: "Riyadh", count: "46,225", onClick: () => setState({ city: "Riyadh" }) },
      { name: "Jeddah", count: "16,625", onClick: () => setState({ city: "Jeddah" }) },
      { name: "Dammam", count: "4,865", onClick: () => setState({ city: "Dammam" }) },
    ],
    viewRows: s.view === "list",
    viewSplitCards: s.view === "split",
    viewSplit: s.view === "split",
    listColStyle: "display: flex; flex-direction: column; overflow: hidden; " + (s.view === "split" ? "width: 560px; min-width: 480px; border-right: 1px solid #E5E7EB;" : "flex: 1;"),
    tabs: ["Properties"].map((t) => ({ label: t, style: tabStyle(s.tab === t), onClick: () => setState({ tab: t }) })),
    tabProperties: s.tab === "Properties", tabDaily: s.tab === "Daily Rentals", tabNew: s.tab === "New Projects",
    goDaily: () => setState({ screen: "results", view: "split", purpose: "Rent" }),
    goNewProj: () => setState({ screen: "results", view: "grid", status: "Off-Plan" }),
    goCalc: () => setState({ screen: "calc" }),
    exclusiveListings: EXCLUSIVE.map((e) => ({ ...e, open: () => setState({ screen: "results", view: "cards" }) })),
    trigStyle: "width: 100%; height: 34px; border: 1px solid #E5E7EB; border-radius: 7px; padding: 0 10px; font-size: 13px; font-family: inherit; background: #fff; display: flex; align-items: center; justify-content: space-between; cursor: pointer; color: #374151; gap: 6px; white-space: nowrap; overflow: hidden;",
    resetBtn: "flex: 1; height: 38px; background: #fff; color: #15803D; border: 1px solid #16A34A; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;",
    doneBtn: "flex: 1; height: 38px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;",
    stepBtn: "width: 30px; height: 30px; border-radius: 50%; border: 1px solid #E5E7EB; background: #fff; color: #16A34A; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; user-select: none;",
    dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    anyPop: !!s.pop, closePop: () => setState({ pop: null }),
    allCities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Dhahran", "Taif", "Tabuk", "Buraidah", "Khamis Mushait", "Abha", "Hail", "Yanbu", "Al Ahsa", "Jubail", "Najran", "Jazan"],
    cityDistricts: DISTRICTS[s.city] || [],
    onDistrictSel: (e: React.ChangeEvent<HTMLSelectElement>) => setState({ district: e.target.value }),
    purposeBuy: s.purpose === "Buy", purposeRent: s.purpose === "Rent",
    resMode: s.propTypeTab !== "Commercial", comMode: s.propTypeTab === "Commercial",
    togRentP: () => setState({ pop: s.pop === "rentp" ? null : "rentp" }),
    popRentP: s.pop === "rentp",
    rentPLabel: s.rentPeriod === "Any" ? "Rent period" : s.rentPeriod,
    rentPColor: s.rentPeriod !== "Any" ? "color:#111827;" : "color:#6B7280;",
    rentPOpts: ["Yearly", "Monthly", "Any"].map((o) => ({ label: o, onClick: () => setState({ rentPeriod: o, pop: null }), style: menuItemStyle(s.rentPeriod === o) })),
    maxPriceNum: s.maxPrice || 0,
    minPriceNum: s.minPrice || 0,
    priceFill: (() => { const mn = Math.min(+(s.minPrice || 0), 6000000), mx = Math.min(+(s.maxPrice || 6000000), 6000000); const a = (mn / 6000000) * 100, b = (mx / 6000000) * 100; return "position:absolute;top:9px;height:3px;border-radius:2px;background:#16A34A;left:" + a + "%;right:" + (100 - b) + "%;"; })(),
    pPriceMinLabel: "SAR " + (s.minPrice ? shortNum(s.minPrice) : "0"),
    pPriceMaxLabel: "SAR " + (s.maxPrice ? shortNum(s.maxPrice) : "6M"),
    togPType: () => setState({ pop: s.pop === "ptype" ? null : "ptype" }),
    popPType: s.pop === "ptype",
    pTabResStyle: npTabStyle(s.propTypeTab === "Residential"),
    pTabComStyle: npTabStyle(s.propTypeTab === "Commercial"),
    setPTabRes: () => setState({ propTypeTab: "Residential" }),
    setPTabCom: () => setState({ propTypeTab: "Commercial" }),
    pTypeOptions: (() => {
      const RES_DEFAULT = ["Apartment", "Villa", "Floor", "Residential Building", "Residential Land", "Rest House", "Chalet", "Room", "Townhouse", "Duplex"];
      const COM_DEFAULT = ["Office", "Commercial Building", "Warehouse", "Commercial Land", "Industrial Land", "Farm", "Agriculture Plot", "Hotel", "Workshop", "Factory", "School", "Health Center", "Gas Station", "Showroom"];
      const COM_KEYWORDS = ["office", "commercial", "warehouse", "land", "industrial", "farm", "hotel", "workshop", "factory", "school", "health", "gas", "showroom"];
      const apiRes = s.apiTypes.filter((t) => !COM_KEYWORDS.some((k) => t.toLowerCase().includes(k)));
      const apiCom = s.apiTypes.filter((t) => COM_KEYWORDS.some((k) => t.toLowerCase().includes(k)));
      const resList = s.propTypeTab !== "Commercial"
        ? [...new Set([...(apiRes.length > 0 ? apiRes : RES_DEFAULT)])]
        : [...new Set([...(apiCom.length > 0 ? apiCom : COM_DEFAULT)])];
      return resList.map((o) => ({ label: o, sel: !!s.types[o], onClick: () => store.toggleKey("types", o), box: "width:17px;height:17px;min-width:17px;border-radius:50%;border:1px solid " + (s.types[o] ? "#16A34A" : "#D1D5DB") + ";background:#fff;display:flex;align-items:center;justify-content:center;", style: "display:flex;align-items:center;gap:9px;height:40px;padding:0 12px;border:1px solid " + (s.types[o] ? "#16A34A" : "#E5E7EB") + ";border-radius:999px;font-size:13px;color:#374151;cursor:pointer;background:" + (s.types[o] ? "#F0FDF4" : "#fff") + ";" }));
    })(),
    resetPType: () => setState({ types: {} }),
    pTypeLabel: (() => { const sel = Object.keys(s.types).filter((k) => s.types[k]); return sel.length === 0 ? s.propTypeTab : sel.length === 1 ? sel[0] : sel.length + " selected"; })(),
    pTypeColor: Object.keys(s.types).some((k) => s.types[k]) ? "color:#111827;" : "color:#374151;",
    togBedsBaths: () => setState({ pop: s.pop === "bedsbaths" ? null : "bedsbaths" }),
    popBedsBaths: s.pop === "bedsbaths",
    bedPills: ["Studio", "1", "2", "3", "4", "5", "6", "7", "8+"].map((b) => ({ label: b, onClick: () => setState({ beds: s.beds === b ? "Any" : b }), style: pillStyle(s.beds === b) })),
    bathPills: ["1", "2", "3", "4", "5", "6+"].map((b) => ({ label: b, onClick: () => setState({ baths: s.baths === b ? "Any" : b }), style: pillStyle(s.baths === b) })),
    resetBedsBaths: () => setState({ beds: "Any", baths: "Any" }),
    bedsBathsLabel: (() => { const p: string[] = []; if (s.beds !== "Any") p.push(s.beds === "Studio" ? "Studio" : s.beds + " bd"); if (s.baths !== "Any") p.push(s.baths + " ba"); return p.length ? p.join(" · ") : "Beds & Baths"; })(),
    bbColor: s.beds !== "Any" || s.baths !== "Any" ? "color:#111827;" : "color:#6B7280;",
    togPPrice: () => setState({ pop: s.pop === "pprice" ? null : "pprice" }),
    popPPrice: s.pop === "pprice",
    pPriceLabel: s.minPrice || s.maxPrice ? "SAR " + (s.minPrice ? shortNum(s.minPrice) : "0") + "–" + (s.maxPrice ? shortNum(s.maxPrice) : "Any") : "Price",
    pPriceColor: s.minPrice || s.maxPrice ? "color:#111827;" : "color:#6B7280;",
    resetPPrice: () => setState({ minPrice: "", maxPrice: "" }),
    togPArea: () => setState({ pop: s.pop === "parea" ? null : "parea" }),
    popPArea: s.pop === "parea",
    areaMin: s.areaMin, areaMax: s.areaMax,
    onAreaMin: (e: React.ChangeEvent<HTMLInputElement>) => setState({ areaMin: e.target.value }),
    onAreaMax: (e: React.ChangeEvent<HTMLInputElement>) => setState({ areaMax: e.target.value }),
    pAreaLabel: s.areaMin || s.areaMax ? (s.areaMin || "0") + "–" + (s.areaMax || "Any") + " m²" : "Area",
    pAreaColor: s.areaMin || s.areaMax ? "color:#111827;" : "color:#6B7280;",
    resetPArea: () => setState({ areaMin: "", areaMax: "" }),
    togCheckin: () => setState({ pop: s.pop === "checkin" ? null : "checkin" }),
    popCheckin: s.pop === "checkin",
    calM1: buildMonth(s, 2026, 5, store.pickDate), calM2: buildMonth(s, 2026, 6, store.pickDate),
    calM1Name: "June 2026", calM2Name: "July 2026",
    checkinLabel: s.checkIn && s.checkOut ? fmtRange(s.checkIn, s.checkOut) : s.checkIn ? fmtSingle(s.checkIn) : "Check In - Check Out",
    checkinColor: s.checkIn ? "color:#111827;" : "color:#6B7280;",
    resetDates: () => setState({ checkIn: null, checkOut: null }),
    togGuests: () => setState({ pop: s.pop === "guests" ? null : "guests" }),
    popGuests: s.pop === "guests", adults: s.guests.adults, children: s.guests.children,
    guestsLabel: s.guests.adults + s.guests.children + " Guest(s)",
    incA: () => setState({ guests: { ...s.guests, adults: s.guests.adults + 1 } }),
    decA: () => setState({ guests: { ...s.guests, adults: Math.max(1, s.guests.adults - 1) } }),
    incC: () => setState({ guests: { ...s.guests, children: s.guests.children + 1 } }),
    decC: () => setState({ guests: { ...s.guests, children: Math.max(0, s.guests.children - 1) } }),
    resetGuests: () => setState({ guests: { adults: 1, children: 0 } }),
    togPrice: () => setState({ pop: s.pop === "dprice" ? null : "dprice" }),
    popPrice: s.pop === "dprice", dMin: s.dailyPrice.min, dMax: s.dailyPrice.max,
    onDMin: (e: React.ChangeEvent<HTMLInputElement>) => setState({ dailyPrice: { ...s.dailyPrice, min: e.target.value } }),
    onDMax: (e: React.ChangeEvent<HTMLInputElement>) => setState({ dailyPrice: { ...s.dailyPrice, max: e.target.value } }),
    dMinNum: s.dailyPrice.min || 0,
    dMaxNum: s.dailyPrice.max || 5000,
    dPriceMinLabel: "SAR " + (s.dailyPrice.min ? (+s.dailyPrice.min).toLocaleString("en-US") : "0"),
    dPriceMaxLabel: "SAR " + (s.dailyPrice.max ? (+s.dailyPrice.max).toLocaleString("en-US") : "5,000+"),
    dPriceFill: (() => { const mn = Math.min(+(s.dailyPrice.min || 0), 5000), mx = Math.min(+(s.dailyPrice.max || 5000), 5000); return "position:absolute;top:9px;height:3px;border-radius:2px;background:#16A34A;left:" + (mn / 5000) * 100 + "%;right:" + (100 - (mx / 5000) * 100) + "%;"; })(),
    dpriceLabel: s.dailyPrice.min || s.dailyPrice.max ? "SAR " + (s.dailyPrice.min || "0") + "–" + (s.dailyPrice.max || "∞") : "Price / night",
    dpriceColor: s.dailyPrice.min || s.dailyPrice.max ? "color:#111827;" : "color:#6B7280;",
    resetPrice: () => setState({ dailyPrice: { min: "", max: "" } }),
    togType: () => setState({ pop: s.pop === "nptype" ? null : "nptype" }),
    popType: s.pop === "nptype",
    npTypeLabel: s.npType || "Residential",
    setNpTabRes: () => setState({ npTypeTab: "Residential" }),
    setNpTabCom: () => setState({ npTypeTab: "Commercial" }),
    npTabResStyle: npTabStyle(s.npTypeTab === "Residential"),
    npTabComStyle: npTabStyle(s.npTypeTab === "Commercial"),
    npTypeOptions: (s.npTypeTab === "Residential" ? ["Apartment", "Chalet", "Villa", "Townhouse", "Floor", "Duplex", "Residential Land"] : ["Office", "Shop", "Warehouse", "Showroom", "Commercial Land", "Building"]).map((o) => ({ label: o, sel: s.npType === o, onClick: () => setState({ npType: o }), dot: "width:18px;height:18px;min-width:18px;border-radius:50%;border:1px solid " + (s.npType === o ? "#16A34A" : "#D1D5DB") + ";display:flex;align-items:center;justify-content:center;", style: "display:flex;align-items:center;gap:9px;height:40px;padding:0 12px;border:1px solid " + (s.npType === o ? "#16A34A" : "#E5E7EB") + ";border-radius:8px;font-size:13px;color:#374151;cursor:pointer;background:" + (s.npType === o ? "#F0FDF4" : "#fff") + ";" })),
    resetType: () => setState({ npType: null }),
    togHandover: () => setState({ pop: s.pop === "handover" ? null : "handover" }),
    popHandover: s.pop === "handover",
    handoverLabel: s.handover || "Handover By",
    handoverColor: s.handover ? "color:#111827;" : "color:#6B7280;",
    handoverOptsD: ["Any", "Q2 2026", "Q3 2026", "Q4 2026", "Q1 2027", "Q2 2027", "Q3 2027", "2028+"].map((o) => ({ label: o, onClick: () => setState({ handover: o === "Any" ? null : o, pop: null }), style: menuItemStyle(s.handover === o) })),
    togPay: () => setState({ pop: s.pop === "pay" ? null : "pay" }),
    popPay: s.pop === "pay", payPlan: s.payPlan,
    payPlanLabel: s.payPlanTouched ? s.payPlan + "% pre-handover" : "Payment Plan",
    payColor: s.payPlanTouched ? "color:#111827;" : "color:#6B7280;",
    onPayPlan: (e: React.ChangeEvent<HTMLInputElement>) => setState({ payPlan: +e.target.value, payPlanTouched: true }),
    resetPay: () => setState({ payPlan: 50, payPlanTouched: false }),
    togCompletion: () => setState({ pop: s.pop === "completion" ? null : "completion" }),
    popCompletion: s.pop === "completion",
    completionLabel: s.completion || "% Completion",
    completionColor: s.completion ? "color:#111827;" : "color:#6B7280;",
    completionOptsD: ["Any", "0-25%", "25-50%", "50-75%", "75-100%"].map((o) => ({ label: o, onClick: () => setState({ completion: o === "Any" ? null : o, pop: null }), style: menuItemStyle(s.completion === o) })),
    popular: ["Apartments in Al Hamra", "Villas in Obhur", "Off-Plan Riyadh", "Studios for Rent", "Offices Jeddah"],
    statStrip: ([[s.searchTotal > 0 ? s.searchTotal.toLocaleString("en-US") : "47,293+", "Live properties"], ["4", "Platforms scanned"], ["13", "Cities covered"], ["100%", "REGA-verified"]] as Array<[string, string]>).map((x, i) => ({ n: x[0], l: x[1], style: "padding: 18px 8px; text-align: center;" + (i < 3 ? " border-right: 1px solid #E5E7EB;" : "") })),
    featured: (() => { let f = liveProps.filter((p) => p.city === s.city); if (f.length < 4) f = f.concat(liveProps.filter((p) => p.city !== s.city)); return f.slice(0, 4).map((p) => ({ ...deco(p), open: () => store.openDetail(p.id) })); })(),
    cityTiles: ([["Jeddah", "Corniche skyline", 16625], ["Riyadh", "Kingdom Centre", 46225], ["Dammam", "Corniche towers", 4865], ["Mecca", "Clock Royal Tower", 8432], ["Medina", "Quba district", 5217], ["Khobar", "Corniche district", 3108]] as Array<[string, string, number]>).map((c) => ({ name: c[0], landmark: c[1], count: c[2], onClick: () => setState({ screen: "results", view: "split", city: c[0] }) })),
    typeTiles: TYPES.map((t) => ({ name: t, count: (typeCounts[t] || 0) * 312 + 96, onClick: () => setState({ screen: "results", view: "split", types: { [t]: true } }) })),
    whyItems: [
      { t: "One search, 8 platforms", d: "We continuously scan Bayut, Wasalt, Aqar, Property Finder, Sakani and more — so you search once instead of eight times." },
      { t: "De-duplicated results", d: "The same villa listed on five sites shows up once, with every source and price compared side by side." },
      { t: "Verified brokers only", d: "Every listing is matched to a REGA-licensed broker you can call, WhatsApp or email directly." },
    ],
    footerCols: [
      { title: "Explore", links: [
        { label: "Buy", onClick: () => setState({ screen: "results", view: "split", purpose: "Buy" }) },
        { label: "Rent", onClick: () => setState({ screen: "results", view: "split", purpose: "Rent" }) },
        { label: "New Projects", onClick: () => setState({ screen: "results", view: "grid" }) },
        { label: "Map search", onClick: () => setState({ screen: "map" }) },
      ] },
      { title: "Tools", links: [
        { label: "Calculators", onClick: () => setState({ screen: "calc" }) },
        { label: "Compare", onClick: () => setState({ screen: "compare" }) },
        { label: "Post Requirement", onClick: () => setState({ screen: "post" }) },
        { label: "Saved & alerts", onClick: () => setState({ screen: "dashboard" }) },
      ] },
      { title: "Company", links: [
        { label: "About", onClick: () => setState({ screen: "about" }) },
        { label: "Contact", onClick: () => setState({ screen: "contact" }) },
        { label: "Market Reports", onClick: () => setState({ screen: "market" }) },
        { label: "Privacy Policy", onClick: () => setState({ screen: "legal", legalDoc: "privacy" }) },
        { label: "Terms of Service", onClick: () => setState({ screen: "legal", legalDoc: "terms" }) },
      ] },
    ],
    views: ["Cards", "Split", "Map", "List", "Grid", "Sheet", "Stats"].map((v) => {
      const active = (s.screen === "map" && v === "Split" && s.mapCardsOpen !== false) || (s.screen === "map" && v === "Map" && s.mapCardsOpen === false) || (v.toLowerCase() === s.view && s.screen === "results");
      const icons: Record<string, string> = { Cards: "M4 5h7v6H4zM13 5h7v6h-7zM4 13h7v6H4zM13 13h7v6h-7z", Split: "M4 5h7v14H4zM13 5h7v14h-7z", Map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z M9 4v14 M15 6v14", List: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01", Grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", Sheet: "M3 4h18v16H3zM3 9h18M9 4v16", Stats: "M4 20V10M10 20V4M16 20v-7M22 20H2" };
      return { label: v, onClick: () => store.setView(v), iconD: icons[v], style: "display: flex; align-items: center; gap: 5px; padding: 4px 9px; font-size: 12px; border-radius: 5px; cursor: pointer; white-space: nowrap; color: " + (active ? "#fff" : "#6B7280") + "; background: " + (active ? "#0A0A0A" : "transparent") + "; font-weight: " + (active ? "500" : "400") + ";" };
    }),
    setLangAR: () => setState({ lang: "AR" }), setLangEN: () => setState({ lang: "EN" }),
    langArStyle: langStyle(s.lang === "AR"), langEnStyle: langStyle(s.lang === "EN"),
    setBuy: () => setState({ purpose: "Buy" }), setRent: () => setState({ purpose: "Rent" }),
    buyStyle: segStyle(s.purpose === "Buy"), rentStyle: segStyle(s.purpose === "Rent"),
    setStAll: () => setState({ status: "All" }), setStReady: () => setState({ status: "Ready" }), setStOff: () => setState({ status: "Off-Plan" }),
    stAllStyle: segStyle(s.status === "All"), stReadyStyle: segStyle(s.status === "Ready"), stOffStyle: segStyle(s.status === "Off-Plan"),
    onCity: (e: React.ChangeEvent<HTMLSelectElement>) => setState({ city: e.target.value }),
    onDistrict: (e: React.ChangeEvent<HTMLInputElement>) => setState({ district: e.target.value }),
    onSearchWithin: (e: React.ChangeEvent<HTMLInputElement>) => setState({ searchWithin: e.target.value }),
    onMinPrice: (e: React.ChangeEvent<HTMLInputElement>) => setState({ minPrice: e.target.value }),
    onMaxPrice: (e: React.ChangeEvent<HTMLInputElement>) => setState({ maxPrice: e.target.value }),
    onBeds: (e: React.ChangeEvent<HTMLSelectElement>) => setState({ beds: e.target.value }),
    goResults: () => { setState({ screen: "map", mapCardsOpen: true, aiMode: false }); store.runSearch(); store.fetchCities(); store.fetchPropertyTypes(); },
    goAiSearch: () => setState({ screen: "map", mapCardsOpen: true, aiMode: true }),
    aiMode: s.aiMode === true,
    dismissAi: () => setState({ aiMode: false }),
    resultsSidebarShown: false,
    goMap: () => setState({ screen: "map" }),
    goHome: () => setState({ screen: "home" }),
    goBack: () => setState({ screen: s.screen === "broker" ? "detail" : s.prevScreen || "map" }),
    applySearch: () => store.runSearch(),
    stopProp: (e: React.MouseEvent) => { e.stopPropagation(); },
    districtChips: ["Al Hamra", "Al Shati", "Al Rawdah"],
    typeOptions: TYPES.map((t) => ({ name: t, count: typeCounts[t] || 0, checked: !!s.types[t], onToggle: () => store.toggleKey("types", t), boxStyle: boxStyle(!!s.types[t]) })),
    platformOptions: PLATFORMS.map((p) => ({ name: p, count: platCounts[p] || 0, checked: !!s.platforms[p], onToggle: () => store.toggleKey("platforms", p), boxStyle: boxStyle(!!s.platforms[p]) })),
    thumbs: ["+12 photos", "floor plan", "video", "street view"],
    detail: {
      ...detail,
      location: detail.district + ", " + detail.city,
      isRent: detail.purpose === "Rent",
      bedsLabel, bathsLabel,
      brokerName: detail.broker.name, brokerAgency: detail.broker.agency, brokerPhone: detail.broker.phone, brokerListings: detail.broker.listings,
      brokerInitials: initials,
      ref: "PS-" + detail.id + "-" + detail.source.slice(0, 2).toUpperCase(),
      matchCount: 3,
      sourceUrl: detail.listingUrl || sourceUrl(detail),
      images: detail.images || [],
      mainImage: (detail.images || [])[0] || "",
      thumbImages: (detail.images || []).slice(1, 5),
      brokerCallUrl: detail.broker.phone ? "tel:" + detail.broker.phone.replace(/\s+/g, "") : "#",
      brokerWaUrl: detail.broker.phone ? "https://wa.me/" + detail.broker.phone.replace(/[^0-9]/g, "") : "#",
      regaVerified: detail.regaVerified || false,
      falLicense: detail.falLicense || null,
      adLicense: detail.adLicense || null,
      adLicenseExpiryFormatted: detail.adLicenseExpiry
        ? new Date(detail.adLicenseExpiry * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
        : null,
      regaStreet: detail.regaStreet || null,
      completionStatus: detail.completionStatus || null,
    },
    detailExportOpen: s.detailExportOpen === true,
    exportCardsCsv: () => downloadListings("csv", filtered(s)),
    togSort: () => setState({ pop: s.pop === "sort" ? null : "sort" }),
    popSort: s.pop === "sort",
    sortLabel: ({ relevance: "Sort: Relevance", priceAsc: "Price ↑", priceDesc: "Price ↓", areaDesc: "Largest area", newest: "Newest" } as Record<string, string>)[s.sortBy || "relevance"],
    sortOptions: ([["relevance", "Relevance"], ["priceAsc", "Price: Low to High"], ["priceDesc", "Price: High to Low"], ["areaDesc", "Largest area"], ["newest", "Newest first"]] as Array<[string, string]>).map((o) => ({ label: o[1], onClick: () => setState({ sortBy: o[0], pop: null }), style: menuItemStyle((s.sortBy || "relevance") === o[0]) })),
    compareCount: s.compareIds.length,
    compareBarOpen: false,
    clearCompare: () => setState({ compareIds: [] }),
    openCompare: () => setState({ screen: "compare" }),
    compareChips: s.compareIds.map((id) => { const pr = liveProps.find((x) => x.id === id); return { title: pr ? pr.title : "", priceLabel: pr ? pr.priceLabel : "", remove: () => setState({ compareIds: s.compareIds.filter((x) => x !== id) }) }; }),
    hasRecent: (s.viewedIds || []).filter((x) => x !== s.selectedId).length > 0,
    recentViewed: (s.viewedIds || []).filter((x) => x !== s.selectedId).slice(0, 5).map((id) => { const pr = liveProps.find((x) => x.id === id); return { priceLabel: pr ? "SAR " + LRM + pr.priceLabel : "", open: () => store.openDetail(id), style: "font-size: 11px; color: #374151; background: #F3F4F6; border-radius: 999px; padding: 3px 9px; cursor: pointer; white-space: nowrap;" }; }),
    savedOnly: !!s.savedOnly,
    toggleSavedOnly: () => setState({ savedOnly: !s.savedOnly }),
    savedToggleStyle: "display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; cursor: pointer; padding: 3px 9px; border-radius: 999px; border: 1px solid " + (s.savedOnly ? "#16A34A" : "#E5E7EB") + "; color: " + (s.savedOnly ? "#15803D" : "#6B7280") + "; background: " + (s.savedOnly ? "#F0FDF4" : "#fff") + ";",
    savedToggleFill: s.savedOnly ? "#16A34A" : "none",
    mapExportOpen: s.mapExportOpen === true,
    togMapExport: () => setState({ mapExportOpen: !s.mapExportOpen, clientExportOpen: false }),
    exportAllCsv: () => { downloadListings("csv", filtered(s)); setState({ mapExportOpen: false }); },
    exportAllXls: () => { downloadListings("xls", filtered(s)); setState({ mapExportOpen: false }); },
    exportAllJson: () => { downloadListings("json", filtered(s)); setState({ mapExportOpen: false }); },
    exportAllPdf: () => { downloadListings("pdf", filtered(s)); setState({ mapExportOpen: false }); },

    clientExportOpen: s.clientExportOpen === true,
    togClientExport: () => setState({ clientExportOpen: !s.clientExportOpen, mapExportOpen: false }),
    clientExportCsv: () => { downloadListingsForClient("csv", filtered(s)); setState({ clientExportOpen: false }); },
    clientExportXls: () => { downloadListingsForClient("xls", filtered(s)); setState({ clientExportOpen: false }); },
    clientExportPdf: () => { downloadListingsForClient("pdf", filtered(s)); setState({ clientExportOpen: false }); },
    togDetailExport: () => setState({ detailExportOpen: !s.detailExportOpen }),
    exportCsv: () => { downloadListings("csv", [detail]); setState({ detailExportOpen: false }); },
    exportXls: () => { downloadListings("xls", [detail]); setState({ detailExportOpen: false }); },
    exportPdf: () => { downloadListings("pdf", [detail]); setState({ detailExportOpen: false }); },
    detailRows,
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtSingle(k: string): string {
  const p = k.split("-").map(Number);
  return MONTHS[p[1]] + " " + p[2] + " – …";
}
function fmtRange(a: string, b: string): string {
  const fmt = (k: string) => { const p = k.split("-").map(Number); return MONTHS[p[1]] + " " + p[2]; };
  return fmt(a) + " – " + fmt(b);
}

export type Derived = ReturnType<typeof useDerived>;
