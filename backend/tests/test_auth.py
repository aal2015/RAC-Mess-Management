
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from main import app
import api.routes.auth as auth_routes


@pytest.fixture
def client():
    # Prevent overrides from leaking between tests.
    app.dependency_overrides.clear()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def make_user():
    return SimpleNamespace(
        id=uuid4(),
        username="testuser",
        name="Test User",
        role="user",
        bus="Bus 1",
        battalion="Battalion A",
        password_hash="hashed-password",
        is_active=True,
    )


class FakeQuery:
    def __init__(self, user):
        self.user = user

    def filter(self, *args):
        return self

    def first(self):
        return self.user


class FakeDB:
    def __init__(self, user):
        self.user = user

    def query(self, model):
        return FakeQuery(self.user)


def setup_fake_db(user):
    app.dependency_overrides[auth_routes.get_db] = (
        lambda: FakeDB(user)
    )


def test_login_success(client, monkeypatch):
    user = make_user()
    setup_fake_db(user)

    monkeypatch.setattr(
        auth_routes,
        "verify_password",
        lambda password, hashed: (
            password == "correct-password"
            and hashed == "hashed-password"
        ),
    )
    monkeypatch.setattr(
        auth_routes,
        "create_access_token",
        lambda user_id, role: "test-access-token",
    )

    response = client.post(
        "/auth/login",
        json={
            "username": "testuser",
            "password": "correct-password",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["access_token"] == "test-access-token"
    assert data["username"] == "testuser"
    assert data["name"] == "Test User"
    assert data["role"] == "user"
    assert data["bus"] == "Bus 1"
    assert data["battalion"] == "Battalion A"
    assert data["token_type"].lower() == "bearer"


def test_login_user_not_found(client, monkeypatch):
    setup_fake_db(None)

    # Password verification should not be needed for a missing user.
    def unexpected_verification(*args):
        pytest.fail("Password verification should not be called")

    monkeypatch.setattr(
        auth_routes, "verify_password", unexpected_verification
    )

    response = client.post(
        "/auth/login",
        json={
            "username": "unknown",
            "password": "any-password",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"


def test_login_wrong_password(client, monkeypatch):
    user = make_user()
    setup_fake_db(user)

    monkeypatch.setattr(
        auth_routes, "verify_password", lambda password, hashed: False
    )

    response = client.post(
        "/auth/login",
        json={
            "username": "testuser",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"


def test_me_without_token_returns_unauthorized(client):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_with_authenticated_user(client):
    user = make_user()

    # Replace authentication with a known test user.
    app.dependency_overrides[auth_routes.get_current_user] = (
        lambda: user
    )

    response = client.get("/auth/me")

    assert response.status_code == 200
    assert response.json() == {
        "id": str(user.id),
        "username": "testuser",
        "role": "user",
        "name": "Test User",
    }
