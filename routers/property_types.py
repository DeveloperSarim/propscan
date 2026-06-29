import asyncio
import logging

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
    summary="Get property types from all platforms",
)
async def get_all_property_types(
    refresh: bool = Query(False, description="Force refresh, bypass cache"),
):
    """Return property types from all 4 platforms (English + Arabic names). Cached 24h."""
    cache_key = "property_types:all"
    if not refresh:
        cached = cache.get(cache_key)
        if cached:
            return cached

    results = {}
    errors = {}

    async def fetch(name: str, scraper_cls):
        try:
            types = await scraper_cls().get_property_types()
            results[name] = [t.model_dump() for t in types]
        except Exception as exc:
            logger.error("property_types fetch failed for %s: %s", name, exc)
            errors[name] = str(exc)

    await asyncio.gather(*[fetch(name, cls) for name, cls in SCRAPERS.items()])

    response = {
        "platforms": results,
        "errors": errors,
        "total": sum(len(v) for v in results.values()),
    }
    cache.set(cache_key, response, settings.property_types_cache_ttl)
    return response


@router.get(
    "/{platform}",
    summary="Get property types from a specific platform",
)
async def get_property_types_by_platform(
    platform: str,
    refresh: bool = Query(False, description="Force refresh, bypass cache"),
):
    """Return property types for one platform. Cached 24h."""
    if platform not in SCRAPERS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown platform '{platform}'. Valid: {list(SCRAPERS.keys())}",
        )

    cache_key = f"property_types:{platform}"
    if not refresh:
        cached = cache.get(cache_key)
        if cached:
            return cached

    try:
        types = await SCRAPERS[platform]().get_property_types()
        response = {
            "platform": platform,
            "count": len(types),
            "property_types": [t.model_dump() for t in types],
        }
        cache.set(cache_key, response, settings.property_types_cache_ttl)
        return response
    except Exception as exc:
        logger.error("get_property_types failed for %s: %s", platform, exc)
        raise HTTPException(status_code=500, detail=str(exc))
