import httpx

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.config import settings
from api.deps import get_current_user
from api.deps import get_current_admin
from core.database import get_db
from schemas.location import (
    ForwardGeocodeRequest,
    ForwardGeocodeResponse,
)
from models.user import User

router = APIRouter(
    prefix="/locations",
    tags=["locations"],
)

@router.post(
    "/geocode",
    response_model=ForwardGeocodeResponse,
)
def forward_geocode(
    request: ForwardGeocodeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        response = httpx.get(
            "https://us1.locationiq.com/v1/search",
            params={
                "key": settings.locationiq_api_key,
                "q": request.address,
                "format": "json",
            },
            timeout=10.0,
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Unable to reach LocationIQ",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="LocationIQ geocoding request failed",
        )

    results = response.json()

    if not results:
        raise HTTPException(
            status_code=404,
            detail="Address could not be found",
        )

    result = results[0]

    return ForwardGeocodeResponse(
        latitude=float(result["lat"]),
        longitude=float(result["lon"]),
        display_name=result["display_name"],
    )