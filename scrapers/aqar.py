"""
Aqar Saudi Arabia scraper  —  https://sa.aqar.fm

search_properties uses Aqar's Next.js RSC (React Server Components) endpoint
via curl_cffi with RSC:1 header. This returns raw JSON-embedded text that
contains all listing data without needing a browser. 19k+ results for Jeddah
apartments.

get_cities / get_areas still use Playwright (they call /next-api/* endpoints
that require session context, but are cached and rarely called).
"""

import asyncio
import json
import logging
import re
import time as _time
from typing import List, Optional
from urllib.parse import quote

from curl_cffi.requests import AsyncSession

from data.areas import get_static_areas
from models.property import City, Area, PropertyType, Property, Broker
from models.search import SearchRequest
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

BASE = "https://sa.aqar.fm"

# ── City Arabic names (for URL path) ─────────────────────────────────────────
_CITIES_AR: dict = {
    "riyadh":    "الرياض",
    "jeddah":    "جدة",
    "mecca":     "مكة-المكرمة",
    "medina":    "المدينة-المنورة",
    "dammam":    "الدمام",
    "khobar":    "الخبر",
    "al khobar": "الخبر",
    "abha":      "أبها",
    "tabuk":     "تبوك",
    "hail":      "حائل",
    "buraidah":  "بريدة",
    "taif":      "الطائف",
    "al taif":   "الطائف",
    "yanbu":     "ينبع",
    "najran":    "نجران",
    "jazan":     "جازان",
    "khamis mushait": "خميس-مشيط",
    "jubail":    "الجبيل",
    "al jubail": "الجبيل",
    "dhahran":   "الظهران",
}

# ── (property_type, purpose) → Arabic URL slug ────────────────────────────────
_SLUGS_AR: dict = {
    ("apartment",  "for-sale"): "شقق-للبيع",
    ("apartment",  "for-rent"): "شقق-للإيجار",
    ("villa",      "for-sale"): "فلل-للبيع",
    ("villa",      "for-rent"): "فلل-للإيجار",
    ("house",      "for-sale"): "بيت-للبيع",
    ("house",      "for-rent"): "بيت-للإيجار",
    ("residential","for-sale"): "عمائر-للبيع",
    ("residential","for-rent"): "عمائر-للإيجار",
    ("building",   "for-sale"): "عمائر-للبيع",
    ("building",   "for-rent"): "عمائر-للإيجار",
    ("land",       "for-sale"): "أراضي-للبيع",
    ("land",       "for-rent"): "أراضي-للإيجار",
    ("office",     "for-sale"): "مكاتب-للبيع",
    ("office",     "for-rent"): "مكتب-تجاري-للإيجار",
    ("shop",       "for-sale"): "محلات-للبيع",
    ("shop",       "for-rent"): "محلات-للإيجار",
    ("commercial", "for-sale"): "محلات-للبيع",
    ("commercial", "for-rent"): "محلات-للإيجار",
}

