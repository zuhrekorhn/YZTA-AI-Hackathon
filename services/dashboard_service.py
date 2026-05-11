from sqlalchemy.orm import Session
from repositories.order_repo import get_todays_orders, get_delayed_orders
from repositories.product_repo import get_critical_stocks
from repositories.message_repo import get_pending_customer_messages

def get_dashboard_summary(db: Session, business_id: str) -> dict:
    todays_orders = get_todays_orders(db, business_id)
    delayed_orders = get_delayed_orders(db, business_id)
    critical_stocks = get_critical_stocks(db, business_id)
    pending_messages = get_pending_customer_messages(db, business_id)

    return {
        "total_orders_today": len(todays_orders),
        "delayed_orders_count": len(delayed_orders),
        "delayed_orders": [
            {
                "id": o.id,
                "customer_name": o.customer_name,
                "cargo_tracking_no": o.cargo_tracking_no,
                "estimated_delivery": str(o.estimated_delivery) if o.estimated_delivery else None
            }
            for o in delayed_orders
        ],
        "critical_stocks_count": len(critical_stocks),
        "critical_stocks": [
            {
                "name": p.name,
                "stock": p.stock,
                "critical_threshold": p.critical_threshold,
                "unit": p.unit
            }
            for p in critical_stocks
        ],
        "pending_messages_count": len(pending_messages),
        "alerts": _generate_alerts(delayed_orders, critical_stocks)
    }

def _generate_alerts(delayed_orders, critical_stocks) -> list:
    alerts = []
    if delayed_orders:
        alerts.append({
            "type": "warning",
            "message": f"{len(delayed_orders)} siparişin kargo teslimatı gecikiyor."
        })
    if critical_stocks:
        names = ", ".join([p.name for p in critical_stocks])
        alerts.append({
            "type": "danger",
            "message": f"Kritik stok seviyesi: {names}"
        })
    return alerts
