import asyncio
import json
import logging
from typing import List

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from models.property import SearchResult
from models.search import SearchRequest, VALID_PLATFORMS
from scrapers.aqar import AqarScraper
from scrapers.bayut import BayutScraper
from scrapers.property_finder import PropertyFinderScraper
from scrapers.wasalt import WasaltScraper

logger = logging.getLogger(__name__)
router = APIRouter()

_PLATFORM_PRIORITY = {"bayut": 4, "property_finder": 3, "wasalt": 2, "aqar": 1}


def _dedup_cross_platform(unified: List[dict]) -> List[dict]:
    """
    Remove cross-platform duplicates: same property listed by same agent on
    multiple platforms.  Fingerprint = city + purpose + beds + baths +
    area(±10 m²) + price(±10k SAR).  When a clash is found, keep whichever
    listing has the most data (images > coordinates > description > platform
    priority).  Properties that lack both price and area are left untouched.
    """

    def _bucket(val: float | None, step: float):
        return None if val is None else round(val / step) * step

    def _fp(p: dict):
        return (
            (p.get("city") or "").lower().strip(),
            (p.get("purpose") or "").lower().strip(),
            p.get("rooms"),
            p.get("bathrooms"),
            _bucket(p.get("size_sqm"), 10),
            _bucket(p.get("price"), 10_000),
        )

    def _score(p: dict) -> int:
        return (
            len(p.get("images") or []) * 3
            + (3 if p.get("description") else 0)
            + (2 if p.get("latitude") else 0)
            + (1 if p.get("broker") else 0)
            + _PLATFORM_PRIORITY.get(p.get("platform", ""), 0)
        )

    groups: dict[tuple, list] = {}
    unkeyed: list = []

    for p in unified:
        fp = _fp(p)
        # Don't try to deduplicate if we have nothing to fingerprint on
        if fp[4] is None and fp[5] is None:
            unkeyed.append(p)
            continue
        groups.setdefault(fp, []).append(p)

    result: List[dict] = []
    removed = 0
    for group in groups.values():
        platforms_in_group = {p.get("platform") for p in group}
        if len(platforms_in_group) == 1:
            # All from same platform — keep every listing (different properties can share specs)
            result.extend(group)
        else:
            # Same property on multiple platforms — keep the best one
            best = max(group, key=_score)
            result.append(best)
            removed += len(group) - 1

    result.extend(unkeyed)
    if removed:
        logger.info("[dedup] removed %d cross-platform duplicates", removed)
    return result

SCRAPERS = {
    "aqar": AqarScraper,
    "bayut": BayutScraper,
    "property_finder": PropertyFinderScraper,
    "wasalt": WasaltScraper,
}


@router.post(
    "",
    summary="Search properties across platforms",
    response_model=SearchResult,
    response_description=(
        "Returns a unified list of all properties AND a breakdown by platform"
    ),
)
async def search_properties(request: SearchRequest):
    """
    Search for properties across one, several, or all 4 platforms simultaneously.

    - Omit `platforms` to search all 4 platforms in parallel.
    - Pass `platforms: ["bayut", "aqar"]` to search only those two.
    - Results are always real-time (no caching).
    - Response includes both `unified` (flat sorted list) and `by_platform` (grouped).

    **Filter fields:**
    - `purpose`: `"for-sale"` or `"for-rent"` (default: `"for-sale"`)
    - `city`: city name (get valid names from `/cities`)
    - `area`: district/area name (get valid names from `/areas?city=...`)
    - `property_type`: type slug (get valid types from `/property-types`)
    - `price_min` / `price_max`: price range in SAR
    - `size_min` / `size_max`: area range in sqm
    - `rooms`: number of bedrooms (0 = studio)
    - `bathrooms`: number of bathrooms
    - `page`: pagination page number (default 1)
    """
    target_platforms = request.platforms or VALID_PLATFORMS
    results_by_platform: dict = {}
    errors: dict = {}

    async def fetch(name: str, scraper_cls):
        try:
            props = await scraper_cls().search_properties(request)
            results_by_platform[name] = [p.model_dump() for p in props]
            logger.info("[search] %s → %d results", name, len(props))
        except Exception as exc:
            logger.error("[search] %s failed: %s", name, exc)
            errors[name] = str(exc)
            results_by_platform[name] = []

    await asyncio.gather(
        *[fetch(name, SCRAPERS[name]) for name in target_platforms]
    )

    # Build unified list, deduplicate cross-platform, sort by price
    unified: List[dict] = []
    for platform_props in results_by_platform.values():
        unified.extend(platform_props)

    unified = _dedup_cross_platform(unified)
    unified.sort(key=lambda p: (p.get("price") is None, p.get("price") or 0))

    return SearchResult(
        total_found=len(unified),
        platforms_searched=target_platforms,
        unified=unified,
        by_platform={
            **results_by_platform,
            **({"errors": errors} if errors else {}),
        },
    )


@router.post("/stream-aqar", summary="Stream Aqar results as SSE batches")
async def stream_aqar(request: SearchRequest):
    """
    Server-Sent Events endpoint — yields Aqar properties in batches of ~25 pages
    as they are fetched, so the frontend can display results progressively.

    Event format:  data: {"event":"batch","count":N,"properties":[...]}
    Final event:   data: {"event":"done","total":N}
    """
    async def generate():
        total = 0
        try:
            async for batch in AqarScraper().stream_properties(request):
                total += len(batch)
                payload = json.dumps({
                    "event": "batch",
                    "count": len(batch),
                    "properties": [p.model_dump() for p in batch],
                })
                yield f"data: {payload}\n\n"
        except Exception as exc:
            logger.error("[stream-aqar] error: %s", exc)
            yield f"data: {json.dumps({'event': 'error', 'error': str(exc)})}\n\n"
        yield f"data: {json.dumps({'event': 'done', 'total': total})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
