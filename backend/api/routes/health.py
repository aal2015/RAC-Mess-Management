from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from core.database import get_db


router = APIRouter(
    prefix="/health",
    tags=["health"],
)


@router.get("")
def health_check(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected",
            "result": result.scalar(),
        }

    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "error": str(e),
        }