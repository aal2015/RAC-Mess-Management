from datetime import date, datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

from main import app
from api.routes import admin as admin_routes
from models.user import User
from models.meal_item import MealItem
from models.meal_booking import MealBooking
from models.location import Location, MessLocation
from models.route import Route
from models.route_location import RouteLocation

BATTALION = "Alpha"
OTHER_BATTALION = "Bravo"

ADMIN_ID = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
USER_ID = UUID("11111111-1111-1111-1111-111111111111")
LOCATION_ID = UUID("22222222-2222-2222-2222-222222222222")
ROUTE_ID = UUID("44444444-4444-4444-4444-444444444444")
ROUTE_LOCATION_ID = UUID("55555555-5555-5555-5555-555555555555")
MESS_LOCATION_ID = UUID("66666666-6666-6666-6666-666666666666")

NOW = datetime.now(timezone.utc)

# --------------------------------------------------
# Fixtures and helpers
# --------------------------------------------------

@pytest.fixture
def db():
    return MagicMock()

@pytest.fixture
def admin():
    return SimpleNamespace(
        id=ADMIN_ID,
        username="admin",
        battalion=BATTALION,
        role="admin",
    )

@pytest.fixture
def client(db, admin):
    app.dependency_overrides[admin_routes.get_db] = lambda: db
    app.dependency_overrides[admin_routes.get_current_admin] = lambda: admin

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

@pytest.fixture
def test_user():
    return SimpleNamespace(
        id=USER_ID,
        username="testuser",
        name="Test User",
        phone="9876543210",
        role="user",
        battalion=BATTALION,
        location_id=None,
        bus="Bus 1",
        is_active=True,
    )

@pytest.fixture
def location():
    return SimpleNamespace(
        id=LOCATION_ID,
        battalion=BATTALION,
        latitude=28.6139,
        longitude=77.2090,
        road_name="Main Road",
        created_at=NOW,
    )

@pytest.fixture
def route():
    return SimpleNamespace(
        id=ROUTE_ID,
        route_number=1,
        battalion=BATTALION,
        name="Route 1",
    )

@pytest.fixture
def route_location():
    return SimpleNamespace(
        id=ROUTE_LOCATION_ID,
        route_id=ROUTE_ID,
        location_id=LOCATION_ID,
        mess_location_id=None,
        stop_order=1,
    )

@pytest.fixture
def mess_location():
    return SimpleNamespace(
        id=MESS_LOCATION_ID,
        name="Main Mess",
        battalion=BATTALION,
        latitude=28.6139,
        longitude=77.2090,
        landmark="Near main gate",
        created_at=NOW,
        updated_at=NOW,
    )

def make_query(first=None, all_=None):
    query = MagicMock()
    query.filter.return_value = query
    query.first.return_value = first
    query.all.return_value = all_ if all_ is not None else []
    return query

def set_queries(db, *queries):
    db.query.side_effect = list(queries)


def set_refresh_defaults(db):
    def refresh(obj):
        if getattr(obj, "id", None) is None:
            obj.id = USER_ID

        if hasattr(obj, "created_at") and obj.created_at is None:
            obj.created_at = NOW

        if hasattr(obj, "updated_at") and obj.updated_at is None:
            obj.updated_at = NOW

    db.refresh.side_effect = refresh

# --------------------------------------------------
# POST /admin/users
# --------------------------------------------------

