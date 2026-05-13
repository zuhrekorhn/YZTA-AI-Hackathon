from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional

class BusinessRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class BusinessLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    business_id: str
    business_name: str
    chat_slug: str

class ChatMessage(BaseModel):
    message: str
    session_id: str
    customer_name: Optional[str] = "Müşteri"

class ManagerChatMessage(BaseModel):
    message: str
    session_id: str


class ManagerCustomerMessage(BaseModel):
    message: str


class SessionSummary(BaseModel):
    session_id: str
    last_message: str
    created_at: datetime


class MessageOut(BaseModel):
    session_id: str
    sender_type: str
    content: str
    created_at: datetime


class NotifyRequest(BaseModel):
    order_ids: list[int]
    message_type: str


class NotifyResultItem(BaseModel):
    order_id: int
    customer: str
    message: str


class NotifyResponse(BaseModel):
    sent_count: int
    messages: list[NotifyResultItem]
class StockUpdate(BaseModel):
    new_stock: float

class NewOrder(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    product_id: int
    quantity: float
    estimated_delivery: Optional[date] = None