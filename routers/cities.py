import asyncio
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

import cache
from config import settings
from models.property import City
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
    summary="Get cities from all platforms",
    response_description="Cities grouped by platform",
)
async def get_all_cities(
    refresh: bool = Query(False, description="Force refresh, bypass cache"),
):
    """Fetch cities from all 4 platforms in parallel. Results cached 24 hours."""
    cache_key = "cities:all"
    if not refresh:
        cached = cache.get(cache_key)
        if cached:
            return cached

    results = {}
    errors = {}

    async def fetch(name: str, scraper_cls):
        try:
            cities = await scraper_cls().get_cities()
            results[name] = [c.model_dump() for c in cities]
        except Exception as exc:
            logger.error("cities fetch failed for %s: %s", name, exc)
            errors[name] = str(exc)

    await asyncio.gather(*[fetch(name, cls) for name, cls in SCRAPERS.items()])

    response = {
        "platforms": results,
        "errors": errors,
        "total": sum(len(v) for v in results.values()),
    }
    cache.set(cache_key, response, settings.cities_cache_ttl)
    return response


@router.get(
    "/{platform}",
    summary="Get cities from a single platform",
)
async def get_cities_by_platform(
    platform: str,
    refresh: bool = Query(False, description="Force refresh, bypass cache"),
):
    """Fetch cities from one specific platform. Results cached 24 hours."""
    if platform not in SCRAPERS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown platform '{platform}'. Valid: {list(SCRAPERS.keys())}",
        )

    cache_key = f"cities:{platform}"
    if not refresh:
        cached = cache.get(cache_key)
        if cached:
            return cached

    try:
        scraper = SCRAPERS[platform]()
        cities = await scraper.get_cities()
        response = {
            "platform": platform,
            "count": len(cities),
            "cities": [c.model_dump() for c in cities],
        }
        cache.set(cache_key, response, settings.cities_cache_ttl)
        return response
    except Exception as exc:
        logger.error("get_cities failed for %s: %s", platform, exc)
        raise HTTPException(status_code=500, detail=str(exc))
