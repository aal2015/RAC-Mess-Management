from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.deps import get_current_maintainer
from core.database import get_db
from models.battalion import Battalion
from models.user import User
from schemas.battalion import (
    BattalionResponse,
    CreateBattalionRequest,
)

router = APIRouter(
    prefix="/maintainer",
    tags=["Maintainer"],
)


@router.post(
    "/battalions",
    response_model=BattalionResponse,
)
def create_battalion(
    request: CreateBattalionRequest,
    db: Session = Depends(get_db),
    maintainer: User = Depends(get_current_maintainer),
):
    name = request.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Battalion name cannot be empty",
        )

    exists = (
        db.query(Battalion)
        .filter(Battalion.name == name)
        .first()
    )

    if exists:
        raise HTTPException(
            status_code=409,
            detail="Battalion already exists",
        )

    battalion = Battalion(name=name)

    db.add(battalion)
    db.commit()
    db.refresh(battalion)

    return battalion