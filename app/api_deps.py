from app.core.deps import get_current_user, oauth2_scheme, require_admin

obter_usuario_autenticado = get_current_user

__all__ = [
    "get_current_user",
    "obter_usuario_autenticado",
    "oauth2_scheme",
    "require_admin",
]
