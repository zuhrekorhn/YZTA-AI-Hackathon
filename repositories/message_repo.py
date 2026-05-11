from sqlalchemy.orm import Session
from models.tables import Message
from datetime import datetime, timezone

def get_messages_by_session(db: Session, session_id: str, business_id: str, limit: int = 10):
    return db.query(Message).filter(
        Message.session_id == session_id,
        Message.business_id == business_id
    ).order_by(Message.created_at.asc()).limit(limit).all()

def save_message(db: Session, business_id: str, session_id: str, sender_type: str, content: str):
    message = Message(
        business_id=business_id,
        session_id=session_id,
        sender_type=sender_type,
        content=content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_pending_customer_messages(db: Session, business_id: str):
    from sqlalchemy import func
    subquery = db.query(
        Message.session_id,
        func.max(Message.created_at).label("last_message")
    ).filter(
        Message.business_id == business_id
    ).group_by(Message.session_id).subquery()

    return db.query(Message).join(
        subquery,
        (Message.session_id == subquery.c.session_id) &
        (Message.created_at == subquery.c.last_message)
    ).filter(
        Message.business_id == business_id,
        Message.sender_type == "customer"
    ).all()
