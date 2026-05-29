from typing import Literal

from app.models.user import User

TipoUsuario = Literal["admin", "gerente", "tecnico", "cliente"]
Role = Literal["admin", "user"]

ROLE_BY_TIPO_USUARIO: dict[TipoUsuario, Role] = {
    "admin": "admin",
    "gerente": "user",
    "tecnico": "user",
    "cliente": "user",
}


def role_for_tipo_usuario(tipo_usuario: TipoUsuario) -> Role:
    return ROLE_BY_TIPO_USUARIO[tipo_usuario]


def is_admin(user: User) -> bool:
    return user.role == "admin"


def is_cliente(user: User) -> bool:
    return user.tipo_usuario == "cliente"


def is_support_staff(user: User) -> bool:
    return is_admin(user) or user.tipo_usuario in {"gerente", "tecnico"}
