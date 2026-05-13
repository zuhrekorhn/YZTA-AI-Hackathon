from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas.schemas import ChatMessage, ManagerChatMessage, ManagerCustomerMessage, SessionSummary, MessageOut
from repositories.message_repo import get_pending_customer_messages, get_messages_by_session
from repositories.message_repo import get_customer_name_for_session
from agent.agent import run_customer_agent, run_manager_ask_ai, run_manager_to_customer
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


@router.get("/customer/{slug}/sessions/{session_id}/messages")
def customer_session_messages(
    slug: str,
    session_id: str,
    db: Session = Depends(get_db)
):
    business = get_business_by_slug(db, slug)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İşletme bulunamadı")

    msgs = get_messages_by_session(db, session_id, business.id, limit=200)
    return [
        {
            "session_id": m.session_id,
            "sender_type": m.sender_type,
            "content": m.content,
            "message_type": m.message_type if hasattr(m, "message_type") else "customer_to_ai",
            "created_at": m.created_at.isoformat(),
        }
        for m in msgs
    ]

@router.post("/manager/ask-ai")
def manager_ask_ai(
    data: ManagerChatMessage,
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    """Manager asks AI in separate session (not in customer chat context)"""
    response = run_manager_ask_ai(
        db=db,
        business_id=business_id,
        session_id=data.session_id,
        user_message=data.message
    )
    return {"reply": response, "session_id": data.session_id}

@router.post("/manager/customer/{session_id}")
def manager_to_customer(
    session_id: str,
    data: ManagerCustomerMessage,
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    """Manager sends direct message to customer (AI does not process)"""
    run_manager_to_customer(
        db=db,
        business_id=business_id,
        session_id=session_id,
        message_content=data.message
    )
    return {"status": "sent", "session_id": session_id}


@router.get("/sessions")
def list_sessions(business_id: str = Depends(get_current_business_id), db: Session = Depends(get_db)):
    msgs = get_pending_customer_messages(db, business_id)
    result = []
    for m in msgs:
        # try to get a friendly customer name saved for this session
        name_msg = get_customer_name_for_session(db, business_id, m.session_id)
        title = None
        if name_msg and name_msg.content:
            title = name_msg.content
        else:
            # fallback: use the first customer message as a readable label
            session_messages = get_messages_by_session(db, m.session_id, business_id, limit=200)
            first_customer = next((item for item in session_messages if item.sender_type == "customer"), None)
            if first_customer and first_customer.content:
                preview = first_customer.content.strip().replace("\n", " ")
                title = preview[:32] + ("..." if len(preview) > 32 else "")
            else:
                title = "Müşteri"
        result.append({"session_id": m.session_id, "title": title, "last_message": m.content, "created_at": m.created_at.isoformat()})
    return result


@router.get("/sessions/{session_id}/messages")
def session_messages(session_id: str, business_id: str = Depends(get_current_business_id), db: Session = Depends(get_db)):
    msgs = get_messages_by_session(db, session_id, business_id, limit=200)
    return [
        {
            "session_id": m.session_id,
            "sender_type": m.sender_type,
            "content": m.content,
            "message_type": m.message_type if hasattr(m, "message_type") else "customer_to_ai",
            "created_at": m.created_at.isoformat()
        }
        for m in msgs
    ]