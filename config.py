from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Saudi Real Estate Scraper API"
    app_version: str = "1.0.0"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    # Cache TTL in seconds
    cities_cache_ttl: int = 86400       # 24 hours
    areas_cache_ttl: int = 86400        # 24 hours
    property_types_cache_ttl: int = 86400  # 24 hours

    # Playwright settings
    headless: bool = False
    browser_timeout: int = 30000        # 30 seconds per page load
    page_wait: int = 3000               # 3 seconds after navigation
    max_retries: int = 3
    retry_delay: int = 2000             # 2 seconds between retries
    search_max_pages: int = 5           # max pages to scrape per search

    # User agent for stealth
    user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )

    # SMTP / email notifications
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""    # Gmail address used to send (e.g. you@gmail.com)
    smtp_pass: str = ""    # Gmail App Password (not your normal password)
    admin_email: str = ""  # Where requirement notifications are delivered

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
