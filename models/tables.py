from sqlalchemy import Column, String, Float, Boolean, DateTime, Date, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from core.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Business(Base):
    __tablename__ = "businesses"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    products = relationship("Product", back_populates="business")
    orders = relationship("Order", back_populates="business")
    messages = relationship("Message", back_populates="business")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    name = Column(String, nullable=False)
    stock = Column(Float, default=0)
    critical_threshold = Column(Float, default=10)
    price = Column(Float, default=0)
    unit = Column(String, default="adet")

    business = relationship("Business", back_populates="products")
    orders = relationship("Order", back_populates="product")
    daily_sales = relationship("DailySale", back_populates="product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=True)
    quantity = Column(Float, nullable=False)
    status = Column(String, default="hazırlandı")
    cargo_tracking_no = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    estimated_delivery = Column(Date, nullable=True)

    business = relationship("Business", back_populates="orders")
    product = relationship("Product", back_populates="orders")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    session_id = Column(String, nullable=False)
    sender_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    business = relationship("Business", back_populates="messages")

class DailySale(Base):
    __tablename__ = "daily_sales"

    id = Column(Integer, primary_key=True, autoincrement=True)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    date = Column(Date, nullable=False)
    quantity_sold = Column(Float, default=0)

    product = relationship("Product", back_populates="daily_sales")

class CargoEvent(Base):
    __tablename__ = "cargo_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tracking_no = Column(String, nullable=False)
    status = Column(String, nullable=False)
    location = Column(String, nullable=True)
    is_delayed = Column(Boolean, default=False)
    event_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))