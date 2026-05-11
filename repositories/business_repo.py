from sqlalchemy.orm import Session
from models.tables import Business
from core.security import hash_password
import uuid
import re

def slugify(name: str) -> str:
    name = name.lower().strip()
    name = re.sub(r'[ğ]', 'g', name)
    name = re.sub(r'[ü]', 'u', name)
    name = re.sub(r'[ş]', 's', name)
    name = re.sub(r'[ı]', 'i', name)
    name = re.sub(r'[ö]', 'o', name)
    name = re.sub(r'[ç]', 'c', name)
    name = re.sub(r'[^a-z0-9\s-]', '', name)
    name = re.sub(r'[\s]+', '-', name)
    return name

def get_business_by_email(db: Session, email: str) -> Business | None:
    return db.query(Business).filter(Business.email == email).first()

def get_business_by_slug(db: Session, slug: str) -> Business | None:
    return db.query(Business).filter(Business.slug == slug).first()

def get_business_by_id(db: Session, business_id: str) -> Business | None:
    return db.query(Business).filter(Business.id == business_id).first()

def create_business(db: Session, name: str, email: str, password: str) -> Business:
    slug = slugify(name)
    existing = get_business_by_slug(db, slug)
    if existing:
        slug = f"{slug}-{str(uuid.uuid4())[:4]}"
    
    business = Business(
        id=str(uuid.uuid4()),
        name=name,
        email=email,
        slug=slug,
        password_hash=hash_password(password)
    )
    db.add(business)
    db.commit()
    db.refresh(business)
    return business
