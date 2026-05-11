from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import HTTPException, status
from services.dashboard_service import get_dashboard_summary
from repositories.product_repo import get_products_by_business
from repositories.order_repo import get_orders_by_business
from services.analytics_service import predict_stockout
from schemas.schemas import StockUpdate, NewOrder
from models.tables import Product, Order
from datetime import date

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
security = HTTPBearer()

def get_current_business_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    business_id = decode_token(token)
    if not business_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz token")
    return business_id

@router.get("/")
def dashboard(
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    return get_dashboard_summary(db, business_id)

@router.get("/products")
def get_products(
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    products = get_products_by_business(db, business_id)
    return [
        {
            "id": p.id,
            "name": p.name,
            "stock": p.stock,
            "unit": p.unit,
            "price": p.price,
            "critical_threshold": p.critical_threshold,
            "status": "KRİTİK" if p.stock <= p.critical_threshold else "NORMAL"
        }
        for p in products
    ]

@router.put("/products/{product_id}/stock")
def update_stock(
    product_id: int,
    data: StockUpdate,
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.business_id == business_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    
    product.stock = data.new_stock
    db.commit()
    db.refresh(product)
    return {
        "message": f"{product.name} stoku güncellendi",
        "new_stock": product.stock,
        "status": "KRİTİK" if product.stock <= product.critical_threshold else "NORMAL"
    }

@router.get("/predict/{product_name}")
def get_stockout_prediction(
    product_name: str,
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    return predict_stockout(db, business_id, product_name)

@router.get("/orders")
def get_orders(
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    orders = get_orders_by_business(db, business_id)
    return [
        {
            "id": o.id,
            "customer_name": o.customer_name,
            "customer_phone": o.customer_phone,
            "product": o.product.name if o.product else None,
            "quantity": o.quantity,
            "status": o.status,
            "cargo_tracking_no": o.cargo_tracking_no,
            "estimated_delivery": str(o.estimated_delivery) if o.estimated_delivery else None,
            "created_at": str(o.created_at)
        }
        for o in orders
    ]

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    data: dict,
    business_id: str = Depends(get_current_business_id),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.business_id == business_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    
    order.status = data.get("status", order.status)
    if data.get("cargo_tracking_no"):
        order.cargo_tracking_no = data["cargo_tracking_no"]
    db.commit()
    return {"message": "Sipariş güncellendi", "status": order.status}