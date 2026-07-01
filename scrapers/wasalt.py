"""
Wasalt scraper  —  https://wasalt.sa

search_properties fetches HTML pages via curl_cffi (safari15_3 TLS impersonation)
and extracts listings from the __NEXT_DATA__ JSON embedded in each page.
No Playwright / browser needed — curl_cffi's TLS fingerprint bypasses Cloudflare.

get_cities / get_areas still use headed Chrome via BaseScraper._create_session().
"""

import asyncio
import json
import logging
import re
from typing import List, Optional
from urllib.parse import quote

from curl_cffi.requests import AsyncSession

from data.areas import get_static_areas
from models.property import City, Area, PropertyType, Property, Broker
from models.search import SearchRequest
from scrapers.area_match import area_matches as _area_matches
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

BASE         = "https://wasalt.sa"
_IMG_CDN     = "https://imagedelivery.net/1DNKFJPRaeUdy_j8F7HT3w/production/properties"

# ── Property type → URL slug ──────────────────────────────────────────────────
_TYPES: dict = {
    "apartment":   "apartments",
    "villa":       "villas",
    "house":       "houses",
    "land":        "land",
    "office":      "offices",
    "commercial":  "commercial",
    "residential": "buildings",
    "building":    "buildings",
}

# ── City name → URL slug ──────────────────────────────────────────────────────
_CITY_SLUGS: dict = {
    "riyadh":    "riyadh",
    "jeddah":    "jeddah",
    "mecca":     "makkah",
    "medina":    "madinah",
    "dammam":    "dammam",
    "khobar":    "al-khobar",
    "al khobar": "al-khobar",
    "abha":      "abha",
    "tabuk":     "tabuk",
    "hail":      "hail",
    "buraidah":  "buraidah",
    "taif":      "al-taif",
    "al taif":   "al-taif",
    "yanbu":     "yanbu",
    "najran":    "najran",
    "jazan":     "jazan",
}

# ── Wasalt city IDs (for get_cities / get_areas Playwright session) ───────────
_WASALT_CITY_IDS: dict = {
    "riyadh": 273, "jeddah": 274, "mecca": 275, "makkah": 275,
    "medina": 276, "al madinah": 276, "dammam": 328,
    "al khobar": 332, "khobar": 332, "tabuk": 323, "abha": 329,
    "hail": 325, "jizan": 330, "jazan": 330, "najran": 360,
    "yanbu": 292, "taif": 324, "khamis mushait": 334,
    "buraidah": 326, "al ahsa": 379, "ahsa": 379,
}

_CITIES_FALLBACK = [
    {"id": "1",  "name": "Riyadh",        "name_ar": "الرياض",         "slug": "riyadh"},
    {"id": "2",  "name": "Jeddah",        "name_ar": "جدة",            "slug": "jeddah"},
    {"id": "3",  "name": "Mecca",         "name_ar": "مكة المكرمة",    "slug": "mecca"},
    {"id": "4",  "name": "Medina",        "name_ar": "المدينة المنورة","slug": "medina"},
    {"id": "5",  "name": "Dammam",        "name_ar": "الدمام",         "slug": "dammam"},
    {"id": "6",  "name": "Al Khobar",     "name_ar": "الخبر",          "slug": "al-khobar"},
    {"id": "7",  "name": "Tabuk",         "name_ar": "تبوك",           "slug": "tabuk"},
    {"id": "8",  "name": "Abha",          "name_ar": "أبها",           "slug": "abha"},
    {"id": "9",  "name": "Hail",          "name_ar": "حائل",           "slug": "hail"},
    {"id": "10", "name": "Jizan",         "name_ar": "جازان",          "slug": "jizan"},
    {"id": "11", "name": "Yanbu",         "name_ar": "ينبع",           "slug": "yanbu"},
    {"id": "12", "name": "Al Ahsa",       "name_ar": "الأحساء",        "slug": "al-ahsa"},
    {"id": "13", "name": "Najran",        "name_ar": "نجران",          "slug": "najran"},
    {"id": "14", "name": "Buraidah",      "name_ar": "بريدة",          "slug": "buraidah"},
    {"id": "15", "name": "Taif",          "name_ar": "الطائف",         "slug": "taif"},
    {"id": "16", "name": "Khamis Mushait","name_ar": "خميس مشيط",     "slug": "khamis-mushait"},
]

