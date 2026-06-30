"""
Bayut Saudi Arabia scraper  —  https://www.bayut.sa

search_properties uses Bayut's public Algolia API directly (httpx POST).
No browser / Playwright needed — Algolia is a plain REST endpoint that
doesn't trigger Cloudflare TLS checks.

get_cities / get_areas still use headed Chrome via BaseScraper._create_session()
because the Bayut location API requires a page load to trigger the request.
"""

import asyncio
import logging
from typing import List, Optional

import httpx

from data.areas import get_static_areas
from models.property import City, Area, PropertyType, Property, Broker
from models.search import SearchRequest
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

BASE = "https://www.bayut.sa"

# ── Bayut public Algolia credentials (embedded in Bayut's client-side JS) ────
_ALGOLIA_APP_ID  = "LL8IZ711CS"
_ALGOLIA_API_KEY = "5b970b39b22a4ff1b99e5167696eef3f"
_ALGOLIA_INDEX   = "bayut-sa-production-ads-city-level-score-ar"
_ALGOLIA_URL     = (
    f"https://{_ALGOLIA_APP_ID}-dsn.algolia.net"
    f"/1/indexes/{_ALGOLIA_INDEX}/query"
)

# ── Category slug mapping ─────────────────────────────────────────────────────
_CAT_SLUGS: dict = {
    "apartment":   "apartments",
    "villa":       "villas",
    "house":       "townhouses",
    "office":      "offices",
    "shop":        "commercial",
    "land":        "residential-lands",
    "commercial":  "showrooms",
    "residential": "residential-buildings",
    "building":    "residential-buildings",
}

# ── City slug mapping (Bayut uses leading-slash slugs in Algolia) ─────────────
_CITY_SLUGS_MAP: dict = {
    "riyadh":         "/riyadh",
    "jeddah":         "/jeddah",
    "mecca":          "/mecca",
    "medina":         "/medina",
    "dammam":         "/dammam",
    "al khobar":      "/al-khobar",
    "khobar":         "/al-khobar",
    "abha":           "/abha",
    "tabuk":          "/tabuk",
    "buraidah":       "/buraidah",
    "khamis mushait": "/khamis-mushait",
    "hail":           "/hail",
    "al taif":        "/taif",
    "taif":           "/taif",
    "yanbu":          "/yanbu",
    "najran":         "/najran",
    "jazan":          "/jazan",
    "dhahran":        "/dhahran",
    "al jubail":      "/jubail",
    "jubail":         "/jubail",
}

# ── Static fallback data ──────────────────────────────────────────────────────
_CITIES_FALLBACK = [
    {"slug": "riyadh",                  "name": "Riyadh",        "name_ar": "الرياض"},
    {"slug": "jeddah",                  "name": "Jeddah",        "name_ar": "جدة"},
    {"slug": "makkah-al-mukarramah",    "name": "Mecca",         "name_ar": "مكة المكرمة"},
    {"slug": "al-madinah-al-munawwarah","name": "Medina",        "name_ar": "المدينة المنورة"},
    {"slug": "dammam",                  "name": "Dammam",        "name_ar": "الدمام"},
    {"slug": "al-khobar",               "name": "Al Khobar",     "name_ar": "الخبر"},
    {"slug": "dhahran",                 "name": "Dhahran",       "name_ar": "الظهران"},
    {"slug": "tabuk",                   "name": "Tabuk",         "name_ar": "تبوك"},
    {"slug": "abha",                    "name": "Abha",          "name_ar": "أبها"},
    {"slug": "hail",                    "name": "Hail",          "name_ar": "حائل"},
    {"slug": "najran",                  "name": "Najran",        "name_ar": "نجران"},
    {"slug": "jizan",                   "name": "Jizan",         "name_ar": "جازان"},
    {"slug": "yanbu",                   "name": "Yanbu",         "name_ar": "ينبع"},
    {"slug": "al-ahsa",                 "name": "Al Ahsa",       "name_ar": "الأحساء"},
    {"slug": "buraidah",                "name": "Buraidah",      "name_ar": "بريدة"},
    {"slug": "al-qassim",               "name": "Al Qassim",     "name_ar": "القصيم"},
    {"slug": "khamis-mushait",          "name": "Khamis Mushait","name_ar": "خميس مشيط"},
    {"slug": "taif",                    "name": "Taif",          "name_ar": "الطائف"},
    {"slug": "al-jubayl",               "name": "Al Jubayl",     "name_ar": "الجبيل"},
    {"slug": "al-qatif",                "name": "Al Qatif",      "name_ar": "القطيف"},
]

