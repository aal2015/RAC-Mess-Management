from fastapi import FastAPI

# from app.api.routes import admin, auth, health
from api.routes import health


app = FastAPI(
    title="Food Delivery API",
    version="0.1.0",
)


app.include_router(health.router)
# app.include_router(auth.router)
# app.include_router(admin.router)