_PROPERTY_TYPES = [
    {"id": "1",  "slug": "apartment",  "name": "Apartment",  "name_ar": "شقة"},
    {"id": "2",  "slug": "villa",      "name": "Villa",      "name_ar": "فيلا"},
    {"id": "3",  "slug": "office",     "name": "Office",     "name_ar": "مكتب"},
    {"id": "4",  "slug": "shop",       "name": "Shop",       "name_ar": "محل"},
    {"id": "5",  "slug": "land",       "name": "Land",       "name_ar": "أرض"},
    {"id": "6",  "slug": "floor",      "name": "Floor",      "name_ar": "دور"},
    {"id": "7",  "slug": "building",   "name": "Building",   "name_ar": "عمارة"},
    {"id": "8",  "slug": "warehouse",  "name": "Warehouse",  "name_ar": "مستودع"},
    {"id": "9",  "slug": "rest-house", "name": "Rest House", "name_ar": "استراحة"},
    {"id": "10", "slug": "farm",       "name": "Farm",       "name_ar": "مزرعة"},
    {"id": "11", "slug": "studio",     "name": "Studio",     "name_ar": "استوديو"},
    {"id": "12", "slug": "townhouse",  "name": "Townhouse",  "name_ar": "تاون هاوس"},
    {"id": "13", "slug": "duplex",     "name": "Duplex",     "name_ar": "دوبلكس"},
    {"id": "14", "slug": "penthouse",  "name": "Penthouse",  "name_ar": "بنتهاوس"},
]


