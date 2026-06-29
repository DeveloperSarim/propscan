from pydantic import BaseModel, field_validator
from typing import Optional, List

VALID_PLATFORMS = ["aqar", "bayut", "property_finder", "wasalt"]
VALID_PURPOSES = ["for-sale", "for-rent"]


class SearchRequest(BaseModel):
    platforms: Optional[List[str]] = None   # None = all 4 platforms
    purpose: str = "for-sale"
    city: Optional[str] = None
    area: Optional[str] = None
    property_type: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    size_min: Optional[float] = None        # sqm
    size_max: Optional[float] = None        # sqm
    rooms: Optional[int] = None             # 0 = studio, 1/2/3... = bedrooms
    bathrooms: Optional[int] = None
    page: int = 1
    max_pages: int = 5                      # how many pages to scrape per platform

    @field_validator("platforms")
    @classmethod
    def validate_platforms(cls, v):
        if v is not None:
            invalid = [p for p in v if p not in VALID_PLATFORMS]
            if invalid:
                raise ValueError(
                    f"Invalid platforms: {invalid}. "
                    f"Valid options: {VALID_PLATFORMS}"
                )
        return v

    @field_validator("purpose")
    @classmethod
    def validate_purpose(cls, v):
        if v not in VALID_PURPOSES:
            raise ValueError(
                f"Invalid purpose: {v}. Valid options: {VALID_PURPOSES}"
            )
        return v
