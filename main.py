import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from playwright.async_api import async_playwright

import cache
from config import settings
from routers import cities, areas, property_types, search, contact

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Saudi Real Estate Scraper API v%s", settings.app_version)
    # Verify Playwright + Chromium are installed
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            await browser.close()
        logger.info("Playwright / Chromium: OK")
    except Exception as exc:
        logger.error(
            "Playwright not ready: %s\n"
            "Run:  playwright install chromium",
            exc,
        )
    yield
    cache.clear()
    logger.info("API shut down — cache cleared")


app = FastAPI(
    title="Saudi Real Estate Scraper API",
    description=(
        "Real-time property scraper for Aqar, Bayut, Property Finder and Wasalt.\n\n"
        "All scraping runs in a local headless Chromium browser on your machine."
    ),
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(cities.router,         prefix="/cities",         tags=["Cities"])
app.include_router(areas.router,          prefix="/areas",          tags=["Areas"])
app.include_router(property_types.router, prefix="/property-types", tags=["Property Types"])
app.include_router(search.router,         prefix="/search",         tags=["Search"])
app.include_router(contact.router,        prefix="/contact",        tags=["Contact"])


# ── Root & Health ─────────────────────────────────────────────────────────────
@app.get("/api/info", tags=["Info"])
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "platforms": ["aqar", "bayut", "property_finder", "wasalt"],
    }


@app.get("/health", tags=["Info"])
async def health():
    return {"status": "ok", "cache": cache.stats()}


@app.delete("/cache", tags=["Info"])
async def clear_cache():
    cache.clear()
    return {"status": "cache cleared"}


# ── Frontend (production Docker build) ────────────────────────────────────────
# Serves React app for all non-API routes. Must be registered LAST so API
# routes defined above take precedence.
_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(_dist):
    # /assets/** served as static files (JS bundles, CSS, images)
    _assets = os.path.join(_dist, "assets")
    if os.path.exists(_assets):
        app.mount("/assets", StaticFiles(directory=_assets), name="assets")

    # Every other path → index.html (SPA client-side routing)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):  # noqa: ARG001
        return FileResponse(os.path.join(_dist, "index.html"))