# ── Area/District slug → Arabic name (for URL path filtering) ────────────────
_AREAS_AR: dict = {
    # Jeddah
    "obhur-al-shamaliyah": "أبحر-الشمالية", "obhur-al-janubiyah": "أبحر-الجنوبية",
    "al-shati": "الشاطئ",         "al-hamra": "الحمراء",          "al-zahraa": "الزهراء",
    "al-nakheel": "النخيل",       "al-rawdah": "الروضة",          "al-murjan": "المرجان",
    "al-naeem": "النعيم",         "al-salamah": "السلامة",        "al-samer": "السامر",
    "al-marwah": "المروة",        "al-khalidiyah": "الخالدية",    "al-bawadi": "البوادي",
    "al-wahah": "الواحة",         "al-nuzha": "النزهة",           "al-zomorod": "الزمرد",
    "briman": "بريمان",           "al-rabwah": "الربوة",          "al-rawabi": "الروابي",
    "al-safa": "الصفا",           "al-sharafiyah": "الشرفية",     "al-balad": "البلد",
    "al-ruwais": "الرويس",        "al-fayhaa": "الفيحاء",         "al-aziziyah": "العزيزية",
    "al-mohammadiyah": "المحمدية","al-musharifah": "المشرفة",     "bani-malik": "بني-مالك",
    "al-manar": "المنار",         "al-andalus": "الأندلس",        "al-salhiyah": "الصالحية",
    "al-jamiah": "الجامعة",       "al-faisaliyah": "الفيصلية",   "al-naseem": "النسيم",
    "al-nahdah": "النهضة",        "al-basateen": "البساتين",      "mraikh": "مريخ",
    "al-taiaser": "التيسير",      "al-sabeel": "السبيل",          "al-riyadh-dist": "الرياض",
    "al-qadisiyah": "القادسية",   "al-salam": "السلام",           "al-worood": "الورود",
    "al-amin": "الأمين",          "al-adl": "العدل",              "al-falah": "الفلاح",
    "al-sawari": "السواري",       "al-sulaimaniyah": "السليمانية","al-noor": "النور",
    "al-ribat": "الرباط",         "al-wafa": "الوفاء",            "al-rehab": "الرحاب",
    "abruq-al-rughamah": "عبروق-الرغامة", "al-azhar": "الأزهر",  "al-rihab": "الرحاب",
    "prince-fawwaz-south": "الأمير-فواز-الجنوبي",                 "al-waha": "الواحة",
    "al-hamdaniyah": "الحمدانية", "al-ajwad": "الأجواد",          "al-rayyan": "الريان",
    "al-majd": "المجد",           "al-wazzan": "الوزان",          "um-al-hamam": "أم-الحمام",
    "al-nawras": "النوارس",       "al-mishrifah": "المشرفة",      "king-fahd": "الملك-فهد",
    "king-abdul-aziz": "الملك-عبدالعزيز", "al-zaytoun": "الزيتون","al-taawun": "التعاون",
    "al-shohada": "الشهداء",      "al-jil": "الجيل",              "al-mataar": "المطار",
    "al-waled": "الوليد",         "al-jawhara": "الجوهرة",        "al-quzah": "القوزاء",
    # Riyadh
    "al-olaya": "العليا",         "al-yasmin": "الياسمين",        "al-narjis": "النرجس",
    "al-arid": "العارض",          "hitin": "حطين",                "al-sahafah": "الصحافة",
    "qurtubah": "قرطبة",          "al-worood-r": "الورود",        "al-aqiq": "العقيق",
    "al-qirawan": "القيروان",     "diplomatic-quarter": "الحي-الدبلوماسي",
}

# ── Sub-regions: scraped in addition to the main city URL for more results ────
_SUBREGIONS: dict = {
    "jeddah": ["شمال-جدة", "جنوب-جدة", "شرق-جدة", "غرب-جدة", "وسط-جدة"],
    "riyadh": ["شمال-الرياض", "جنوب-الرياض", "شرق-الرياض", "غرب-الرياض", "وسط-الرياض"],
    "dammam": ["شمال-الدمام", "جنوب-الدمام", "شرق-الدمام", "غرب-الدمام", "وسط-الدمام"],
}

# Type-specific supplemental slugs for generic (no property_type) searches.
# These are shorter paginated series for each major type — used to fill gaps
# when the main city URL pages partially fail under rate limiting.
_SUPPLEMENTAL_SLUGS: dict = {
    "jeddah": [
        "شقق-للبيع", "شقق-للإيجار",
        "فلل-للبيع", "فلل-للإيجار",
        "أراضي-للبيع",
    ],
    "riyadh": [
        "شقق-للبيع", "شقق-للإيجار",
        "فلل-للبيع", "فلل-للإيجار",
        "أراضي-للبيع",
    ],
    "dammam": [
        "شقق-للبيع", "شقق-للإيجار",
        "فلل-للبيع",
    ],
    "khobar": ["شقق-للبيع", "شقق-للإيجار", "فلل-للبيع"],
    "al khobar": ["شقق-للبيع", "شقق-للإيجار", "فلل-للبيع"],
    "mecca": ["شقق-للبيع", "شقق-للإيجار"],
    "medina": ["شقق-للبيع", "شقق-للإيجار"],
}

_CITY_ID_MAP: dict = {
    "riyadh": 21, "jeddah": 66, "dammam": 18, "al khobar": 12, "khobar": 12,
    "medina": 41, "al madinah": 41, "mecca": 94, "makkah": 94, "hail": 67,
    "tabuk": 59, "abha": 1, "khamis mushait": 70, "al hofuf": 46,
    "al ahsa": 46, "ahsa": 46, "dhahran": 27, "al jubail": 8, "jubail": 8,
    "taif": 26, "buraidah": 52, "yanbu": 69, "najran": 50, "jizan": 65, "jazan": 65,
}

