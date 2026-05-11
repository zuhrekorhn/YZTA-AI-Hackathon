from sqlalchemy.orm import Session
from sqlalchemy import func
from models.tables import Order, CargoEvent
from datetime import date, datetime, timezone

def get_orders_by_business(db: Session, business_id: str, status: str = None):
    query = db.query(Order).filter(Order.business_id == business_id)
    if status:
        query = query.filter(Order.status == status)
    return query.order_by(Order.created_at.desc()).all()

def get_order_by_id(db: Session, order_id: int, business_id: str):
    return db.query(Order).filter(
        Order.id == order_id,
        Order.business_id == business_id
    ).first()

def get_delayed_orders(db: Session, business_id: str):
    today = date.today()
    return db.query(Order).filter(
        Order.business_id == business_id,
        Order.status == "yolda",
        Order.estimated_delivery < today
    ).all()

def get_todays_orders(db: Session, business_id: str):
    today = date.today()
    return db.query(Order).filter(
        Order.business_id == business_id,
        func.date(Order.created_at) == today
    ).all()

def get_cargo_events(db: Session, tracking_no: str):
    return db.query(CargoEvent).filter(
        CargoEvent.tracking_no == tracking_no
    ).order_by(CargoEvent.event_time.desc()).all()
