from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

from main import app
from api.routes import routes as route_routes
from api.routes import admin as admin_routes
from models.route import Route
from models.route_location import RouteLocation
from models.location import Location
from models.user import User


BATTALION = "Alpha"
OTHER_BATTALION = "Bravo"

USER_ID = UUID("11111111-1111-1111-1111-111111111111")
LOCATION_ID = UUID("22222222-2222-2222-2222-222222222222")
OTHER_LOCATION_ID = UUID("33333333-3333-3333-3333-333333333333")

ROUTE_ID = UUID("44444444-4444-4444-4444-444444444444")
ROUTE_LOCATION_ID = UUID("55555555-5555-5555-5555-555555555555")


@pytest.fixture
def db():
    return MagicMock()


@pytest.fixture
def admin():
    return SimpleNamespace(
        id=UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
        username="admin",
        battalion=BATTALION,
        role="admin",
    )


@pytest.fixture
def test_user():
    return SimpleNamespace(
        id=USER_ID,
        username="testuser",
        battalion=BATTALION,
        location_id=None,
    )


@pytest.fixture
def test_location():
    return SimpleNamespace(
        id=LOCATION_ID,
        battalion=BATTALION,
        latitude=28.6139,
        longitude=77.2090,
        road_name="Main Road",
        created_at=datetime.now(timezone.utc),
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
def location():
    return SimpleNamespace(
        id=LOCATION_ID,
        battalion=BATTALION,
        latitude=28.6139,
        longitude=77.2090,
        road_name="Main Road",
    )


@pytest.fixture
def route_location():
    return SimpleNamespace(
        id=ROUTE_LOCATION_ID,
        route_id=ROUTE_ID,
        location_id=LOCATION_ID,
        stop_order=1,
    )


@pytest.fixture(autouse=True)
def setup_dependencies(db, admin):
    # Dependencies used by the admin endpoints.
    app.dependency_overrides[admin_routes.get_db] = lambda: db
    app.dependency_overrides[admin_routes.get_current_admin] = (
        lambda: admin
    )

    # Dependencies used by the route endpoints.
    app.dependency_overrides[route_routes.get_db] = lambda: db

    # Use the dependency actually imported by api.routes.routes.
    app.dependency_overrides[route_routes.get_current_user] = (
        lambda: admin
    )

    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def query_result(result):
    """Create a mock query whose first() returns result."""
    mock_query = MagicMock()
    mock_query.filter.return_value.first.return_value = result
    return mock_query


def set_query_results(db, *results):
    """Set successive db.query(...).filter(...).first() results."""
    db.query.side_effect = [
        query_result(result) for result in results
    ]


# --------------------------------------------------
# POST /locations
# --------------------------------------------------

def test_create_location_success(client, db, admin):
    admin.battalion = BATTALION

    def refresh_location(location):
        location.id = LOCATION_ID
        location.created_at = datetime.now(timezone.utc)

    db.refresh.side_effect = refresh_location

    response = client.post(
        "/admin/locations",
        json={
            "latitude": 28.6139,
            "longitude": 77.2090,
            "road_name": "Main Road",
        },
    )

    assert response.status_code == 200
    assert response.json()["id"] == str(LOCATION_ID)
    assert response.json()["battalion"] == BATTALION
    assert response.json()["road_name"] == "Main Road"

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
    assert response.json()["detail"] == (
        "Admin is not assigned to a battalion"
    )
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_create_location_rejects_invalid_coordinates(client, db):
    response = client.post(
        "/admin/locations",
        json={
            "latitude": 100,
            "longitude": 77.2090,
        },
    )

    # Assumes CreateLocationRequest validates coordinate ranges.
    assert response.status_code == 422
    db.add.assert_not_called()


# --------------------------------------------------
# PUT /assign-location/{username}
# --------------------------------------------------

def test_assign_location_success(
    client, db, test_user, test_location
):
    db.query.return_value.filter.return_value.first.side_effect = [
        test_user,
        test_location,
    ]

    response = client.put(
        "/admin/assign-location/testuser",
        json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Location assigned successfully"
    assert response.json()["username"] == "testuser"
    assert response.json()["location_id"] == str(LOCATION_ID)

    assert test_user.location_id == LOCATION_ID
    db.commit.assert_called_once()


def test_assign_location_user_not_found(client, db):
    db.query.return_value.filter.return_value.first.return_value = None

    response = client.put(
        "/admin/assign-location/missinguser",
        json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "User not found in your battalion"
    )
    db.commit.assert_not_called()


def test_assign_location_not_found_in_battalion(
    client, db, test_user
):
    db.query.return_value.filter.return_value.first.side_effect = [
        test_user,
        None,
    ]

    response = client.put(
        "/admin/assign-location/testuser",
        json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Location not found in your battalion"
    )
    db.commit.assert_not_called()


def test_assign_location_already_assigned(
    client, db, test_user, test_location
):
    test_user.location_id = LOCATION_ID
    db.query.return_value.filter.return_value.first.side_effect = [
        test_user,
        test_location,
    ]

    response = client.put(
        "/admin/assign-location/testuser",
        json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 200
    assert response.json()["message"] == (
        "User is already assigned to this location"
    )
    db.commit.assert_not_called()


def test_assign_location_database_error(
    client, db, test_user, test_location
):
    db.query.return_value.filter.return_value.first.side_effect = [
        test_user,
        test_location,
    ]
    db.commit.side_effect = SQLAlchemyError("Database error")

    response = client.put(
        "/admin/assign-location/testuser",
        json={"location_id": str(LOCATION_ID)},
    )

    assert response.status_code == 500
    assert response.json()["detail"] == (
        "Failed to assign location to user"
    )
    db.rollback.assert_called_once()


# --------------------------------------------------
# PATCH /locations/{username}
# --------------------------------------------------

def test_update_user_location_success(
    client, db, test_user, test_location
):
    test_user.location_id = LOCATION_ID
    db.query.return_value.filter.return_value.first.return_value = (
        test_user
    )
    db.get.return_value = test_location

    response = client.patch(
        "/admin/locations/testuser",
        json={
            "latitude": 28.7000,
            "longitude": 77.3000,
            "road_name": "Updated Road",
        },
    )

    assert response.status_code == 200
    assert response.json()["latitude"] == pytest.approx(28.7000)
    assert response.json()["longitude"] == pytest.approx(77.3000)
    assert response.json()["road_name"] == "Updated Road"

    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(test_location)


def test_update_location_user_not_found(client, db):
    db.query.return_value.filter.return_value.first.return_value = None

    response = client.patch(
        "/admin/locations/missinguser",
        json={"latitude": 28.7},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "User not found in your battalion"
    )


def test_update_location_user_has_no_location(
    client, db, test_user
):
    test_user.location_id = None
    db.query.return_value.filter.return_value.first.return_value = (
        test_user
    )

    response = client.patch(
        "/admin/locations/testuser",
        json={"latitude": 28.7},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "User does not have a location"
    )


def test_update_location_record_missing(
    client, db, test_user
):
    test_user.location_id = LOCATION_ID
    db.query.return_value.filter.return_value.first.return_value = (
        test_user
    )
    db.get.return_value = None

    response = client.patch(
        "/admin/locations/testuser",
        json={"latitude": 28.7},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Location not found"

    # The endpoint clears the broken assignment.
    assert test_user.location_id is None
    db.commit.assert_called_once()


def test_update_location_wrong_battalion(
    client, db, test_user, test_location
):
    test_user.location_id = LOCATION_ID
    test_location.battalion = OTHER_BATTALION

    db.query.return_value.filter.return_value.first.return_value = (
        test_user
    )
    db.get.return_value = test_location

    response = client.patch(
        "/admin/locations/testuser",
        json={"latitude": 28.7},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
        "Location does not belong to your battalion"
    )
    db.commit.assert_not_called()


# --------------------------------------------------
# DELETE /locations/{username}
# --------------------------------------------------

def test_unassign_user_location_success(
    client, db, test_user
):
    test_user.location_id = LOCATION_ID
    db.query.return_value.filter.return_value.first.return_value = (
        test_user
    )

    response = client.delete("/admin/locations/testuser")

    assert response.status_code == 200
    assert response.json()["message"] == (
        "User location unassigned successfully"
    )
    assert response.json()["username"] == "testuser"

    assert test_user.location_id is None
    db.commit.assert_called_once()

    # The physical location must not be deleted.
    db.delete.assert_not_called()


def test_unassign_location_user_not_found(client, db):
    db.query.return_value.filter.return_value.first.return_value = None

    response = client.delete("/admin/locations/missinguser")

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "User not found in your battalion"
    )
    db.commit.assert_not_called()


def test_unassign_user_without_location(
    client, db, test_user
):
    test_user.location_id = None
    db.query.return_value.filter.return_value.first.return_value = (
        test_user
    )

    response = client.delete("/admin/locations/testuser")

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "User does not have a location"
    )
    db.commit.assert_not_called()


def test_unassign_location_admin_without_battalion(
    client, db, admin
):
    admin.battalion = None

    response = client.delete("/admin/locations/testuser")

    assert response.status_code == 400
    db.query.assert_not_called()


# ==================================================
# POST /{route_number}/locations
# ==================================================

def test_link_route_location_success(
    client, db, route, location
):
    set_query_results(
        db,
        route,       # Find route
        location,    # Find location in battalion
        None,        # No existing route-location link
        None,        # No existing stop order
    )

    def refresh_link(link):
        link.id = ROUTE_LOCATION_ID

    db.refresh.side_effect = refresh_link

    response = client.post(
        "/admin/1/locations",
        json={
            "location_id": str(LOCATION_ID),
            "stop_order": 1,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(ROUTE_LOCATION_ID)
    assert data["route_id"] == str(ROUTE_ID)
    assert data["location_id"] == str(LOCATION_ID)
    assert data["stop_order"] == 1

    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


def test_link_route_location_admin_without_battalion(
    client, db, admin
):
    admin.battalion = None

    response = client.post(
        "/admin/1/locations",
        json={
            "location_id": str(LOCATION_ID),
            "stop_order": 1,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Admin is not assigned to a battalion"
    )
    db.query.assert_not_called()


def test_link_route_location_route_not_found(client, db):
    set_query_results(db, None)

    response = client.post(
        "/admin/1/locations",
        json={
            "location_id": str(LOCATION_ID),
            "stop_order": 1,
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Route not found in your battalion"
    )
    db.add.assert_not_called()


def test_link_route_location_location_not_found(
    client, db, route
):
    set_query_results(db, route, None)

    response = client.post(
        "/admin/1/locations",
        json={
            "location_id": str(LOCATION_ID),
            "stop_order": 1,
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Location not found in your battalion"
    )
    db.add.assert_not_called()


def test_link_route_location_already_linked(
    client, db, route, location, route_location
):
    set_query_results(
        db,
        route,
        location,
        route_location,
    )

    response = client.post(
        "/admin/1/locations",
        json={
            "location_id": str(LOCATION_ID),
            "stop_order": 1,
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "Location is already assigned to this route"
    )
    db.add.assert_not_called()


def test_link_route_location_stop_order_conflict(
    client, db, route, location
):
    existing_link = SimpleNamespace(
        id=ROUTE_LOCATION_ID,
        route_id=ROUTE_ID,
        location_id=UUID(
            "dddddddd-dddd-dddd-dddd-dddddddddddd"
        ),
        stop_order=1,
    )

    set_query_results(
        db,
        route,
        location,
        None,
        existing_link,
    )

    response = client.post(
        "/admin/1/locations",
        json={
            "location_id": str(LOCATION_ID),
            "stop_order": 1,
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "Stop order already exists for this route"
    )
    db.add.assert_not_called()


# ==================================================
# PATCH /{route_number}/locations/{location_id}
# ==================================================

def test_update_route_location_success(client, db, route, route_location):
    set_query_results(
        db,
        route,           # Find route
        route_location,  # Find existing route-location link
        None,            # No other link uses stop_order 3
    )

    response = client.patch(
        f"/admin/1/locations/{LOCATION_ID}",
        json={"stop_order": 3},
    )

    assert response.status_code == 200
    assert response.json()["stop_order"] == 3
    assert route_location.stop_order == 3
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(route_location)


def test_update_route_location_admin_without_battalion(
    client, db, admin
):
    admin.battalion = None

    response = client.patch(
        f"/admin/1/locations/{LOCATION_ID}",
        json={"stop_order": 3},
    )

    assert response.status_code == 400
    db.query.assert_not_called()


def test_update_route_location_route_not_found(client, db):
    set_query_results(db, None)

    response = client.patch(
        f"/admin/1/locations/{LOCATION_ID}",
        json={"stop_order": 3},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Route not found in your battalion"
    )


def test_update_route_location_link_not_found(
    client, db, route
):
    set_query_results(db, route, None)

    response = client.patch(
        f"/admin/1/locations/{LOCATION_ID}",
        json={"stop_order": 3},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Location is not assigned to this route"
    )
    db.commit.assert_not_called()


def test_update_route_location_stop_order_conflict(
    client, db, route, route_location
):
    existing_link = SimpleNamespace(
        id=UUID("dddddddd-dddd-dddd-dddd-dddddddddddd"),
        route_id=ROUTE_ID,
        location_id=UUID(
            "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
        ),
        stop_order=3,
    )

    set_query_results(
        db,
        route,
        route_location,
        existing_link,
    )

    response = client.patch(
        f"/admin/1/locations/{LOCATION_ID}",
        json={"stop_order": 3},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "Stop order already exists for this route"
    )
    db.commit.assert_not_called()


# ==================================================
# DELETE /{route_number}/locations/{location_id}
# ==================================================

def test_delete_route_location_success(
    client, db, route, route_location
):
    set_query_results(db, route, route_location)

    response = client.delete(
        f"/admin/1/locations/{LOCATION_ID}"
    )

    assert response.status_code == 200
    assert response.json()["message"] == (
        "Location removed from route successfully"
    )

    db.delete.assert_called_once_with(route_location)
    db.commit.assert_called_once()


def test_delete_route_location_admin_without_battalion(
    client, db, admin
):
    admin.battalion = None

    response = client.delete(
        f"/admin/1/locations/{LOCATION_ID}"
    )

    assert response.status_code == 400
    db.query.assert_not_called()
    db.delete.assert_not_called()


def test_delete_route_location_route_not_found(client, db):
    set_query_results(db, None)

    response = client.delete(
        f"/admin/1/locations/{LOCATION_ID}"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Route not found in your battalion"
    )
    db.delete.assert_not_called()


def test_delete_route_location_link_not_found(
    client, db, route
):
    set_query_results(db, route, None)

    response = client.delete(
        f"/admin/1/locations/{LOCATION_ID}"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Location is not assigned to this route"
    )
    db.delete.assert_not_called()
    db.commit.assert_not_called()