_CITIES_FALLBACK = [
    {"id": "21", "name": "Riyadh",        "name_ar": "الرياض",          "slug": "riyadh"},
    {"id": "66", "name": "Jeddah",         "name_ar": "جدة",             "slug": "jeddah"},
    {"id": "94", "name": "Mecca",          "name_ar": "مكة المكرمة",     "slug": "mecca"},
    {"id": "41", "name": "Medina",         "name_ar": "المدينة المنورة", "slug": "medina"},
    {"id": "18", "name": "Dammam",         "name_ar": "الدمام",          "slug": "dammam"},
    {"id": "12", "name": "Al Khobar",      "name_ar": "الخبر",           "slug": "al-khobar"},
    {"id": "27", "name": "Dhahran",        "name_ar": "الظهران",         "slug": "dhahran"},
    {"id": "59", "name": "Tabuk",          "name_ar": "تبوك",            "slug": "tabuk"},
    {"id": "1",  "name": "Abha",           "name_ar": "أبها",            "slug": "abha"},
    {"id": "67", "name": "Hail",           "name_ar": "حائل",            "slug": "hail"},
    {"id": "50", "name": "Najran",         "name_ar": "نجران",           "slug": "najran"},
    {"id": "65", "name": "Jizan",          "name_ar": "جازان",           "slug": "jizan"},
    {"id": "69", "name": "Yanbu",          "name_ar": "ينبع",            "slug": "yanbu"},
    {"id": "46", "name": "Al Ahsa",        "name_ar": "الأحساء",         "slug": "al-ahsa"},
    {"id": "52", "name": "Buraidah",       "name_ar": "بريدة",           "slug": "buraidah"},
    {"id": "26", "name": "Taif",           "name_ar": "الطائف",          "slug": "taif"},
    {"id": "70", "name": "Khamis Mushait", "name_ar": "خميس مشيط",       "slug": "khamis-mushait"},
    {"id": "8",  "name": "Al Jubail",      "name_ar": "الجبيل",          "slug": "al-jubail"},
]

_PROPERTY_TYPES = [
    {"id": "1",  "slug": "apartment",  "name": "Apartment",  "name_ar": "شقة"},
    {"id": "2",  "slug": "villa",      "name": "Villa",      "name_ar": "فيلا"},
    {"id": "3",  "slug": "floor",      "name": "Floor",      "name_ar": "دور"},
    {"id": "4",  "slug": "land",       "name": "Land",       "name_ar": "أرض"},
    {"id": "5",  "slug": "office",     "name": "Office",     "name_ar": "مكتب"},
    {"id": "6",  "slug": "shop",       "name": "Shop",       "name_ar": "محل"},
    {"id": "7",  "slug": "warehouse",  "name": "Warehouse",  "name_ar": "مستودع"},
    {"id": "8",  "slug": "building",   "name": "Building",   "name_ar": "عمارة"},
    {"id": "9",  "slug": "rest-house", "name": "Rest House", "name_ar": "استراحة"},
    {"id": "10", "slug": "farm",       "name": "Farm",       "name_ar": "مزرعة"},
    {"id": "11", "slug": "studio",     "name": "Studio",     "name_ar": "استوديو"},
    {"id": "12", "slug": "townhouse",  "name": "Townhouse",  "name_ar": "تاون هاوس"},
    {"id": "13", "slug": "duplex",     "name": "Duplex",     "name_ar": "دوبلكس"},
    {"id": "14", "slug": "penthouse",  "name": "Penthouse",  "name_ar": "بنتهاوس"},
    {"id": "15", "slug": "compound",   "name": "Compound",   "name_ar": "مجمع"},
]

# ── In-memory search cache (30 min TTL) ──────────────────────────────────────
_SEARCH_CACHE: dict = {}  # key → (timestamp, List[dict])
_CACHE_TTL = 30 * 24 * 3600  # 30 days

_RSC_HEADERS = {
    "RSC": "1",
    "Accept": "text/x-component, */*",
    "Accept-Language": "ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": BASE + "/",
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
}


def _extract_listings(text: str) -> list:
    clean = text.replace('\\"', '"')
    matches = list(re.finditer(r'\{"id":\d+,"sov_campaign_id"', clean))
    listings, seen = [], set()
    for m in matches:
        start = m.start()
        depth, end = 0, start
        for i, ch in enumerate(clean[start:], start):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        try:
            obj = json.loads(clean[start:end])
            lid = obj.get("id")
            if lid and lid not in seen:
                seen.add(lid)
                listings.append(obj)
        except Exception:
            pass
    return listings


