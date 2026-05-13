from sqlalchemy.orm import Session
from models.tables import Message
from datetime import datetime, timezone

def get_messages_by_session(db: Session, session_id: str, business_id: str, limit: int = 10):
    return db.query(Message).filter(
        Message.session_id == session_id,
        Message.business_id == business_id
    ).order_by(Message.created_at.asc()).limit(limit).all()

def save_message(db: Session, business_id: str, session_id: str, sender_type: str, content: str, message_type: str = "customer_to_ai"):
    message = Message(
        business_id=business_id,
        session_id=session_id,
        sender_type=sender_type,
        message_type=message_type,
        content=content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_pending_customer_messages(db: Session, business_id: str):
    from sqlalchemy import func
    # Get all sessions that have at least one customer message (regardless of response status)
    customer_messages = db.query(Message).filter(
        Message.business_id == business_id,
        Message.sender_type == "customer"
    ).all()
    
    if not customer_messages:
        return []
    
    # Get unique session IDs
    session_ids = list(set([m.session_id for m in customer_messages]))
    
    # For each session, get the latest message (regardless of sender)
    latest_messages = []
    for session_id in session_ids:
        latest = db.query(Message).filter(
            Message.business_id == business_id,
            Message.session_id == session_id
        ).order_by(Message.created_at.desc()).first()
        if latest:
            latest_messages.append(latest)
    
    return latest_messages


def get_customer_name_for_session(db: Session, business_id: str, session_id: str):
    # return the latest saved customer_name meta message for a session, if any
    return db.query(Message).filter(
        Message.business_id == business_id,
        Message.session_id == session_id,
        Message.sender_type == "customer_name"
    ).order_by(Message.created_at.desc()).first()
