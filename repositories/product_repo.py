from sqlalchemy.orm import Session
from sqlalchemy import func
from models.tables import Product, DailySale
from datetime import date, timedelta

def get_products_by_business(db: Session, business_id: str):
    return db.query(Product).filter(
        Product.business_id == business_id
    ).all()

def get_product_by_name(db: Session, business_id: str, name: str):
    return db.query(Product).filter(
        Product.business_id == business_id,
        Product.name.ilike(f"%{name}%")
    ).first()

def get_critical_stocks(db: Session, business_id: str):
    return db.query(Product).filter(
        Product.business_id == business_id,
        Product.stock <= Product.critical_threshold
    ).all()

def get_sales_last_n_days(db: Session, product_id: int, days: int = 14):
    start_date = date.today() - timedelta(days=days)
    return db.query(DailySale).filter(
        DailySale.product_id == product_id,
        DailySale.date >= start_date
    ).all()
