from datetime import date, timedelta, datetime, timezone
from core.database import SessionLocal, engine
from models.tables import Base, Business, Product, Order, CargoEvent, DailySale
from core.security import hash_password
import uuid

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing = db.query(Business).filter(Business.email == "antakya@koopai.com").first()
        if existing:
            print("Veri zaten yüklenmiş, atlanıyor.")
            return

        # İşletme 1
        b1 = Business(
            id=str(uuid.uuid4()),
            name="Antakya Zeytinyağı Kooperatifi",
            slug="antakya-zeytinyagi",
            email="antakya@koopai.com",
            password_hash=hash_password("test123"),
            address="Organik Tarım Vadisi, Merkez/Karabük",
            phone="+90 (555) 123 45 67",
            tax_number="1234567890",
            employee_count=14,
            active_members=120,
            rating=4.8
        )
        db.add(b1)
        db.flush()

        # Ürünler
        p1 = Product(business_id=b1.id, name="Sızma Zeytinyağı", stock=38, critical_threshold=50, price=280, unit="litre")
        p2 = Product(business_id=b1.id, name="Defne Sabunu", stock=120, critical_threshold=30, price=45, unit="adet")
        p3 = Product(business_id=b1.id, name="Kekik", stock=15, critical_threshold=20, price=60, unit="kg")
        p4 = Product(business_id=b1.id, name="Sele Zeytini", stock=80, critical_threshold=25, price=120, unit="kg")
        p5 = Product(business_id=b1.id, name="Narenciye Reçeli", stock=45, critical_threshold=15, price=95, unit="adet")
        db.add_all([p1, p2, p3, p4, p5])
        db.flush()

        # Kargo olayları
        cargo_events = [
            CargoEvent(tracking_no="YK123456", status="teslim edildi", location="Antakya", is_delayed=False),
            CargoEvent(tracking_no="YK789012", status="dağıtımda", location="Adana Şubesi", is_delayed=False),
            CargoEvent(tracking_no="YK345678", status="gecikiyor", location="İskenderun Şubesi", is_delayed=True),
            CargoEvent(tracking_no="MNG111222", status="dağıtımda", location="Mersin Şubesi", is_delayed=False),
            CargoEvent(tracking_no="MNG333444", status="gecikiyor", location="Gaziantep Şubesi", is_delayed=True),
        ]
        db.add_all(cargo_events)
        db.flush()

        today = date.today()

        # Siparişler
        orders = [
            Order(business_id=b1.id, product_id=p1.id, customer_name="Fatma Yıldız", customer_phone="05321234567", quantity=2, status="yolda", cargo_tracking_no="YK789012", estimated_delivery=today + timedelta(days=1)),
            Order(business_id=b1.id, product_id=p2.id, customer_name="Mehmet Kaya", customer_phone="05331234567", quantity=5, status="yolda", cargo_tracking_no="YK345678", estimated_delivery=today - timedelta(days=1)),
            Order(business_id=b1.id, product_id=p3.id, customer_name="Ayşe Demir", customer_phone="05341234567", quantity=1, status="yolda", cargo_tracking_no="MNG333444", estimated_delivery=today - timedelta(days=2)),
            Order(business_id=b1.id, product_id=p4.id, customer_name="Ali Çelik", customer_phone="05351234567", quantity=3, status="hazırlandı", cargo_tracking_no=None, estimated_delivery=today + timedelta(days=2)),
            Order(business_id=b1.id, product_id=p1.id, customer_name="Zeynep Kaya", customer_phone="05361234567", quantity=4, status="teslim edildi", cargo_tracking_no="YK123456", estimated_delivery=today - timedelta(days=3)),
            Order(business_id=b1.id, product_id=p5.id, customer_name="Hasan Şahin", customer_phone="05371234567", quantity=2, status="yolda", cargo_tracking_no="MNG111222", estimated_delivery=today + timedelta(days=1)),
            Order(business_id=b1.id, product_id=p2.id, customer_name="Hatice Öz", customer_phone="05381234567", quantity=10, status="hazırlandı", cargo_tracking_no=None, estimated_delivery=today + timedelta(days=3)),
            Order(business_id=b1.id, product_id=p3.id, customer_name="İbrahim Yılmaz", customer_phone="05391234567", quantity=2, status="yolda", cargo_tracking_no="YK789012", estimated_delivery=today + timedelta(days=1)),
        ]
        db.add_all(orders)
        db.flush()

        # Günlük satış geçmişi (son 30 gün)
        daily_sales = []
        for i in range(30):
            sale_date = today - timedelta(days=i)
            daily_sales.extend([
                DailySale(business_id=b1.id, product_id=p1.id, date=sale_date, quantity_sold=8),
                DailySale(business_id=b1.id, product_id=p2.id, date=sale_date, quantity_sold=5),
                DailySale(business_id=b1.id, product_id=p3.id, date=sale_date, quantity_sold=2),
                DailySale(business_id=b1.id, product_id=p4.id, date=sale_date, quantity_sold=4),
                DailySale(business_id=b1.id, product_id=p5.id, date=sale_date, quantity_sold=3),
            ])
        db.add_all(daily_sales)
        db.commit()
        print("Seed data yuklendi!")
        print(f"Isletme: {b1.name}")
        print(f"Slug: {b1.slug}")
        print(f"Email: antakya@koopai.com")
        print(f"Sifre: test123")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()