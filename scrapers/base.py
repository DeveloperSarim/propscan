import asyncio
import logging
import os
import random
from abc import ABC, abstractmethod
from typing import List, Tuple

from playwright.async_api import (
    async_playwright,
    Browser,
    BrowserContext,
    Page,
    Playwright,
)
try:
    from playwright_stealth import stealth_async
    _stealth_fn = stealth_async
except ImportError:
    from playwright_stealth import Stealth as _StealthClass
    _stealth_instance = _StealthClass()
    async def _stealth_fn(page):  # type: ignore[misc]
        await _stealth_instance.apply_stealth_async(page)

from config import settings
from models.property import City, Area, PropertyType, Property
from models.search import SearchRequest

logger = logging.getLogger(__name__)

# Local Chrome binary — real TLS/hardware fingerprint bypasses Cloudflare Turnstile
_CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

LAUNCH_ARGS = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--window-size=1920,1080",
    "--headless=new",                   # Chrome's new headless: truly invisible, full fingerprint
    "--disable-blink-features=AutomationControlled",
    "--disable-extensions",
    "--no-first-run",
    "--disable-infobars",
]


class BaseScraper(ABC):
    platform_name: str = ""
    base_url: str = ""

    # ------------------------------------------------------------------ #
    #  Browser lifecycle                                                   #
    # ------------------------------------------------------------------ #

    async def _create_session(self) -> Tuple[Playwright, Browser, BrowserContext, Page]:
        playwright = await async_playwright().start()
        launch_kwargs: dict = {
            "headless": False,   # prevents Playwright from adding legacy --headless flag; --headless=new is in LAUNCH_ARGS
            "args": LAUNCH_ARGS,
        }
        if os.path.exists(_CHROME_PATH):
            launch_kwargs["channel"] = "chrome"  # real Chrome binary → better TLS/hardware fingerprint
        browser = await playwright.chromium.launch(**launch_kwargs)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent=settings.user_agent,
            locale="en-US",
            timezone_id="Asia/Riyadh",
            java_script_enabled=True,
            accept_downloads=False,
        )
        # block images/fonts to speed up loading (still renders JS)
        await context.route(
            "**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,eot}",
            lambda route: route.abort()
            if "listing" not in route.request.url
            else route.continue_(),
        )
        page = await context.new_page()
        await _stealth_fn(page)
        page.set_default_timeout(settings.browser_timeout)
        return playwright, browser, context, page

    async def _close_session(
        self, playwright: Playwright, browser: Browser
    ) -> None:
        try:
            await browser.close()
            await playwright.stop()
        except Exception:
            pass

    async def _new_stealth_page(self, context: BrowserContext) -> Page:
        """Open a fresh tab in an existing context (shares cookies/session)."""
        page = await context.new_page()
        await _stealth_fn(page)
        page.set_default_timeout(settings.browser_timeout)
        return page

    async def _goto_with_retry(self, page: Page, url: str) -> bool:
        for attempt in range(1, settings.max_retries + 1):
            try:
                await page.goto(url, wait_until="domcontentloaded")
                await page.wait_for_timeout(settings.page_wait)
                return True
            except Exception as exc:
                logger.warning(
                    "[%s] goto attempt %d/%d failed for %s: %s",
                    self.platform_name, attempt, settings.max_retries, url, exc,
                )
                if attempt < settings.max_retries:
                    await asyncio.sleep(settings.retry_delay / 1000)
        return False

    async def _human_delay(self, min_ms: int = 500, max_ms: int = 1500) -> None:
        await asyncio.sleep(random.randint(min_ms, max_ms) / 1000)

    # ------------------------------------------------------------------ #
    #  Abstract interface                                                  #
    # ------------------------------------------------------------------ #

    @abstractmethod
    async def get_cities(self) -> List[City]:
        """Return all cities available on this platform."""

    @abstractmethod
    async def get_areas(self, city: str) -> List[Area]:
        """Return all areas/districts for the given city."""

    @abstractmethod
    async def get_property_types(self) -> List[PropertyType]:
        """Return all property types listed on this platform."""

    @abstractmethod
    async def search_properties(self, request: SearchRequest) -> List[Property]:
        """Run a live search and return matching properties."""