def test_create_user_success(client, db, admin, monkeypatch):
    monkeypatch.setattr(admin_routes, "hash_password", lambda password: "hashed")
    set_queries(db, make_query(first=None))
    set_refresh_defaults(db)

    response = client.post(
    "/admin/users",
    json={
    "username": "newuser",
    "password": "password123",
    "name": "New User",
    "phone": "9876543210",
    "role": "user",
    "bus": "Bus 1",
    },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newuser"
    assert data["name"] == "New User"
    assert data["role"] == "user"
    assert data["battalion"] == BATTALION
    assert data["is_active"] is True

    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_create_user_invalid_role(client, db):
    response = client.post(
    "/admin/users",
    json={
    "username": "newuser",
    "password": "password123",
    "name": "New User",
    "role": "admin",
    },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Role must be user or driver"
    db.add.assert_not_called()

def test_create_user_admin_without_battalion(client, db, admin):
    admin.battalion = None

    response = client.post(
    "/admin/users",
    json={
    "username": "newuser",
    "password": "password123",
    "name": "New User",
    "role": "user",
    },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Admin is not assigned to a battalion"
    db.add.assert_not_called()

def test_create_user_duplicate_username(client, db):
    set_queries(db, make_query(first=SimpleNamespace(username="newuser")))

    response = client.post(
    "/admin/users",
    json={
    "username": "newuser",
    "password": "password123",
    "name": "New User",
    "role": "user",
    },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Username already exists"
    db.add.assert_not_called()

# --------------------------------------------------
# POST /admin/meal-items
# --------------------------------------------------

def test_create_meal_item_success(client, db):
    set_queries(db, make_query(first=None))
    set_refresh_defaults(db)

    response = client.post(
    "/admin/meal-items",
    json={"item": "  Rice  "},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["item"] == "Rice"
    assert data["id"] is not None
    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_create_meal_item_duplicate(client, db):
    existing = SimpleNamespace(item="Rice")
    set_queries(db, make_query(first=existing))

    response = client.post(
    "/admin/meal-items",
    json={"item": " Rice "},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Meal item already exists"
    db.add.assert_not_called()

def test_create_meal_item_admin_without_battalion(client, db, admin):
    admin.battalion = None

    response = client.post(
    "/admin/meal-items",
    json={"item": "Rice"},
    )

    assert response.status_code == 400
    db.add.assert_not_called()

# --------------------------------------------------
# POST /admin/bookings
# --------------------------------------------------

def test_create_meal_bookings_success(client, db, test_user):
    booking_date = date.today() + timedelta(days=2)

    user_query = make_query(first=test_user)
    bookings_query = make_query(all_=[])
    set_queries(db, user_query, bookings_query)

def refresh_booking(booking):
    booking.id = UUID("77777777-7777-7777-7777-777777777777")
    booking.created_at = NOW
    booking.updated_at = NOW

    db.refresh.side_effect = refresh_booking

    response = client.post(
    "/admin/bookings",
    json={
    "username": "testuser",
    "dates": [booking_date.isoformat()],
    "lunch": True,
    "dinner": False,
    },
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["user_id"] == str(USER_ID)
    assert data[0]["book_date"] == booking_date.isoformat()
    assert data[0]["lunch"] is True
    assert data[0]["dinner"] is False

    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_create_meal_bookings_user_not_found(client, db):
    set_queries(db, make_query(first=None))

    response = client.post(
    "/admin/bookings",
    json={
    "username": "missing",
    "dates": [(date.today() + timedelta(days=1)).isoformat()],
    "lunch": True,
    },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"

def test_create_meal_bookings_inactive_user(client, db, test_user):
    test_user.is_active = False
    set_queries(db, make_query(first=test_user))

    response = client.post(
    "/admin/bookings",
    json={
    "username": "testuser",
    "dates": [(date.today() + timedelta(days=1)).isoformat()],
    "lunch": True,
    },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "User is inactive"

def test_create_meal_bookings_no_meal_selected(client, db, test_user):
    set_queries(db, make_query(first=test_user))

    response = client.post(
    "/admin/bookings",
    json={
    "username": "testuser",
    "dates": [(date.today() + timedelta(days=1)).isoformat()],
    "lunch": False,
    "dinner": False,
    },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "At least one meal must be selected"

def test_create_meal_bookings_past_date(client, db, test_user):
    set_queries(db, make_query(first=test_user))

    response = client.post(
    "/admin/bookings",
    json={
    "username": "testuser",
    "dates": [(date.today() - timedelta(days=1)).isoformat()],
    "lunch": True,
    },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot create bookings for past dates"

def test_create_meal_bookings_duplicate_date(client, db, test_user):
    booking_date = date.today() + timedelta(days=1)
    existing_booking = SimpleNamespace(book_date=booking_date)

    set_queries(
    db,
    make_query(first=test_user),
    make_query(all_=[existing_booking]),
    )

    response = client.post(
    "/admin/bookings",
    json={
    "username": "testuser",
    "dates": [booking_date.isoformat()],
    "lunch": True,
    },
    )

    assert response.status_code == 409
    assert response.json()["detail"]["message"] == (
    "Booking already exists for one or more dates"
    )
    assert response.json()["detail"]["dates"] == [booking_date.isoformat()]
    db.add.assert_not_called()

# --------------------------------------------------
# DELETE /admin/bookings
# --------------------------------------------------

def test_cancel_user_booking_success(client, db, test_user):
    booking_date = date.today() + timedelta(days=1)
    booking = SimpleNamespace(
    user_id=USER_ID,
    book_date=booking_date,
    )

    set_queries(
    db,
    make_query(first=test_user),
    make_query(first=booking),
    )

    response = client.request(
    "DELETE",
    "/admin/bookings",
    json={
    "username": "testuser",
    "book_date": booking_date.isoformat(),
    },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Booking cancelled successfully"
    assert response.json()["username"] == "testuser"

    db.delete.assert_called_once_with(booking)
    db.commit.assert_called_once()

def test_cancel_user_booking_user_not_found(client, db):
    set_queries(db, make_query(first=None))

    response = client.request(
    "DELETE",
    "/admin/bookings",
    json={
    "username": "missing",
    "book_date": date.today().isoformat(),
    },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"

def test_cancel_user_booking_other_battalion(client, db, test_user):
    test_user.battalion = OTHER_BATTALION
    set_queries(db, make_query(first=test_user))

    response = client.request(
    "DELETE",
    "/admin/bookings",
    json={
    "username": "testuser",
    "book_date": date.today().isoformat(),
    },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
    "You can only access users in your battalion"
    )

def test_cancel_user_booking_not_found(client, db, test_user):
    set_queries(
    db,
    make_query(first=test_user),
    make_query(first=None),
    )

    response = client.request(
    "DELETE",
    "/admin/bookings",
    json={
    "username": "testuser",
    "book_date": date.today().isoformat(),
    },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Booking not found"

# --------------------------------------------------
# POST /admin/locations
# --------------------------------------------------

def test_create_location_success(client, db):
    set_refresh_defaults(db)

    response = client.post(
    "/admin/locations",
    json={
    "latitude": 28.6139,
    "longitude": 77.2090,
    "road_name": "Main Road",
    },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["battalion"] == BATTALION
    assert data["latitude"] == 28.6139
    assert data["road_name"] == "Main Road"

    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_create_location_admin_without_battalion(client, db, admin):
    admin.battalion = None

    response = client.post(
    "/admin/locations",
    json={
    "latitude": 28.6139,
    "longitude": 77.2090,
    },
    )

    assert response.status_code == 400
    db.add.assert_not_called()

def test_create_location_invalid_coordinates(client, db):
    response = client.post(
    "/admin/locations",
    json={
    "latitude": 100,
    "longitude": 77.2090,
    },
    )

    assert response.status_code == 422
    db.add.assert_not_called()

# --------------------------------------------------
# PUT /admin/assign-location/{username}
# --------------------------------------------------

def test_assign_user_location_success(client, db, test_user, location):
    set_queries(
    db,
    make_query(first=test_user),
    make_query(first=location),
    )

    response = client.put(
    "/admin/assign-location/testuser",
    json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Location assigned successfully"
    assert test_user.location_id == LOCATION_ID
    db.commit.assert_called_once()

def test_assign_user_location_user_not_found(client, db):
    set_queries(db, make_query(first=None))

    response = client.put(
    "/admin/assign-location/missing",
    json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found in your battalion"

def test_assign_user_location_not_found(client, db, test_user):
    set_queries(
    db,
    make_query(first=test_user),
    make_query(first=None),
    )

    response = client.put(
    "/admin/assign-location/testuser",
    json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Location not found in your battalion"

def test_assign_user_location_already_assigned(client, db, test_user, location):
    test_user.location_id = LOCATION_ID

    set_queries(
    db,
    make_query(first=test_user),
    make_query(first=location),
    )

    response = client.put(
    "/admin/assign-location/testuser",
    json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 200
    assert response.json()["message"] == (
    "User is already assigned to this location"
    )
    db.commit.assert_not_called()

def test_assign_user_location_database_error(client, db, test_user, location):
    set_queries(
    db,
    make_query(first=test_user),
    make_query(first=location),
    )
    db.commit.side_effect = SQLAlchemyError("database error")

    response = client.put(
    "/admin/assign-location/testuser",
    json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 500
    assert response.json()["detail"] == "Failed to assign location to user"
    db.rollback.assert_called_once()

# --------------------------------------------------
# PATCH /admin/locations/{username}
# --------------------------------------------------

def test_update_user_location_success(client, db, test_user, location):
    test_user.location_id = LOCATION_ID
    db.query.return_value = make_query(first=test_user)
    db.get.return_value = location

    response = client.patch(
    "/admin/locations/testuser",
    json={
    "latitude": 28.7000,
    "road_name": "Updated Road",
    },
    )

    assert response.status_code == 200
    assert response.json()["latitude"] == 28.7000
    assert response.json()["longitude"] == 77.2090
    assert response.json()["road_name"] == "Updated Road"

    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(location)

def test_update_user_location_user_not_found(client, db):
    db.query.return_value = make_query(first=None)

    response = client.patch(
    "/admin/locations/missing",
    json={"road_name": "Updated Road"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found in your battalion"

def test_update_user_location_user_has_no_location(client, db, test_user):
    test_user.location_id = None
    db.query.return_value = make_query(first=test_user)

    response = client.patch(
    "/admin/locations/testuser",
    json={"road_name": "Updated Road"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User does not have a location"

def test_update_user_location_record_missing(client, db, test_user):
    test_user.location_id = LOCATION_ID
    db.query.return_value = make_query(first=test_user)
    db.get.return_value = None

    response = client.patch(
    "/admin/locations/testuser",
    json={"road_name": "Updated Road"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Location not found"
    assert test_user.location_id is None
    db.commit.assert_called_once()

def test_update_user_location_other_battalion(client, db, test_user, location):
    test_user.location_id = LOCATION_ID
    location.battalion = OTHER_BATTALION
    db.query.return_value = make_query(first=test_user)
    db.get.return_value = location

    response = client.patch(
    "/admin/locations/testuser",
    json={"road_name": "Updated Road"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
    "Location does not belong to your battalion"
    )
    db.commit.assert_not_called()

# --------------------------------------------------
# DELETE /admin/locations/{username}
# --------------------------------------------------

def test_delete_user_location_success(client, db, test_user):
    test_user.location_id = LOCATION_ID
    db.query.return_value = make_query(first=test_user)

    response = client.delete("/admin/locations/testuser")

    assert response.status_code == 200
    assert response.json()["message"] == (
    "User location unassigned successfully"
    )
    assert test_user.location_id is None
    db.commit.assert_called_once()
    db.delete.assert_not_called()

def test_delete_user_location_user_not_found(client, db):
    db.query.return_value = make_query(first=None)

    response = client.delete("/admin/locations/missing")

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found in your battalion"

def test_delete_user_location_not_assigned(client, db, test_user):
    test_user.location_id = None
    db.query.return_value = make_query(first=test_user)

    response = client.delete("/admin/locations/testuser")

    assert response.status_code == 404
    assert response.json()["detail"] == "User does not have a location"
    db.commit.assert_not_called()

# --------------------------------------------------
# POST /admin/{route_number}/locations
# --------------------------------------------------

def test_link_route_location_success(client, db, route, location):
    set_queries(
    db,
    make_query(first=route),
    make_query(first=location),
    make_query(first=None),
    )
    set_refresh_defaults(db)

    response = client.post(
    "/admin/1/locations",
    json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["route_id"] == str(ROUTE_ID)
    assert data["location_id"] == str(LOCATION_ID)

    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_link_route_location_route_not_found(client, db):
    set_queries(db, make_query(first=None))

    response = client.post(
    "/admin/1/locations",
    json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Route not found in your battalion"

def test_link_route_location_not_found(client, db, route):
    set_queries(
    db,
    make_query(first=route),
    make_query(first=None),
    )

    response = client.post(
    "/admin/1/locations",
    json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Location not found in your battalion"

def test_link_route_location_duplicate(client, db, route, location):
    existing = SimpleNamespace(id=ROUTE_LOCATION_ID)
    set_queries(
    db,
    make_query(first=route),
    make_query(first=location),
    make_query(first=existing),
    )

    response = client.post(
    "/admin/1/locations",
    json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Location is already assigned to this route"

def test_link_route_location_duplicate_stop_order(client, db, route, location):
    existing = SimpleNamespace(id=ROUTE_LOCATION_ID)
    set_queries(
    db,
    make_query(first=route),
    make_query(first=location),
    make_query(first=None),
    make_query(first=existing),
    )

    response = client.post(
    "/admin/1/locations",
    json={
    "location_id": str(LOCATION_ID),
    "stop_order": 1,
    },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Stop order already exists for this route"

# --------------------------------------------------
# PATCH /admin/{route_number}/locations/{location_id}
# --------------------------------------------------

def test_update_route_location_success(client, db, route, route_location):
    set_queries(
        db,
        make_query(first=route),
        make_query(first=route_location),
        make_query(first=None),  # No duplicate stop order
    )
    set_refresh_defaults(db)

    response = client.patch(
        f"/admin/1/locations/{LOCATION_ID}",
        json={"stop_order": 3},
    )

    assert response.status_code == 200
    assert route_location.stop_order == 3
    db.commit.assert_called_once()

def test_update_route_location_route_not_found(client, db):
    set_queries(db, make_query(first=None))

    response = client.patch(
    f"/admin/1/locations/{LOCATION_ID}",
    json={"stop_order": 3},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Route not found in your battalion"

def test_update_route_location_not_assigned(client, db, route):
    set_queries(
    db,
    make_query(first=route),
    make_query(first=None),
    )

    response = client.patch(
    f"/admin/1/locations/{LOCATION_ID}",
    json={"stop_order": 3},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Location is not assigned to this route"

def test_update_route_location_duplicate_stop_order(
    client, db, route, route_location
):
    existing = SimpleNamespace(id=UUID("88888888-8888-8888-8888-888888888888"))
    set_queries(
    db,
    make_query(first=route),
    make_query(first=route_location),
    make_query(first=existing),
    )

    response = client.patch(
    f"/admin/1/locations/{LOCATION_ID}",
    json={"stop_order": 2},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Stop order already exists for this route"

# --------------------------------------------------
# DELETE /admin/{route_number}/locations/{location_id}
# --------------------------------------------------

def test_delete_route_location_success(client, db, route, route_location):
    set_queries(
    db,
    make_query(first=route),
    make_query(first=route_location),
    )

    response = client.delete(f"/admin/1/locations/{LOCATION_ID}")

    assert response.status_code == 200
    assert response.json()["message"] == (
    "Location removed from route successfully"
    )
    db.delete.assert_called_once_with(route_location)
    db.commit.assert_called_once()

def test_delete_route_location_route_not_found(client, db):
    set_queries(db, make_query(first=None))

    response = client.delete(f"/admin/1/locations/{LOCATION_ID}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Route not found in your battalion"

def test_delete_route_location_not_assigned(client, db, route):
    set_queries(
    db,
    make_query(first=route),
    make_query(first=None),
    )

    response = client.delete(f"/admin/1/locations/{LOCATION_ID}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Location is not assigned to this route"

# --------------------------------------------------
# DELETE /admin/delete-locations/{location_id}
# --------------------------------------------------

def test_delete_location_success(client, db, location):
    location_query = make_query(first=location)
    user_query = make_query()
    set_queries(db, location_query, user_query)

    response = client.delete(f"/admin/delete-locations/{LOCATION_ID}")

    assert response.status_code == 200
    assert response.json()["message"] == "Location deleted successfully"
    assert response.json()["location_id"] == str(LOCATION_ID)

    user_query.update.assert_called_once()
    db.delete.assert_called_once_with(location)
    db.commit.assert_called_once()

def test_delete_location_not_found(client, db):
    set_queries(db, make_query(first=None))

    response = client.delete(f"/admin/delete-locations/{LOCATION_ID}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Location not found in your battalion"
    db.delete.assert_not_called()

def test_delete_location_database_error(client, db, location):
    set_queries(
    db,
    make_query(first=location),
    make_query(),
    )
    db.commit.side_effect = SQLAlchemyError("database error")

    response = client.delete(f"/admin/delete-locations/{LOCATION_ID}")

    assert response.status_code == 500
    assert response.json()["detail"] == "Failed to delete location"
    db.rollback.assert_called_once()

# --------------------------------------------------
# POST /admin/mess-locations
# --------------------------------------------------

def test_create_mess_location_success(client, db):
    set_refresh_defaults(db)

    response = client.post(
    "/admin/mess-locations",
    json={
    "name": "Main Mess",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "landmark": "Near main gate",
    },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Main Mess"
    assert data["battalion"] == BATTALION
    assert data["landmark"] == "Near main gate"

    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_create_mess_location_admin_without_battalion(client, db, admin):
    admin.battalion = None

    response = client.post(
    "/admin/mess-locations",
    json={
    "name": "Main Mess",
    "latitude": 28.6139,
    "longitude": 77.2090,
    },
    )

    assert response.status_code == 400
    db.add.assert_not_called()

def test_create_mess_location_invalid_coordinates(client, db):
    response = client.post(
    "/admin/mess-locations",
    json={
    "name": "Main Mess",
    "latitude": 100,
    "longitude": 77.2090,
    },
    )

    assert response.status_code == 422
    db.add.assert_not_called()

# --------------------------------------------------
# POST /admin/routes/{route_id}/mess-locations
# --------------------------------------------------

def test_assign_mess_location_to_route_success(
    client, db, route, mess_location
    ):
    set_queries(
    db,
    make_query(first=route),
    make_query(first=mess_location),
    make_query(first=None),
    )
    set_refresh_defaults(db)

    response = client.post(
    f"/admin/routes/{ROUTE_ID}/mess-locations",
    json={"mess_location_id": str(MESS_LOCATION_ID)},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["route_id"] == str(ROUTE_ID)
    assert data["mess_location_id"] == str(MESS_LOCATION_ID)
    assert data["stop_order"] is None

    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_assign_mess_location_route_not_found(client, db):
    set_queries(db, make_query(first=None))

    response = client.post(
    f"/admin/routes/{ROUTE_ID}/mess-locations",
    json={"mess_location_id": str(MESS_LOCATION_ID)},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Route not found in your battalion"

def test_assign_mess_location_not_found(client, db, route):
    set_queries(
    db,
    make_query(first=route),
    make_query(first=None),
    )

    response = client.post(
    f"/admin/routes/{ROUTE_ID}/mess-locations",
    json={"mess_location_id": str(MESS_LOCATION_ID)},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
    "Mess location not found in your battalion"
    )

def test_assign_mess_location_duplicate(client, db, route, mess_location):
    existing = SimpleNamespace(id=ROUTE_LOCATION_ID)
    set_queries(
    db,
    make_query(first=route),
    make_query(first=mess_location),
    make_query(first=existing),
    )

    response = client.post(
    f"/admin/routes/{ROUTE_ID}/mess-locations",
    json={"mess_location_id": str(MESS_LOCATION_ID)},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == (
    "Mess location is already assigned to this route"
    )

def test_assign_mess_location_duplicate_stop_order(
    client, db, route, mess_location
):
    existing = SimpleNamespace(id=ROUTE_LOCATION_ID)
    set_queries(
    db,
    make_query(first=route),
    make_query(first=mess_location),
    make_query(first=None),
    make_query(first=existing),
    )

    response = client.post(
    f"/admin/routes/{ROUTE_ID}/mess-locations",
    json={
    "mess_location_id": str(MESS_LOCATION_ID),
    "stop_order": 1,
    },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == (
    "This stop order is already used by the route"
    )