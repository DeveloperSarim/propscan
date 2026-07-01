# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (creates venv, installs deps, installs Chromium)
bash setup.sh

# Run the API (activates venv automatically if present)
bash run.sh
# OR manually:
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# API docs (Swagger UI after starting)
open http://localhost:8000/docs
```

There are no automated tests. Validation is done manually via the Swagger UI or curl against the running API.

### Docker (primary deployment)

```bash
# One command — auto-creates .env, builds frontend + backend, runs on a unique port
bash start.sh

# Manual
docker compose up -d --build          # build + run (port from .env PORT, default 4823→8000)
docker logs platformsscraper-propscan-1 --tail 50   # container logs
```

The Dockerfile is multi-stage: a `node:20` stage builds `frontend/` (Vite → `frontend/dist`), then the `mcr.microsoft.com/playwright/python:v1.44.0-jammy` stage runs the API and serves the built frontend. **Editing frontend code requires `docker compose up -d --build`** (the bundle is baked into the image), then a browser hard-refresh (Cmd+Shift+R) to bust the cached JS.

`SMTP_PASS` and other secrets live only in `.env` (gitignored) — never commit them.

## Architecture

**FastAPI + mixed scraping backends** for Saudi Arabia real estate. No database — in-memory TTL cache only. A React/Vite frontend (`frontend/`) is served from the same container.

### Request flow

```
POST /search  →  routers/search.py
    asyncio.gather() runs all platform scrapers in parallel
    → scrapers/{platform}.py  (each uses its own backend: Algolia / RSC / __NEXT_DATA__ / Playwright)
    → unified sorted SearchResult
