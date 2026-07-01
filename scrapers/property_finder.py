"""
Property Finder Saudi Arabia scraper  —  https://www.propertyfinder.sa

Property Finder uses React + an internal REST API.
Cities and areas are fetched via network interception of their location search API.
Property search navigates to /search/ with URL query parameters.

Selector notes (update if PF redesigns):
  - Property cards: [data-testid="property-card"] or .property-card
  - Price: [data-testid="property-card-price"]
  - Location: [data-testid="property-card-location"]
  - Broker: [data-testid="property-card-agent-name"]
"""

import asyncio
import json
import logging
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

from curl_cffi.requests import AsyncSession
from data.areas import get_static_areas
from models.property import City, Area, PropertyType, Property, Broker
from models.search import SearchRequest
from scrapers.area_match import area_matches as _area_matches
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

BASE = "https://www.propertyfinder.sa"

_CITIES_FALLBACK = [
    {"id": "1", "name": "Riyadh", "name_ar": "الرياض", "slug": "riyadh"},
    {"id": "2", "name": "Jeddah", "name_ar": "جدة", "slug": "jeddah"},
    {"id": "3", "name": "Mecca", "name_ar": "مكة المكرمة", "slug": "mecca"},
    {"id": "4", "name": "Medina", "name_ar": "المدينة المنورة", "slug": "medina"},
    {"id": "5", "name": "Dammam", "name_ar": "الدمام", "slug": "dammam"},
    {"id": "6", "name": "Al Khobar", "name_ar": "الخبر", "slug": "al-khobar"},
    {"id": "7", "name": "Tabuk", "name_ar": "تبوك", "slug": "tabuk"},
    {"id": "8", "name": "Abha", "name_ar": "أبها", "slug": "abha"},
    {"id": "9", "name": "Hail", "name_ar": "حائل", "slug": "hail"},
    {"id": "10", "name": "Jizan", "name_ar": "جازان", "slug": "jizan"},
    {"id": "11", "name": "Yanbu", "name_ar": "ينبع", "slug": "yanbu"},
    {"id": "12", "name": "Al Ahsa", "name_ar": "الأحساء", "slug": "al-ahsa"},
    {"id": "13", "name": "Najran", "name_ar": "نجران", "slug": "najran"},
    {"id": "14", "name": "Khamis Mushait", "name_ar": "خميس مشيط", "slug": "khamis-mushait"},
    {"id": "15", "name": "Buraidah", "name_ar": "بريدة", "slug": "buraidah"},
    {"id": "16", "name": "Taif", "name_ar": "الطائف", "slug": "taif"},
]

# category IDs for Property Finder search API
_CATEGORY_MAP = {
    "apartment": "1",
    "apartments": "1",
    "villa": "3",
    "villas": "3",
    "office": "5",
    "offices": "5",
    "shop": "8",
    "shops": "8",
    "land": "14",
    "plot": "14",
    "plots": "14",
    "townhouse": "4",
    "townhouses": "4",
    "penthouse": "12",
    "penthouses": "12",
    "warehouse": "10",
    "warehouses": "10",
    "building": "9",
    "buildings": "9",
    "compound": "11",
    "compounds": "11",
    "floor": "6",
    "duplex": "13",
    "hotel-apartment": "7",
    "hotel apartment": "7",
}

_PROPERTY_TYPES = [
    {"id": "1", "slug": "apartment", "name": "Apartment", "name_ar": "شقة"},
    {"id": "3", "slug": "villa", "name": "Villa", "name_ar": "فيلا"},
    {"id": "4", "slug": "townhouse", "name": "Townhouse", "name_ar": "تاون هاوس"},
    {"id": "5", "slug": "office", "name": "Office", "name_ar": "مكتب"},
    {"id": "6", "slug": "floor", "name": "Floor", "name_ar": "دور"},
    {"id": "7", "slug": "hotel-apartment", "name": "Hotel Apartment", "name_ar": "شقة فندقية"},
    {"id": "8", "slug": "shop", "name": "Shop", "name_ar": "محل"},
    {"id": "9", "slug": "building", "name": "Building", "name_ar": "عمارة"},
    {"id": "10", "slug": "warehouse", "name": "Warehouse", "name_ar": "مستودع"},
    {"id": "11", "slug": "compound", "name": "Compound", "name_ar": "مجمع"},
    {"id": "12", "slug": "penthouse", "name": "Penthouse", "name_ar": "بنتهاوس"},
    {"id": "13", "slug": "duplex", "name": "Duplex", "name_ar": "دوبلكس"},
    {"id": "14", "slug": "land", "name": "Land / Plot", "name_ar": "أرض"},
]


