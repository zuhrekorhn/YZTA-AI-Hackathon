from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas.schemas import ChatMessage, ManagerChatMessage
from agent.agent import run_customer_agent, run_manager_agent
from repositories.business_repo import get_business_by_slug

router = APIRouter(prefix="/chat", tags=["chat"])
security = HTTPBearer()

def get_current_business_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    business_id = decode_token(token)
    if not business_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz token")
    return business_id

@router.post("/customer/{slug}")
def customer_chat(
    slug: str,
    data: ChatMessage,
    db: Session = Depends(get_db)
):
    business = get_business_by_slug(db, slug)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İşletme bulunamadı")
    
    response = run_customer_agent(
        db=db,
        business_id=business.id,
        session_id=data.session_id,
        user_message=data.message,
        customer_name=data.customer_name
    )
    return {"reply": response, "session_id": data.session_id}

@router.post("/manager")
def manager_chat(
    data: ManagerChatMessage,
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    response = run_manager_agent(
        db=db,
        business_id=business_id,
        session_id=data.session_id,
        user_message=data.message
    )
    return {"reply": response, "session_id": data.session_id}