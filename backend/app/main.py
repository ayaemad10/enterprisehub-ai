from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import auth, drive, dashboard

# Import models so SQLAlchemy is aware of them when creating tables.
from app import models  # noqa: F401

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(drive.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def on_startup():
    # MVP: create tables directly. Swap for Alembic migrations once schema stabilizes.
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
