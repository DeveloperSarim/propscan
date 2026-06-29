# PropScan Hero

A pixel-faithful React + Vite + TypeScript implementation of the **PropScan Hero**
design — a professional Saudi-Arabia property aggregator search tool
(MapScraper-Pro / Linear / Vercel aesthetic; black + white + a single green
`#16A34A`, Inter typography).

It was rebuilt from the Claude Design handoff in `../project/PropScan Hero.dc.html`.
The original is a single streaming Design-Components prototype; this is the same
visual output and full interaction set, restructured into real React components
with an API-ready data layer.

## Run it

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build
npm run preview    # serve the production build
```

## What's included

The whole flow is clickable, all in one SPA:

- **Home** — hero + the search card (Buy/Rent, city + searchable district
  dropdown across all Saudi cities, status / rent-period, Residential vs
  Commercial type selector, Beds & Baths, dual-handle price slider, platform
  picker), "View on Map", AI search, popular chips.
- **Results** — 7 views: **Split** (cards + live pin map, the default), Cards,
  Map (full map + price pins, hover popup), List, Grid, Sheet, Stats — switchable
  from the top tabs. Live scanning state, AI-suggestion bar, export menu
  (CSV / Excel / JSON / PDF).
- **Map** — drop-a-pin search with the full horizontal search panel, radius
  (1–20 km + City-wide), satellite toggle, my-location, results cards panel with
  sort, saved filter, compare bar and export.
- **Property detail** — scrollable Overview → Features → Location → REGA Info,
  broker card (Call / WhatsApp / Email / View on source), price/source links,
  export, recently-viewed.
- Plus **Broker profile, Compare, Dashboard** (saved / searches / alerts /
  requirements / recent / notifications / settings), **Post Requirement,
  Calculators** (mortgage + rental yield), **About, Contact, Login, Area Guide,
  Market Reports, Shortlist, Privacy / Terms**, and the report / onboarding
  modals + share popover.

## Architecture

```
src/
  data/               # mock "database" + reference data
    properties.ts     #   listings, platforms, types, teams, etc. (verbatim seed)
    ksa.ts            #   full Saudi cities + districts dataset
    propertyService.ts#   ⭐ the API seam — swap these bodies for fetch() calls
    types.ts
  store/
    useStore.ts       # Zustand store: state + actions (ports the design's class)
    logic.ts          # pure helpers (filtering, formatting, calendar, styles)
    useDerived.ts     # ports renderVals() → one derived-values object per render
  lib/
    css.ts            # parses the design's inline-style strings → React style objects
    exporter.ts       # CSV / Excel / JSON / PDF download
  components/         # Icon set, Hover (style-hover), shared NavHeader
  screens/           # one component per screen + modals
  App.tsx            # screen router
```

### Data is mock now, API-ready

All data resolves from the bundled mock arrays today, but every read goes through
`data/propertyService.ts`. That module is the **single seam** a real backend
would replace — its methods are already shaped like endpoints
(`listProperties()`, `getProperty(id)`, `listCities()`, `listDistricts(city)`,
…). Point them at `fetch(...)` and no screen or store code needs to change.

### Faithful styling

To match the prototype exactly, the original inline-style strings are reused
verbatim via the `css()` helper, which converts a CSS declaration string into a
React style object. Dynamic style strings produced by `useDerived` (active
states, slider fills, pin positions, etc.) flow through the same helper.

> Note: this is a front-end prototype with mock data — there is no live
> backend, scraping, auth, or database, consistent with the original design.
