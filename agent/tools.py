from sqlalchemy.orm import Session
from repositories.order_repo import get_order_by_id, get_delayed_orders, get_cargo_events
from repositories.product_repo import get_product_by_name, get_critical_stocks
from repositories.message_repo import save_message, get_pending_customer_messages
from services.dashboard_service import get_dashboard_summary
from services.analytics_service import predict_stockout
import uuid

def tool_get_order_status(db: Session, business_id: str, order_id: int) -> dict:
    order = get_order_by_id(db, order_id, business_id)
    if not order:
        return {"error": f"{order_id} numaralı sipariş bulunamadı."}
    
    cargo_events = get_cargo_events(db, order.cargo_tracking_no) if order.cargo_tracking_no else []
    last_event = cargo_events[0] if cargo_events else None

    return {
        "order_id": order.id,
        "customer_name": order.customer_name,
        "product": order.product.name if order.product else "Bilinmiyor",
        "quantity": order.quantity,
        "status": order.status,
        "cargo_tracking_no": order.cargo_tracking_no,
        "estimated_delivery": str(order.estimated_delivery) if order.estimated_delivery else None,
        "last_cargo_location": last_event.location if last_event else None,
        "is_delayed": last_event.is_delayed if last_event else False
    }

def tool_check_stock(db: Session, business_id: str, product_name: str) -> dict:
    product = get_product_by_name(db, business_id, product_name)
    if not product:
        return {"error": f"'{product_name}' adında ürün bulunamadı."}
    
    return {
        "product": product.name,
        "stock": product.stock,
        "unit": product.unit,
        "price": product.price,
        "critical_threshold": product.critical_threshold,
        "status": "KRİTİK" if product.stock <= product.critical_threshold else "YETERLI"
    }

def tool_get_daily_summary(db: Session, business_id: str) -> dict:
    return get_dashboard_summary(db, business_id)

def tool_predict_stockout(db: Session, business_id: str, product_name: str) -> dict:
    return predict_stockout(db, business_id, product_name)

def tool_notify_customers(db: Session, business_id: str, order_ids: list[int], message_type: str) -> dict:
    from repositories.order_repo import get_order_by_id
    
    messages_sent = []
    for order_id in order_ids:
        order = get_order_by_id(db, order_id, business_id)
        if not order:
            continue
        
        if message_type == "delay":
            content = f"Sayın {order.customer_name}, {order.id} numaralı siparişinizin teslimatında gecikme yaşanmaktadır. Özür dileriz."
        elif message_type == "shipped":
            content = f"Sayın {order.customer_name}, {order.id} numaralı siparişiniz kargoya verilmiştir. Takip no: {order.cargo_tracking_no}"
        else:
            content = f"Sayın {order.customer_name}, siparişiniz hakkında bilgilendirme: {message_type}"
        
        session_id = f"notify_{order_id}_{str(uuid.uuid4())[:4]}"
        save_message(db, business_id, session_id, "ai", content)
        messages_sent.append({
            "order_id": order_id,
            "customer": order.customer_name,
            "message": content
        })
    
    return {
        "sent_count": len(messages_sent),
        "messages": messages_sent
    }

TOOL_DEFINITIONS = [
    {
        "name": "get_order_status",
        "description": "Verilen sipariş ID'sine göre sipariş durumunu ve kargo bilgisini getirir.",
        "parameters": {
            "type": "object",
            "properties": {
                "order_id": {"type": "integer", "description": "Sipariş numarası"}
            },
            "required": ["order_id"]
        }
    },
    {
        "name": "check_stock",
        "description": "Ürün adına göre stok durumunu kontrol eder.",
        "parameters": {
            "type": "object",
            "properties": {
                "product_name": {"type": "string", "description": "Ürün adı"}
            },
            "required": ["product_name"]
        }
    },
    {
        "name": "get_daily_summary",
        "description": "Bugünkü sipariş özeti, geciken kargolar ve kritik stokları getirir.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "predict_stockout",
        "description": "Geçmiş satış verilerine göre ürünün kaç günde tükeneceğini tahmin eder.",
        "parameters": {
            "type": "object",
            "properties": {
                "product_name": {"type": "string", "description": "Ürün adı"}
            },
            "required": ["product_name"]
        }
    },
    {
        "name": "notify_customers",
        "description": "Belirtilen siparişlerin müşterilerine otomatik bildirim mesajı gönderir.",
        "parameters": {
            "type": "object",
            "properties": {
                "order_ids": {"type": "array", "items": {"type": "integer"}, "description": "Bildirim gönderilecek sipariş ID listesi"},
                "message_type": {"type": "string", "description": "Mesaj tipi: delay, shipped veya özel mesaj"}
            },
            "required": ["order_ids", "message_type"]
        }
    }
]