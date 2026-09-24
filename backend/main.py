from fastapi import FastAPI

from api.routes import auth, admin, health

app = FastAPI(
    title="RAC Mess Management API",
    version="0.1.0"
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(admin.router)