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

## Architecture

**FastAPI + mixed scraping backends** for Saudi Arabia real estate. No database — in-memory TTL cache only.

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
- Sub-regions (`_SUBREGIONS`) only activate when `city_pages >= SAFETY_CAP` (i.e., city has >40k listings). They are subsets of the city — used to cover the overflow, not to add new listings.
- `impersonate="chrome110"`, concurrency 30.

**Bayut** (`scrapers/bayut.py`) — **Algolia REST API**
- POSTs to `https://LL8IZ711CS-dsn.algolia.net/1/indexes/bayut-sa-production-ads-city-level-score-ar/query` using Bayut's public Algolia credentials embedded in their client-side JS.
- All filters (price, rooms, size, purpose, type, city) are applied server-side via Algolia `filters` string.
- `hitsPerPage=100`; fetches up to `max_pages` pages in parallel via `asyncio.gather`.
- No browser/Playwright needed for search — plain `httpx.AsyncClient`.

**Wasalt** (`scrapers/wasalt.py`) — **curl_cffi + `__NEXT_DATA__`**
- Fetches HTML pages with `impersonate="safari15_3"` (bypasses Cloudflare TLS check).
- Extracts listings from `<script id="__NEXT_DATA__">` JSON embedded in each page.
- `totalPages` comes from `searchResult.totalPages`; capped at `min(total, max_pages, 340)`.
- URL: `https://wasalt.sa/en/{type}-for-{sale|rent}-in-{city}?page=N`. Batches 20 pages at a time.
- Filters (price, rooms) applied client-side in `_parse_wasalt_props`.

**Property Finder** (`scrapers/property_finder.py`) — **Playwright + `__NEXT_DATA__`**
- Uses a **single browser for all pages** — `context.clear_cookies()` + localStorage/sessionStorage clear before each page (resets PF's cookie-based bot detection without relaunching Chrome).
- URL: `https://www.propertyfinder.sa/en/search/?l=sa&c=1&q=Riyadh&page=N` — **trailing slash before `?` is critical**; without it, page 2+ returns 0 results.
- `_extract_page` reads `__NEXT_DATA__` for lat/lng, description, reference numbers not in card DOM.
- `c=1` = for-sale, `c=2` = for-rent. Category IDs in `_CATEGORY_MAP`.

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