_PROPERTY_TYPES = [
    {"slug": "apartments",           "name": "Apartment",       "name_ar": "شقة"},
    {"slug": "villas",               "name": "Villa",           "name_ar": "فيلا"},
    {"slug": "offices",              "name": "Office",          "name_ar": "مكتب"},
    {"slug": "shops",                "name": "Shop",            "name_ar": "محل تجاري"},
    {"slug": "plots",                "name": "Plot / Land",     "name_ar": "أرض"},
    {"slug": "townhouses",           "name": "Townhouse",       "name_ar": "تاون هاوس"},
    {"slug": "penthouses",           "name": "Penthouse",       "name_ar": "بنتهاوس"},
    {"slug": "hotels-apartments",    "name": "Hotel Apartment", "name_ar": "شقة فندقية"},
    {"slug": "buildings",            "name": "Building",        "name_ar": "عمارة"},
    {"slug": "compounds",            "name": "Compound",        "name_ar": "مجمع سكني"},
    {"slug": "floors",               "name": "Floor",           "name_ar": "دور"},
    {"slug": "duplexes",             "name": "Duplex",          "name_ar": "دوبلكس"},
    {"slug": "warehouses",           "name": "Warehouse",       "name_ar": "مستودع"},
    {"slug": "farms",                "name": "Farm / Rest House","name_ar": "مزرعة / استراحة"},
]


