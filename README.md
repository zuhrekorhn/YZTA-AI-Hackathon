# KoopAI - YZTA AI Hackathon Projesi

KoopAI, KOBI ve kooperatiflerin siparis, stok, kargo ve musteri iletisim sureclerini yapay zeka destekli sekilde yonetmek icin gelistirilmis bir prototiptir.

Bu repo hackathon beklentilerine uygun olarak su hedefleri kapsar:

- Calisir prototip
- Sistem mimarisi aciklamasi
- Kullanilan AI yaklasiminin aciklanmasi
- Kisa ve etkili demo akisi

## Problem ve Cozum Ozeti

KOBI'lerde su surecler genellikle manuel yurutuluyor:::

- Siparis takibi
- Kargo gecikme yonetimi
- Stok kritik esik takibi
- Musteri sorularina hizli yanit

KoopAI, bu alanlari tek panelde birlestirip LLM tabanli ajan araciligiyla hem bilgi uretiyor hem de aksiyon alabiliyor.

## Kapsanan Hackathon Basliklari

Proje su 3 ana baslikta calisir durumdadir:

1. Musteri Iletisiminin Otomasyonu
2. Urun ve Siparis Takibi
3. Stok ve Envanter Yonetimi

## Sistem Mimarisi

Yuksek seviye akis:

1. Next.js frontend yonetici panelinden API cagrisi yapar.
2. FastAPI backend kimlik dogrulama (JWT) ve is kurallarini calistirir.
3. AI ajan Gemini uzerinden tool-calling ile veriye erisir.
4. SQLAlchemy katmani SQLite veritabanindan siparis/stok/mesaj verilerini okur-yazar.

### Bilesenler

- Frontend: Next.js App Router + TypeScript + Tailwind
- Backend: FastAPI + SQLAlchemy
- AI: Gemini 2.5 Flash (agent + tool calling)
- DB: SQLite

### Mimari Diyagram

Aşağıdaki şema, bileşenler arasındaki etkileşimi ve veri akışını özetlemektedir:

```text
+---------------------+       +-----------------------+
|    User Browser     | <---> |   Next.js Frontend    |
+---------------------+       +-----------------------+
                                          ^
                                          | API (REST)
                                          v
                              +-----------------------+      (Opsiyonel)
                              |   FastAPI Backend     | <--- Harici Servisler
                              +-----------------------+      (Kargo/WhatsApp)
                                /         |         \
                               /          |          \
                              v           v           v
                        +-------+   +----------+   +-------------------+
                        | Auth  |   | Database |   |     AI Agent      |
                        | (JWT) |   | (SQLite) |   | (Gemini 2.5 Flash)|
                        +-------+   +----------+   +-------------------+
                                          ^                 |      |
                                          |                 |      | (API Çağrısı)
                                          | Tool Calling    v      v
                                    +--------------------+   +------------+
                                    |    Agent Tools     |   | Gemini API |
                                    | - check_stock      |   +------------+
                                    | - predict_stockout |
                                    | - get_order_status |
                                    | - notify_customers |
                                    +--------------------+
```

### Proje Yapisi

- `src/app/*`: Dashboard, siparis, stok, kargo, sohbet ekranlari
- `src/lib/api.ts`: Frontend API istemcisi (token dahil)
- `agent/*`: AI agent, promptlar ve tool tanimlari
- `routers/*`: FastAPI endpointleri
- `services/*`: Is mantigi (ozet, analytics)
- `repositories/*`: Veri erisim katmani
- `models/tables.py`: SQLAlchemy tablo tanimlari
- `seed/seed_data.py`: Demo veri yukleme

## AI Yaklasimi

KoopAI, iki farkli sistem promptu ile calisan bir agent mimarisi kullanir:

- Customer agent: musteri odakli yanitlar
- Manager agent: operasyonel ozet, uyarilar ve aksiyonlar

### Tool Calling

Agent su toollar ile aksiyon alir:

- `get_order_status`
- `check_stock`
- `get_daily_summary`
- `predict_stockout`
- `notify_customers`

Bu sayede sadece sohbet degil, veri tabani destekli karar ve islem akislari da saglanir.

## Ozellikler

### 1) Urun ve Siparis Takibi

- Gunluk dashboard ozeti
- Siparis listesi ve durum guncelleme
- Kritik stok ve geciken kargo uyari gorunumu

### 2) Stok ve Envanter Yonetimi

- Urun bazli stok gorunumu
- Kritik esik kontrolu
- Gecmis satis verisinden stok bitis tahmini
- Stok guncelleme aksiyonlari

### 3) Musteri Iletisimi Otomasyonu

- Yonetici asistan sohbeti
- Kargo gecikme durumunda AI yardimiyla bilgilendirme
- Session bazli mesaj kaydi

## API Ozeti

### Public

- `POST /auth/register`
- `POST /auth/login`
- `POST /chat/customer/{slug}`

### Protected (Bearer Token)

- `GET /dashboard/`
- `GET /dashboard/products`
- `PUT /dashboard/products/{product_id}/stock`
- `GET /dashboard/predict/{product_name}`
- `GET /dashboard/orders`
- `PUT /dashboard/orders/{order_id}/status`
- `POST /chat/manager`
- `GET /business/chat-link`
- `GET /business/me`

## Kurulum

### Gereksinimler

- Python 3.11+
- Node.js 20+

### 1) Backend kurulum

```bash
pip install -r requirements.txt
```

`.env` dosyasi olusturun:

```env
GEMINI_API_KEY=your_gemini_key
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///./koopai.db
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Seed verisini yukleyin:

```bash
python -m seed.seed_data
```

Backend'i baslatin:

```bash
uvicorn main:app --reload
```

### 2) Frontend kurulum

```bash
npm install
npm run dev
```

Opsiyonel frontend env:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_DEMO_EMAIL=antakya@koopai.com
NEXT_PUBLIC_DEMO_PASSWORD=test123
NEXT_PUBLIC_API_TIMEOUT_MS=10000
```

## Demo Hesabi

Seed ile olusan demo isletme:

- Email: `antakya@koopai.com`
- Sifre: `test123`

## Demo Senaryosu (2-3 Dakika)

1. Dashboard acilir, bugunku siparis ve kritik stok ozeti gosterilir.
2. Stok ekraninda tahmin sonucu gorulur, onerilen stok artisi uygulanir.
3. Kargo ekraninda geciken siparis secilir ve musteri bilgilendirme aksiyonu tetiklenir.
4. Sohbet ekraninda yonetici asistanina operasyon sorusu sorulur, tool-calling ile yanit alinir.

## Beklenen Ciktiya Gore Durum

- Calisir prototip: Tamam
- Sistem mimarisi README'de aciklandi: Tamam
- AI yaklasimi aciklandi: Tamam
- Kisa ve etkili demo akisi: Tamam

## Sonraki Gelistirme Alanlari

- Musteri tarafi canli chat arayuzu (customer endpoint icin)
- Konusma gecmisi ekraninda filtreleme ve raporlama
- Toplu bildirim ve e-posta/WhatsApp entegrasyonu

