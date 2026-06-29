import asyncio
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

import cache
from config import settings
from scrapers.aqar import AqarScraper
from scrapers.bayut import BayutScraper
from scrapers.property_finder import PropertyFinderScraper
from scrapers.wasalt import WasaltScraper

logger = logging.getLogger(__name__)
router = APIRouter()

SCRAPERS = {
    "aqar": AqarScraper,
    "bayut": BayutScraper,
    "property_finder": PropertyFinderScraper,
    "wasalt": WasaltScraper,
}


@router.get(
    "",
    summary="Get areas for a city",
    response_description="Areas/districts for the given city, optionally filtered by platform",
)
async def get_areas(
    city: str = Query(..., description="City name (e.g. Riyadh, Jeddah)"),
    platform: Optional[str] = Query(None, description="Filter to one platform (aqar/bayut/property_finder/wasalt)"),
    refresh: bool = Query(False, description="Force refresh, bypass cache"),
):
    """
    Fetch districts/areas within a city from one or all platforms.
    Results cached 24 hours per city+platform combination.
    """
    platforms = [platform] if platform else list(SCRAPERS.keys())

    for p in platforms:
        if p not in SCRAPERS:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown platform '{p}'. Valid: {list(SCRAPERS.keys())}",
            )

    results = {}
    errors = {}

    async def fetch(name: str, scraper_cls):
        ck = f"areas:{name}:{city.lower()}"
        if not refresh:
            cached = cache.get(ck)
            if cached is not None:
                results[name] = cached
                return
        try:
            areas = await scraper_cls().get_areas(city)
            data = [a.model_dump() for a in areas]
            cache.set(ck, data, settings.areas_cache_ttl)
            results[name] = data
        except Exception as exc:
            logger.error("areas fetch failed for %s city=%s: %s", name, city, exc)
            errors[name] = str(exc)

    await asyncio.gather(*[fetch(name, SCRAPERS[name]) for name in platforms])

    return {
        "city": city,
        "platforms": results,
        "errors": errors,
        "total": sum(len(v) for v in results.values()),
    }


@router.get(
    "/{platform}",
    summary="Get areas from a specific platform for a city",
)
async def get_areas_by_platform(
    platform: str,
    city: str = Query(..., description="City name (e.g. Riyadh)"),
    refresh: bool = Query(False, description="Force refresh, bypass cache"),
):
    if platform not in SCRAPERS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown platform '{platform}'. Valid: {list(SCRAPERS.keys())}",
        )

    cache_key = f"areas:{platform}:{city.lower()}"
    if not refresh:
        cached = cache.get(cache_key)
        if cached is not None:
            return {"platform": platform, "city": city, "count": len(cached), "areas": cached}

    try:
        areas = await SCRAPERS[platform]().get_areas(city)
        data = [a.model_dump() for a in areas]
        cache.set(cache_key, data, settings.areas_cache_ttl)
        return {"platform": platform, "city": city, "count": len(data), "areas": data}
    except Exception as exc:
        logger.error("get_areas failed %s city=%s: %s", platform, city, exc)
        raise HTTPException(status_code=500, detail=str(exc))
