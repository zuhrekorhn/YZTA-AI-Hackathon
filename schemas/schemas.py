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
