from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PlatformEnum(str, Enum):
    aqar = "aqar"
    bayut = "bayut"
    property_finder = "property_finder"
    wasalt = "wasalt"


class City(BaseModel):
    id: Optional[str] = None
    name: str
    name_ar: Optional[str] = None
    slug: Optional[str] = None
    platform: str


class Area(BaseModel):
    id: Optional[str] = None
    name: str
    name_ar: Optional[str] = None
    slug: Optional[str] = None
    city: str
    platform: str


class PropertyType(BaseModel):
    id: Optional[str] = None
    name: str
    name_ar: Optional[str] = None
    slug: Optional[str] = None
    platform: str


class Broker(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    agency: Optional[str] = None
    agency_logo: Optional[str] = None
    profile_url: Optional[str] = None


class Property(BaseModel):
    id: Optional[str] = None
    platform: str
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    purpose: str = "for-sale"          # for-sale | for-rent
    price: Optional[float] = None
    currency: str = "SAR"
    price_period: Optional[str] = None  # yearly | monthly (for rent)
    size_sqm: Optional[float] = None
    rooms: Optional[int] = None         # 0 = studio
    bathrooms: Optional[int] = None
    floor: Optional[int] = None
    city: Optional[str] = None
    area: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: List[str] = []
    broker: Optional[Broker] = None
    listing_url: Optional[str] = None
    reference_number: Optional[str] = None
    listed_at: Optional[str] = None
    scraped_at: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat()
    )
    # REGA / licensing fields (Bayut extraFields)
    rega_verified: bool = False
    fal_license: Optional[str] = None
    ad_license: Optional[str] = None
    ad_license_expiry: Optional[int] = None   # Unix timestamp
    rega_street: Optional[str] = None
    amenities: List[str] = []
    furnishing: Optional[str] = None
    completion_status: Optional[str] = None


class SearchResult(BaseModel):
    total_found: int = 0
    platforms_searched: List[str] = []
    unified: List[Property] = []
    by_platform: dict = {}
