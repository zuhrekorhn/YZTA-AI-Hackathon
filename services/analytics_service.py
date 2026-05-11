from sqlalchemy.orm import Session
from repositories.product_repo import get_product_by_name, get_sales_last_n_days

def predict_stockout(db: Session, business_id: str, product_name: str) -> dict:
    product = get_product_by_name(db, business_id, product_name)
    
    if not product:
        return {"error": f"'{product_name}' adında ürün bulunamadı."}

    sales = get_sales_last_n_days(db, product.id, days=14)

    if not sales:
        return {
            "product": product.name,
            "current_stock": product.stock,
            "unit": product.unit,
            "avg_daily_sales": 0,
            "days_until_stockout": None,
            "recommended_order": 0,
            "status": "VERİ YOK",
            "message": "Yeterli satış verisi bulunamadı."
        }

    avg_daily = sum(s.quantity_sold for s in sales) / len(sales)

    if avg_daily == 0:
        days_left = None
        recommended = 0
    else:
        days_left = round(product.stock / avg_daily, 1)
        recommended = round((avg_daily * 30) - product.stock, 1)
        recommended = max(recommended, 0)

    if days_left is None:
        status = "NORMAL"
    elif days_left <= 3:
        status = "ACİL"
    elif days_left <= 7:
        status = "KRİTİK"
    else:
        status = "NORMAL"

    return {
        "product": product.name,
        "current_stock": product.stock,
        "unit": product.unit,
        "avg_daily_sales": round(avg_daily, 2),
        "days_until_stockout": days_left,
        "recommended_order": recommended,
        "status": status
    }
