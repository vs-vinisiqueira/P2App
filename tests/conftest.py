import os
from collections.abc import Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")

from app.crud.user import criar_usuario  # noqa: E402
from app.database import Base, get_db  # noqa: E402
from app.main import app as fastapi_app  # noqa: E402
from app.models.atendimento import Atendimento  # noqa: E402, F401
from app.models.ticket_event import TicketEvent  # noqa: E402, F401
from app.models.ticket import Ticket  # noqa: E402, F401
from app.models.user import User  # noqa: E402, F401
from app.schemas.user import UserCreate  # noqa: E402

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def reset_database() -> Generator[None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session() -> Generator[Session]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def app() -> FastAPI:
    return fastapi_app


@pytest.fixture
def client(app: FastAPI) -> Generator[TestClient]:
    def override_get_db() -> Generator[Session]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def regular_user(db_session: Session) -> User:
    user = criar_usuario(
        db_session,
        UserCreate(
            nome="Usuario Comum",
            email="usuario@example.com",
            senha="12345678",
            tipo_usuario="cliente",
        ),
    )
    assert user is not None
    return user


@pytest.fixture
def admin_user(db_session: Session) -> User:
    user = criar_usuario(
        db_session,
        UserCreate(
            nome="Administrador",
            email="admin@example.com",
            senha="12345678",
            tipo_usuario="admin",
        ),
    )
    assert user is not None
    return user


@pytest.fixture
def gerente_user(db_session: Session) -> User:
    user = criar_usuario(
        db_session,
        UserCreate(
            nome="Gerente de Suporte",
            email="gerente@example.com",
            senha="12345678",
            tipo_usuario="gerente",
        ),
    )
    assert user is not None
    return user


@pytest.fixture
def tecnico_user(db_session: Session) -> User:
    user = criar_usuario(
        db_session,
        UserCreate(
            nome="Tecnico de Suporte",
            email="tecnico@example.com",
            senha="12345678",
            tipo_usuario="tecnico",
        ),
    )
    assert user is not None
    return user


def login_token(client: TestClient, email: str, senha: str = "12345678") -> str:
    response = client.post("/auth/login", json={"email": email, "senha": senha})
    assert response.status_code == 200
    return response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def regular_token(client: TestClient, regular_user: User) -> str:
    return login_token(client, regular_user.email)


@pytest.fixture
def admin_token(client: TestClient, admin_user: User) -> str:
    return login_token(client, admin_user.email)


@pytest.fixture
def gerente_token(client: TestClient, gerente_user: User) -> str:
    return login_token(client, gerente_user.email)


@pytest.fixture
def tecnico_token(client: TestClient, tecnico_user: User) -> str:
    return login_token(client, tecnico_user.email)


@pytest.fixture
def regular_auth_headers(regular_token: str) -> dict[str, str]:
    return auth_headers(regular_token)


@pytest.fixture
def admin_auth_headers(admin_token: str) -> dict[str, str]:
    return auth_headers(admin_token)


@pytest.fixture
def gerente_auth_headers(gerente_token: str) -> dict[str, str]:
    return auth_headers(gerente_token)


@pytest.fixture
def tecnico_auth_headers(tecnico_token: str) -> dict[str, str]:
    return auth_headers(tecnico_token)
