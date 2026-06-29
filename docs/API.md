# Saudi Real Estate Scraper API — Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000`  
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI)

---

## Overview

A local backend API that scrapes real-time property data from 4 Saudi real estate platforms:

| Platform | Website |
|---|---|
| `aqar` | https://aqar.sa |
| `bayut` | https://www.bayut.sa |
| `property_finder` | https://www.propertyfinder.sa |
| `wasalt` | https://wasalt.com |

All scraping runs in a **headless Chromium browser on your local machine** — no proxies, no external services.

**Caching strategy:**
- Cities, areas, property types → cached **24 hours** (refresh with `?refresh=true`)
- Property search → always **real-time** (no cache)

---

## Endpoints

### GET /cities
Fetch cities from all 4 platforms in parallel.

**Query params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `refresh` | bool | false | Bypass cache, force live scrape |

**Response:**
```json
{
  "platforms": {
    "aqar": [
      { "id": "1", "name": "Riyadh", "name_ar": "الرياض", "slug": "riyadh", "platform": "aqar" }
    ],
    "bayut": [ ... ],
    "property_finder": [ ... ],
    "wasalt": [ ... ]
  },
  "errors": {},
  "total": 80
}
```

---

### GET /cities/{platform}
Fetch cities from one specific platform.

**Path params:**
- `platform`: `aqar` | `bayut` | `property_finder` | `wasalt`

**Query params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `refresh` | bool | false | Bypass cache |

**Response:**
```json
{
  "platform": "bayut",
  "count": 20,
  "cities": [
    { "id": null, "name": "Riyadh", "name_ar": "الرياض", "slug": "riyadh", "platform": "bayut" }
  ]
}
```

---

### GET /areas
Fetch areas/districts for a city from one or all platforms.

**Query params:**
| Param | Type | Required | Description |
|---|---|---|---|
| `city` | string | **yes** | City name e.g. `Riyadh` |
| `platform` | string | no | Filter to one platform |
| `refresh` | bool | false | Bypass cache |

**Example:**
```
GET /areas?city=Riyadh
GET /areas?city=Jeddah&platform=bayut
```

**Response:**
```json
{
  "city": "Riyadh",
  "platforms": {
    "aqar": [
      { "id": "101", "name": "Al Olaya", "name_ar": "العليا", "slug": "olaya", "city": "Riyadh", "platform": "aqar" }
    ],
    "bayut": [ ... ]
  },
  "errors": {},
  "total": 120
}
```

---

### GET /areas/{platform}
Fetch areas from a specific platform for a city.

**Example:**
```
GET /areas/bayut?city=Riyadh
```

---

### GET /property-types
Get all property types from all platforms (English + Arabic names).

**Response:**
```json
{
  "platforms": {
    "aqar": [
      { "id": "1", "slug": "apartment", "name": "Apartment", "name_ar": "شقة", "platform": "aqar" }
    ],
    "bayut": [ ... ]
  },
  "errors": {},
  "total": 56
}
```

---

### GET /property-types/{platform}
Get property types from one platform.

**Example:**
```
GET /property-types/wasalt
```

---

### POST /search
Search for properties with full filtering. Always real-time.

**Request body (JSON):**
```json
{
  "platforms": ["bayut", "aqar"],
  "purpose": "for-sale",
  "city": "Riyadh",
  "area": "Al Olaya",
  "property_type": "apartment",
  "price_min": 300000,
  "price_max": 1500000,
  "size_min": 80,
  "size_max": 300,
  "rooms": 3,
  "bathrooms": 2,
  "page": 1
}
```

**Field reference:**

| Field | Type | Default | Description |
|---|---|---|---|
| `platforms` | string[] | all 4 | Platforms to search. Omit = all 4 |
| `purpose` | string | `"for-sale"` | `"for-sale"` or `"for-rent"` |
| `city` | string | — | City name (from `/cities`) |
| `area` | string | — | Area/district (from `/areas`) |
| `property_type` | string | — | Property type slug (from `/property-types`) |
| `price_min` | number | — | Minimum price in SAR |
| `price_max` | number | — | Maximum price in SAR |
| `size_min` | number | — | Minimum area in sqm |
| `size_max` | number | — | Maximum area in sqm |
| `rooms` | integer | — | Bedrooms count. `0` = studio |
| `bathrooms` | integer | — | Bathrooms count |
| `page` | integer | `1` | Pagination page number |