class BayutScraper(BaseScraper):
    platform_name = "bayut"
    base_url = BASE

    # ------------------------------------------------------------------ #
    #  Cities / Areas / Property Types                                    #
    # ------------------------------------------------------------------ #

    async def get_cities(self) -> List[City]:
        playwright, browser, context, page = await self._create_session()
        captured: List[dict] = []

        async def on_response(response):
            url = response.url
            if "api/v2/locations" in url and response.status == 200:
                try:
                    data = await response.json()
                    if isinstance(data, dict) and "results" in data:
                        captured.extend(data["results"])
                    elif isinstance(data, list):
                        captured.extend(data)
                except Exception:
                    pass

        page.on("response", on_response)

        try:
            await self._goto_with_retry(page, BASE)
            try:
                search_sel = 'input[placeholder*="location"], input[placeholder*="city"], input[name*="location"], [data-testid*="search"] input'
                await page.wait_for_selector(search_sel, timeout=8000)
                await page.click(search_sel)
                await page.type(search_sel, " ", delay=100)
                await self._human_delay(1500, 2500)
            except Exception:
                pass
            await self._human_delay(1000, 2000)
            if captured:
                cities = []
                for item in captured:
                    if item.get("type") in ("city", "City", "CITY", None):
                        cities.append(City(
                            id=str(item.get("id", "")),
                            name=item.get("name", item.get("slug", "")),
                            name_ar=item.get("name_ar", item.get("nameAr")),
                            slug=item.get("slug"),
                            platform=self.platform_name,
                        ))
                if cities:
                    logger.info("[bayut] Scraped %d cities from API", len(cities))
                    return cities
        except Exception as exc:
            logger.error("[bayut] get_cities error: %s", exc)
        finally:
            await self._close_session(playwright, browser)

        logger.info("[bayut] Using fallback city list (%d cities)", len(_CITIES_FALLBACK))
        return [
            City(name=c["name"], name_ar=c["name_ar"], slug=c["slug"], platform=self.platform_name)
            for c in _CITIES_FALLBACK
        ]

    async def get_areas(self, city: str) -> List[Area]:
        playwright, browser, context, page = await self._create_session()
        captured: List[dict] = []

        async def on_response(response):
            url = response.url
            if "api/v2/locations" in url and response.status == 200:
                try:
                    data = await response.json()
                    items = data.get("results", data) if isinstance(data, dict) else data
                    if isinstance(items, list):
                        captured.extend(items)
                except Exception:
                    pass

        page.on("response", on_response)
        city_slug = city.lower().replace(" ", "-")
        url = f"{BASE}/for-sale/properties-{city_slug}/"
        try:
            await self._goto_with_retry(page, url)
            try:
                loc_sel = 'input[placeholder*="location"], input[placeholder*="area"], [data-testid*="location"] input'
                await page.wait_for_selector(loc_sel, timeout=8000)
                await page.click(loc_sel)
                await page.type(loc_sel, city[:3], delay=120)
                await self._human_delay(1500, 2500)
            except Exception:
                pass
            await self._human_delay(1000, 2000)
            areas = []
            for item in captured:
                if item.get("type") not in ("city", "City"):
                    areas.append(Area(
                        id=str(item.get("id", "")),
                        name=item.get("name", ""),
                        name_ar=item.get("name_ar", item.get("nameAr")),
                        slug=item.get("slug"),
                        city=city,
                        platform=self.platform_name,
                    ))
            if areas:
                logger.info("[bayut] Scraped %d areas for %s", len(areas), city)
                return areas
        except Exception as exc:
            logger.error("[bayut] get_areas error: %s", exc)
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
            PropertyType(slug=pt["slug"], name=pt["name"], name_ar=pt["name_ar"],
                         platform=self.platform_name)
            for pt in _PROPERTY_TYPES
        ]

    # ------------------------------------------------------------------ #
    #  Search — Algolia REST API (no browser needed, CF-immune)           #
    # ------------------------------------------------------------------ #

    async def search_properties(self, request: SearchRequest) -> List[Property]:
        max_pages = getattr(request, "max_pages", 5)
        logger.info("[bayut] Algolia search (max_pages=%d)", max_pages)

        purpose  = "for-sale" if request.purpose == "for-sale" else "for-rent"
        pt       = (request.property_type or "").lower()

        city_str  = (request.city or "riyadh").strip().lower()
        city_slug = _CITY_SLUGS_MAP.get(city_str, f"/{city_str.replace(' ', '-')}")

        # Each inner list = AND; items within a list = OR
        city_facet = [f"location.slug_l1:{city_slug}"]
        facet_filters = [city_facet]
        if request.area:
            area_slug = request.area.lower().strip().replace(" ", "-")
            # Separate list → AND (not OR) with city filter
            facet_filters.append([f"location.slug_l2:{city_slug}/{area_slug}"])

        filters = f"purpose:{purpose}"
        if pt:
            cat_slug = _CAT_SLUGS.get(pt, pt)
            filters += f" AND category.slug_l1:{cat_slug}"
        if request.price_min is not None:
            filters += f" AND price>={int(request.price_min)}"
        if request.price_max is not None:
            filters += f" AND price<={int(request.price_max)}"
        if request.rooms is not None:
            filters += f" AND rooms={request.rooms}"
        if request.bathrooms is not None:
            filters += f" AND baths={request.bathrooms}"
        if request.size_min is not None:
            filters += f" AND area>={int(request.size_min)}"
        if request.size_max is not None:
            filters += f" AND area<={int(request.size_max)}"

        _hdrs = {
            "X-Algolia-Application-Id": _ALGOLIA_APP_ID,
            "X-Algolia-API-Key":        _ALGOLIA_API_KEY,
            "Content-Type":             "application/json",
            "Origin":                   "https://www.bayut.sa",
            "Referer":                  "https://www.bayut.sa/",
        }

        def _payload(page: int) -> dict:
            return {
                "query":        "",
                "filters":      filters,
                "facetFilters": facet_filters,
                "hitsPerPage":  100,
                "page":         page,
                "attributesToRetrieve": [
                    "title_l1", "price", "rooms", "baths", "area",
                    "externalID", "coverPhoto", "phoneNumber",
                    "geography", "_geoloc", "location", "rentFrequency",
                    "agent", "agency", "description_l1",
                    "extraFields", "amenities_l1", "verification",
                    "furnishingStatus", "completionStatus", "ownerAgent",
                    "photoIDs",
                ],
            }

        all_hits: List[dict] = []
        limits = httpx.Limits(max_connections=50, max_keepalive_connections=20)
        async with httpx.AsyncClient(timeout=30, limits=limits) as client:
            probe_data = None
            for attempt in range(3):
                try:
                    r = await client.post(_ALGOLIA_URL, json=_payload(0), headers=_hdrs)
                    if r.status_code == 200:
                        probe_data = r.json()
                        break
                    logger.warning("[bayut] Algolia attempt %d: HTTP %d", attempt + 1, r.status_code)
                except Exception as exc:
                    logger.warning("[bayut] Algolia attempt %d: %s", attempt + 1, exc)
                    await asyncio.sleep(2)

            if not probe_data:
                logger.error("[bayut] All Algolia probe attempts failed")
                return []

            nb_pages     = probe_data.get("nbPages", 1)
            pages_needed = min(nb_pages, max_pages)
            logger.info("[bayut] %d total hits, %d pages to fetch",
                        probe_data.get("nbHits", 0), pages_needed)

            all_hits = list(probe_data.get("hits", []))

            _BATCH = 25  # 25 concurrent Algolia requests per round
            if pages_needed > 1:
                for batch_start in range(1, pages_needed, _BATCH):
                    batch_end = min(batch_start + _BATCH, pages_needed)
                    tasks = [
                        client.post(_ALGOLIA_URL, json=_payload(p), headers=_hdrs)
                        for p in range(batch_start, batch_end)
                    ]
                    responses = await asyncio.gather(*tasks, return_exceptions=True)
                    for resp in responses:
                        if isinstance(resp, Exception):
                            continue
                        if hasattr(resp, "status_code") and resp.status_code == 200:
                            try:
                                all_hits.extend(resp.json().get("hits", []))
                            except Exception:
                                pass

        properties = [
            prop for prop in (
                self._parse_hit_to_property(h, request) for h in all_hits
            )
            if prop
        ]
        logger.info("[bayut] Done — %d properties", len(properties))
        return properties

    # ------------------------------------------------------------------ #
    #  Helpers                                                            #
    # ------------------------------------------------------------------ #

    def _parse_hit_to_property(self, h: dict, request: SearchRequest) -> Optional[Property]:
        title = h.get("title_l1") or h.get("title")
        if not title:
            return None

        loc_list = h.get("location") or []
        location_str = " › ".join(
            x.get("name_l1", "") for x in loc_list
            if isinstance(x, dict) and x.get("name_l1")
        ).strip(" › ") or request.city

        ext_id      = h.get("externalID", "")
        listing_url = f"{BASE}/property/details-{ext_id}.html" if ext_id else None

        cover    = h.get("coverPhoto") or {}
        cover_id = cover.get("id") if isinstance(cover, dict) else None
        photo_ids = h.get("photoIDs") or []
        if photo_ids:
            images = [f"https://images.bayut.sa/thumbnails/{pid}-400x300.jpeg" for pid in photo_ids[:10]]
        elif cover_id:
            images = [f"https://images.bayut.sa/thumbnails/{cover_id}-400x300.jpeg"]
        else:
            images = []

        ph    = h.get("phoneNumber") or {}
        phone = None
        whatsapp = None
        if isinstance(ph, dict):
            phone = ph.get("mobile") or ph.get("phone") or (ph.get("phoneNumbers") or [None])[0]
            whatsapp = ph.get("whatsapp")

        agent_obj  = h.get("ownerAgent") or h.get("agent") or h.get("agency") or {}
        agency_obj = h.get("agency") or {}
        broker = Broker(
            name=(agent_obj.get("name_l1") or agent_obj.get("name")) if isinstance(agent_obj, dict) else None,
            phone=phone,
            whatsapp=str(whatsapp) if whatsapp else None,
            agency=agency_obj.get("name_l1") or agency_obj.get("name") if isinstance(agency_obj, dict) else None,
        ) if (agent_obj or phone) else None

        # REGA / licensing data from extraFields
        ef = h.get("extraFields") or {}
        fal_license = ef.get("brokerage_and_marketing_license_number")
        ad_license_expiry = ef.get("ad_license_expiry_date")
        rega_street_raw = ef.get("rega_location_street_name") or {}
        rega_street = rega_street_raw.get("en") if isinstance(rega_street_raw, dict) else None
        verification = h.get("verification") or {}
        rega_verified = (verification.get("status") == "verified") if isinstance(verification, dict) else False
        amenities = h.get("amenities_l1") or []

        geo = h.get("geography") or h.get("_geoloc") or {}
        lat = geo.get("lat")
        lng = geo.get("lng")

        rooms_val = h.get("rooms")
        rooms     = 0 if rooms_val == 0 else (int(rooms_val) if rooms_val is not None else None)
        baths_val = h.get("baths")
        baths     = int(baths_val) if baths_val is not None else None

        freq_raw     = (h.get("rentFrequency") or "").lower()
        price_period = (
            {"yearly": "yearly", "monthly": "monthly"}.get(freq_raw)
            if request.purpose == "for-rent" else None
        )

        price = h.get("price")
        area  = h.get("area")

        # Extract actual district/area from Bayut location hierarchy (level ≥ 2)
        actual_area = None
        for loc in loc_list:
            if isinstance(loc, dict) and (loc.get("level") or 0) >= 2:
                actual_area = loc.get("slug") or None
                break

        return Property(
            id=ext_id or None,
            platform=self.platform_name,
            title=title,
            description=h.get("description_l1"),
            property_type=request.property_type,
            purpose=request.purpose,
            price=float(price) if price is not None else None,
            price_period=price_period,
            size_sqm=float(area) if area is not None else None,
            rooms=rooms,
            bathrooms=baths,
            city=request.city,
            area=actual_area or request.area,
            location=location_str,
            latitude=float(lat) if lat is not None else None,
            longitude=float(lng) if lng is not None else None,
            images=images,
            broker=broker,
            listing_url=listing_url,
            reference_number=ext_id or None,
            rega_verified=rega_verified,
            fal_license=str(fal_license) if fal_license else None,
            ad_license_expiry=int(ad_license_expiry) if ad_license_expiry else None,
            rega_street=rega_street,
            amenities=amenities if isinstance(amenities, list) else [],
            furnishing=h.get("furnishingStatus"),
            completion_status=h.get("completionStatus"),
        )