class WasaltScraper(BaseScraper):
    platform_name = "wasalt"
    base_url = BASE

    # ------------------------------------------------------------------ #
    #  Cities / Areas / Property Types                                    #
    # ------------------------------------------------------------------ #

    async def get_cities(self) -> List[City]:
        playwright, browser, context, page = await self._create_session()
        captured: List[dict] = []

        async def on_response(response):
            url = response.url
            if response.status == 200 and any(
                kw in url for kw in ["cities", "locations", "city", "regions", "areas"]
            ):
                try:
                    data = await response.json()
                    items = (
                        data.get("data", data.get("cities", data.get("results", data)))
                        if isinstance(data, dict) else data
                    )
                    if isinstance(items, list) and len(items) > 0:
                        captured.extend(items)
                except Exception:
                    pass

        page.on("response", on_response)
        try:
            await self._goto_with_retry(page, f"{BASE}/en")
            try:
                sel = 'input[placeholder*="city"], input[placeholder*="location"], [class*="city"] input, [class*="search"] input'
                await page.wait_for_selector(sel, timeout=8000)
                await page.click(sel)
                await self._human_delay(1500, 2500)
            except Exception:
                pass
            await self._human_delay(1000, 2000)
            if captured:
                cities = []
                for item in captured:
                    name    = item.get("nameEn") or item.get("name_en") or item.get("name") or ""
                    name_ar = item.get("nameAr") or item.get("name_ar") or ""
                    if name or name_ar:
                        cities.append(City(
                            id=str(item.get("id", "")),
                            name=name or name_ar,
                            name_ar=name_ar,
                            slug=item.get("slug", item.get("code")),
                            platform=self.platform_name,
                        ))
                if cities:
                    logger.info("[wasalt] Scraped %d cities from API", len(cities))
                    return cities
        except Exception as exc:
            logger.error("[wasalt] get_cities error: %s", exc)
        finally:
            await self._close_session(playwright, browser)

        return [
            City(id=c["id"], name=c["name"], name_ar=c["name_ar"],
                 slug=c["slug"], platform=self.platform_name)
            for c in _CITIES_FALLBACK
        ]

    async def get_areas(self, city: str) -> List[Area]:
        playwright, browser, context, page = await self._create_session()
        captured: List[dict] = []

        async def on_response(response):
            url = response.url
            if response.status == 200 and any(
                kw in url for kw in ["districts", "areas", "neighborhood", "location"]
            ):
                try:
                    data = await response.json()
                    items = (
                        data.get("data", data.get("districts", data.get("areas", data)))
                        if isinstance(data, dict) else data
                    )
                    if isinstance(items, list):
                        captured.extend(items)
                except Exception:
                    pass

        page.on("response", on_response)
        try:
            url = f"{BASE}/en/search?city={quote(city)}&lang=en"
            await self._goto_with_retry(page, url)
            try:
                sel = '[class*="district"] input, input[placeholder*="district"], input[placeholder*="area"]'
                await page.wait_for_selector(sel, timeout=8000)
                await page.click(sel)
                await self._human_delay(1500, 2500)
            except Exception:
                pass
            await self._human_delay(1000, 2000)
            areas = []
            for item in captured:
                name    = item.get("nameEn") or item.get("name_en") or item.get("name") or ""
                name_ar = item.get("nameAr") or item.get("name_ar") or ""
                if (name or name_ar) and name.lower() != city.lower():
                    areas.append(Area(
                        id=str(item.get("id", "")),
                        name=name or name_ar,
                        name_ar=name_ar,
                        slug=item.get("slug", item.get("code")),
                        city=city,
                        platform=self.platform_name,
                    ))
            if areas:
                return areas
        except Exception as exc:
            logger.error("[wasalt] get_areas error: %s", exc)
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
    #  Search — curl_cffi HTML scraping + __NEXT_DATA__ (CF-bypassed)    #
    # ------------------------------------------------------------------ #

    async def search_properties(self, request: SearchRequest) -> List[Property]:
        max_pages = getattr(request, "max_pages", 340)
        # Area searches filter client-side (Wasalt's districtSlug param is ignored),
        # so we sample a fixed slice of the city's pages — enough to surface the
        # target district while keeping the request responsive (~30-40s).
        if request.area:
            max_pages = 25

        city_str = (request.city or "riyadh").strip().lower()
        city_slug = _CITY_SLUGS.get(city_str, city_str.replace(" ", "-"))
        city_id = _WASALT_CITY_IDS.get(city_str)
        pt = (request.property_type or "").lower()
        purpose = "sale" if request.purpose == "for-sale" else "rent"

        # Use the correct search API URL (returns 12,714 results vs slug URL's 30)
        if city_id:
            base_params = f"propertyFor={purpose}&countryId=1&cityId={city_id}"
        else:
            base_params = f"propertyFor={purpose}&countryId=1&slug={city_slug}"

        # Wasalt type codes: apartment, villa, land, office, commercial, building
        _WASALT_TYPES = {
            "apartment": "apartment", "villa": "villa", "house": "villa",
            "land": "land", "office": "office", "commercial": "commercial",
            "building": "building", "residential": "residential",
        }
        if pt and pt in _WASALT_TYPES:
            base_params += f"&type={_WASALT_TYPES[pt]}"
        if request.area:
            area_slug = request.area.lower().strip().replace(" ", "-")
            base_params += f"&districtSlug={area_slug}"

        base_url = f"{BASE}/en/{purpose}/search?{base_params}"

        hdrs = {
            "Accept":          "text/html,application/xhtml+xml,*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer":         BASE + "/en/",
        }

        seen_ids:   set         = set()
        properties: List[Property] = []

        logger.info("[wasalt] Fetching %s (max_pages=%d)", base_url, max_pages)

        # Probe impersonations until one works (Docker/Linux may need chrome instead of safari)
        _IMPERSONATIONS = ["safari15_3", "chrome120", "chrome124", "safari17_0"]
        working_imp = "safari15_3"
        r1 = None
        for imp in _IMPERSONATIONS:
            try:
                async with AsyncSession(impersonate=imp) as s:
                    r1 = await s.get(base_url, headers=hdrs, timeout=45)
                if r1.status_code == 200:
                    working_imp = imp
                    break
                logger.warning("[wasalt] %s → HTTP %d", imp, r1.status_code)
                r1 = None
            except Exception as exc:
                logger.warning("[wasalt] %s failed: %s", imp, exc)
                r1 = None

        if r1 is None:
            logger.error("[wasalt] page 1 failed with all impersonations")
            return []

        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', r1.text, re.S)
        if not m:
            logger.error("[wasalt] no __NEXT_DATA__ on page 1")
            return []

        data0       = json.loads(m.group(1))
        sr0         = data0.get("props", {}).get("pageProps", {}).get("searchResult", {})
        props0      = sr0.get("properties", []) if isinstance(sr0, dict) else []
        total_pages = int(sr0.get("totalPages") or 1)
        total_pages = min(total_pages, max_pages, 400)

        logger.info("[wasalt] %s total listings, %d pages (using %s)",
                    sr0.get("count", "?"), total_pages, working_imp)

        for prop in self._parse_wasalt_props(props0, seen_ids, purpose, city_slug, request):
            properties.append(prop)

        # ── Remaining pages — all fetched concurrently under a semaphore ──────
        # (Sequential batches of 20 took ~10 min for a 340-page city and blew
        # past the frontend's 5-min timeout, so Wasalt showed as failed. A
        # 40-slot semaphore fetches everything at once and finishes in ~2 min.)
        CONCURRENCY = 40
        sem = asyncio.Semaphore(CONCURRENCY)

        async def _fetch_page(session, pg: int):
            async with sem:
                try:
                    return await session.get(f"{base_url}&page={pg}", headers=hdrs, timeout=30)
                except Exception:
                    return None

        async with AsyncSession(impersonate=working_imp) as session:
            responses = await asyncio.gather(
                *[_fetch_page(session, pg) for pg in range(2, total_pages + 1)],
                return_exceptions=True,
            )
            for resp in responses:
                if isinstance(resp, Exception) or resp is None:
                    continue
                if resp.status_code != 200:
                    continue
                m2 = re.search(
                    r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',
                    resp.text, re.S,
                )
                if not m2:
                    continue
                data2  = json.loads(m2.group(1))
                sr2    = data2.get("props", {}).get("pageProps", {}).get("searchResult", {})
                props2 = sr2.get("properties", []) if isinstance(sr2, dict) else []
                for prop in self._parse_wasalt_props(
                    props2, seen_ids, purpose, city_slug, request
                ):
                    properties.append(prop)

        logger.info("[wasalt] Done — %d properties", len(properties))
        return properties

    # ------------------------------------------------------------------ #
    #  Helpers                                                            #
    # ------------------------------------------------------------------ #

    def _parse_wasalt_props(
        self,
        raw:       list,
        seen_ids:  set,
        purpose:   str,
        city_slug: str,
        request:   SearchRequest,
    ) -> List[Property]:
        results: List[Property] = []

        flat_raw: list = []
        for item in raw:
            if isinstance(item, list):
                flat_raw.extend(item)
            elif isinstance(item, dict):
                flat_raw.append(item)

        for p in flat_raw:
            pi    = p.get("propertyInfo") or p
            loc   = p.get("location") or {}
            _own  = p.get("propertyOwner") or p.get("owner") or {}
            owner = _own if isinstance(_own, dict) else (_own[0] if isinstance(_own, list) and _own else {})
            files = p.get("propertyFiles") or {}
            attrs = {
                a["key"]: a["value"]
                for a in (p.get("attributes") or [])
                if isinstance(a, dict) and "key" in a
            }

            prop_id = str(p.get("id") or p.get("propertyId") or "")
            if not prop_id or prop_id in seen_ids:
                continue
            seen_ids.add(prop_id)

            title = pi.get("title") or p.get("title")
            if not title:
                continue

            if purpose == "rent":
                price = (
                    pi.get("expectedRent") or pi.get("conversionPrice")
                    or p.get("price") or p.get("rentPrice")
                )
            else:
                price = (
                    pi.get("salePrice") or pi.get("conversionPrice")
                    or p.get("price") or p.get("salePrice")
                )

            freq_raw     = str(pi.get("expectedRentType") or p.get("rentType") or "").lower()
            price_period = None
            if purpose == "rent":
                price_period = "yearly" if "year" in freq_raw else "monthly" if "month" in freq_raw else "yearly"

            ld  = (
                pi.get("address") or pi.get("district") or pi.get("zone")
                or p.get("district") or p.get("address") or request.city
            )
            lat_raw = loc.get("lat") or p.get("lat")
            lng_raw = loc.get("lon") or loc.get("lng") or p.get("lng")
            lat = float(lat_raw) if lat_raw else None
            lng = float(lng_raw) if lng_raw else None

            imgs = files.get("images") if isinstance(files, dict) else (p.get("images") or [])
            # Correct format: /{prop_id}/images/{uuid}.jpg/width=500,quality=60,format=auto
            image_url = f"{_IMG_CDN}/{prop_id}/images/{imgs[0]}/width=500,quality=60,format=auto" if imgs and prop_id else ""

            phone         = (
                owner.get("phone") or owner.get("whatsApp")
                or (p.get("contactDetails") or {}).get("phoneNumber")
                or p.get("phone")
            )
            broker_name   = (
                owner.get("enName") or owner.get("name")
                or owner.get("fullName") or p.get("brokerName")
            )
            broker_agency = (
                owner.get("companyName")
                or (owner.get("company") or {}).get("name")
                or owner.get("agencyName") or p.get("agencyName")
            )
            owner_slug  = owner.get("slug") or ""
            broker_url  = f"{BASE}/en/agents/{owner_slug}" if owner_slug else None

            broker = Broker(
                name=broker_name,
                phone=phone,
                agency=broker_agency,
                profile_url=broker_url,
            ) if (broker_name or phone) else None

            slug       = pi.get("slug") or p.get("slug")
            source_url = (
                f"{BASE}/en/property/{slug}" if slug
                else f"{BASE}/en/property/{prop_id}" if prop_id
                else f"{BASE}/en/{_TYPES.get(request.property_type or '', 'properties') if request.property_type else 'properties'}-for-{purpose}-in-{city_slug}"
            )

            price_float = float(price) if price is not None else None
            if request.price_min and price_float and price_float < request.price_min:
                continue
            if request.price_max and price_float and price_float > request.price_max:
                continue

            def _int_safe(v) -> Optional[int]:
                try:
                    return int(str(v).replace("+", "").strip())
                except (TypeError, ValueError):
                    return None

            beds  = _int_safe(attrs.get("noOfBedrooms") or p.get("bedrooms"))
            baths = _int_safe(attrs.get("noOfBathrooms") or p.get("bathrooms"))
            area_val = attrs.get("builtUpArea") or p.get("area")

            if request.rooms is not None and beds is not None and beds != request.rooms:
                continue
            if request.bathrooms is not None and baths is not None and baths != request.bathrooms:
                continue

            # ── Area guard: Wasalt's districtSlug URL param doesn't filter, so we
            #    match the property's own (English) district name client-side. ──
            prop_district = (
                pi.get("district") or p.get("district") or p.get("zone") or ""
            )
            if request.area and not _area_matches(request.area, str(prop_district)):
                continue  # Different district — skip

            results.append(Property(
                id=prop_id,
                platform=self.platform_name,
                title=str(title),
                property_type=request.property_type,
                purpose=request.purpose,
                price=price_float,
                price_period=price_period,
                size_sqm=float(area_val) if area_val is not None else None,
                rooms=beds,
                bathrooms=baths,
                city=request.city,
                area=(prop_district or request.area),
                location=str(ld) if ld else None,
                latitude=lat,
                longitude=lng,
                images=[image_url] if image_url else [],
                broker=broker,
                listing_url=source_url,
                reference_number=prop_id,
            ))

        return results
