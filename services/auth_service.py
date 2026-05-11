from sqlalchemy.orm import Session
from repositories.business_repo import get_business_by_email, create_business
from core.security import verify_password, create_access_token
from fastapi import HTTPException, status

def register_business(db: Session, name: str, email: str, password: str):
    existing = get_business_by_email(db, email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu email zaten kayıtlı"
        )
    business = create_business(db, name, email, password)
    token = create_access_token(business.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "business_id": business.id,
        "business_name": business.name,
        "chat_slug": business.slug
    }

def login_business(db: Session, email: str, password: str):
    business = get_business_by_email(db, email)
    if not business:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email veya şifre hatalı"
        )
    if not verify_password(password, business.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email veya şifre hatalı"
        )
    token = create_access_token(business.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "business_id": business.id,
        "business_name": business.name,
        "chat_slug": business.slug
    }
