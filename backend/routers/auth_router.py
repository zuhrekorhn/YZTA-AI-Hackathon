from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.schemas import BusinessRegister, BusinessLogin, TokenResponse
from services.auth_service import register_business, login_business
from core.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(data: BusinessRegister, db: Session = Depends(get_db)):
    return register_business(db, data.name, data.email, data.password)

@router.post("/login", response_model=TokenResponse)
def login(data: BusinessLogin, db: Session = Depends(get_db)):
    return login_business(db, data.email, data.password)