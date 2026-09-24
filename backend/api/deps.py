from uuid import UUID

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import decode_token
from models.user import User

security = HTTPBearer()

def get_current_user(
    credentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        payload = decode_token(credentials.credentials)
    except Exception:
        raise HTTPException(401, "Invalid token")

    user = db.get(User, UUID(payload["sub"]))

    if not user or not user.is_active:
        raise HTTPException(401, "Unauthorized")

    return user


def get_current_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")

    return current_user