from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, admin, health
from models.user import User
from models.location import Location
from models.meal_item import MealItem
from models.meal_booking import MealBooking

app = FastAPI(
    title="RAC Mess Management API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(admin.router)