```

### Key files

- `main.py` — FastAPI app, lifespan, router registration
- `config.py` — Settings via pydantic-settings; reads `.env`
- `cache.py` — In-process TTL dict cache (cities/areas/property-types only; search never cached)
- `models/property.py` — `Property`, `Broker`, `City`, `Area`, `PropertyType`, `SearchResult`
- `models/search.py` — `SearchRequest`: filter fields + `page` + `max_pages`
- `scrapers/base.py` — `BaseScraper` with Playwright session helpers (`_create_session`, `_goto_with_retry`, `_human_delay`)
- `data/areas.py` — Static fallback area lists keyed by city name

### Scraper backends (per platform)

Each platform's `search_properties` uses a different technique. `get_cities` / `get_areas` on all platforms still use Playwright (they hit internal APIs that need a browser session).

**Aqar** (`scrapers/aqar.py`) — **curl_cffi + RSC headers**
- Sends `RSC: 1` + `Accept: text/x-component, */*` headers to Aqar's Next.js routes — returns raw RSC streaming text with all listing JSON embedded.
- `_extract_listings()` finds objects via `{"id":\d+,"sov_campaign_id"` regex + brace-counting to extract full JSON.
- `_total_pages()` reads `"total": N` from RSC response; internal `SAFETY_CAP = 2000` pages (40k results). The user's `max_pages` field is **ignored** — Aqar always fetches all available pages.
- URL structure: `https://sa.aqar.fm/{cat_slug}/{city_ar}` with Arabic path segments.
  - No `property_type` → uses `عقارات/{city}` (all types, all purposes) — returns ~33k for Jeddah.
  - With type: uses `_SLUGS_AR[(type, purpose)]` e.g. `شقق-للبيع/جدة`.
  - Paginated URLs: `/{base}/{page_num}?beds=N&wc=N` — page number comes **before** the query string.
- Server-side filters supported: `beds=N` (rooms) and `wc=N` (bathrooms) as URL params. Price and area are filtered client-side in `_parse_item`.
- Sub-regions (`_SUBREGIONS`) + beds-segmentation add coverage for generic (no type, no area) city searches; both are turned OFF in area mode.
- Rotates impersonations (`chrome107/110/120/124`, `safari15_3/17_0`), throttled to ~10 req/s with a 30-slot semaphore; 429s are retried with backoff.
- **Streaming endpoint** `POST /search/stream-aqar` (`stream_properties`) yields SSE batches so the frontend shows Aqar results progressively. The frontend calls this (not the blocking `/search`) for Aqar. Area searches are capped at 80 pages here too.

**Bayut** (`scrapers/bayut.py`) — **Algolia REST API**
- POSTs to `https://LL8IZ711CS-dsn.algolia.net/1/indexes/bayut-sa-production-ads-city-level-score-ar/query` using Bayut's public Algolia credentials embedded in their client-side JS.
- All filters (price, rooms, size, purpose, type, city) are applied server-side via Algolia `filters` string.
- `hitsPerPage=100`; fetches up to `max_pages` pages in parallel via `asyncio.gather`.
- No browser/Playwright needed for search — plain `httpx.AsyncClient`.

**Wasalt** (`scrapers/wasalt.py`) — **curl_cffi + `__NEXT_DATA__`**
- Fetches HTML from `https://wasalt.sa/en/{sale|rent}/search?propertyFor=...&cityId={id}` and extracts `<script id="__NEXT_DATA__">` JSON.
- **Impersonation fallback**: tries `safari15_3 → chrome120 → chrome124 → safari17_0` (Docker/Linux sometimes needs chrome instead of safari); 45s timeout per request.
- `totalPages` from `searchResult.totalPages`; capped `min(total, max_pages, 400)`.
- Filters (price, rooms, baths) applied client-side in `_parse_wasalt_props`.

**Property Finder** (`scrapers/property_finder.py`) — **curl_cffi + `__NEXT_DATA__`** (no longer Playwright for search)
- Fetches `https://www.propertyfinder.sa/en/search/?l={loc_id}&c=1&page=N` with `impersonate="chrome124"` — **trailing slash before `?` is critical**. One shared session + a 12-slot semaphore; each request hard-capped via `asyncio.wait_for` (curl_cffi's own timeout is unreliable).
- `c=1` = for-sale, `c=2` = for-rent. Category IDs in `_CATEGORY_MAP`.
- **City filtering via numeric location ID** — the free-text `q=<city>` param does NOT filter (returns Riyadh/Jazan/etc. defaults). `l=<PF location id>` filters server-side: `_PF_LOCATION_IDS` maps `riyadh→8216`, `jeddah→2658` (discovered from listing `location.path` = `region.city.district`). `l=2658` → ~1034 Jeddah for-sale. Cities not in the map fall back to `q=<city>` + a client-side **city guard** that drops non-matching-city listings. PF's location autocomplete API is no longer reachable, so add new city IDs by reading `location.path` from a listing in that city. `get_cities`/`get_areas` still use Playwright.

### Area / district filtering (all 4 platforms)

The frontend sends the selected district as `area` (an English display name, e.g. `"Obhur Al Shamaliyah"`). Each platform resolves it differently — verified against live data, not guessed:

- **Bayut** — server-side. Districts nest under a ZONE in Algolia slugs (`/jeddah/north-jeddah/obhur-al-shamaliyah`), so the zone is unknown up front. `_resolve_area_slug()` runs a discovery query (city hits, `hitsPerPage=1000`) to find the location entry whose `slug_l1` ends with `/{area_slug}`, then filters with that full slug. `area` field on the returned Property = the deepest location `name_l1` (English district name), NOT the Arabic zone slug.
- **Aqar** — client-side. District-specific URL paths trigger a Cloudflare challenge (429 "Just a moment…"); only the generic city URL passes. So it fetches the city (capped **80 pages** in area mode; subregions + beds-segmentation OFF) and filters on the Arabic `district` field via `_norm_ar()` (hamza/alef/taa-marbuta normalization). Cache key includes `:area` vs `:full` so the two modes don't collide.
- **Wasalt** — client-side. Wasalt's `districtSlug` URL param is **ignored** (returns whole city); samples 25 pages and filters on the property's English district name.
- **Property Finder** — client-side (`_area_matches`), gated behind the city guard.

Wasalt + PF share `scrapers/area_match.py` (`area_matches`) — a transliteration-tolerant matcher: vowel-run normalization (`Shamaliyah`≈`Shamalyyah`, `Rawdah`≈`Rawdhah`, `Janubiyah`≈`Janoubeyyah`), a 4-char common-prefix floor, and sub-3-char token drop (rejects stray `Al Faiha|A` fragments). The **frontend** re-applies its own tolerant district filter in `frontend/src/store/logic.ts` `_districtMatch()` — needed because Aqar labels are Arabic and Wasalt transliterates differently, so an exact `===` would hide them from map/list even after the backend filtered correctly.

### Browser setup (`scrapers/base.py`)

Used only by `get_cities`, `get_areas`, and Property Finder search:
- `--headless=new` in `LAUNCH_ARGS` (Chrome's new headless mode — full fingerprint, truly invisible).
- Prefers local Google Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) for real TLS/hardware fingerprint; falls back to Playwright Chromium.
- `playwright-stealth` applied on every new page.

### Adding a new scraper

1. Create `scrapers/{name}.py`, subclass `BaseScraper`, implement `get_cities`, `get_areas`, `get_property_types`, `search_properties`
2. Add to `SCRAPERS` dict in `routers/search.py`
3. Add to `VALID_PLATFORMS` in `models/search.py`

### Bot detection patterns encountered

- **PF**: cookie-based — `context.clear_cookies()` + storage clear before each page is the fix
- **Bayut**: Cloudflare TLS — bypassed by hitting Algolia directly (no browser load at all)
- **Wasalt**: Cloudflare TLS — bypassed by `curl_cffi` safari15_3 TLS fingerprint
- **Aqar**: No bot detection on RSC endpoints; rate limiting on some specific URL paths (e.g. type-specific slugs occasionally 429)

### Maximum-results JSON example (Aqar, all types, no filters)

```json
{
  "platforms": ["aqar"],
  "city": "jeddah",
  "purpose": "for-sale"
}
```

Omitting `property_type` activates the `عقارات/جدة` generic path (~33k listings). Aqar fetches all pages automatically regardless of `max_pages`.
