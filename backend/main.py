from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine
from models.tables import Base
from routers.auth_router import router as auth_router
from routers.dashboard_router import router as dashboard_router
from routers.chat_router import router as chat_router
from routers.business_router import router as business_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="KoopAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(chat_router)
app.include_router(business_router)

@app.get("/")
def root():
    return {"message": "KoopAI çalışıyor"}