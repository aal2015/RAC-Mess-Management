from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import verify_password, create_access_token
from models.user import User
from schemas.auth import LoginRequest, TokenResponse
from api.deps import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.username == request.username)
        .first()
    )

    if not user:
        raise HTTPException(401, "Invalid username or password")

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(401, "Invalid username or password")

    token = create_access_token(
        str(user.id),
        user.role
    )

    return TokenResponse(access_token=token)


@router.get("/me")
def me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "name": current_user.name
    }