def _build_search_url(request: SearchRequest) -> str:
    params: Dict[str, Any] = {
        "l": "sa",  # country = Saudi Arabia
    }
    if request.purpose == "for-rent":
        params["c"] = "2"   # for-rent
    else:
        params["c"] = "1"   # for-sale

    if request.property_type:
        cat = _CATEGORY_MAP.get(request.property_type.lower())
        if cat:
            params["t"] = cat

    if request.city:
        params["q"] = request.city
    if request.area:
        # Convert slug → readable name for PF's text search ("obhur-al-shamaliyah"
        # → "Obhur Al Shamaliyah") so the location query actually resolves.
        area_name = request.area.replace("-", " ").replace("_", " ").title()
        params["q"] = f"{area_name}, {request.city or ''}".strip(", ")

    if request.price_min is not None:
        params["pf"] = int(request.price_min)
    if request.price_max is not None:
        params["pt"] = int(request.price_max)
    if request.rooms is not None:
        params["bf"] = request.rooms
        params["bt"] = request.rooms
    if request.size_min is not None:
        params["af"] = int(request.size_min)
    if request.size_max is not None:
        params["at"] = int(request.size_max)
    if request.page and request.page > 1:
        params["page"] = request.page

    return f"{BASE}/en/search/?{urlencode(params)}"