def _total_pages(text: str, cap: int = 2000) -> int:
    """Return actual page count from RSC total field, capped at `cap` (safety limit)."""
    m = re.search(r'"total"\s*:\s*(\d+)', text)
    if m:
        total = int(m.group(1))
        return min(cap, max(1, (total + 19) // 20))
    return 5


class AqarScraper(BaseScraper):
    platform_name = "aqar"
    base_url = BASE

    # ------------------------------------------------------------------ #
    #  Cities / Areas / Property Types  (Playwright — cached, rarely called)
    # ------------------------------------------------------------------ #

    async def get_cities(self) -> List[City]:
        playwright, browser, context, page = await self._create_session()
        try:
            await self._goto_with_retry(page, BASE)
            cities_raw = await page.evaluate("""
async () => {
    try {
        const resp = await fetch('/next-api/cities');
        const data = await resp.json();
        return data.data || [];
    } catch(e) { return []; }
}
""")
            if cities_raw:
                cities = []
                for item in cities_raw:
                    name = item.get("name_en") or item.get("name") or ""
                    name_ar = item.get("name") if not item.get("name_en") else item.get("name", "")
                    if name:
                        cities.append(City(
                            id=str(item.get("id", "")),
                            name=name,
                            name_ar=name_ar,
                            slug=item.get("path_en") or item.get("path"),
                            platform=self.platform_name,
                        ))
                if cities:
                    logger.info("[aqar] Got %d cities from API", len(cities))
                    return cities
        except Exception as exc:
            logger.error("[aqar] get_cities error: %s", exc)
        finally:
            await self._close_session(playwright, browser)

        return [
            City(id=c["id"], name=c["name"], name_ar=c["name_ar"],
                 slug=c["slug"], platform=self.platform_name)
            for c in _CITIES_FALLBACK
        ]

    async def get_areas(self, city: str) -> List[Area]:
        playwright, browser, context, page = await self._create_session()
        try:
            cid = str(_CITY_ID_MAP.get(city.lower().strip(), ""))
            await self._goto_with_retry(page, BASE)
            districts_raw = await page.evaluate(f"""
async () => {{
    try {{
        const resp = await fetch('/next-api/districts?city_id={cid}');
        const data = await resp.json();
        return data.data || [];
    }} catch(e) {{ return []; }}
}}
""")
            if districts_raw:
                areas = []
                for item in districts_raw:
                    name = item.get("name_en") or item.get("name") or ""
                    if name:
                        areas.append(Area(
                            id=str(item.get("id", "")),
                            name=name,
                            name_ar=item.get("name"),
                            slug=item.get("path_en") or item.get("path"),
                            city=city,
                            platform=self.platform_name,
                        ))
                if areas:
                    logger.info("[aqar] Got %d areas for %s from API", len(areas), city)
                    return areas
        except Exception as exc:
            logger.error("[aqar] get_areas error: %s", exc)
        finally:
            await self._close_session(playwright, browser)

        static = get_static_areas(city)
        if static:
            return [
                Area(id=a["id"], name=a["name"], name_ar=a["name_ar"],
                     slug=a["slug"], city=city, platform=self.platform_name)
                for a in static
            ]
        return []

    async def get_property_types(self) -> List[PropertyType]:
        return [
            PropertyType(id=pt["id"], slug=pt["slug"], name=pt["name"],
                         name_ar=pt["name_ar"], platform=self.platform_name)
            for pt in _PROPERTY_TYPES
        ]

    # ------------------------------------------------------------------ #
    #  Search — RSC + curl_cffi (no browser, 19k+ results)               #
    # ------------------------------------------------------------------ #

    def _build_url(self, request: SearchRequest):
        """Return (city_base, qs, cache_key) for a search request."""
        city_str = (request.city or "riyadh").strip().lower()
        city_ar  = _CITIES_AR.get(city_str, "الرياض")
        pt       = (request.property_type or "").strip().lower()
        cat_slug = _SLUGS_AR.get((pt, request.purpose), "عقارات") if pt else "عقارات"
        qs_parts = []
        if request.rooms is not None:
            qs_parts.append(f"beds={int(request.rooms)}")
        if request.bathrooms is not None:
            qs_parts.append(f"wc={int(request.bathrooms)}")
        qs        = ("?" + "&".join(qs_parts)) if qs_parts else ""
        city_base = f"{BASE}/{quote(cat_slug)}/{quote(city_ar)}"
        if request.area:
            area_slug = request.area.lower().strip().replace(" ", "-")
            area_ar = _AREAS_AR.get(area_slug, area_slug)
            city_base = f"{city_base}/{quote(area_ar)}"
        cache_key = f"{city_str}:{cat_slug}:{request.area or ''}:{qs}"
        return city_base, qs, cache_key

    async def _make_sessions(self):
        _IMPERS = [
            "chrome107", "chrome110", "chrome120", "chrome124",
            "safari15_3", "safari17_0",
        ]
        sessions      = [AsyncSession(impersonate=imp) for imp in _IMPERS]
        sem           = asyncio.Semaphore(30)
        ctr           = [0]
        throttle_lock = asyncio.Lock()
        throttle_ts   = [0.0]
        rate          = 10.0  # req/sec

        async def _get(url: str):
            async with throttle_lock:
                now   = asyncio.get_event_loop().time()
                delay = throttle_ts[0] + (1.0 / rate) - now
                if delay > 0:
                    await asyncio.sleep(delay)
                throttle_ts[0] = asyncio.get_event_loop().time()
            idx = ctr[0] % len(sessions)
            ctr[0] += 1
            async with sem:
                for attempt in range(3):
                    try:
                        r = await sessions[idx].get(url, headers=_RSC_HEADERS, timeout=25)
                        if r.status_code == 200:
                            return r
                        if r.status_code == 429:
                            wait = 3.0 * (attempt + 1)
                            logger.warning("[aqar] 429 — waiting %.0fs (attempt %d)", wait, attempt + 1)
                            await asyncio.sleep(wait)
                            idx = (idx + 1) % len(sessions)
                            continue
                        logger.warning("[aqar] status=%d for %s", r.status_code, url)
                        return None
                    except Exception as exc:
                        logger.warning("[aqar] attempt %d error %s: %s", attempt + 1, url, exc)
                        if attempt < 2:
                            await asyncio.sleep(2.0 * (attempt + 1))
                return None

        return sessions, _get

    async def _fetch_url_pages(self, base_url: str, qs: str, _get) -> List[dict]:
        """Fetch ALL pages for a URL in chunks with retry passes. Returns raw item dicts."""
        r0 = await _get(f"{base_url}{qs}")
        if r0 is None:
            logger.warning("[aqar] probe failed: %s", base_url)
            return []

        items0 = _extract_listings(r0.text)
        pages  = _total_pages(r0.text, cap=2000)
        all_raw: List[dict] = list(items0)
        logger.info("[aqar] %s → %d pages, %d p1 items", base_url, pages, len(items0))

        if pages <= 1:
            return all_raw

        missing = list(range(2, pages + 1))
        CHUNK   = 40

        for pass_num in range(4):
            if not missing:
                break
            if pass_num > 0:
                wait = 10.0 * pass_num
                logger.info(
                    "[aqar] retry pass %d for %s: %d pages, waiting %.0fs",
                    pass_num + 1, base_url.split("/")[-1], len(missing), wait,
                )
                await asyncio.sleep(wait)

            fetched, still_missing = 0, []
            for i in range(0, len(missing), CHUNK):
                chunk   = missing[i : i + CHUNK]
                urls    = [f"{base_url}/{p}{qs}" for p in chunk]
                resps   = await asyncio.gather(*[_get(u) for u in urls], return_exceptions=True)
                for p, resp in zip(chunk, resps):
                    if isinstance(resp, Exception) or resp is None:
                        still_missing.append(p)
                    else:
                        all_raw.extend(_extract_listings(resp.text))
                        fetched += 1

            logger.info(
                "[aqar] pass %d: %d/%d pages fetched, %d still missing",
                pass_num + 1, fetched, len(missing), len(still_missing),
            )
            missing = still_missing

        if missing:
            logger.warning("[aqar] gave up on %d/%d pages", len(missing), pages - 1)

        return all_raw

    async def stream_properties(self, request: SearchRequest):
        """Async generator — yields List[Property] in batches as pages are fetched."""
        city_base, qs, cache_key = self._build_url(request)

        # Cache hit — yield all at once instantly
        cached = _SEARCH_CACHE.get(cache_key)
        if cached and (_time.time() - cached[0]) < _CACHE_TTL:
            logger.info("[aqar] stream: cache hit → %d items", len(cached[1]))
            props = [p for p in (self._parse_item(i, request) for i in cached[1]) if p]
            if props:
                yield props
            return

        sessions, _get = await self._make_sessions()
        try:
            # Probe page 1
            r0 = await _get(f"{city_base}{qs}")
            if r0 is None:
                logger.warning("[aqar] stream: probe failed")
                return

            items0 = _extract_listings(r0.text)
            pages  = _total_pages(r0.text, cap=2000)
            all_raw: List[dict] = list(items0)

            logger.info("[aqar] stream: %d pages, yielding batches of 25", pages)

            # Yield first page immediately
            props0 = [p for p in (self._parse_item(i, request) for i in items0) if p]
            if props0:
                yield props0

            # Fetch remaining pages in batches of 25, yield each batch
            pending = [f"{city_base}/{p}{qs}" for p in range(2, pages + 1)]
            STREAM_BATCH = 25

            for i in range(0, len(pending), STREAM_BATCH):
                chunk = pending[i : i + STREAM_BATCH]
                responses = await asyncio.gather(*[_get(u) for u in chunk], return_exceptions=True)

                batch_raw = []
                for resp in responses:
                    if isinstance(resp, Exception) or resp is None:
                        continue
                    page_items = _extract_listings(resp.text)
                    batch_raw.extend(page_items)
                    all_raw.extend(page_items)

                if batch_raw:
                    props = [p for p in (self._parse_item(i, request) for i in batch_raw) if p]
                    if props:
                        yield props

            # Cache final deduplicated raw items
            seen: set = set()
            unique: List[dict] = []
            for item in all_raw:
                lid = item.get("id")
                if lid and lid not in seen:
                    seen.add(lid)
                    unique.append(item)
            _SEARCH_CACHE[cache_key] = (_time.time(), unique)
            logger.info("[aqar] stream: cached %d unique items", len(unique))

        finally:
            for s in sessions:
                try:
                    await s.close()
                except Exception:
                    pass

    async def search_properties(self, request: SearchRequest) -> List[Property]:
        city_base, qs, cache_key = self._build_url(request)

        # Cache hit
        cached = _SEARCH_CACHE.get(cache_key)
        if cached and (_time.time() - cached[0]) < _CACHE_TTL:
            logger.info("[aqar] cache hit → %d raw items", len(cached[1]))
            unique = cached[1]
        else:
            sessions, _get = await self._make_sessions()
            try:
                city_str   = (request.city or "riyadh").strip().lower()
                pt         = (request.property_type or "").strip().lower()
                # Sub-regions only for generic (no property_type) searches
                subregions = _SUBREGIONS.get(city_str, []) if not pt else []

                url_bases = [city_base] + [
                    f"{BASE}/{quote('عقارات')}/{quote(sr)}" for sr in subregions
                ]
                labels = ["main"] + list(subregions)

                # ── Sequential fetch: each source gets the full rate budget ──
                # Running concurrently triggers Aqar's rate limiter and yields
                # fewer results than fetching one source at a time.
                all_raw: List[dict] = []
                for label, base in zip(labels, url_bases):
                    try:
                        result = await self._fetch_url_pages(base, qs, _get)
                        all_raw.extend(result)
                        logger.info(
                            "[aqar] %s → %d items (running total: %d)",
                            label, len(result), len(all_raw),
                        )
                    except Exception as exc:
                        logger.warning("[aqar] %s failed: %s", label, exc)

                # ── Beds segmentation: fill gaps in the main URL ──────────────
                # For large cities without a rooms filter, the main URL can have
                # 1,600+ pages and some fail under rate limiting. Fetching each
                # beds segment separately (only 150-300 pages each) covers those
                # missing listings since beds is a server-side Aqar filter.
                _SEGMENT_CITIES = {"jeddah", "riyadh", "dammam", "khobar", "al khobar"}
                if not pt and request.rooms is None and city_str in _SEGMENT_CITIES:
                    for beds_n in range(1, 7):
                        beds_qs = f"?beds={beds_n}"
                        try:
                            result = await self._fetch_url_pages(city_base, beds_qs, _get)
                            all_raw.extend(result)
                            logger.info(
                                "[aqar] beds=%d → %d items (running total: %d)",
                                beds_n, len(result), len(all_raw),
                            )
                        except Exception as exc:
                            logger.warning("[aqar] beds=%d failed: %s", beds_n, exc)

            finally:
                for s in sessions:
                    try:
                        await s.close()
                    except Exception:
                        pass

            seen_ids: set = set()
            unique: List[dict] = []
            for item in all_raw:
                lid = item.get("id")
                if lid and lid not in seen_ids:
                    seen_ids.add(lid)
                    unique.append(item)

            _SEARCH_CACHE[cache_key] = (_time.time(), unique)
            logger.info("[aqar] cached %d unique items (TTL %ds)", len(unique), _CACHE_TTL)

        logger.info("[aqar] %d unique items before filtering", len(unique))
        properties = [p for p in (self._parse_item(item, request) for item in unique) if p]
        logger.info("[aqar] Done — %d properties", len(properties))
        return properties

    # ------------------------------------------------------------------ #
    #  Helpers                                                            #
    # ------------------------------------------------------------------ #

    def _parse_item(self, item: dict, request: SearchRequest) -> Optional[Property]:
        title = item.get("title") or ""
        if not title:
            return None

        price = item.get("price")
        if price is not None:
            try:
                price = float(price)
            except (TypeError, ValueError):
                price = None

        # Client-side filters
        if request.price_min is not None and price is not None and price < request.price_min:
            return None
        if request.price_max is not None and price is not None and price > request.price_max:
            return None

        beds = item.get("beds")
        if beds is not None:
            try:
                beds = int(beds)
            except (TypeError, ValueError):
                beds = None
        if request.rooms is not None and beds is not None and beds != request.rooms:
            return None

        wc = item.get("wc")
        if wc is not None:
            try:
                wc = int(wc)
            except (TypeError, ValueError):
                wc = None
        if request.bathrooms is not None and wc is not None and wc != request.bathrooms:
            return None

        area_m2 = item.get("area")
        if area_m2 is not None:
            try:
                area_m2 = float(area_m2)
            except (TypeError, ValueError):
                area_m2 = None
        if request.size_min is not None and area_m2 is not None and area_m2 < request.size_min:
            return None
        if request.size_max is not None and area_m2 is not None and area_m2 > request.size_max:
            return None

        geo = item.get("location") or {}
        lat = geo.get("lat") if isinstance(geo, dict) else None
        lng = geo.get("lng") if isinstance(geo, dict) else None

        path = item.get("path") or ""
        listing_url = f"{BASE}{path}" if path else None
        listing_id  = str(item.get("id", "")) or None

        main_img = item.get("mainImage") or (item.get("imgs") or [None])[0]
        images = [f"https://images.aqar.fm/webp/750x0/props/{main_img}"] if main_img else []

        period_text = item.get("rent_period_text") or ""
        price_period = None
        if "سنوي" in period_text:
            price_period = "yearly"
        elif "شهري" in period_text:
            price_period = "monthly"

        location_str = (
            item.get("address_text")
            or item.get("district")
            or item.get("city")
            or request.city
        )

        user_obj = item.get("user") or {}
        user_id  = item.get("user_id") or ""
        b_name   = user_obj.get("name") or user_obj.get("company_name") or None
        b_agency = user_obj.get("company_name") or None
        raw_logo = user_obj.get("company_logo") or user_obj.get("img") or ""
        b_photo  = (
            f"https://images.aqar.fm/{raw_logo}"
            if raw_logo and not str(raw_logo).startswith("http")
            else (raw_logo or None)
        )
        b_url = f"{BASE}/user/{user_id}" if user_id else None
        broker = Broker(
            name=b_name, agency=b_agency, agency_logo=b_photo, profile_url=b_url
        ) if (b_name or b_agency) else None

        return Property(
            id=listing_id,
            platform=self.platform_name,
            title=title,
            property_type=request.property_type,
            purpose=request.purpose,
            price=price,
            price_period=price_period,
            size_sqm=area_m2,
            rooms=beds,
            bathrooms=wc,
            city=request.city,
            area=request.area,
            location=location_str,
            latitude=float(lat) if lat is not None else None,
            longitude=float(lng) if lng is not None else None,
            images=images,
            broker=broker,
            listing_url=listing_url,
            reference_number=listing_id,
        )
