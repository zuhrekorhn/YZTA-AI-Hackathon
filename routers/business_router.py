from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from repositories.business_repo import get_business_by_id

router = APIRouter(prefix="/business", tags=["business"])
security = HTTPBearer()

def get_current_business_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    business_id = decode_token(token)
    if not business_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz token")
    return business_id

@router.get("/chat-link")
def get_chat_link(
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    business = get_business_by_id(db, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İşletme bulunamadı")
    
    return {
        "chat_url": f"/chat/{business.slug}",
        "slug": business.slug,
        "business_name": business.name
    }

@router.get("/me")
def get_me(
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    business = get_business_by_id(db, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İşletme bulunamadı")
    
    return {
        "id": business.id,
        "name": business.name,
        "email": business.email,
        "slug": business.slug,
        "created_at": business.created_at
    }