class PropertyFinderScraper(BaseScraper):
    platform_name = "property_finder"
    base_url = BASE

    async def get_cities(self) -> List[City]:
        playwright, browser, context, page = await self._create_session()
        captured: List[dict] = []

        async def on_response(response):
            url = response.url
            if (
                ("location" in url or "city" in url or "places" in url)
                and response.status == 200
            ):
                try:
                    data = await response.json()
                    items = (
                        data.get("data", data.get("results", data))
                        if isinstance(data, dict)
                        else data
                    )
                    if isinstance(items, list):
                        captured.extend(items)
                except Exception:
                    pass

        page.on("response", on_response)

        try:
            await self._goto_with_retry(page, f"{BASE}/en/")
            try:
                search_input = await page.wait_for_selector(
                    'input[placeholder*="location"], input[placeholder*="city"], input[name="q"]',
                    timeout=8000,
                )
                await search_input.click()
                await search_input.type("Riyadh", delay=100)
                await self._human_delay(1500, 2500)
            except Exception:
                pass

            await self._human_delay(1000, 2000)

            if captured:
                cities = []
                for item in captured:
                    name = item.get("name") or item.get("label") or item.get("title") or ""
                    if name:
                        cities.append(
                            City(
                                id=str(item.get("id", item.get("city_id", ""))),
                                name=name,
                                name_ar=item.get("name_ar", item.get("label_ar")),
                                slug=item.get("slug"),
                                platform=self.platform_name,
                            )
                        )
                if cities:
                    return cities

        except Exception as exc:
            logger.error("[property_finder] get_cities error: %s", exc)
        finally:
            await self._close_session(playwright, browser)

        return [
            City(
                id=c["id"],
                name=c["name"],
                name_ar=c["name_ar"],
                slug=c["slug"],
                platform=self.platform_name,
            )
            for c in _CITIES_FALLBACK
        ]

    async def get_areas(self, city: str) -> List[Area]:
        playwright, browser, context, page = await self._create_session()
        captured: List[dict] = []

        async def on_response(response):
            url = response.url
            if (
                ("location" in url or "area" in url or "district" in url)
                and response.status == 200
            ):
                try:
                    data = await response.json()
                    items = (
                        data.get("data", data.get("results", data))
                        if isinstance(data, dict)
                        else data
                    )
                    if isinstance(items, list):
                        captured.extend(items)
                except Exception:
                    pass

        page.on("response", on_response)

        try:
            await self._goto_with_retry(page, f"{BASE}/en/search/?q={city}&c=1")
            try:
                search_input = await page.wait_for_selector(
                    'input[placeholder*="location"], input[name="q"]',
                    timeout=8000,
                )
                await search_input.click()
                await search_input.triple_click()
                await search_input.type(city, delay=100)
                await self._human_delay(2000, 3000)
            except Exception:
                pass

            areas = []
            for item in captured:
                name = item.get("name") or item.get("label") or ""
                if name and name.lower() != city.lower():
                    areas.append(
                        Area(
                            id=str(item.get("id", "")),
                            name=name,
                            name_ar=item.get("name_ar", item.get("label_ar")),
                            slug=item.get("slug"),
                            city=city,
                            platform=self.platform_name,
                        )
                    )
            if areas:
                return areas

        except Exception as exc:
            logger.error("[property_finder] get_areas error: %s", exc)
        finally:
            await self._close_session(playwright, browser)

        static = get_static_areas(city)
        if static:
            logger.info("[property_finder] Using static areas for %s (%d areas)", city, len(static))
            return [
                Area(id=a["id"], name=a["name"], name_ar=a["name_ar"],
                     slug=a["slug"], city=city, platform=self.platform_name)
                for a in static
            ]
        return []

    async def get_property_types(self) -> List[PropertyType]:
        return [
            PropertyType(
                id=pt["id"],
                slug=pt["slug"],
                name=pt["name"],
                name_ar=pt["name_ar"],
                platform=self.platform_name,
            )
            for pt in _PROPERTY_TYPES
        ]

    async def _extract_page(self, page) -> list:
        """Extract property cards from the current Property Finder page."""
        try:
            await page.wait_for_selector(
                '[data-testid="property-card"], .property-card, article[class*="card"]',
                timeout=12000,
            )
        except Exception:
            pass

        return await page.evaluate("""
() => {
    function clean(t) { return t ? t.replace(/\\s+/g, ' ').trim() : null; }

    // Pull enriched per-property data (lat/lng, description, etc.) from Next.js payload
    const nextMap = {};
    try {
        const nd = document.getElementById('__NEXT_DATA__');
        if (nd) {
            const data = JSON.parse(nd.textContent);
            const pp = data?.props?.pageProps || {};
            const listings = pp.listings || pp.properties ||
                             pp.data?.listings || pp.searchResults?.listings || [];
            for (const item of (Array.isArray(listings) ? listings : [])) {
                const ref = String(item.referenceNumber || item.reference || item.id || '');
                if (ref) {
                    nextMap[ref] = {
                        lat: item.latitude ?? item.lat ?? null,
                        lng: item.longitude ?? item.lng ?? null,
                        description: item.description || item.descriptionEn || null,
                        listed_at: item.listingDate || item.createdAt || item.publishedAt || null,
                        reference_number: item.referenceNumber || item.reference || null,
                    };
                }
            }
        }
    } catch(_) {}

    const selectors = [
        '[data-testid="property-card"]',
        '.property-card',
        'article[class*="PropertyCard"]',
        'article',
        '[class*="card"][class*="propert"]',
    ];

    let cards = [];
    for (const sel of selectors) {
        cards = [...document.querySelectorAll(sel)];
        if (cards.length > 0) break;
    }

    const seen = new Set();
    const unique = [];
    for (const c of cards) {
        const a = c.querySelector('a[href]');
        const key = a ? a.href : c.textContent.slice(0, 40);
        if (!seen.has(key)) { seen.add(key); unique.push(c); }
    }

    return unique.map(card => {
        const a = card.querySelector('a[href]');
        const href = a ? a.href : null;

        const titleEl  = card.querySelector('[data-testid*="title"], [class*="title"], h2, h3');
        const priceEl  = card.querySelector('[data-testid*="price"], [class*="price"], [class*="Price"]');
        const locEl    = card.querySelector('[data-testid*="location"], [class*="location"], [class*="address"]');
        const agentEl  = card.querySelector('[data-testid*="agent"], [class*="agent"], [class*="broker"], [class*="Agency"]');
        const phoneEl  = card.querySelector('a[href^="tel:"]');
        const waEl     = card.querySelector('a[href*="wa.me"], a[href*="whatsapp"]');
        const bedsEl   = card.querySelector('[data-testid*="bed"], [class*="bed"], [aria-label*="bed"]');
        const bathsEl  = card.querySelector('[data-testid*="bath"], [class*="bath"], [aria-label*="bath"]');
        const sizeEl   = card.querySelector('[data-testid*="area"], [class*="area"], [aria-label*="sq"]');
        const refEl    = card.querySelector('[data-testid*="ref"], [class*="reference"], [class*="ref-"]');
        const dateEl   = card.querySelector('[data-testid*="date"], [class*="date"], [class*="listed"], time');
        const descEl   = card.querySelector('[data-testid*="desc"], [class*="description"], [class*="excerpt"]');

        const imgs = [...card.querySelectorAll('img[src], img[data-src]')]
            .map(i => i.src || i.getAttribute('data-src'))
            .filter(s => s && !s.includes('data:') && s.length > 20);

        const bedMatch  = bedsEl  && bedsEl.textContent.match(/(\\d+)/);
        const bathMatch = bathsEl && bathsEl.textContent.match(/(\\d+)/);
        const sizeMatch = sizeEl  && sizeEl.textContent.match(/([\\d,.]+)/);

        const priceText = clean(priceEl ? priceEl.textContent : null) || '';
        const ptl = priceText.toLowerCase();
        let price_period = null;
        if (ptl.includes('year') || ptl.includes('annual')) price_period = 'yearly';
        else if (ptl.includes('month')) price_period = 'monthly';

        // reference from DOM element or card text fallback
        const cardText = card.textContent || '';
        let reference_number = refEl ? clean(refEl.textContent)?.replace(/^ref\\.?\\s*/i, '') : null;
        if (!reference_number) {
            const rm = cardText.match(/[Rr]ef(?:erence)?\\s*[:#]?\\s*([A-Z0-9\\-]+)/);
            if (rm) reference_number = rm[1];
        }

        // Match listing numeric ID from URL for __NEXT_DATA__ lookup
        const idMatch = href && href.match(/(\\d+)(?:\\.html)?(?:[/?#]|$)/);
        const listingId = idMatch ? idMatch[1] : null;
        const extra = (listingId && nextMap[listingId]) ? nextMap[listingId]
                    : (reference_number && nextMap[reference_number]) ? nextMap[reference_number]
                    : {};

        return {
            href,
            title:            clean(titleEl ? titleEl.textContent : null),
            description:      clean(descEl ? descEl.textContent : null) || extra.description || null,
            price_text:       priceText,
            price_period,
            location:         clean(locEl ? locEl.textContent : null),
            broker_name:      clean(agentEl ? agentEl.textContent : null),
            phone:            phoneEl ? phoneEl.href.replace('tel:', '') : null,
            whatsapp:         waEl ? waEl.href : null,
            rooms:            bedMatch  ? parseInt(bedMatch[1])                   : null,
            baths:            bathMatch ? parseInt(bathMatch[1])                  : null,
            size:             sizeMatch ? parseFloat(sizeMatch[1].replace(',','')) : null,
            images:           imgs.slice(0, 10),
            reference_number: reference_number || extra.reference_number || null,
            listed_at:        clean(dateEl ? dateEl.textContent : null) || extra.listed_at || null,
            latitude:         extra.lat  ?? null,
            longitude:        extra.lng  ?? null,
        };
    }).filter(p => p.href || p.title);
}
""")

    # curl_cffi city slug map for clean URL structure
    _CITY_SLUGS: dict = {
        "riyadh": "riyadh", "jeddah": "jeddah", "mecca": "makkah-al-mukarramah",
        "makkah": "makkah-al-mukarramah", "medina": "madinah", "dammam": "dammam",
        "khobar": "al-khobar", "al khobar": "al-khobar", "abha": "abha",
        "tabuk": "tabuk", "hail": "hail", "buraidah": "buraidah",
        "taif": "taif", "al taif": "taif", "yanbu": "yanbu",
        "dhahran": "dhahran", "jubail": "jubail", "al jubail": "jubail",
    }
    _TYPE_SLUGS: dict = {
        "apartment": "apartments", "villa": "villas", "house": "houses",
        "land": "land", "office": "offices", "commercial": "commercial-properties",
        "building": "whole-building", "residential": "whole-building",
        "shop": "shops", "townhouse": "townhouses",
    }

    def _parse_pf_page(self, data: dict, request: SearchRequest) -> List[Property]:
        props_raw = (data.get("props") or {}).get("pageProps") or {}
        sr = props_raw.get("searchResult") or {}
        if not isinstance(sr, dict):
            return []
        raw_listings = sr.get("listings") or sr.get("properties") or []

        out: List[Property] = []
        for item in raw_listings:
            # Each item wraps the actual property under a 'property' key
            p = item.get("property") if isinstance(item, dict) and "property" in item else item
            if not isinstance(p, dict):
                continue

            title = (p.get("title") or "").strip()
            if not title:
                continue

            price_obj = p.get("price") or {}
            try:
                price_num: Optional[float] = float(price_obj.get("value") or 0) or None
            except (TypeError, ValueError):
                price_num = None

            period_raw = str(price_obj.get("period") or "").lower()
            price_period = "/year" if "year" in period_raw else "/month" if "month" in period_raw else None
            if request.purpose == "for-sale":
                price_period = None

            loc_obj = p.get("location") or {}
            location_str = loc_obj.get("full_name") or request.city or ""

            # City guard: PF's free-text `q` doesn't reliably filter by city
            # (it returns Riyadh-heavy defaults), so drop any listing whose
            # location doesn't mention the requested city.
            if request.city:
                city_norm = request.city.lower().replace("-", " ").strip()
                if city_norm and city_norm not in location_str.lower():
                    continue

            # Area guard: keep only listings whose location mentions the district.
            if request.area and not _area_matches(request.area, location_str):
                continue

            coords = loc_obj.get("coordinates") or {}
            lat: Optional[float] = None
            lng: Optional[float] = None
            try:
                lat = float(coords.get("lat") or 0) or None
                lng = float(coords.get("lng") or coords.get("lon") or 0) or None
            except (TypeError, ValueError):
                pass

            imgs_raw = p.get("images") or []
            images = [img.get("medium") or img.get("small") or "" for img in imgs_raw[:10] if isinstance(img, dict)]
            images = [u for u in images if u]

            sz_obj = p.get("size") or {}
            try:
                area_sqm: Optional[float] = float(sz_obj.get("value") or 0) or None
            except (TypeError, ValueError):
                area_sqm = None

            agent_obj = p.get("agent") or {}
            broker_obj = p.get("broker") or {}
            broker_name = (agent_obj.get("name") if isinstance(agent_obj, dict) else None) or \
                          (broker_obj.get("name") if isinstance(broker_obj, dict) else None)
            broker_phone = (broker_obj.get("phone") if isinstance(broker_obj, dict) else None)
            broker = Broker(name=broker_name, phone=broker_phone) if (broker_name or broker_phone) else None

            href = p.get("share_url") or p.get("slug") or ""
            if href and not href.startswith("http"):
                href = f"{BASE}{href}"

            def _int_safe(v) -> Optional[int]:
                try:
                    return int(str(v).replace("+", "").strip())
                except (TypeError, ValueError):
                    return None

            out.append(Property(
                platform=self.platform_name,
                title=title,
                property_type=request.property_type,
                purpose=request.purpose,
                price=price_num,
                price_period=price_period,
                size_sqm=area_sqm,
                rooms=_int_safe(p.get("rooms") or p.get("bedrooms")),
                bathrooms=_int_safe(p.get("baths") or p.get("bathrooms")),
                city=request.city,
                location=location_str,
                latitude=lat,
                longitude=lng,
                images=images,
                broker=broker,
                listing_url=href or None,
            ))
        return out

    def _get_pf_total_pages(self, data: dict) -> int:
        props_raw = (data.get("props") or {}).get("pageProps") or {}
        sr = props_raw.get("searchResult") or {}
        meta = sr.get("meta") or {}
        return int(meta.get("page_count") or 1)

    async def search_properties(self, request: SearchRequest) -> List[Property]:
        max_pages = min(getattr(request, "max_pages", 145), 145)

        # Build search URL using /en/search/ which bypasses Cloudflare on curl_cffi
        purpose_code = "2" if request.purpose == "for-rent" else "1"
        city_q = (request.city or "riyadh").strip()
        if request.area:
            city_q = f"{request.area}, {city_q}"
        params: dict = {"l": "sa", "c": purpose_code, "q": city_q}
        if request.property_type:
            cat = _CATEGORY_MAP.get(request.property_type.lower())
            if cat:
                params["t"] = cat
        if request.price_min is not None:
            params["pf"] = int(request.price_min)
        if request.price_max is not None:
            params["pt"] = int(request.price_max)
        if request.rooms is not None:
            params["bf"] = request.rooms
            params["bt"] = request.rooms

        base_search = f"{BASE}/en/search/?" + urlencode(params)

        hdrs = {
            "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.google.com/",
        }

        properties: List[Property] = []
        seen_hrefs: set = set()

        # One shared session + a semaphore. Previously each page opened its own
        # AsyncSession at concurrency 10, which PF throttled — pages hung for 70s
        # and were lost, so only ~500 of ~1400 listings came back. A shared
        # session at concurrency 12 with a short 25s timeout keeps pages flowing.
        CONCURRENCY = 12
        sem = asyncio.Semaphore(CONCURRENCY)

        async def _fetch_page(session, page_num: int):
            url = base_search if page_num == 1 else f"{base_search}&page={page_num}"
            async with sem:
                for attempt in range(2):
                    try:
                        r = await session.get(url, headers=hdrs, timeout=25)
                        if r.status_code == 200:
                            m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', r.text, re.S)
                            if m:
                                return json.loads(m.group(1))
                        elif r.status_code in (404, 403):
                            return None
                    except Exception as exc:
                        logger.warning("[property_finder] page %d attempt %d: %s", page_num, attempt + 1, exc)
                        await asyncio.sleep(1)
                return None

        async with AsyncSession(impersonate="chrome124") as session:
            # Probe page 1 — get total page count from meta
            data1 = await _fetch_page(session, 1)
            if not data1:
                logger.info("[property_finder] 0 results from %s", base_search)
                return []

            page1_props = self._parse_pf_page(data1, request)
            total_pages = min(self._get_pf_total_pages(data1), max_pages)
            logger.info("[property_finder] %d total pages, fetching up to %d", total_pages, max_pages)

            for prop in page1_props:
                if prop.listing_url and prop.listing_url not in seen_hrefs:
                    seen_hrefs.add(prop.listing_url)
                    properties.append(prop)

            if not page1_props:
                return []

            # Fetch all remaining pages concurrently (semaphore bounds the load)
            results = await asyncio.gather(
                *[_fetch_page(session, p) for p in range(2, total_pages + 1)],
                return_exceptions=True,
            )
            for res in results:
                if isinstance(res, dict):
                    for prop in self._parse_pf_page(res, request):
                        if prop.listing_url and prop.listing_url not in seen_hrefs:
                            seen_hrefs.add(prop.listing_url)
                            properties.append(prop)

        logger.info("[property_finder] Done — %d properties from %s", len(properties), base_search)
        return properties