**Response:**
```json
{
  "total_found": 47,
  "platforms_searched": ["bayut", "aqar"],
  "unified": [
    {
      "id": null,
      "platform": "bayut",
      "title": "3 Bedroom Apartment in Al Olaya",
      "description": null,
      "property_type": "apartment",
      "purpose": "for-sale",
      "price": 850000,
      "currency": "SAR",
      "price_period": null,
      "size_sqm": 145.0,
      "rooms": 3,
      "bathrooms": 2,
      "floor": null,
      "city": "Riyadh",
      "area": "Al Olaya",
      "location": "Al Olaya, Riyadh",
      "latitude": null,
      "longitude": null,
      "images": [
        "https://images.bayut.sa/thumbnails/123456-800x600.webp"
      ],
      "broker": {
        "name": "Ahmed Real Estate",
        "phone": "+966501234567",
        "whatsapp": null,
        "agency": "Ahmed Real Estate",
        "agency_logo": null,
        "profile_url": null
      },
      "listing_url": "https://www.bayut.sa/property/details-123456.html",
      "reference_number": "BAY-123456",
      "listed_at": null,
      "scraped_at": "2026-06-20T10:30:00"
    }
  ],
  "by_platform": {
    "bayut": [ ... ],
    "aqar": [ ... ]
  }
}
```

---

### GET /health
Check API status and cache stats.

**Response:**
```json
{
  "status": "ok",
  "cache": {
    "total_keys": 5,
    "expired_keys": 0,
    "live_keys": 5
  }
}
```

---

### DELETE /cache
Clear all cached data (cities, areas, property types).

---

## Setup & Installation

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Chromium browser
```bash
playwright install chromium
```

### 3. Configure (optional)
Copy `.env.example` to `.env` and adjust settings:
```bash
cp .env.example .env
```

### 4. Start the API
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the provided script:
```bash
bash run.sh
```

API will be available at `http://localhost:8000`  
Swagger UI at `http://localhost:8000/docs`

---

## Configuration (.env)

| Variable | Default | Description |
|---|---|---|
| `HEADLESS` | `true` | Run browser headlessly (set `false` to see the browser) |
| `BROWSER_TIMEOUT` | `30000` | Page load timeout in ms |
| `PAGE_WAIT` | `3000` | Extra wait after page load in ms |
| `MAX_RETRIES` | `3` | Retry attempts for failed page loads |
| `SEARCH_MAX_PAGES` | `5` | Max pages to scrape per search |
| `PORT` | `8000` | API server port |
| `DEBUG` | `false` | Enable debug logging |

---

## Notes

1. **First request is slower** — Chromium launches cold. Subsequent requests on the same platform are faster.
2. **Parallel scraping** — When searching multiple platforms, all scrapers run simultaneously.
3. **Anti-bot** — `playwright-stealth` is applied to mimic a real browser. All scraping stays on your local IP.
4. **Selector updates** — If a platform redesigns their UI, update the CSS selectors at the top of their scraper file in `scrapers/`.
5. **Phone numbers** — Some platforms hide phone numbers behind a "Reveal" button. The scraper attempts to click it, but some numbers may not be visible without user interaction or login.
6. **Search quality** — Results are extracted from what the platform renders. If the platform changes its URL structure, update `_build_search_url()` in the relevant scraper.

---

## Platform URL Patterns

| Platform | For Sale | For Rent |
|---|---|---|
| Bayut | `/for-sale/{type}-{city}/` | `/for-rent/{type}-{city}/` |
| Property Finder | `/search/?c=1&q={city}` | `/search/?c=2&q={city}` |
| Aqar | `/search?purpose=sale&city={city}` | `/search?purpose=rent&city={city}` |
| Wasalt | `/en/search?purpose=sale&city={city}` | `/en/search?purpose=rent&city={city}` |
